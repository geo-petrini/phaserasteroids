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
        // this.scene = this.config.scene;
        this.type = 'ship';
        this.name = 'playerShip';
        this.status = 'active';

        this.ROTATION = 100
        this.ACCELERATION = 40
        this.TURBO_ACCELERATION_INCREMENT = 5
        this.FIRE_INTERVALL = 5;
        this.REPAIR_INTERVALL = 1000;
        this.REPAIR_AMOUNT = 1;
        this.WEAPONS_RECHARGE_INTERVALL = 200;
        this.WEAPONS_RECHARGE_AMOUNT = 1;
        this.TURBO_INTERVALL = 2000;


        this.setScale(0.5);
        //this.body.maxVelocity.x = 600;
        //this.body.maxVelocity.y = 600;
        this.body.setMaxVelocity(600);
        this.body.setMaxSpeed(600);
        //this.body.setDrag(200, 200);
        this.body.setDrag(0.5);
        this.body.allowDrag = true;
        this.body.useDamping = true;    //https://newdocs.phaser.io/docs/3.55.2/focus/Phaser.Physics.Arcade.Body-useDamping
        this.body.angularDrag = 150;
        this.body.acceleration = this.ACCELERATION;
        this.setDepth(1);
        //this.setDrag(200);
        //this.setAngularDrag(150);
        //ship.setMaxVelocity(700);	//wrong axes https://phaser.discourse.group/t/arcade-physics-incorrect-velocity-vector-when-trying-to-fly-forward/4126        

        this.hull_hb = new HealthBar({ scene: this.config.scene, width: 32, height: 4 });
        this.weapons_hb = new HealthBar({ scene: this.config.scene, width: 32, height: 4, fill_color: 0xffff00 });
        this.turbo_hb = new HealthBar({ scene: this.config.scene, width: 32, height: 4, fill_color: 0x00ffff });
        //this.repairEvent = this.config.scene.time.addEvent({ delay: 1000, callback: this.repairHull, callbackScope: this, loop: true });
        //this.repairEvent = this.config.scene.time.addEvent({ delay: 1000, loop: true });

        fx.createTrail(this, this.config.scene)
        this.assignKeys();
        console.log(this);
    }

    assignKeys() {
        //TODO add events so that keys can be removed from update()

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
        //TODO disable commands
        //TODO display wreckage
    }

    repairHull() {
        if (this.hull_hb.value < 100) {
            // console.log('repairing hb: '+this.hull_hb.value)
            this.hull_hb.increase(this.REPAIR_AMOUNT)
        }
    }

    rechargeWeapons() {
        if (this.weapons_hb.value < 100) {
            // console.log('recharging weapons: '+this.weapons_hb.value)
            this.weapons_hb.increase(this.WEAPONS_RECHARGE_AMOUNT)
        }
    }

    _repositionHealthBars() {
        let v_offset = 4
        this.hull_hb.x = this.x - this.body.width / 2
        this.hull_hb.y = this.y + this.body.height
        this.hull_hb.draw()

        this.weapons_hb.x = this.x - this.body.width / 2
        this.weapons_hb.y = this.y + this.body.height + v_offset
        this.weapons_hb.draw()

        this.turbo_hb.x = this.x - this.body.width / 2
        this.turbo_hb.y = this.y + this.body.height + v_offset * 2
        this.turbo_hb.draw()
    }

    update(keys, time, delta) {
        this._repositionHealthBars()

        if (this.hull_hb.value <= 0) {
            this.explode()
        }

        if (keys == null) {

        } else {
            //console.log('ship: (' + this.x + ';' + this.y + ')')
            if (keys.left.isDown || keys.alt_left.isDown) {
                this.body.setAngularVelocity(this.ROTATION * -1);
            } else if (keys.right.isDown || keys.alt_right.isDown) {
                this.body.setAngularVelocity(this.ROTATION);
            } else {
                //this.setAngularVelocity(0)
                //this.body.angularVelocity = 0;;
            }



            if (keys.up.isDown || keys.alt_up.isDown) {
                //this.physics.velocityFromRotation(this.rotation, 600, this.body.acceleration);
                const vector = this.config.scene.physics.velocityFromRotation(this.rotation, 1);//, this.body.velocity);
                const vel = this.body.velocity

                vel.x += vector.x * this.body.acceleration
                vel.y += vector.y * this.body.acceleration

                this.body.setVelocity(vel.x, vel.y)

            } else {
                //this.body.acceleration = 10
                /*if(this.body.velocity.x>0){
                    this.body.velocity.x = Math.max(this.body.velocity.x * this.body.acceleration*-1, 0)
                }
                if(this.body.velocity.y>0){
                    this.body.velocity.y = Math.max(this.body.velocity.y - this.body.acceleration, 0)
                } */
                //console.log(this.body.velocity)

                //this.setAcceleration(0);
            }


            if (keys.fire.isDown && time > this.lastFired && this.weapons_hb.value > 0) {
                var bullet = this.bullets.get();

                if (bullet) {
                    bullet.fire(this);
                    bullet.setDepth(this.depth - 1);
                    this.lastFired = time + this.FIRE_INTERVALL;
                    this.config.scene.sounds['laser'].play();
                    this.weapons_hb.decrease(1)
                }
            }

            if (time > this.lastRepaired) {
                this.repairHull()
                this.lastRepaired = time + this.REPAIR_INTERVALL;
            }
            if (time > this.lastWeaponsRecharge) {
                this.rechargeWeapons()
                this.lastWeaponsRecharge = time + this.WEAPONS_RECHARGE_INTERVALL;
            }

            /*if (keys.turbo.isDown && time > this.lastTurbo)
            {
                this.config.scene.debug('turbo')
                vel.x += vector.x * this.body.acceleration * this.TURBO_ACCELERATION_INCREMENT
                vel.y += vector.y * this.body.acceleration * this.TURBO_ACCELERATION_INCREMENT    
                
                this.lastTurbo = time + this.TURBO_INTERVALL;
            } */

        }
    }
};