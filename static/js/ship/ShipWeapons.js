import WeaponComponent from './WeaponComponent.js'

export default class ShipWeapons {
  constructor(weaponPositions, shipRef) {
    this.shipRef = shipRef
    this.weapons = (weaponPositions || []).map(cfg => new WeaponComponent(cfg, shipRef))
    this.trackingWeapons = this.weapons.filter(w => w.isTracking)
    this.fixedWeapons = this.weapons.filter(w => !w.isTracking)
    this._createBulletGroups()
  }

  _createBulletGroups() {
    const scene = this.shipRef.config.scene
    for (const w of this.weapons) {
      w.createBulletGroup(scene)
    }
  }

  fireAll(shipX, shipY, shipRotation, shipScale, time, energyHb, sounds, volume) {
    let nextFired = null
    for (const w of this.weapons) {
      const result = w.fire(shipX, shipY, shipRotation, shipScale, time, energyHb, sounds, volume)
      if (result !== null && (nextFired === null || result < nextFired)) {
        nextFired = result
      }
    }
    return nextFired
  }

  getBulletGroups() {
    return this.weapons.map(w => w.group).filter(Boolean)
  }

  destroy() {
    for (const w of this.weapons) {
      w.destroy()
    }
  }
}
