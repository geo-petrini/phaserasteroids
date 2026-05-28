export default class ShipWeapons {
  constructor(weaponPositions, shipRef) {
    this.shipRef = shipRef
    this.weaponOffsets = weaponPositions || []
    this.trackWeaponOffsets = this.weaponOffsets.filter(w => w.isTracking)
    this.fixedWeaponOffsets = this.weaponOffsets.filter(w => !w.isTracking)
    this.trackTurretAngles = this.trackWeaponOffsets.map(() => 0)
  }

  _computeWorldPos(off, shipX, shipY, rotation, scaleX) {
    const cos = Math.cos(rotation)
    const sin = Math.sin(rotation)
    return {
      x: shipX + (off.x * scaleX) * cos - (off.y * scaleX) * sin,
      y: shipY + (off.x * scaleX) * sin + (off.y * scaleX) * cos,
    }
  }

  fireFixed(shipX, shipY, rotation, scaleX, bullets, time, fireInterval, energyHb, sounds, volume) {
    if (this.fixedWeaponOffsets.length === 0) return null
    if (energyHb.value <= 5) return null

    for (const off of this.fixedWeaponOffsets) {
      const wp = this._computeWorldPos(off, shipX, shipY, rotation, scaleX)
      const bullet = bullets.get()
      if (bullet) {
        bullet.fire(this.shipRef, wp.x, wp.y)
        bullet.setDepth(this.shipRef.depth - 1)
      }
    }
    sounds['laser'].play({ volume })
    energyHb.decrease(1)
    return time + fireInterval
  }

  fireTracking(shipX, shipY, rotation, scaleX, bullets, time, fireInterval, energyHb, sounds, volume) {
    if (this.trackWeaponOffsets.length === 0) return null
    if (energyHb.value <= 5) return null

    let anyFired = false
    for (let i = 0; i < this.trackWeaponOffsets.length; i++) {
      const off = this.trackWeaponOffsets[i]
      const wp = this._computeWorldPos(off, shipX, shipY, rotation, scaleX)
      const bullet = bullets.get()
      if (bullet) {
        bullet.fire(this.shipRef, wp.x, wp.y, this.trackTurretAngles[i])
        bullet.setDepth(this.shipRef.depth - 1)
        anyFired = true
      }
    }
    if (anyFired) {
      sounds['laser'].play({ volume })
      energyHb.decrease(1)
      return time + fireInterval
    }
    return null
  }
}
