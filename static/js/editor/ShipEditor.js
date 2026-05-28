import EditorGrid, { CELL, GAP, COLS, ROWS, GRID_X, GRID_Y, PALETTE_X } from './EditorGrid.js'
import TextureGenerator from './TextureGenerator.js'
import ShipData from './ShipData.js'
import { registry } from '../components/index.js'

/**
 * ShipEditor — full-screen ship builder.
 * Owns an EditorGrid (data), renders palette + tabs + grid visuals,
 * handles drag-drop, texture generation, and persistence.
 */
export default class ShipEditor {
  constructor(scene) {
    this.scene = scene
    this.gridModel = new EditorGrid()
    this.texGen = new TextureGenerator()

    this.dragging = null
    this.currentPage = 0
    this.paletteGroup = []
    this.tabGroup = []

    // Background layers
    this.bg = scene.add.graphics()
    this.paletteBg = scene.add.graphics()

    this._drawGrid()
    this._createTabs()
    this._drawPalettePage()
    this._createButtons()
    this._loadGridFromShipData()
  }

  // ====================================================================
  //  Grid rendering
  // ====================================================================

  _drawGrid() {
    const g = this.bg
    g.clear()
    g.fillStyle(0x0a0a1a, 1)
    g.fillRect(GRID_X - 10, GRID_Y - 10, COLS * (CELL + GAP) + GAP + 20, ROWS * (CELL + GAP) + GAP + 20)

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (this.gridModel.grid[r][c]) continue
        const pos = this.gridModel.cellToPixel(c, r)
        g.fillStyle(0x1a1a3a, 1)
        g.fillRect(pos.x, pos.y, CELL, CELL)
      }
    }
  }

  // ====================================================================
  //  Palette
  // ====================================================================

  _clearPalettePage() {
    for (const obj of this.paletteGroup) obj.destroy()
    this.paletteGroup = []
    this.paletteBg.clear()
  }

  _drawPalettePage() {
    this._clearPalettePage()

    const cat = registry.getCategory(this.currentPage)
    if (!cat) return

    const PAGE_Y = GRID_Y + 30
    this.paletteBg.fillStyle(0x0a0a1a, 1)
    this.paletteBg.fillRect(PALETTE_X - 10, PAGE_Y - 10, 200, this._paletteHeight() + 20)

    const title = this.scene.add.text(PALETTE_X, PAGE_Y, cat.name, { fontSize: '13px', color: '#8888ff' })
    this.paletteGroup.push(title)

    let y = PAGE_Y + 24
    for (const el of cat.items) {
      const w = el.w * (CELL + GAP) - GAP
      const h = el.h * (CELL + GAP) - GAP
      const cx = PALETTE_X + w / 2
      const cy = y + h / 2

      /* Palette items are draggable — dragstart creates a ghost, dragend places on grid. */
      const rect = this.scene.add.rectangle(cx, cy, w, h, el.color)
      rect.setInteractive({ draggable: true })
      const label = this.scene.add.text(cx, cy, el.label, { fontSize: '10px', color: '#000' }).setOrigin(0.5)

      rect.on('dragstart', () => {
        this.dragging = { el, ghost: this.scene.add.rectangle(0, 0, w, h, el.color, 0.6) }
      })

      rect.on('drag', (pointer) => {
        if (!this.dragging) return
        const col = Math.round((pointer.x - GRID_X - GAP) / (CELL + GAP))
        const row = Math.round((pointer.y - GRID_Y - GAP) / (CELL + GAP))
        this.dragging.ghost.x = GRID_X + GAP + col * (CELL + GAP) + (el.w * (CELL + GAP) - GAP) / 2
        this.dragging.ghost.y = GRID_Y + GAP + row * (CELL + GAP) + (el.h * (CELL + GAP) - GAP) / 2
      })

      rect.on('dragend', (pointer) => {
        if (!this.dragging) return
        this.dragging.ghost.destroy()
        const col = Math.round((pointer.x - GRID_X - GAP) / (CELL + GAP))
        const row = Math.round((pointer.y - GRID_Y - GAP) / (CELL + GAP))
        if (this.gridModel.canPlace(el, col, row)) this._placeEntry(el, col, row)
        this.dragging = null
      })

      this.paletteGroup.push(rect, label)
      y += h + 14
    }
  }

  _paletteHeight() {
    const cat = registry.getCategory(this.currentPage)
    if (!cat) return 24
    let h = 24
    for (const el of cat.items) h += el.h * (CELL + GAP) - GAP + 14
    return h
  }

  // ====================================================================
  //  Tabs
  // ====================================================================

  _createTabs() {
    const tabW = 36, tabH = 22, gap = 4
    let x = PALETTE_X

    for (let i = 0; i < registry.categories.length; i++) {
      const bg = this.scene.add.rectangle(x, GRID_Y - tabH / 2, tabW, tabH, 0x333355)
      const lbl = this.scene.add.text(x, GRID_Y - tabH / 2, registry.categories[i].name.charAt(0), {
        fontSize: '11px', color: '#aaa',
      }).setOrigin(0.5)
      bg.setInteractive({ useHandCursor: true })
      bg.on('pointerdown', () => this._switchPage(i))
      this.tabGroup.push({ bg, lbl, index: i })
      x += tabW + gap
    }
    this._highlightTab()
  }

  _highlightTab() {
    for (const tab of this.tabGroup) {
      tab.bg.setFillStyle(tab.index === this.currentPage ? 0x5555aa : 0x333355)
      tab.lbl.setColor(tab.index === this.currentPage ? '#fff' : '#aaa')
    }
  }

  _switchPage(index) {
    this.currentPage = index
    this._drawPalettePage()
    this._highlightTab()
  }

  // ====================================================================
  //  Grid entry placement (visual + data)
  // ====================================================================

  _placeEntry(el, col, row) {
    this.gridModel.place(el, col, row)

    const pos = this.gridModel.cellToPixel(col, row)
    const w = el.w * (CELL + GAP) - GAP
    const h = el.h * (CELL + GAP) - GAP

    const container = this.scene.add.container(pos.x + w / 2, pos.y + h / 2)
    const bg = this.scene.add.rectangle(0, 0, w, h, el.color)
    const label = this.scene.add.text(0, 0, el.label, { fontSize: '9px', color: '#000' }).setOrigin(0.5)
    container.add([bg, label])
    container.setSize(w, h)
    container.setInteractive({ draggable: true })

    const entry = { container, bg, label, el, col, row, w, h }
    this.gridModel.entries.push(entry)

    /* Grid entries are re-draggable for repositioning. */
    let ghost = null
    container.on('dragstart', () => {
      ghost = this.scene.add.rectangle(container.x, container.y, w, h, el.color, 0.5)
      container.setAlpha(0.3)
    })

    container.on('drag', (pointer) => {
      if (!ghost) return
      const col = Math.round((pointer.x - GRID_X - GAP) / (CELL + GAP))
      const row = Math.round((pointer.y - GRID_Y - GAP) / (CELL + GAP))
      ghost.x = GRID_X + GAP + col * (CELL + GAP) + (el.w * (CELL + GAP) - GAP) / 2
      ghost.y = GRID_Y + GAP + row * (CELL + GAP) + (el.h * (CELL + GAP) - GAP) / 2
    })

    container.on('dragend', (pointer) => {
      if (!ghost) return
      ghost.destroy()
      container.setAlpha(1)

      const { col: nc, row: nr } = this.gridModel.pixelToCell(pointer.x, pointer.y)

      if (!this.gridModel.isOnGrid(pointer.x, pointer.y)) {
        this._removeEntry(entry)
      } else if (this.gridModel.canPlace(el, nc, nr, entry)) {
        this._removeEntry(entry)
        this._placeEntry(el, nc, nr)
      } else {
        const snap = this.gridModel.cellToPixel(col, row)
        container.x = snap.x + w / 2
        container.y = snap.y + h / 2
      }
    })
  }

  _removeEntry(entry) {
    this.gridModel.remove(entry)
    entry.container.destroy()
    this.gridModel.entries = this.gridModel.entries.filter(e => e !== entry)
  }

  // ====================================================================
  //  Load from saved ship data
  // ====================================================================

  _loadGridFromShipData() {
    const data = ShipData.load(this.scene.registry)
    if (!data || !data.gridLayout) return
    for (const entry of data.gridLayout) {
      const el = registry.findItem(entry.id)
      if (el) this._placeEntry(el, entry.col, entry.row)
    }
  }

  // ====================================================================
  //  Buttons (BUILD SHIP + CLEAR)
  // ====================================================================

  _createButtons() {
    const bx = PALETTE_X
    const by = GRID_Y + ROWS * (CELL + GAP) + GAP + 40

    const buildBtn = this.scene.add.rectangle(bx + 50, by, 100, 30, 0x44aa44)
    buildBtn.setInteractive({ useHandCursor: true })
    this.scene.add.text(bx + 50, by, 'BUILD SHIP', { fontSize: '12px', color: '#fff' }).setOrigin(0.5)
    buildBtn.on('pointerdown', () => this._buildShip())

    const clearBtn = this.scene.add.rectangle(bx + 160, by, 70, 30, 0xcc3333)
    clearBtn.setInteractive({ useHandCursor: true })
    this.scene.add.text(bx + 160, by, 'CLEAR', { fontSize: '11px', color: '#fff' }).setOrigin(0.5)
    clearBtn.on('pointerdown', () => this._clearGrid())
  }

  // ====================================================================
  //  Validation
  // ====================================================================

  _validate() {
    const cabins = this.gridModel.entries.filter(e => e.el.id === 'cabin')
    const gens = this.gridModel.entries.filter(e => e.el.id.startsWith('gen'))
    const fwd = this.gridModel.entries.filter(e => e.el.id.startsWith('thrust_f'))
    const lat = this.gridModel.entries.filter(e => e.el.id.startsWith('thrust_l'))
    if (cabins.length !== 1) return 'Need exactly 1 cabin'
    if (gens.length < 1) return 'Need at least 1 generator'
    if (fwd.length + lat.length < 1) return 'Need at least 1 thruster'
    return null
  }

  // ====================================================================
  //  Build
  // ====================================================================

  _buildShip() {
    const error = this._validate()
    if (error) { this._showMessage(error, 0xff4444); return }

    const texInfo = this.texGen.generate(this.scene, this.gridModel.entries)
    const stats = ShipData.buildDefinition(this.gridModel.entries, texInfo)
    ShipData.persist(this.scene.registry, stats)
    this._showMessage('Ship built! Press O to play', 0x44ff44)
  }

  // ====================================================================
  //  Clear
  // ====================================================================

  _clearGrid() {
    for (const e of [...this.gridModel.entries]) this._removeEntry(e)
    this._drawGrid()
    this._showMessage('Grid cleared', 0xff8844)
  }

  // ====================================================================
  //  Message popup (auto-dismiss after 3 s)
  // ====================================================================

  _showMessage(text, color) {
    if (this.msgText) this.msgText.destroy()
    const bx = PALETTE_X + 50
    const by = GRID_Y + ROWS * (CELL + GAP) + GAP + 80
    this.msgText = this.scene.add.text(bx, by, text, {
      fontSize: '11px', color: '#' + color.toString(16).padStart(6, '0'),
    }).setOrigin(0.5)
    this.scene.time.delayedCall(3000, () => {
      if (this.msgText) { this.msgText.destroy(); this.msgText = null }
    })
  }
}
