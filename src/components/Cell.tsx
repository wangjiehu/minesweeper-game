import React from 'react';
import { CellData } from '../utils/minesweeper';

interface CellProps {
  cell: CellData;
  r: number;
  c: number;
  onClick: (r: number, c: number) => void;
  onContextMenu: (e: React.MouseEvent, r: number, c: number) => void;
}

const Cell: React.FC<CellProps> = ({ cell, r, c, onClick, onContextMenu }) => {
  let content = '';
  let classes = ['cell'];

  if (cell.isRevealed) {
    classes.push('revealed');
    if (cell.value === 'mine') {
      content = '💣';
      classes.push('mine');
    } else if (cell.value !== 0 && cell.value !== null) {
      content = String(cell.value);
      classes.push(`cell-${cell.value}`);
    }
  } else if (cell.isFlagged) {
    classes.push('flagged');
    content = '🚩';
  }

  return (
    <div 
      className={classes.join(' ')}
      onClick={() => onClick(r, c)}
      onContextMenu={(e) => onContextMenu(e, r, c)}
    >
      {content}
    </div>
  );
};

export default React.memo(Cell);
