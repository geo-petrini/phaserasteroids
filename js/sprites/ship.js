export default class Ship extends Phaser.GameObjects.Sprite {
    
    lastFired = null;
    
    
    constructor(config) {
        super(config.scene, config.x, config.y, config.texture, config.key);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        this.config = config;
        this.type = 'ship';
        this.name = 'playerShip';

        this.ROTATION = 100
        this.ACCELERATION = 40
        this.FIREINTERVALL = 25;

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
            if (keys.left.isDown || keys.alt_left.isDown) {
                this.body.setAngularVelocity( this.ROTATION*-1);
            } else if (keys.right.isDown || keys.alt_right.isDown) {
                this.body.setAngularVelocity(this.ROTATION);
            } else {
                //this.setAngularVelocity(0)
                //this.body.angularVelocity = 0;;
            }

            if (keys.up.isDown || keys.alt_up.isDown) {
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
                    bullet.setDepth( this.depth -1 );
                    this.lastFired = time + this.FIREINTERVALL;
                    this.config.scene.sounds['laser'].play();
                }
            }
        
        }
    }
};