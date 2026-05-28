import { CELL, GAP } from './EditorGrid.js'

/**
 * TextureGenerator — renders the ship's appearance from grid entries
 * onto an off-screen Graphics object, then calls generateTexture()
 * so the result can be used as a sprite texture.
 */
export default class TextureGenerator {

  /**
   * @param {Phaser.Scene} scene
   * @param {Array} gridEntries — EditorGrid.entries
   * @returns {{ texKey: string, shipW: number, shipH: number }}
   */
  generate(scene, gridEntries) {
    const { minCol, minRow, maxCol, maxRow } = this._bounds(gridEntries)
    const shipW = (maxCol - minCol) * (CELL + GAP) + GAP
    const shipH = (maxRow - minRow) * (CELL + GAP) + GAP

    const g = scene.add.graphics()
    for (const e of gridEntries) {
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

    return { texKey, shipW, shipH, shipCenterX: shipW / 2, shipCenterY: shipH / 2 }
  }

  /**
   * Returns the bounding box (in grid coords) of all entries.
   */
  _bounds(gridEntries) {
    let minCol = 13, minRow = 13, maxCol = 0, maxRow = 0
    for (const e of gridEntries) {
      if (e.col < minCol) minCol = e.col
      if (e.row < minRow) minRow = e.row
      if (e.col + e.el.w > maxCol) maxCol = e.col + e.el.w
      if (e.row + e.el.h > maxRow) maxRow = e.row + e.el.h
    }
    return { minCol, minRow, maxCol, maxRow }
  }

  /** Element center in texture pixels, relative to ship center. */
  elementCenter(minCol, minRow, entry, ctrX, ctrY) {
    return {
      x: (entry.col - minCol) * (CELL + GAP) + GAP + (entry.el.w * (CELL + GAP) - GAP) / 2 - ctrX,
      y: (entry.row - minRow) * (CELL + GAP) + GAP + (entry.el.h * (CELL + GAP) - GAP) / 2 - ctrY,
    }
  }
}
