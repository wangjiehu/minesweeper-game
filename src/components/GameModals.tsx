import React from 'react';
import { Difficulty, GameSession } from '../App';

interface GameModalsProps {
  showDiffModal: boolean;
  showHistoryModal: boolean;
  deleteId: string | null;
  showDeleteOthersConfirm: boolean;
  gameHistory: GameSession[];
  activeGameId: string | null;
  onStartNewGame: (diff: Difficulty) => void;
  onLoadGame: (session: GameSession) => void;
  onConfirmDelete: (e: React.MouseEvent, id: string) => void;
  onExecuteDelete: () => void;
  onExecuteDeleteOthers: () => void;
  setShowDiffModal: (show: boolean) => void;
  setShowHistoryModal: (show: boolean) => void;
  setDeleteId: (id: string | null) => void;
  setShowDeleteOthersConfirm: (show: boolean) => void;
  setIsPaused: (paused: boolean) => void;
  formatTime: (seconds: number) => string;
}

const GameModals: React.FC<GameModalsProps> = ({
  showDiffModal,
  showHistoryModal,
  deleteId,
  showDeleteOthersConfirm,
  gameHistory,
  activeGameId,
  onStartNewGame,
  onLoadGame,
  onConfirmDelete,
  onExecuteDelete,
  onExecuteDeleteOthers,
  setShowDiffModal,
  setShowHistoryModal,
  setDeleteId,
  setShowDeleteOthersConfirm,
  setIsPaused,
  formatTime
}) => {
  return (
    <>
      {/* Game Type Selector Modal */}
      {showDiffModal && (
        <div className="modal-overlay" onClick={() => { setIsPaused(false); setShowDiffModal(false); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Game Type</h3>
            <button className="modal-btn" onClick={() => onStartNewGame('easy')}>Easy (9x9, 10 Mines)</button>
            <button className="modal-btn" onClick={() => onStartNewGame('medium')}>Medium (16x16, 40 Mines)</button>
            <button className="modal-btn" onClick={() => onStartNewGame('hard')}>Hard (16x30, 99 Mines)</button>
            <p style={{fontSize: '0.8rem', color: '#888', marginTop: '10px'}}>More types coming soon...</p>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="modal-overlay" onClick={() => { setIsPaused(false); setShowHistoryModal(false); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ position: 'relative', marginBottom: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>History</h3>
              <button 
                onClick={() => setShowDeleteOthersConfirm(true)}
                style={{
                  position: 'absolute',
                  right: '0',
                  backgroundColor: '#ffebee',
                  color: '#e74c3c',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Delete others
              </button>
            </div>
            <div className="history-list">
              {gameHistory.length === 0 ? <p>No history yet</p> : 
                [...gameHistory]
                .sort((a, b) => {
                  if (a.id === activeGameId) return -1;
                  if (b.id === activeGameId) return 1;
                  return b.lastPlayed - a.lastPlayed;
                })
                .map(game => (
                <div key={game.id} className={`history-item ${activeGameId === game.id ? 'active' : ''}`} onClick={() => onLoadGame(game)}>
                  <div className="history-info" style={{ flex: 1, paddingRight: '15px' }}>
                    <div className="history-main-row" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <span className="history-diff">
                        {game.difficulty === 'easy' ? 'Easy (9x9, 10 Mines)' : 
                         game.difficulty === 'medium' ? 'Medium (16x16, 40 Mines)' : 
                         'Hard (16x30, 99 Mines)'}
                      </span>
                      <span className={`history-status ${game.gameStatus === 'won' ? 'completed' : 'uncompleted'}`}>
                        {game.gameStatus === 'won' ? 'Won' : game.gameStatus === 'lost' ? 'Lost' : 'Playing'}
                      </span>
                    </div>
                    <span className="history-time">{formatTime(game.timer)} - {new Date(game.createdAt).toLocaleDateString()} {new Date(game.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <button className="trash-btn" onClick={(e) => onConfirmDelete(e, game.id)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Record?</h3>
            <p style={{marginBottom: '25px', color: '#666', fontSize: '0.9rem'}}>Are you sure you want to remove this game history?</p>
            <div className="confirm-footer">
              <button className="confirm-btn cancel" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="confirm-btn confirm" onClick={onExecuteDelete}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Others Confirmation Modal */}
      {showDeleteOthersConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteOthersConfirm(false)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Others?</h3>
            <p style={{marginBottom: '25px', color: '#666', fontSize: '0.9rem'}}>Are you sure you want to remove all history except the current game?</p>
            <div className="confirm-footer">
              <button className="confirm-btn cancel" onClick={() => setShowDeleteOthersConfirm(false)}>Cancel</button>
              <button className="confirm-btn confirm" onClick={onExecuteDeleteOthers}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GameModals;
