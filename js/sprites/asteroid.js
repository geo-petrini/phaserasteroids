export default class Asteroid extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);

        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        this.play(config.key)

        this.config = config;

        this.type = config.type;


        if (this.type == 'BIG') {
            this.setScale(Phaser.Math.FloatBetween(1.2, 0.8));
            this.body.setMaxVelocity(100);
            this.vel = new Phaser.Math.Vector2(Phaser.Math.RND.integerInRange(-30, 30), Phaser.Math.RND.integerInRange(-30, 30));
            this.avel = Phaser.Math.FloatBetween(-30, 30)
        }
        if (this.type == 'MEDIUM') {
            this.setScale(Phaser.Math.FloatBetween(0.5, 0.3));
            this.body.setMaxVelocity(150);
            this.vel = new Phaser.Math.Vector2(Phaser.Math.RND.integerInRange(-40, 40), Phaser.Math.RND.integerInRange(-40, 40));
            this.avel = Phaser.Math.FloatBetween(-40, 40)
        }
        if (this.type == 'SMALL') {
            this.setScale(Phaser.Math.FloatBetween(0.25, 0.20));
            this.body.setMaxVelocity(200);
            this.vel = new Phaser.Math.Vector2(Phaser.Math.RND.integerInRange(-60, 60), Phaser.Math.RND.integerInRange(-60, 60));
            this.avel = Phaser.Math.FloatBetween(-60, 60)
        }

        this.setRotation(Phaser.Math.FloatBetween(0, 1));
        this.body.setCircle(Math.max(this.width, this.height) / 2); //collision bounds
        this.body.updateBounds();

        //this.setMass(this.type)

        this.firstRound = true;

        this.config.scene.asteroidsGroup.add(this);
        this.config.scene.asteroidsArray.push(this);
    }

    setMass(type) {
        if (type == 'BIG') { this.body.mass = 10 }
        if (type == 'MEDIUM') { this.body.mass = 5 }
        if (type == 'SMALL') { this.body.mass = 2 }
    }

    update() {
        if (this.firstRound && this.body != undefined) {
            this.body.setVelocity(this.vel.x, this.vel.y)
            this.body.setAngularVelocity(this.avel);
            this.firstRound = false;
        }
    }

    createChild() {
        let type = 'BIG';
        if (this.type == 'BIG') { type = 'MEDIUM' }
        if (this.type == 'MEDIUM') { type = 'SMALL' }
        if (this.type == 'SMALL') { type = 'DUST' }

        var asteroid = new Asteroid({ scene: this.config.scene, key: this.config.key, x: this.x, y: this.y, type: type });

        if (asteroid.type == 'DUST') {
            asteroid.destroy();
        }
        let emitterSmoke = this.config.scene.add.particles('smoke').createEmitter({
            x: asteroid.x,
            y: asteroid.y,
            speed: { min: 1, max: 10 },
            angle: { min: 0, max: 270 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 1, end: 0 },
            blendMode: 'SCREEN',
            active: true,
            lifespan: 600, //milliseconds
        });
        let emitterFlame = this.config.scene.add.particles('flame').createEmitter({
            x: asteroid.x,
            y: asteroid.y,
            speed: { min: 1, max: 10 },
            angle: { min: 0, max: 270 },
            scale: { start: 0.5, end: 1 },
            alpha: { start: 0.5, end: 0 },
            blendMode: 'SCREEN',
            active: true,
            lifespan: 600, //milliseconds
        });        
        emitterSmoke.explode();
        emitterFlame.explode();

        if (this.type == 'BIG') {
            let emitterBlast = this.config.scene.add.particles('blastwave').createEmitter({
                x: asteroid.x,
                y: asteroid.y,
                speed: { min: 0, max: 0 },
                angle: { min: 0, max: 270 },
                scale: { start: 0.1, end: 0.8 },
                alpha: { start: 0.5, end: 0 },
                blendMode: 'SCREEN',
                active: true,
                lifespan: 600, //milliseconds
            });
            emitterBlast.explode();
        }    
    }

    toString() {
        let str = 'Asteroid(';
        str += 'x: ~' + this.x.toFixed(2);
        str += ', y: ~' + this.y.toFixed(2);
        str += ', w: ~' + this.width.toFixed(2);
        str += ', h: ~' + this.height.toFixed(2);
        str += ', scale: ~' + this.scaleX.toFixed(2);
        str += ', rotation: ~' + this.rotation.toFixed(2);
        str += ', vel: (' + this.vel.x + ',' + this.vel.y + ')';
        str += ', type: ' + this.type;
        str += ', key: ' + this.config.key;
        str += ', body: ' + this.body;
        str += ')';
        return str;
    }
};