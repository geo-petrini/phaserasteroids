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
        this.TURBO_ACCELERATION_INCREMENT = 5
        this.FIRE_INTERVALL = 15;
        this.HULL_REPAIR_INTERVALL = 10;
        this.HULL_REPAIR_AMOUNT = 0.001;
        this.WEAPONS_RECHARGE_INTERVALL = 10;
        this.WEAPONS_RECHARGE_AMOUNT = 0.1;
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

        this.hull_hb = new HealthBar({ scene: this.config.scene, width: 32, height: 4 , border_color: 0x00000000});
        this.energy_hb = new HealthBar({ scene: this.config.scene, width: 32, height: 4, fill_color: 0xff9c00, border_color: 0x00000000 });
        this.shield_hb = new HealthBar({ scene: this.config.scene, width: 32, height: 4, fill_color: 0x00ffff  , border_color: 0x00000000});

        this.trail_emitter = fx.createTrail(this, this.config.scene)
        this.assignKeys();
        console.log(this);
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
        this.weapons_hb.visible = false;
        this.turbo_hb.visible = false;
        this.visible = false;
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

    _rechargeWeapons() {
        if (this.weapons_hb.value < 100) {
            this.weapons_hb.increase(this.WEAPONS_RECHARGE_AMOUNT)
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

        this.weapons_hb.x = shipScreenX - this.body.width / 2
        this.weapons_hb.y = shipScreenY + this.body.height + v_offset
        this.weapons_hb.draw()

        this.turbo_hb.x = shipScreenX - this.body.width / 2
        this.turbo_hb.y = shipScreenY + this.body.height + v_offset * 2
        this.turbo_hb.draw()
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
        if (this.weapons_hb.value > this.WEAPONS_BULLET_DISCHARGE_AMOUNT) {
            var bullet = this.bullets.get();

            if (bullet) {
                bullet.fire(this);
                bullet.setDepth(this.depth - 1);
                this.lastFired = time + this.FIRE_INTERVALL;
                this.config.scene.sounds['laser'].play({ 'volume': this.config.scene.options.volume_bullets });
                this.weapons_hb.decrease(1)
            }
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
            if (keys.left.isDown || keys.alt_left.isDown) {
                this._rotate("left")
            }
            if (keys.right.isDown || keys.alt_right.isDown) {
                this._rotate("right")
            }

            if (keys.up.isDown || keys.alt_up.isDown) {
                this.trail_emitter.startFollow(this)
                this.trail_emitter.emitting = true
                this._accelerate();
            } else {
                this.trail_emitter.stopFollow()
                this.trail_emitter.emitting = false
            }
            if (keys.turbo.isDown && time > this.lastTurbo) {
                this._accelerate(true);

                this.lastTurbo = time + this.TURBO_INTERVALL;
            }

            if (keys.fire.isDown && time > this.lastFired) {
                this._fire(time);
            }

            if (time > this.lastRepaired) {
                this._repairHull()
                this.lastRepaired = time + this.HULL_REPAIR_INTERVALL;
            }
            if (time > this.lastWeaponsRecharge) {
                this._rechargeWeapons()
                this.lastWeaponsRecharge = time + this.WEAPONS_RECHARGE_INTERVALL;
            }


        }
    }
};
