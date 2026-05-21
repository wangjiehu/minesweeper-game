import React from 'react';
import { Difficulty } from '../App';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  difficulty: Difficulty;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, onToggleDarkMode, difficulty }) => {
  return (
    <header className="header" style={{ position: 'relative' }}>
      <h1 style={{ marginBottom: '15px' }}>Minesweeper</h1>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <div className="signature">WJH</div>
        <button 
          className="dark-mode-toggle" 
          onClick={onToggleDarkMode}
          title="Toggle Dark Mode"
          style={{ right: '-110px' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
