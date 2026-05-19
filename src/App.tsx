import React, { useState, useEffect, useCallback } from 'react';
import './styles/Minesweeper.css';
import { 
  Board, 
  Difficulty, 
  DIFFICULTY_SETTINGS, 
  createEmptyBoard, 
  initializeBoard, 
  revealCell 
} from './utils/minesweeper';

function App() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [board, setBoard] = useState<Board>([]);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [minesLeft, setMinesLeft] = useState(0);
  const [timer, setTimer] = useState(0);

  const startNewGame = useCallback((diff: Difficulty) => {
    const { rows, cols, mines } = DIFFICULTY_SETTINGS[diff];
    setBoard(createEmptyBoard(rows, cols));
    setDifficulty(diff);
    setGameState('idle');
    setMinesLeft(mines);
    setTimer(0);
  }, []);

  useEffect(() => {
    startNewGame('easy');
  }, [startNewGame]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'playing') {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  const handleCellClick = (r: number, c: number) => {
    if (gameState === 'won' || gameState === 'lost') return;

    if (gameState === 'idle') {
      const { rows, cols, mines } = DIFFICULTY_SETTINGS[difficulty];
      const newBoard = initializeBoard(rows, cols, mines, [r, c]);
      setBoard(revealCell(newBoard, r, c));
      setGameState('playing');
      return;
    }

    if (board[r][c].isRevealed || board[r][c].isFlagged) return;

    if (board[r][c].value === 'mine') {
      const newBoard = board.map(row => row.map(cell => ({ ...cell, isRevealed: cell.value === 'mine' ? true : cell.isRevealed })));
      setBoard(newBoard);
      setGameState('lost');
      return;
    }

    const newBoard = revealCell(board, r, c);
    setBoard(newBoard);

    // Check Win
    const { rows, cols, mines } = DIFFICULTY_SETTINGS[difficulty];
    let revealedCount = 0;
    newBoard.forEach(row => row.forEach(cell => { if (cell.isRevealed) revealedCount++; }));
    if (revealedCount === rows * cols - mines) {
      setGameState('won');
    }
  };

  const handleContextMenu = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameState !== 'playing' || board[r][c].isRevealed) return;

    const newBoard = board.map((row, ri) => row.map((cell, ci) => {
      if (ri === r && ci === c) {
        const newFlagged = !cell.isFlagged;
        setMinesLeft(prev => newFlagged ? prev - 1 : prev + 1);
        return { ...cell, isFlagged: newFlagged };
      }
      return cell;
    }));
    setBoard(newBoard);
  };

  const renderCell = (r: number, c: number) => {
    const cell = board[r][c];
    let content = '';
    let classes = ['cell'];

    if (cell.isRevealed) {
      classes.push('revealed');
      if (cell.value === 'mine') {
        content = '💣';
        classes.push('mine');
      } else if (cell.value !== 0) {
        content = String(cell.value);
        classes.push(`cell-${cell.value}`);
      }
    } else if (cell.isFlagged) {
      classes.push('flagged');
    }

    return (
      <div 
        key={`${r}-${c}`}
        className={classes.join(' ')}
        onClick={() => handleCellClick(r, c)}
        onContextMenu={(e) => handleContextMenu(e, r, c)}
      >
        {content}
      </div>
    );
  };

  return (
    <div className="minesweeper-container">
      <header className="header">
        <h1>Minesweeper</h1>
        <div className="signature">WJH</div>
      </header>

      <div className="game-controls">
        <button className="control-btn" onClick={() => startNewGame('easy')}>Easy</button>
        <button className="control-btn" onClick={() => startNewGame('medium')}>Medium</button>
        <button className="control-btn" onClick={() => startNewGame('hard')}>Hard</button>
      </div>

      <div className="game-info">
        <span>🚩 {minesLeft}</span>
        <button className="control-btn" onClick={() => startNewGame(difficulty)}>
          {gameState === 'won' ? '😎' : gameState === 'lost' ? '😵' : '🙂'}
        </button>
        <span>⏱️ {timer}</span>
      </div>

      <div className="board" style={{ 
        gridTemplateColumns: `repeat(${DIFFICULTY_SETTINGS[difficulty].cols}, 30px)` 
      }}>
        {board.map((row, r) => row.map((_, c) => renderCell(r, c)))}
      </div>

      {gameState === 'won' && <h2 style={{color: 'var(--accent-color)'}}>You Win!</h2>}
    </div>
  );
}

export default App;
