# Modern Minesweeper (WJH & WZX Edition)

A high-performance, industrial-grade Minesweeper experience built with React 19 and TypeScript. Engineered for algorithmic precision, visual harmony with the Sudoku project, and ultra-smooth gameplay.

**[🎮 Play Now on GitHub Pages](https://wangjiehu.github.io/minesweeper-game)**

---

## 🎮 Player's Guide

### Controls & Mechanics
- **Reveal Cell**: Left-click to sweep a cell.
- **Flag Mine**: Right-click to place or remove a flag on a suspected mine.
- **Chording (Advanced)**: If a revealed number matches the surrounding flag count, **Left-click on the number** to instantly reveal all remaining adjacent tiles.
- **Global Pause**: Press **`Space`** or the pause button to toggle the game timer at any time.
- **First-Click Safety**: Your first click (and its 8 neighbors) is mathematically guaranteed to be safe.

### Layout & Customization
- **Intelligent Layout**: 
  - **Easy Mode**: Optimized for mobile/compact feel with controls at the bottom and 20px breathing room.
  - **Medium/Hard Modes**: Unified top-bar layout aligned perfectly to the board boundaries.
- **Stable UI**: Fixed-width data displays for 🚩 and ⏱️ to prevent layout shifting during play.
- **Dark Mode**: Seamless toggle with a vibrant yellow moon, perfectly aligned with the `WJH` signature.

---

## 🌟 Difficulties

- **Easy (9x9, 10 Mines)**: Perfect for a quick logic fix.
- **Medium (16x16, 40 Mines)**: The classic standard.
- **Hard (16x30, 99 Mines)**: The ultimate test of sweeping speed (features smooth horizontal scrolling).

---

## 🚀 Technical Highlights

- **Fisher-Yates Shuffle**: Mine placement utilizes a true `O(1)` placement logic via 1D array shuffling, ensuring instantaneous generation.
- **Zero-Copy BFS (Zero-Cascade)**: Optimized sweep algorithm prevents redundant memory re-allocations during large recursive reveals, maintaining a constant 60FPS.
- **Modular Architecture**: Fully refactored into specialized React components (`Cell`, `Board`, `Header`, `Modals`) for maximum maintainability.
- **Persistence Layer**: Cross-session game state and history tracking powered by **LocalStorage DB**.

---
Developed by **WJH & WZX**
