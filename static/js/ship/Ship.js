import ShipHealth from './ShipHealth.js'
import ShipThrusters from './ShipThrusters.js'
import ShipWeapons from './ShipWeapons.js'
import ShipTargeting from './ShipTargeting.js'
import * as fx from '../sprites/fx.js'

/**
 * Ship — main player entity.
 * Composes specialised subsystems (health, thrusters, weapons, targeting)
 * rather than inheriting every responsibility.
 */
export default class Ship extends Phaser.GameObjects.Sprite {

  constructor(config) {
    super(config.scene, config.x, config.y, config.texture, config.key)
    config.scene.physics.world.enable(this)
    config.scene.add.existing(this)

    this.config = config
    this.type = 'ship'
    this.name = 'playerShip'
    this.status = 'active'

    // ---- stats from editor ----
    this.ROTATION = config.rotation || 180
    this.ACCELERATION = config.accel || 40
    this.ENERGY_GEN = config.energyGen || 0
    this.SHIELD_CAPACITY = config.shieldCapacity || 0
    this.SHIELD_RECHARGE = config.shieldRecharge || 0
    this.TURBO_ACCELERATION_INCREMENT = 5
    this.HULL_REPAIR_INTERVAL = 10
    this.HULL_REPAIR_AMOUNT = 0.001
    this.ENERGY_RECHARGE_INTERVAL = 10
    this.TURBO_INTERVAL = 2000

    // ---- timers ----
    this.lastRepaired = null
    this.lastWeaponsRecharge = null
    this.lastShieldRecharge = null
    this.lastTurbo = null

    // ---- visual scale ----
    if (config.scale !== undefined) this.setScale(config.scale)
    else this.setScale(0.5)

    // ---- physics ----
    this.body.setMaxVelocity(600)
    this.body.setMaxSpeed(600)
    this.body.setDrag(0.5)
    this.body.allowDrag = true
    this.body.useDamping = true
    this.body.angularDrag = 150
    this.body.acceleration = this.ACCELERATION
    this.setDepth(1)

    // ---- subsystems ----
    this.health = new ShipHealth(config.scene, this.body.width, this.SHIELD_CAPACITY)
    this.thrusters = new ShipThrusters(config.scene, this.scaleX, config.forwardThrusters, config.lateralThrusters, this)
    this.weapons = new ShipWeapons(config.weaponPositions, this)
    this.targeting = new ShipTargeting(config.scene, this.weapons.trackingWeapons, this)

    this.keys = null
  }

  // ======================================================================
  //  Damage & destruction
  // ======================================================================

  damage(amount) { this.health.damage(amount) }

  explode() {
    this.status = 'destroyed'
    this.health.explode()
    this.visible = false
    this.thrusters.destroy()
    this.targeting.destroy()
    fx.createSmokeFX(this.x, this.y, this.config.scene)
    fx.createFlameFX(this.x, this.y, this.config.scene)
    fx.createBlastFX(this.x, this.y, this.config.scene)
    this.keys = null
  }

  // ======================================================================
  //  Options (read from scene options each frame)
  // ======================================================================

  _checkOptions() {
    const opts = this.config.scene.options
    this.HULL_REPAIR_AMOUNT = opts.player_hull_repair_amount
  }

  // ======================================================================
  //  Regeneration ticks
  // ======================================================================

  _repairHull() {
    if (this.health.hull_hb.value < 100) {
      this.health.hull_hb.increase(this.HULL_REPAIR_AMOUNT)
    }
  }

  _rechargeEnergy() {
    if (this.health.energy_hb.value < 100) {
      this.health.energy_hb.increase(this.ENERGY_GEN)
    }
  }

  // ======================================================================
  //  Input-driven actions
  // ======================================================================

  _rotate(dir) {
    this.body.setAngularVelocity(this.ROTATION * (dir === 'left' ? -1 : 1))
  }

  _accelerate(turbo = false) {
    const vec = this.config.scene.physics.velocityFromRotation(this.rotation, 1)
    const multiplier = turbo ? this.TURBO_ACCELERATION_INCREMENT : 1
    this.body.velocity.x += vec.x * this.body.acceleration * multiplier
    this.body.velocity.y += vec.y * this.body.acceleration * multiplier
  }

  // ======================================================================
  //  Health bar repositioning (screen-space, every frame)
  // ======================================================================

  _repositionHealthBars() {
    this.health.reposition(this.config.scene.cameras.main)
  }

  // ======================================================================
  //  Main update loop (called from GameScene)
  // ======================================================================

  update(keys, time, delta) {
    this._checkOptions()
    this._repositionHealthBars()

    if (this.health.hull_hb.value <= 0) { this.explode(); return }

    if (!keys) return

    // ---- rotation ----
    let rotDir = 0
    if (keys.left.isDown || keys.alt_left.isDown) { this._rotate('left'); rotDir = -1 }
    if (keys.right.isDown || keys.alt_right.isDown) { this._rotate('right'); rotDir = 1 }

    // ---- acceleration ----
    const isAccel = keys.up.isDown || keys.alt_up.isDown
    if (isAccel) this._accelerate()
    if (keys.turbo.isDown && time > this.lastTurbo) {
      this._accelerate(true)
      this.lastTurbo = time + this.TURBO_INTERVAL
    }

    // ---- subsystem updates ----
    this.thrusters.update(this.x, this.y, this.rotation, this.scaleX, isAccel, rotDir)
    this.targeting.update(this.config.scene.asteroidsArray)

    // ---- firing ----
    if (keys.fire.isDown) {
      this.weapons.fireAll(
        this.x, this.y, this.rotation, this.scaleX, time,
        this.health.energy_hb, this.config.scene.sounds,
        this.config.scene.options.volume_bullets
      )
    }

    // ---- timed regeneration ----
    if (time > this.lastRepaired) {
      this._repairHull()
      this.lastRepaired = time + this.HULL_REPAIR_INTERVAL
    }
    if (time > this.lastWeaponsRecharge) {
      this._rechargeEnergy()
      this.lastWeaponsRecharge = time + this.ENERGY_RECHARGE_INTERVAL
    }
    if (time > this.lastShieldRecharge) {
      if (this.SHIELD_RECHARGE > 0) {
        this.health.rechargeShield(this.SHIELD_RECHARGE, this.health.energy_hb)
      }
      this.lastShieldRecharge = time + this.ENERGY_RECHARGE_INTERVAL
    }
  }

  destroy() {
    if (this.thrusters) this.thrusters.destroy()
    if (this.targeting) this.targeting.destroy()
    if (this.weapons) this.weapons.destroy()
    if (this.health) this.health.destroy()
    super.destroy()
  }

  toString() {
    return `Ship(hull:${this.health.hull_hb.value.toFixed(1)} energy:${this.health.energy_hb.value.toFixed(1)})`
  }
}
