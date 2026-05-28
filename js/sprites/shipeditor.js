const CELL = 48
const GAP = 2
const COLS = 13
const ROWS = 13
const GRID_X = 60
const GRID_Y = 60
const PALETTE_X = GRID_X + (COLS + 1) * CELL + (COLS + 1) * GAP

const CATEGORIES = [
  {
    name: 'HULL', color: 0xf0d060,
    items: [
      { id: 'cabin',       label: 'Cabin',        w: 2, h: 1 },
      { id: 'connector_s', label: 'Connector S',  w: 1, h: 1 },
      { id: 'connector_m', label: 'Connector M',  w: 2, h: 2 },
      { id: 'connector_l', label: 'Connector L',  w: 3, h: 3 },
    ],
  },
  {
    name: 'GENERATOR', color: 0x4488ff,
    items: [
      { id: 'gen1', label: 'Gen L1', w: 1, h: 1, energyGen: 2 },
      { id: 'gen2', label: 'Gen L2', w: 2, h: 1, energyGen: 5 },
      { id: 'gen3', label: 'Gen L3', w: 3, h: 1, energyGen: 8 },
    ],
  },
  {
    name: 'THRUSTERS', color: 0xff6644,
    items: [
      { id: 'thrust_f1', label: 'Fwd L1', w: 1, h: 1, accel: 20,  particleColor: 0xff4444 },
      { id: 'thrust_f2', label: 'Fwd L2', w: 2, h: 1, accel: 55,  particleColor: 0xffff44 },
      { id: 'thrust_f3', label: 'Fwd L3', w: 3, h: 1, accel: 70,  particleColor: 0x4488ff },
      { id: 'thrust_l1', label: 'Lat L1', w: 1, h: 1, rotation: 20, particleColor: 0xff4444 },
      { id: 'thrust_l2', label: 'Lat L2', w: 1, h: 1, rotation: 55, particleColor: 0xffff44 },
    ],
  },
  {
    name: 'SHIELDS', color: 0x44ffcc,
    items: [
      { id: 'shield_gen1', label: 'Gen L1', w: 1, h: 1, recharge: 0.5 },
      { id: 'shield_gen2', label: 'Gen L2', w: 2, h: 2, recharge: 0.67 },
      { id: 'shield_gen3', label: 'Gen L3', w: 3, h: 2, recharge: 2 },
      { id: 'shield_cap1', label: 'Cap L1', w: 1, h: 1, capacity: 40 },
      { id: 'shield_cap2', label: 'Cap L2', w: 1, h: 2, capacity: 90 },
      { id: 'shield_cap3', label: 'Cap L3', w: 2, h: 3, capacity: 150 },
    ],
  },
  {
    name: 'WEAPONS', color: 0xffaa44,
    items: [
      { id: 'gun1',     label: 'Gun L1',    w: 1, h: 1 },
      { id: 'trackgun', label: 'Track Gun', w: 2, h: 1 },
    ],
  },
]

const _findElementById = (id) => {
  for (const cat of CATEGORIES) {
    for (const item of cat.items) {
      if (item.id === id) {
        item.color = cat.color
        return item
      }
    }
  }
  return null
}

