export const CELL = 48
export const GAP = 2
export const COLS = 13
export const ROWS = 13
export const GRID_X = 60
export const GRID_Y = 60
export const PALETTE_X = GRID_X + (COLS + 1) * CELL + (COLS + 1) * GAP

/**
 * EditorGrid — data model for the ship-editor grid.
 * Tracks which cells are occupied and provides place / remove helpers.
 * Does NOT render anything (see EditorRenderer).
 */
export default class EditorGrid {
  constructor() {
    this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null))
    this.entries = [] // { container, bg, label, el, col, row, w, h }
  }

  cellToPixel(col, row) {
    return { x: GRID_X + GAP + col * (CELL + GAP), y: GRID_Y + GAP + row * (CELL + GAP) }
  }

  pixelToCell(px, py) {
    return {
      col: Math.round((px - GRID_X - GAP) / (CELL + GAP)),
      row: Math.round((py - GRID_Y - GAP) / (CELL + GAP)),
    }
  }

  isOnGrid(px, py) {
    return px >= GRID_X && px < GRID_X + COLS * (CELL + GAP) + GAP
        && py >= GRID_Y && py < GRID_Y + ROWS * (CELL + GAP) + GAP
  }

  canPlace(el, col, row, ignoreEntry) {
    if (col < 0 || col + el.w > COLS || row < 0 || row + el.h > ROWS) return false
    for (let r = row; r < row + el.h; r++) {
      for (let c = col; c < col + el.w; c++) {
        if (this.grid[r][c] && this.grid[r][c] !== ignoreEntry) return false
      }
    }
    return true
  }

  place(el, col, row) {
    for (let r = row; r < row + el.h; r++) {
      for (let c = col; c < col + el.w; c++) this.grid[r][c] = el.id
    }
  }

  remove(entry) {
    for (let r = entry.row; r < entry.row + entry.el.h; r++) {
      for (let c = entry.col; c < entry.col + entry.el.w; c++) this.grid[r][c] = null
    }
  }

  /** Number of occupied cells (for validation). */
  get occupiedCells() {
    return this.entries.length
  }

  /** Remove all entries. */
  clear() {
    this.entries = []
    this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null))
  }
}
