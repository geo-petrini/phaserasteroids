const CELL = 48
const GAP = 2
const COLS = 9
const ROWS = 9
const GRID_X = 60
const GRID_Y = 60
const PALETTE_X = 580

const ELEMENTS = [
  { id: 'cabin',    label: 'Cabin',     w: 1, h: 2, color: 0xf0d060 },
  { id: 'gen1',     label: 'Gen L1',    w: 1, h: 1, color: 0x4488ff },
  { id: 'gen2',     label: 'Gen L2',    w: 1, h: 2, color: 0x44a0ff },
  { id: 'gen3',     label: 'Gen L3',    w: 1, h: 3, color: 0x44b8ff },
  { id: 'thrust1',  label: 'Thrust L1', w: 1, h: 1, color: 0xff6644 },
  { id: 'thrust2',  label: 'Thrust L2', w: 1, h: 2, color: 0xff8044 },
  { id: 'thrust3',  label: 'Thrust L3', w: 1, h: 3, color: 0xff9944 },
  { id: 'shield1',  label: 'Shield L1', w: 1, h: 1, color: 0x44ffcc },
  { id: 'shield2',  label: 'Shield L2', w: 1, h: 2, color: 0x44ffdd },
  { id: 'shield3',  label: 'Shield L3', w: 1, h: 3, color: 0x44ffee },
  { id: 'gun1',     label: 'Gun L1',    w: 1, h: 1, color: 0xffaa44 },
  { id: 'trackgun', label: 'Track Gun', w: 2, h: 1, color: 0xffbb66 },
]

export default class ShipEditor {
  constructor(scene) {
    this.scene = scene
    this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null))
    this.gridEntries = []
    this.dragging = null

    this.bg = scene.add.graphics()
    this.drawGrid()
    this.createPalette()
  }

  cellToPixel(col, row) {
    return {
      x: GRID_X + GAP + col * (CELL + GAP),
      y: GRID_Y + GAP + row * (CELL + GAP),
    }
  }

  pixelToCell(px, py) {
    const col = Math.round((px - GRID_X - GAP) / (CELL + GAP))
    const row = Math.round((py - GRID_Y - GAP) / (CELL + GAP))
    return { col, row }
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
      for (let c = col; c < col + el.w; c++) {
        this.grid[r][c] = el.id
      }
    }
    const pos = this.cellToPixel(col, row)
    const w = el.w * (CELL + GAP) - GAP
    const h = el.h * (CELL + GAP) - GAP
    const rect = this.scene.add.rectangle(pos.x + w / 2, pos.y + h / 2, w, h, el.color)
    rect.setInteractive({ draggable: true })
    const label = this.scene.add.text(pos.x + w / 2, pos.y + h / 2, el.label, {
      fontSize: '9px', color: '#000',
    }).setOrigin(0.5)

    const entry = { rect, label, el, col, row }
    this.gridEntries.push(entry)

    rect.on('drag', (pointer, dragX, dragY) => {
      rect.x = dragX
      rect.y = dragY
      label.x = dragX
      label.y = dragY
    })

    rect.on('dragend', () => {
      const { col: newCol, row: newRow } = this.pixelToCell(rect.x, rect.y)
      if (this.canPlace(el, newCol, newRow, entry)) {
        this.removeEntry(entry)
        this.place(el, newCol, newRow)
      } else {
        const pos = this.cellToPixel(col, row)
        rect.x = pos.x + w / 2
        rect.y = pos.y + h / 2
        label.x = pos.x + w / 2
        label.y = pos.y + h / 2
      }
    })

    rect.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.removeEntry(entry)
      }
    })
  }

  removeEntry(entry) {
    for (let r = entry.row; r < entry.row + entry.el.h; r++) {
      for (let c = entry.col; c < entry.col + entry.el.w; c++) {
        this.grid[r][c] = null
      }
    }
    entry.rect.destroy()
    entry.label.destroy()
    this.gridEntries = this.gridEntries.filter(e => e !== entry)
  }

  drawGrid() {
    const g = this.bg
    g.clear()
    g.fillStyle(0x0a0a1a, 1)
    g.fillRect(GRID_X - 10, GRID_Y - 10,
      COLS * (CELL + GAP) + GAP + 20,
      ROWS * (CELL + GAP) + GAP + 20)
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (this.grid[r][c]) continue
        const pos = this.cellToPixel(c, r)
        g.fillStyle(0x1a1a3a, 1)
        g.fillRect(pos.x, pos.y, CELL, CELL)
      }
    }
  }

  createPalette() {
    let y = GRID_Y
    for (const el of ELEMENTS) {
      const w = el.w * (CELL + GAP) - GAP
      const h = el.h * (CELL + GAP) - GAP
      const cx = PALETTE_X + w / 2
      const cy = y + h / 2

      const rect = this.scene.add.rectangle(cx, cy, w, h, el.color)
      const label = this.scene.add.text(cx, cy, el.label, {
        fontSize: '10px', color: '#000',
      }).setOrigin(0.5)

      rect.setInteractive({ draggable: true })
      rect.elementData = el

      rect.on('dragstart', () => {
        this.dragging = {
          el, ghost: this.scene.add.rectangle(0, 0, w, h, el.color, 0.6),
        }
      })

      rect.on('drag', (pointer) => {
        if (!this.dragging) return
        const col = Math.round((pointer.x - GRID_X - GAP) / (CELL + GAP))
        const row = Math.round((pointer.y - GRID_Y - GAP) / (CELL + GAP))
        const snapX = GRID_X + GAP + col * (CELL + GAP) + (el.w * (CELL + GAP) - GAP) / 2
        const snapY = GRID_Y + GAP + row * (CELL + GAP) + (el.h * (CELL + GAP) - GAP) / 2
        this.dragging.ghost.x = snapX
        this.dragging.ghost.y = snapY
      })

      rect.on('dragend', (pointer) => {
        if (!this.dragging) return
        this.dragging.ghost.destroy()
        const col = Math.round((pointer.x - GRID_X - GAP) / (CELL + GAP))
        const row = Math.round((pointer.y - GRID_Y - GAP) / (CELL + GAP))
        if (this.canPlace(el, col, row)) {
          this.place(el, col, row)
        }
        this.dragging = null
      })

      y += h + 16
    }
  }
}
