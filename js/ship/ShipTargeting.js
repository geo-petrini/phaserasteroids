export default class ShipTargeting {
  constructor(scene, trackWeaponOffsets, trackTurretAngles, shipRef) {
    this.shipRef = shipRef
    this.trackWeaponOffsets = trackWeaponOffsets
    this.trackTurretAngles = trackTurretAngles
    this.trackGraphics = null

    if (trackWeaponOffsets.length > 0) {
      this.trackGraphics = scene.add.graphics()
      this.trackGraphics.setDepth(2)
    }
  }

  /**
   * Assigns one unique target per tracking weapon, sorted by distance.
   * Weapon i targets asteroids[i]; excess weapons get null.
   */
  assignTargets(asteroids) {
    if (!asteroids) return this.trackWeaponOffsets.map(() => null)
    const shipX = this.shipRef.x
    const shipY = this.shipRef.y
    const sorted = [...asteroids].sort((a, b) => {
      const da = Phaser.Math.Distance.Between(shipX, shipY, a.x, a.y)
      const db = Phaser.Math.Distance.Between(shipX, shipY, b.x, b.y)
      return da - db
    })
    return this.trackWeaponOffsets.map((_, i) => sorted[i] || null)
  }

  update(asteroids) {
    if (!this.trackGraphics) return
    this.trackGraphics.clear()

    const targets = this.assignTargets(asteroids)
    this._updateTurretAngles(targets)
    this._drawTargetingLasers(targets)
    this._drawTargetCrosses(targets)
  }

  _updateTurretAngles(targets) {
    const shipX = this.shipRef.x
    const shipY = this.shipRef.y

    for (let i = 0; i < this.trackWeaponOffsets.length; i++) {
      const target = targets[i]
      if (!target) continue
      const dx = target.x - shipX
      const dy = target.y - shipY
      const desired = Math.atan2(dy, dx)
      const diff = Phaser.Math.Angle.Wrap(desired - this.trackTurretAngles[i])
      const turnSpeed = 3 * (Math.PI / 180)
      this.trackTurretAngles[i] += Math.abs(diff) > turnSpeed
        ? Math.sign(diff) * turnSpeed
        : diff
    }
  }

  _drawTargetingLasers(targets) {
    const scaleX = this.shipRef.scaleX
    const rotation = this.shipRef.rotation
    const shipX = this.shipRef.x
    const shipY = this.shipRef.y

    for (let i = 0; i < this.trackWeaponOffsets.length; i++) {
      const off = this.trackWeaponOffsets[i]
      const cos = Math.cos(rotation)
      const sin = Math.sin(rotation)
      const wx = shipX + (off.x * scaleX) * cos - (off.y * scaleX) * sin
      const wy = shipY + (off.x * scaleX) * sin + (off.y * scaleX) * cos

      this.trackGraphics.lineStyle(1, 0xff0000, 0.6)
      this.trackGraphics.beginPath()
      this.trackGraphics.moveTo(wx, wy)
      this.trackGraphics.lineTo(
        wx + Math.cos(this.trackTurretAngles[i]) * 150,
        wy + Math.sin(this.trackTurretAngles[i]) * 150
      )
      this.trackGraphics.strokePath()
    }
  }

  _drawTargetCrosses(targets) {
    for (const target of targets) {
      if (!target) continue
      const size = 8
      this.trackGraphics.lineStyle(2, 0xff0000, 1)
      this.trackGraphics.beginPath()
      this.trackGraphics.moveTo(target.x - size, target.y - size)
      this.trackGraphics.lineTo(target.x + size, target.y + size)
      this.trackGraphics.moveTo(target.x + size, target.y - size)
      this.trackGraphics.lineTo(target.x - size, target.y + size)
      this.trackGraphics.strokePath()
    }
  }

  destroy() {
    if (this.trackGraphics) this.trackGraphics.destroy()
  }
}
