import React, { useState, useEffect, useCallback } from 'react';
import './styles/Minesweeper.css';
import Header from './components/Header';
import MinesweeperBoard from './components/MinesweeperBoard';
import GameModals from './components/GameModals';
import { 
  Board, 
  Difficulty, 
  DIFFICULTY_SETTINGS, 
  createEmptyBoard, 
  initializeBoard, 
  revealCell,
  revealNeighbors
} from './utils/minesweeper';

export interface GameSession {
  id: string;
  board: Board;
  difficulty: Difficulty;
  minesLeft: number;
  timer: number;
  lastPlayed: number;
  createdAt: number;
  gameStatus: 'idle' | 'playing' | 'won' | 'lost';
}

export type { Difficulty };

function App() {
  const [board, setBoard] = useState<Board>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [minesLeft, setMinesLeft] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('minesweeper_darkmode') === 'true');

  // Multi-session history with localStorage
  const [gameHistory, setGameHistory] = useState<GameSession[]>(() => {
    const saved = localStorage.getItem('minesweeper_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  // Modals
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteOthersConfirm, setShowDeleteOthersConfirm] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
    localStorage.setItem('minesweeper_darkmode', isDarkMode.toString());
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('minesweeper_history', JSON.stringify(gameHistory));
  }, [gameHistory]);

  const startNewGame = useCallback((diff: Difficulty) => {
    const { rows, cols, mines } = DIFFICULTY_SETTINGS[diff];
    const newBoard = createEmptyBoard(rows, cols);
    const newId = Date.now().toString();

    setBoard(newBoard);
    setDifficulty(diff);
    setGameStatus('idle');
    setMinesLeft(mines);
    setTimer(0);
    setIsPaused(false);
    setShowDiffModal(false);

    const newSession: GameSession = {
      id: newId,
      board: newBoard,
      difficulty: diff,
      minesLeft: mines,
      timer: 0,
      lastPlayed: Date.now(),
      createdAt: Date.now(),
      gameStatus: 'idle'
    };
    setGameHistory(prev => [newSession, ...prev]);
    setActiveGameId(newId);
  }, []);

  // Initial load: either resume last game or start new
  useEffect(() => {
    if (gameHistory.length > 0 && !activeGameId) {
      const lastGame = gameHistory[0];
      setBoard(lastGame.board);
      setDifficulty(lastGame.difficulty);
      setMinesLeft(lastGame.minesLeft);
      setTimer(lastGame.timer);
      setGameStatus(lastGame.gameStatus);
      setActiveGameId(lastGame.id);
    } else if (gameHistory.length === 0) {
      startNewGame('easy');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync current game to history
  useEffect(() => {
    if (!activeGameId) return;
    setGameHistory(prev => prev.map(game => 
      game.id === activeGameId 
        ? { ...game, board, minesLeft, timer, lastPlayed: Date.now(), gameStatus } 
        : game
    ));
  }, [board, minesLeft, timer, gameStatus, activeGameId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStatus === 'playing' && !isPaused) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [gameStatus, isPaused]);

  const handleCellClick = (r: number, c: number) => {
    if (gameStatus === 'won' || gameStatus === 'lost' || isPaused) return;

    if (gameStatus === 'idle') {
      const { rows, cols, mines } = DIFFICULTY_SETTINGS[difficulty];
      const newBoard = initializeBoard(rows, cols, mines, [r, c]);
      setBoard(revealCell(newBoard, r, c));
      setGameStatus('playing');
      return;
    }

    const cell = board[r][c];

    if (cell.isFlagged) return;

    // Chording logic (clicking a revealed number)
    if (cell.isRevealed && typeof cell.value === 'number' && cell.value > 0) {
      const { newBoard, hitMine } = revealNeighbors(board, r, c);
      setBoard(newBoard);
      if (hitMine) {
        setGameStatus('lost');
      } else {
        checkWin(newBoard);
      }
      return;
    }

    if (cell.isRevealed) return;

    if (cell.value === 'mine') {
      const newBoard = board.map(row => row.map(cell => ({ ...cell, isRevealed: cell.value === 'mine' ? true : cell.isRevealed })));
      setBoard(newBoard);
      setGameStatus('lost');
      return;
    }

    const newBoard = revealCell(board, r, c);
    setBoard(newBoard);
    checkWin(newBoard);
  };

  const checkWin = (currentBoard: Board) => {
    const { rows, cols, mines } = DIFFICULTY_SETTINGS[difficulty];
    let revealedCount = 0;
    currentBoard.forEach(row => row.forEach(cell => { if (cell.isRevealed) revealedCount++; }));
    if (revealedCount === rows * cols - mines) {
      setGameStatus('won');
    }
  };

  const handleContextMenu = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameStatus !== 'playing' || board[r][c].isRevealed || isPaused) return;

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

  const togglePause = useCallback(() => {
    if (gameStatus === 'won' || gameStatus === 'lost' || gameStatus === 'idle') return;
    setIsPaused(prev => !prev);
  }, [gameStatus]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        togglePause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePause]);

  const loadGame = (session: GameSession) => {
    setBoard(session.board);
    setDifficulty(session.difficulty);
    setMinesLeft(session.minesLeft);
    setTimer(session.timer);
    setGameStatus(session.gameStatus);
    setActiveGameId(session.id);
    setIsPaused(false);
    setShowHistoryModal(false);
  };

  const confirmDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  const executeDelete = () => {
    if (!deleteId) return;
    const updatedHistory = gameHistory.filter(g => g.id !== deleteId);
    setGameHistory(updatedHistory);
    
    if (activeGameId === deleteId) {
      if (updatedHistory.length > 0) {
        loadGame(updatedHistory[0]);
      } else {
        startNewGame('easy');
      }
    }
    setDeleteId(null);
  };

  const executeDeleteOthers = () => {
    if (!activeGameId) return;
    const activeGame = gameHistory.find(g => g.id === activeGameId);
    if (activeGame) {
      setGameHistory([activeGame]);
    }
    setShowDeleteOthersConfirm(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="minesweeper-container">
      <Header 
        isDarkMode={isDarkMode} 
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
        difficulty={difficulty}
      />

      {/* Main aligned container */}
      <div style={{ display: 'flex', flexDirection: 'column', width: 'max-content', maxWidth: '100%' }}>
        
        {difficulty === 'easy' ? (
          <>
            {/* Top Info Bar for Easy */}
            <div className="game-info" style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '80px', 
              width: '100%', 
              margin: '0 0 10px 0', 
              padding: 0 
            }}>
              <div className="info-item">
                <span>🚩</span>
                <span style={{ width: '40px', display: 'inline-block', textAlign: 'left', fontVariantNumeric: 'tabular-nums' }}>{minesLeft}</span>
              </div>
              <div className="info-item">
                <span>⏱️</span>
                <span style={{ width: '60px', display: 'inline-block', textAlign: 'left', fontVariantNumeric: 'tabular-nums' }}>{formatTime(timer)}</span>
              </div>            </div>

            <MinesweeperBoard 
              board={board}
              isPaused={isPaused}
              onCellClick={handleCellClick}
              onCellContextMenu={handleContextMenu}
            />

            {/* Bottom Control Bar for Easy - Adjusted Spacing */}
            <div className="top-controls" style={{ display: 'flex', gap: '10px', width: '100%', margin: '20px 0 0 0' }}>
              <button className="top-btn btn-history" style={{ flex: 1, margin: 0 }} onClick={() => { setIsPaused(true); setShowHistoryModal(true); }}>
                History
              </button>
              <button className={`top-btn btn-timer ${isPaused ? 'paused' : ''}`} style={{ flex: 1, margin: 0 }} onClick={togglePause}>
                {isPaused ? 'Start' : 'Pause'}
              </button>
              <button className="top-btn" style={{ flex: 1, margin: 0 }} onClick={() => { setIsPaused(true); setShowDiffModal(true); }}>
                New Game
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Unified Top Bar for Medium/Hard */}
            <div style={{ display: 'flex', gap: '10px', width: '100%', marginBottom: '20px', alignItems: 'center' }}>
              <button className="top-btn btn-history" style={{ flex: 1, margin: 0 }} onClick={() => { setIsPaused(true); setShowHistoryModal(true); }}>
                History
              </button>
              <div className="game-info" style={{ 
                flex: 2, 
                margin: 0, 
                display: 'flex', 
                justifyContent: 'center', 
                gap: difficulty === 'hard' ? '150px' : '30px', 
                padding: 0 
              }}>
                <div className="info-item">
                  <span>🚩</span>
                  <span style={{ width: '40px', display: 'inline-block', textAlign: 'left', fontVariantNumeric: 'tabular-nums' }}>{minesLeft}</span>
                </div>
                <div className="info-item">
                  <span>⏱️</span>
                  <span style={{ width: '60px', display: 'inline-block', textAlign: 'left', fontVariantNumeric: 'tabular-nums' }}>{formatTime(timer)}</span>
                </div>              </div>
              <button className="top-btn" style={{ flex: 1, margin: 0 }} onClick={() => { setIsPaused(true); setShowDiffModal(true); }}>
                New Game
              </button>
            </div>

            <MinesweeperBoard 
              board={board}
              isPaused={isPaused}
              onCellClick={handleCellClick}
              onCellContextMenu={handleContextMenu}
            />
          </>
        )}

      </div>

      {gameStatus === 'won' && <div style={{marginTop: '20px', color: '#2ecc71', fontWeight: 'bold'}}>Congratulations! You Win!</div>}

      <GameModals 
        showDiffModal={showDiffModal}
        showHistoryModal={showHistoryModal}
        deleteId={deleteId}
        showDeleteOthersConfirm={showDeleteOthersConfirm}
        gameHistory={gameHistory}
        activeGameId={activeGameId}
        onStartNewGame={startNewGame}
        onLoadGame={loadGame}
        onConfirmDelete={confirmDelete}
        onExecuteDelete={executeDelete}
        onExecuteDeleteOthers={executeDeleteOthers}
        setShowDiffModal={setShowDiffModal}
        setShowHistoryModal={setShowHistoryModal}
        setDeleteId={setDeleteId}
        setShowDeleteOthersConfirm={setShowDeleteOthersConfirm}
        setIsPaused={setIsPaused}
        formatTime={formatTime}
      />
    </div>
  );
}

export default App;