export default class ShipEditor {
  constructor(scene) {
    this.scene = scene
    this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null))
    this.gridEntries = []
    this.dragging = null
    this.currentPage = 0
    this.paletteGroup = []
    this.tabGroup = []
    this.shipBuilt = false

    this.bg = scene.add.graphics()
    this.paletteBg = scene.add.graphics()
    this.drawGrid()
    this.createTabs()
    this.drawPalettePage()
    this.createBuildButton()
    this._loadGridFromShipData()
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

  onGrid(px, py) {
    return px >= GRID_X && px < GRID_X + COLS * (CELL + GAP) + GAP &&
           py >= GRID_Y && py < GRID_Y + ROWS * (CELL + GAP) + GAP
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

    const container = this.scene.add.container(pos.x + w / 2, pos.y + h / 2)

    const bg = this.scene.add.rectangle(0, 0, w, h, el.color)
    const label = this.scene.add.text(0, 0, el.label, {
      fontSize: '9px', color: '#000',
    }).setOrigin(0.5)

    container.add([bg, label])
    container.setSize(w, h)
    container.setInteractive({ draggable: true })

    const entry = { container, bg, label, el, col, row, w, h }
    this.gridEntries.push(entry)

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

      const { col: newCol, row: newRow } = this.pixelToCell(pointer.x, pointer.y)

      if (!this.onGrid(pointer.x, pointer.y)) {
        this.removeEntry(entry)
      } else if (this.canPlace(el, newCol, newRow, entry)) {
        this.removeEntry(entry)
        this.place(el, newCol, newRow)
      } else {
        const snap = this.cellToPixel(col, row)
        container.x = snap.x + w / 2
        container.y = snap.y + h / 2
      }
    })
  }

  removeEntry(entry) {
    for (let r = entry.row; r < entry.row + entry.el.h; r++) {
      for (let c = entry.col; c < entry.col + entry.el.w; c++) {
        this.grid[r][c] = null
      }
    }
    entry.container.destroy()
    this.gridEntries = this.gridEntries.filter(e => e !== entry)
  }

  _loadGridFromShipData() {
    const data = this.scene.registry.get('shipData') ||
                 JSON.parse(localStorage.getItem('phaserAsteroidsShip') || 'null')
    if (!data || !data.gridLayout) return
    for (const entry of data.gridLayout) {
      const el = _findElementById(entry.id)
      if (el) this.place(el, entry.col, entry.row)
    }
  }

  clearGrid() {
    for (const e of [...this.gridEntries]) {
      this.removeEntry(e)
    }
    this.drawGrid()
    this.showMessage('Grid cleared', 0xff8844)
  }

  drawGrid() {
    const g = this.bg
    // g.clear()
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

  clearPalettePage() {
    for (const obj of this.paletteGroup) {
      obj.destroy()
    }
    this.paletteGroup = []
    this.paletteBg.clear()
  }

  drawPalettePage() {
    this.clearPalettePage()

    const cat = CATEGORIES[this.currentPage]
    const PAGE_Y = GRID_Y + 30

    this.paletteBg.fillStyle(0x0a0a1a, 1)
    this.paletteBg.fillRect(PALETTE_X - 10, PAGE_Y - 10, 200,
      this.paletteHeight() + 20)

    const title = this.scene.add.text(PALETTE_X, PAGE_Y, cat.name, {
      fontSize: '13px', color: '#8888ff',
    })
    this.paletteGroup.push(title)

    let y = PAGE_Y + 24
    for (const el of cat.items) {
      el.color = cat.color
      const w = el.w * (CELL + GAP) - GAP
      const h = el.h * (CELL + GAP) - GAP
      const cx = PALETTE_X + w / 2
      const cy = y + h / 2

      const rect = this.scene.add.rectangle(cx, cy, w, h, el.color)
      rect.setInteractive({ draggable: true })
      const label = this.scene.add.text(cx, cy, el.label, {
        fontSize: '10px', color: '#000',
      }).setOrigin(0.5)

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

      this.paletteGroup.push(rect, label)
      y += h + 14
    }
  }

  paletteHeight() {
    const cat = CATEGORIES[this.currentPage]
    let h = 24
    for (const el of cat.items) {
      h += el.h * (CELL + GAP) - GAP + 14
    }
    return h
  }

  createTabs() {
    const tabW = 36
    const tabH = 22
    const gap = 4
    let x = PALETTE_X

    for (let i = 0; i < CATEGORIES.length; i++) {
      const bg = this.scene.add.rectangle(x, GRID_Y - tabH / 2, tabW, tabH, 0x333355)
      const label = this.scene.add.text(x, GRID_Y - tabH / 2, CATEGORIES[i].name.charAt(0), {
        fontSize: '11px', color: '#aaa',
      }).setOrigin(0.5)
      bg.setInteractive({ useHandCursor: true })
      bg.on('pointerdown', () => this.switchPage(i))

      this.tabGroup.push({ bg, label, index: i })
      x += tabW + gap
    }

    this.highlightTab()
  }

  highlightTab() {
    for (const tab of this.tabGroup) {
      tab.bg.setFillStyle(tab.index === this.currentPage ? 0x5555aa : 0x333355)
      tab.label.setColor(tab.index === this.currentPage ? '#fff' : '#aaa')
    }
  }

  switchPage(index) {
    this.currentPage = index
    this.drawPalettePage()
    this.highlightTab()
  }

  createBuildButton() {
    const bx = PALETTE_X
    const by = GRID_Y + ROWS * (CELL + GAP) + GAP + 40

    const buildBtn = this.scene.add.rectangle(bx + 50, by, 100, 30, 0x44aa44)
    buildBtn.setInteractive({ useHandCursor: true })
    const buildLbl = this.scene.add.text(bx + 50, by, 'BUILD SHIP', {
      fontSize: '12px', color: '#fff',
    }).setOrigin(0.5)
    buildBtn.on('pointerdown', () => this.buildShip())

    const clearBtn = this.scene.add.rectangle(bx + 160, by, 70, 30, 0xcc3333)
    clearBtn.setInteractive({ useHandCursor: true })
    const clearLbl = this.scene.add.text(bx + 160, by, 'CLEAR', {
      fontSize: '11px', color: '#fff',
    }).setOrigin(0.5)
    clearBtn.on('pointerdown', () => this.clearGrid())

    this.buildBtn = { btn: buildBtn, lbl: buildLbl }
    this.clearBtn = { btn: clearBtn, lbl: clearLbl }
  }

  validate() {
    const cabins = this.gridEntries.filter(e => e.el.id === 'cabin')
    const gens = this.gridEntries.filter(e => e.el.id.startsWith('gen'))
    const fwdThrust = this.gridEntries.filter(e => e.el.id.startsWith('thrust_f'))
    const latThrust = this.gridEntries.filter(e => e.el.id.startsWith('thrust_l'))
    const totalThrust = fwdThrust.length + latThrust.length

    if (cabins.length !== 1) return 'Need exactly 1 cabin'
    if (gens.length < 1) return 'Need at least 1 generator'
    if (totalThrust < 1) return 'Need at least 1 thruster'
    return null
  }

  computeBounds() {
    let minCol = COLS, minRow = ROWS, maxCol = 0, maxRow = 0
    for (const e of this.gridEntries) {
      if (e.col < minCol) minCol = e.col
      if (e.row < minRow) minRow = e.row
      if (e.col + e.el.w > maxCol) maxCol = e.col + e.el.w
      if (e.row + e.el.h > maxRow) maxRow = e.row + e.el.h
    }
    return { minCol, minRow, maxCol, maxRow }
  }

  elementCenter(minCol, minRow, e) {
    const cx = (e.col - minCol) * (CELL + GAP) + GAP + (e.el.w * (CELL + GAP) - GAP) / 2
    const cy = (e.row - minRow) * (CELL + GAP) + GAP + (e.el.h * (CELL + GAP) - GAP) / 2
    return { x: cx, y: cy }
  }

  _saveShip(stats){
    this.scene.registry.set('shipData', stats)
    this.scene.registry.set('shipDataVersion', (this.scene.registry.get('shipDataVersion') || 0) + 1)

    localStorage.setItem('phaserAsteroidsShip', JSON.stringify(stats))
  }

  buildShip() {
    const error = this.validate()
    if (error) {
      this.showMessage(error, 0xff4444)
      return
    }

    const { minCol, minRow, maxCol, maxRow } = this.computeBounds()
    const shipW = (maxCol - minCol) * (CELL + GAP) + GAP
    const shipH = (maxRow - minRow) * (CELL + GAP) + GAP
    const ctrX = shipW / 2
    const ctrY = shipH / 2

    const g = this.scene.add.graphics()
    for (const e of this.gridEntries) {
      const x = (e.col - minCol) * (CELL + GAP) + GAP
      const y = (e.row - minRow) * (CELL + GAP) + GAP
      const w = e.el.w * (CELL + GAP) - GAP
      const h = e.el.h * (CELL + GAP) - GAP
      g.fillStyle(e.el.color, 1)
      g.fillRect(x, y, w, h)
    }

    const texKey = 'custom_ship_' + Date.now()
    g.generateTexture(texKey, shipW, shipH)
    g.destroy()

    const stats = this.computeStats()
    const fwdThrusters = []
    const latThrusters = []
    const weapons = []

    for (const e of this.gridEntries) {
      const c = this.elementCenter(minCol, minRow, e)
      const relX = c.x - ctrX
      const relY = c.y - ctrY

      if (e.el.id.startsWith('thrust_f')) {
        fwdThrusters.push({ x: relX, y: relY, color: e.el.particleColor })
      } else if (e.el.id.startsWith('thrust_l')) {
        latThrusters.push({ x: relX, y: relY, color: e.el.particleColor })
      } else if (e.el.id.startsWith('gun') || e.el.id.startsWith('track')) {
        weapons.push({ x: relX, y: relY, isTracking: e.el.id === 'trackgun' })
      }
    }

    stats.textureKey = texKey
    stats.textureWidth = shipW
    stats.textureHeight = shipH
    stats.forwardThrusters = fwdThrusters
    stats.lateralThrusters = latThrusters
    stats.weaponPositions = weapons
    stats.gridLayout = this.gridEntries.map(e => ({
      id: e.el.id, col: e.col, row: e.row,
    }))

    this._saveShip(stats)


    this.shipBuilt = true
    this.showMessage('Ship built! Press O to play', 0x44ff44)
  }



  computeStats() {
    let accel = 0, rotation = 0, energyGen = 0
    let shieldRecharge = 0, shieldCapacity = 0

    for (const e of this.gridEntries) {
      const el = e.el
      if (el.accel) accel += el.accel
      if (el.rotation) rotation += el.rotation
      if (el.energyGen) energyGen += el.energyGen
      if (el.recharge) shieldRecharge += el.recharge
      if (el.capacity) shieldCapacity += el.capacity
    }

    return { accel, rotation, energyGen, shieldRecharge, shieldCapacity }
  }

  showMessage(text, color) {
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
