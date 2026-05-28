export default class ShipTargeting {
  constructor(scene, trackingWeapons, shipRef) {
    this.shipRef = shipRef
    this.trackingWeapons = trackingWeapons
    this.trackGraphics = null

    if (trackingWeapons.length > 0) {
      this.trackGraphics = scene.add.graphics()
      this.trackGraphics.setDepth(2)
      this.trackGraphics.alpha = 0.4
    }
  }

  assignTargets(asteroids) {
    if (!asteroids) return this.trackingWeapons.map(() => null)
    const shipX = this.shipRef.x
    const shipY = this.shipRef.y
    const sorted = [...asteroids].sort((a, b) => {
      const da = Phaser.Math.Distance.Between(shipX, shipY, a.x, a.y)
      const db = Phaser.Math.Distance.Between(shipX, shipY, b.x, b.y)
      return da - db
    })
    return this.trackingWeapons.map((_, i) => sorted[i] || null)
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

    for (let i = 0; i < this.trackingWeapons.length; i++) {
      const w = this.trackingWeapons[i]
      const target = targets[i]
      if (!target) continue
      const dx = target.x - shipX
      const dy = target.y - shipY
      const desired = Math.atan2(dy, dx)
      const diff = Phaser.Math.Angle.Wrap(desired - w.turretAngle)
      const turnSpeed = 3 * (Math.PI / 180)
      w.turretAngle += Math.abs(diff) > turnSpeed
        ? Math.sign(diff) * turnSpeed
        : diff
    }
  }

  _drawTargetingLasers(targets) {
    const shipX = this.shipRef.x
    const shipY = this.shipRef.y

    for (let i = 0; i < this.trackingWeapons.length; i++) {
      const w = this.trackingWeapons[i]
      const cos = Math.cos(this.shipRef.rotation)
      const sin = Math.sin(this.shipRef.rotation)
      const wx = shipX + (w.x * this.shipRef.scaleX) * cos - (w.y * this.shipRef.scaleX) * sin
      const wy = shipY + (w.x * this.shipRef.scaleX) * sin + (w.y * this.shipRef.scaleX) * cos

      this.trackGraphics.lineStyle(1, 0xff0000, 0.6)
      this.trackGraphics.beginPath()
      this.trackGraphics.moveTo(wx, wy)
      this.trackGraphics.lineTo(
        wx + Math.cos(w.turretAngle) * 150,
        wy + Math.sin(w.turretAngle) * 150
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
