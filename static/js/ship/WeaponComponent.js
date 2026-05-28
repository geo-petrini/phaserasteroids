import Bullet from '../sprites/bullet.js'

export default class WeaponComponent {
  constructor(offset, shipRef) {
    this.shipRef = shipRef
    this.x = offset.x
    this.y = offset.y
    this.isTracking = offset.isTracking
    this.fireInterval = offset.fireIntervall || 15
    this.energyPerShot = offset.energyUsage || 5
    this.bulletsPool = offset.bulletsPool || 10
    this.bulletSpeed = offset.bulletSpeed || 1000
    this.bulletLifespan = offset.bulletLifespan || 500
    this.bulletColorParsed = offset.bulletColor ? Number(offset.bulletColor) : null
    if (offset.bulletSize) {
      const parts = offset.bulletSize.split('x').map(Number)
      this.bulletScaleX = parts[0]
      this.bulletScaleY = parts[1] || parts[0]
    } else {
      this.bulletScaleX = null
    }
    this.nextFireTime = 0
    this.turretAngle = 0
    this.group = null
  }

  createBulletGroup(scene) {
    this.group = scene.physics.add.group({
      classType: Bullet,
      maxSize: this.bulletsPool,
      runChildUpdate: true,
    })
  }

  fire(shipX, shipY, shipRotation, shipScale, time, energyHb, sounds, volume) {
    if (time < this.nextFireTime) return null
    if (!this.group) return null
    if (energyHb.value < this.energyPerShot) return null

    const cos = Math.cos(shipRotation)
    const sin = Math.sin(shipRotation)
    const wx = shipX + (this.x * shipScale) * cos - (this.y * shipScale) * sin
    const wy = shipY + (this.x * shipScale) * sin + (this.y * shipScale) * cos
    const angle = this.isTracking ? this.turretAngle : shipRotation

    const bullet = this.group.get()
    if (bullet) {
      bullet.fire(this.shipRef, wx, wy, angle, {
        speed: this.bulletSpeed,
        lifespan: this.bulletLifespan,
      })
      if (this.bulletColorParsed !== null) bullet.setTint(this.bulletColorParsed)
      if (this.bulletScaleX !== null) bullet.setSize(this.bulletScaleX, this.bulletScaleY)
      bullet.setDepth(this.shipRef.depth - 1)
    }
    sounds['laser'].play({ volume })
    energyHb.decrease(this.energyPerShot)

    this.nextFireTime = time + this.fireInterval
    return this.nextFireTime
  }

  destroy() {
    if (this.group) {
      this.group.destroy(true)
      this.group = null
    }
  }
}
