export default class Ship extends Phaser.GameObjects.Sprite {
    
    lastFired = null;
    fireIntervall = 350;
    
    constructor(config) {
        super(config.scene, config.x, config.y, config.texture, config.key);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        this.config = config;
        this.type = 'ship';

        this.setScale(0.5);
        //this.body.maxVelocity.x = 600;
        //this.body.maxVelocity.y = 600;
        this.body.setMaxVelocity(600);
        this.body.setDrag(200, 200);
        //his.body.useDamping = true
        this.body.allowDrag = true
        this.body.angularDrag = 150;
        this.body.acceleration = 50;
        //this.setDrag(200);
        //this.setAngularDrag(150);
        //ship.setMaxVelocity(700);	//wrong axes https://phaser.discourse.group/t/arcade-physics-incorrect-velocity-vector-when-trying-to-fly-forward/4126        
        console.log(this);     
    }

    assignBullets(bullets, bulletSound){
        this.bullets = bullets;
        this.bulletSound = bulletSound
    }

    update(keys, time, delta) {
        
        if (keys == null) {
            
        }else{
            //console.log('ship: (' + this.x + ';' + this.y + ')')
            if (keys.left.isDown) {
                this.body.setAngularVelocity( -150);
            } else if (keys.right.isDown) {
                this.body.setAngularVelocity(150);
            } else {
                //this.setAngularVelocity(0)
                //this.body.angularVelocity = 0;;
            }

            if (keys.up.isDown) {
                //this.physics.velocityFromRotation(this.rotation, 600, this.body.acceleration);
                const vector = this.scene.physics.velocityFromRotation(this.rotation, 1);//, this.body.velocity);
                const vel = this.body.velocity
                vel.x += vector.x * this.body.acceleration
                vel.y += vector.y * this.body.acceleration

                this.body.setVelocity(vel.x, vel.y )

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

            
            if (keys.fire.isDown && time > this.lastFired)
            {
                var bullet = this.bullets.get();
        
                if (bullet)
                {
                    bullet.fire(this);
                    this.lastFired = time + this.fireIntervall;
                    this.config.scene.sounds['laser'].play();
                }
            }
        
        }
    }
};