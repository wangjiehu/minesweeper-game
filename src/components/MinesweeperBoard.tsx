import React from 'react';
import { Board } from '../utils/minesweeper';
import Cell from './Cell';

interface MinesweeperBoardProps {
  board: Board;
  isPaused: boolean;
  onCellClick: (r: number, c: number) => void;
  onCellContextMenu: (e: React.MouseEvent, r: number, c: number) => void;
}

const MinesweeperBoard: React.FC<MinesweeperBoardProps> = ({ 
  board, 
  isPaused, 
  onCellClick, 
  onCellContextMenu 
}) => {
  const cols = board[0]?.length || 0;

  return (
    <div className="board-wrapper" style={{ margin: 0, width: 'max-content', maxWidth: '100%' }}>
      <div className="board" style={{ 
        gridTemplateColumns: `repeat(${cols}, 32px)` 
      }}>
        {board.map((row, r) => 
          row.map((cell, c) => (
            isPaused ? (
              <div key={`${r}-${c}`} className="cell" />
            ) : (
              <Cell 
                key={`${r}-${c}`}
                cell={cell}
                r={r}
                c={c}
                onClick={onCellClick}
                onContextMenu={onCellContextMenu}
              />
            )
          ))
        )}
      </div>
    </div>
  );
};

export default MinesweeperBoard;
