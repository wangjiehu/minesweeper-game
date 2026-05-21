export type CellValue = number | 'mine' | null;

export interface CellData {
  value: CellValue;
  isRevealed: boolean;
  isFlagged: boolean;
}

export type Board = CellData[][];

export type Difficulty = 'easy' | 'medium' | 'hard';

export const DIFFICULTY_SETTINGS = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 16, cols: 30, mines: 99 },
};

export const createEmptyBoard = (rows: number, cols: number): Board => {
  return Array(rows).fill(null).map(() => 
    Array(cols).fill(null).map(() => ({
      value: null,
      isRevealed: false,
      isFlagged: false,
    }))
  );
};

export const initializeBoard = (rows: number, cols: number, mines: number, firstClick: [number, number]): Board => {
  const board = createEmptyBoard(rows, cols);
  
  // Fisher-Yates Shuffle for optimal mine placement
  const totalCells = rows * cols;
  const availableIndices: number[] = [];
  
  for (let i = 0; i < totalCells; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    // Exclude first click and its immediate 8 neighbors to guarantee a safe start
    if (Math.abs(r - firstClick[0]) <= 1 && Math.abs(c - firstClick[1]) <= 1) {
      continue;
    }
    availableIndices.push(i);
  }

  // Shuffle the first 'mines' elements
  for (let i = 0; i < mines; i++) {
    const j = i + Math.floor(Math.random() * (availableIndices.length - i));
    const temp = availableIndices[i];
    availableIndices[i] = availableIndices[j];
    availableIndices[j] = temp;
    
    // Place mine
    const mineIndex = availableIndices[i];
    const r = Math.floor(mineIndex / cols);
    const c = mineIndex % cols;
    board[r][c].value = 'mine';
  }

  // Calculate numbers
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].value === 'mine') continue;

      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].value === 'mine') {
            count++;
          }
        }
      }
      board[r][c].value = count;
    }
  }

  return board;
};

// Mutable helper to prevent O(N) memory allocations per cascade step
const revealCellMutable = (board: Board, startR: number, startC: number): void => {
  if (board[startR][startC].isRevealed || board[startR][startC].isFlagged) return;

  const rows = board.length;
  const cols = board[0].length;
  const stack: [number, number][] = [[startR, startC]];

  while (stack.length > 0) {
    const [currR, currC] = stack.pop()!;
    if (board[currR][currC].isRevealed || board[currR][currC].isFlagged) continue;

    board[currR][currC].isRevealed = true;

    if (board[currR][currC].value === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = currR + dr;
          const nc = currC + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !board[nr][nc].isRevealed && !board[nr][nc].isFlagged) {
            stack.push([nr, nc]);
          }
        }
      }
    }
  }
};

export const revealCell = (board: Board, r: number, c: number): Board => {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  revealCellMutable(newBoard, r, c);
  return newBoard;
};

export const revealNeighbors = (board: Board, r: number, c: number): { newBoard: Board, hitMine: boolean } => {
  const cell = board[r][c];
  if (!cell.isRevealed || cell.value === 'mine' || cell.value === 0 || typeof cell.value !== 'number') {
    return { newBoard: board, hitMine: false };
  }

  const rows = board.length;
  const cols = board[0].length;
  let flagCount = 0;

  // Count surrounding flags
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isFlagged) {
        flagCount++;
      }
    }
  }

  // If flags match the number, reveal the rest efficiently
  if (flagCount === cell.value) {
    const newBoard = board.map(row => row.map(c => ({ ...c })));
    let hitMine = false;

    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !newBoard[nr][nc].isRevealed && !newBoard[nr][nc].isFlagged) {
          if (newBoard[nr][nc].value === 'mine') {
            hitMine = true;
            newBoard[nr][nc].isRevealed = true;
          } else {
            revealCellMutable(newBoard, nr, nc);
          }
        }
      }
    }
    return { newBoard, hitMine };
  }

  return { newBoard: board, hitMine: false };
};
