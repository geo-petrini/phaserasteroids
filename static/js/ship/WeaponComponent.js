import Bullet from '../sprites/bullet.js'

export default class WeaponComponent {
  constructor(cfg, shipRef) {
    this.shipRef = shipRef
    this.x = cfg.x
    this.y = cfg.y
    this.isTracking = cfg.isTracking
    this.fireInterval = cfg.fireIntervall || 15
    this.energyPerShot = cfg.energyUsage || 5
    this.bulletsPool = cfg.bulletsPool || 10
    this.bulletSpeed = cfg.bulletSpeed || 1000
    this.bulletLifespan = cfg.bulletLifespan || 500
    this.bulletColorParsed = cfg.bulletColor ? Number(cfg.bulletColor) : null
    if (cfg.bulletSize) {
      const parts = cfg.bulletSize.split('x').map(Number)
      this.bulletScaleX = parts[0]
      this.bulletScaleY = parts[1] || parts[0]
    } else {
      this.bulletScaleX = null
    }
    this.nextFireTime = 0
    this.turretAngle = 0
    this.group = null
    this.laserLength = cfg.laserLength || 0
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
      if (this.bulletScaleX !== null) {
        bullet.setDisplaySize(this.bulletScaleX, this.bulletScaleY)
        const bw = Math.max(this.bulletScaleX, 6)
        const bh = Math.max(this.bulletScaleY, 6)
        bullet.body.setSize(bw, bh, true)
      }
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
