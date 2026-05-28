import HealthBar from './healthbar.js';
import * as fx from './fx.js';

export default class Ship extends Phaser.GameObjects.Sprite {

    lastFired = null;
    lastRepaired = null;
    lastWeaponsRecharge = null;
    lastTurbo = null;

    constructor(config) {
        super(config.scene, config.x, config.y, config.texture, config.key);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        this.config = config;
        this.type = 'ship';
        this.name = 'playerShip';
        this.status = 'active';

        this.ROTATION = config.rotation || 180
        this.ACCELERATION = config.accel || 40
        this.ENERGY_GEN = config.energyGen || 0
        this.TURBO_ACCELERATION_INCREMENT = 5
        this.FIRE_INTERVALL = 15;
        this.HULL_REPAIR_INTERVALL = 10;
        this.HULL_REPAIR_AMOUNT = 0.001;
        this.ENERGY_RECHARGE_INTERVALL = 10;
        // this.WEAPONS_RECHARGE_AMOUNT = 0.1;
        this.WEAPONS_BULLET_DISCHARGE_AMOUNT = 5;
        this.TURBO_INTERVALL = 2000;

        if (config.scale !== undefined) {
            this.setScale(config.scale);
        } else {
            this.setScale(0.5);
        }

        this.body.setMaxVelocity(600);
        this.body.setMaxSpeed(600);
        this.body.setDrag(0.5);
        this.body.allowDrag = true;
        this.body.useDamping = true;
        this.body.angularDrag = 150;
        this.body.acceleration = this.ACCELERATION;
        this.setDepth(1);

        this.hull_hb = new HealthBar({ scene: this.config.scene, width: 32, height: 4, border_color: 0x00000000 });
        this.energy_hb = new HealthBar({ scene: this.config.scene, width: 32, height: 4, fill_color: 0xff9c00, border_color: 0x00000000 });
        this.shield_hb = new HealthBar({ scene: this.config.scene, width: 32, height: 4, fill_color: 0x00ffff, border_color: 0x00000000 });

        this.forwardEmitters = []
        this.lateralEmitters = []

        const ps = this.scaleX

        if (config.forwardThrusters) {
            for (const t of config.forwardThrusters) {
                const e = config.scene.add.particles(0, 0, 'smoke', {
                    speed: { min: 10 * ps, max: 50 * ps },
                    angle: {
                        onEmit: () => (this.angle + 180) + Phaser.Math.Between(-20, 20),
                    },
                    scale: { start: ps, end: ps * 0.2 },
                    alpha: { start: 0.6, end: 0 },
                    lifespan: 400,
                    emitting: false,
                    blendMode: 'ADD',
                })
                this.forwardEmitters.push({ emitter: e, ox: t.x, oy: t.y })
            }
        }

        if (config.lateralThrusters) {
            for (const t of config.lateralThrusters) {
                const side = t.y >= 0 ? 1 : -1
                const e = config.scene.add.particles(0, 0, 'smoke', {
                    speed: { min: 10 * ps, max: 40 * ps },
                    angle: {
                        onEmit: () => (this.angle + 90 * side) + Phaser.Math.Between(-15, 15),
                    },
                    scale: { start: ps * 0.8, end: ps * 0.1 },
                    alpha: { start: 0.5, end: 0 },
                    lifespan: 300,
                    emitting: false,
                    blendMode: 'ADD',
                })
                this.lateralEmitters.push({ emitter: e, ox: t.x, oy: t.y, side })
            }
        }

        this.weaponOffsets = config.weaponPositions || []
        this.trackWeaponOffsets = this.weaponOffsets.filter(w => w.isTracking)
        this.fixedWeaponOffsets = this.weaponOffsets.filter(w => !w.isTracking)

        this.trackTurretAngles = this.trackWeaponOffsets.map(() => 0)

        if (this.trackWeaponOffsets.length > 0) {
            this.trackGraphics = config.scene.add.graphics()
            this.trackGraphics.setDepth(2)
            this.trackGraphics.alpha = 0.5
        }

        this.assignKeys()
        console.log(this)
    }

    assignKeys() {
    }

    assignBullets(bullets, bulletSound) {
        this.bullets = bullets;
        this.bulletSound = bulletSound
    }

    damage(amount) {
        this.hull_hb.decrease(amount)
    }

