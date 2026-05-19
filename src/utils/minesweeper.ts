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
  let minesPlaced = 0;

  // Place mines
  while (minesPlaced < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);

    // Don't place mine on first click or already placed mine
    if (board[r][c].value !== 'mine' && (Math.abs(r - firstClick[0]) > 1 || Math.abs(c - firstClick[1]) > 1)) {
      board[r][c].value = 'mine';
      minesPlaced++;
    }
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

export const revealCell = (board: Board, r: number, c: number): Board => {
  if (board[r][c].isRevealed || board[r][c].isFlagged) return board;

  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  const rows = board.length;
  const cols = board[0].length;

  const stack: [number, number][] = [[r, c]];

  while (stack.length > 0) {
    const [currR, currC] = stack.pop()!;
    if (newBoard[currR][currC].isRevealed) continue;

    newBoard[currR][currC].isRevealed = true;

    if (newBoard[currR][currC].value === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = currR + dr;
          const nc = currC + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !newBoard[nr][nc].isRevealed) {
            stack.push([nr, nc]);
          }
        }
      }
    }
  }

  return newBoard;
};
