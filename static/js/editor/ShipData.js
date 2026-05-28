/**
 * ShipData — aggregate stats computation and persistence for custom ships.
 * Computes totals (accel, rotation, energyGen, etc.) from grid entries,
 * then serialises the full ship definition to registry + localStorage.
 */
export default class ShipData {

  /**
   * Compute aggregate stats from the current grid entries.
   * @param {Array} gridEntries
   * @returns {{ accel, rotation, energyGen, shieldRecharge, shieldCapacity }}
   */
  static computeStats(gridEntries) {
    let accel = 0, rotation = 0, energyGen = 0, shieldRecharge = 0, shieldCapacity = 0
    for (const e of gridEntries) {
      const el = e.el
      if (el.accel) accel += el.accel
      if (el.rotation) rotation += el.rotation
      if (el.energyGen) energyGen += el.energyGen
      if (el.recharge) shieldRecharge += el.recharge
      if (el.capacity) shieldCapacity += el.capacity
    }
    return { accel, rotation, energyGen, shieldRecharge, shieldCapacity }
  }

  /**
   * Build the full ship definition object that gets saved.
   */
  static buildDefinition(gridEntries, { texKey, shipW, shipH, shipCenterX, shipCenterY }) {
    const stats = ShipData.computeStats(gridEntries)
    const fwdThrusters = []
    const latThrusters = []
    const weapons = []
    const minCol = 13, minRow = 13
    // Recompute bounds inline for simplicity — TextureGenerator does the same.
    let mc = 13, mr = 13, xc = 0, xr = 0
    for (const e of gridEntries) {
      if (e.col < mc) mc = e.col
      if (e.row < mr) mr = e.row
      if (e.col + e.el.w > xc) xc = e.col + e.el.w
      if (e.row + e.el.h > xr) xr = e.row + e.el.h
    }

    for (const e of gridEntries) {
      const cx = (e.col - mc) * (48 + 2) + 2 + (e.el.w * (48 + 2) - 2) / 2 - shipCenterX
      const cy = (e.row - mr) * (48 + 2) + 2 + (e.el.h * (48 + 2) - 2) / 2 - shipCenterY

      if (e.el.id.startsWith('thrust_f')) {
        fwdThrusters.push({ x: cx, y: cy, color: e.el.particleColor })
      } else if (e.el.id.startsWith('thrust_l')) {
        latThrusters.push({ x: cx, y: cy, color: e.el.particleColor })
      } else if (e.el.id.startsWith('gun') || e.el.id.startsWith('track')) {
        weapons.push({
          x: cx, y: cy,
          isTracking: e.el.id === 'trackgun',
          fireIntervall: e.el.fireIntervall,
          energyUsage: e.el.energyUsage,
          bulletsPool: e.el.bulletsPool,
          bulletSpeed: e.el.bulletSpeed,
          bulletLifespan: e.el.bulletLifespan,
          bulletColor: e.el.bulletColor,
          bulletSize: e.el.bulletSize,
        })
      }
    }

    stats.textureKey = texKey
    stats.textureWidth = shipW
    stats.textureHeight = shipH
    stats.forwardThrusters = fwdThrusters
    stats.lateralThrusters = latThrusters
    stats.weaponPositions = weapons
    stats.gridLayout = gridEntries.map(e => ({ id: e.el.id, col: e.col, row: e.row }))

    return stats
  }

  /**
   * Save ship definition to Phaser registry + localStorage.
   */
  static persist(registry, stats) {
    registry.set('shipData', stats)
    registry.set('shipDataVersion', (registry.get('shipDataVersion') || 0) + 1)
    localStorage.setItem('phaserAsteroidsShip', JSON.stringify(stats))
  }

  /**
   * Load ship definition from registry (fallback to localStorage).
   */
  static load(registry) {
    return registry.get('shipData') ||
           JSON.parse(localStorage.getItem('phaserAsteroidsShip') || 'null')
  }
}