    explode() {
        this.status = 'destroyed'
        this.hull_hb.visible = false;
        this.energy_hb.visible = false;
        this.shield_hb.visible = false;
        this.visible = false;
        for (const fe of this.forwardEmitters) { fe.emitter.emitting = false; fe.emitter.destroy() }
        for (const le of this.lateralEmitters) { le.emitter.emitting = false; le.emitter.destroy() }
        if (this.trackGraphics) this.trackGraphics.destroy()
        fx.createSmokeFX(this.x, this.y, this.config.scene);
        fx.createFlameFX(this.x, this.y, this.config.scene);
        fx.createBlastFX(this.x, this.y, this.config.scene);
        this.keys = null;
    }

    _checkOptions() {
        const options = this.config.scene.options;
        this.HULL_REPAIR_AMOUNT = options.player_hull_repair_amount
        this.WEAPONS_RECHARGE_AMOUNT = options.player_weapons_recharge_amount
    }

    _repairHull() {
        if (this.hull_hb.value < 100) {
            this.hull_hb.increase(this.HULL_REPAIR_AMOUNT)
        }
    }

    _rechargeEnergy() {
        if (this.energy_hb.value < 100) {
            this.energy_hb.increase(this.ENERGY_GEN)
        }
    }

    _repositionHealthBars() {
        const cam = this.config.scene.cameras.main
        let v_offset = 4

        const shipScreenX = cam.width / 2
        const shipScreenY = cam.height / 2

        this.hull_hb.x = shipScreenX - this.body.width / 2
        this.hull_hb.y = shipScreenY + this.body.height
        this.hull_hb.draw()

        this.energy_hb.x = shipScreenX - this.body.width / 2
        this.energy_hb.y = shipScreenY + this.body.height + v_offset
        this.energy_hb.draw()

        this.shield_hb.x = shipScreenX - this.body.width / 2
        this.shield_hb.y = shipScreenY + this.body.height + v_offset * 2
        this.shield_hb.draw()
    }

    _rotate(direction) {
        if (direction == "left") {
            this.body.setAngularVelocity(this.ROTATION * -1);
        }
        if (direction == "right") {
            this.body.setAngularVelocity(this.ROTATION);
        }
    }

    _accelerate(turbo = false) {
        const vector = this.config.scene.physics.velocityFromRotation(this.rotation, 1);
        const vel = this.body.velocity
        if (turbo) {
            vel.x += vector.x * this.body.acceleration * this.TURBO_ACCELERATION_INCREMENT
            vel.y += vector.y * this.body.acceleration * this.TURBO_ACCELERATION_INCREMENT
        } else {
            vel.x += vector.x * this.body.acceleration
            vel.y += vector.y * this.body.acceleration
        }
        this.body.setVelocity(vel.x, vel.y)
    }

    _fire(time) {
        if (this.energy_hb.value > this.WEAPONS_BULLET_DISCHARGE_AMOUNT) {
            const s = this.scaleX
            for (const off of this.fixedWeaponOffsets) {
                const cos = Math.cos(this.rotation)
                const sin = Math.sin(this.rotation)
                const wx = this.x + (off.x * s) * cos - (off.y * s) * sin
                const wy = this.y + (off.x * s) * sin + (off.y * s) * cos
                const bullet = this.bullets.get()
                if (bullet) {
                    bullet.fire(this, wx, wy)
                    bullet.setDepth(this.depth - 1)
                }
            }
            this.lastFired = time + this.FIRE_INTERVALL
            if (this.fixedWeaponOffsets.length > 0) {
                this.config.scene.sounds['laser'].play({ 'volume': this.config.scene.options.volume_bullets })
                this.energy_hb.decrease(1)
            }
        }
    }

    _assignTargets(asteroids) {
        if (!asteroids) return this.trackWeaponOffsets.map(() => null)
        const sorted = [...asteroids].sort((a, b) => {
            const da = Phaser.Math.Distance.Between(this.x, this.y, a.x, a.y)
            const db = Phaser.Math.Distance.Between(this.x, this.y, b.x, b.y)
            return da - db
        })
        return this.trackWeaponOffsets.map((_, i) => sorted[i] || null)
    }

    _updateTrackingVisuals(asteroids) {
        if (!this.trackWeaponOffsets.length) return
        this.trackGraphics.clear()

        const targets = this._assignTargets(asteroids)
        const s = this.scaleX

        for (let i = 0; i < this.trackWeaponOffsets.length; i++) {
            const target = targets[i]
            if (target) {
                const dx = target.x - this.x
                const dy = target.y - this.y
                const desiredAngle = Math.atan2(dy, dx)
                const diff = Phaser.Math.Angle.Wrap(desiredAngle - this.trackTurretAngles[i])
                const turnSpeed = 3 * (Math.PI / 180)
                if (Math.abs(diff) > turnSpeed) {
                    this.trackTurretAngles[i] += Math.sign(diff) * turnSpeed
                } else {
                    this.trackTurretAngles[i] = desiredAngle
                }
            }

            const off = this.trackWeaponOffsets[i]
            const cos = Math.cos(this.rotation)
            const sin = Math.sin(this.rotation)
            const wx = this.x + off.x * s * cos - off.y * s * sin
            const wy = this.y + off.x * s * sin + off.y * s * cos

            this.trackGraphics.lineStyle(1, 0xff0000, 0.6)
            this.trackGraphics.beginPath()
            this.trackGraphics.moveTo(wx, wy)
            this.trackGraphics.lineTo(
                wx + Math.cos(this.trackTurretAngles[i]) * 150,
                wy + Math.sin(this.trackTurretAngles[i]) * 150
            )
            this.trackGraphics.strokePath()
        }

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

    _fireTracking(time) {
        if (this.energy_hb.value > this.WEAPONS_BULLET_DISCHARGE_AMOUNT) {
            const s = this.scaleX
            let anyFired = false
            for (let i = 0; i < this.trackWeaponOffsets.length; i++) {
                const off = this.trackWeaponOffsets[i]
                const cos = Math.cos(this.rotation)
                const sin = Math.sin(this.rotation)
                const wx = this.x + off.x * s * cos - off.y * s * sin
                const wy = this.y + off.x * s * sin + off.y * s * cos
                const bullet = this.bullets.get()
                if (bullet) {
                    bullet.fire(this, wx, wy, this.trackTurretAngles[i])
                    bullet.setDepth(this.depth - 1)
                    anyFired = true
                }
            }
            if (anyFired) {
                this.lastFired = time + this.FIRE_INTERVALL
                this.config.scene.sounds['laser'].play({ 'volume': this.config.scene.options.volume_bullets })
                this.energy_hb.decrease(1)
            }
        }
    }

    _updateThrusterEmitters(isAccelerating, rotDir) {
        const s = this.scaleX
        for (const fe of this.forwardEmitters) {
            const cos = Math.cos(this.rotation)
            const sin = Math.sin(this.rotation)
            fe.emitter.setPosition(
                this.x + (fe.ox * s) * cos - (fe.oy * s) * sin,
                this.y + (fe.ox * s) * sin + (fe.oy * s) * cos
            )
            fe.emitter.emitting = isAccelerating
        }

        for (const le of this.lateralEmitters) {
            const cos = Math.cos(this.rotation)
            const sin = Math.sin(this.rotation)
            le.emitter.setPosition(
                this.x + (le.ox * s) * cos - (le.oy * s) * sin,
                this.y + (le.ox * s) * sin + (le.oy * s) * cos
            )
            le.emitter.emitting = rotDir !== 0
        }
    }

    toString() {
        let outstr = ""
        outstr += 'Ship('
        outstr += `center: {x: ${this.x.toFixed(2)} y: ${this.y.toFixed(2)} `
        outstr += ', ' + `hull_hb: {x:${this.hull_hb.x}, y:${this.hull_hb.y}} `
        outstr += ')'
        return outstr
    }

    update(keys, time, delta) {
        this._checkOptions()
        this._repositionHealthBars()

        if (this.hull_hb.value <= 0) {
            this.explode()
        }

        if (keys == null) {

        } else {
            let rotDir = 0
            if (keys.left.isDown || keys.alt_left.isDown) {
                this._rotate("left")
                rotDir = -1
            }
            if (keys.right.isDown || keys.alt_right.isDown) {
                this._rotate("right")
                rotDir = 1
            }

            const isAccel = keys.up.isDown || keys.alt_up.isDown
            if (isAccel) {
                this._accelerate()
            }
            if (keys.turbo.isDown && time > this.lastTurbo) {
                this._accelerate(true)
                this.lastTurbo = time + this.TURBO_INTERVALL
            }

            this._updateThrusterEmitters(isAccel, rotDir)
            this._updateTrackingVisuals(this.config.scene.asteroidsArray)

            if (keys.fire.isDown && time > this.lastFired) {
                this._fire(time)
                this._fireTracking(time)
            }

            if (time > this.lastRepaired) {
                this._repairHull()
                this.lastRepaired = time + this.HULL_REPAIR_INTERVALL;
            }
            if (time > this.lastWeaponsRecharge) {
                this._rechargeEnergy()
                this.lastWeaponsRecharge = time + this.ENERGY_RECHARGE_INTERVALL;
            }
        }
    }
};
