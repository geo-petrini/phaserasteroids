import Ship from '../sprites/ship.js'
import Bullet from '../sprites/bullet.js'
import Asteroid from '../sprites/asteroid.js';


class GameScene extends Phaser.Scene {
    asteroidsArray = [];

    constructor(test) {
        super({
            key: 'GameScene'
        });
    }

    preload() {
        this.canvas = this.sys.game.canvas;
    }

    	

    create() {
        console.log('create');
        let { game_width, game_height } = this.sys.game.canvas;
        this.game_width = game_width;
        this.game_height = game_height;
        //  World size is 8000 x 6000
        this.WORLD_WIDTH = 8000;
        this.WORLD_HEIGHT = 8000;
        this.MAX_ASTEROIDS = this.WORLD_WIDTH*0.1;

        this.createBackground();
        this.text = this.add.text(32, 32, { color: '#fff' });

        var spaceAtlasTexture = this.textures.get('space');

        var spaceFrames = spaceAtlasTexture.getFrameNames();
        //for (var i = 0; i < spaceFrames.length; i++){
        //    console.log(spaceFrames[i]);
        //}

        //var player_keys = this.input.keyboard.createCursorKeys();
        //player_keys.fire = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.player_keys = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
            fire: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
        };
        this.createShip();
        this.createAsteroids();
    
        this.physics.add.collider(this.ship, this.asteroidsGroup, this.collideShip)
        //this.physics.add.collider(this.asteroidsGroup,this.asteroidsGroup, this.collideAsteroid)        
        this.physics.add.collider(this.bullets,this.asteroidsGroup, this.collideBullet)        
    }

    createBackground() {
        //this.bg = this.add.tileSprite(this.game_width / 2, this.game_height / 2, this.game_width, this.game_height, 'background').setScrollFactor(0);
        this.bg = this.add.tileSprite(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT, 'background').setScrollFactor(0);
        //  Add our planets, etc

        this.add.image(512, 680, 'space', 'blue-planet').setOrigin(0).setScrollFactor(0.6);
        this.add.image(2833, 1246, 'space', 'brown-planet').setOrigin(0).setScrollFactor(0.6);
        this.add.image(3875, 531, 'space', 'sun').setOrigin(0).setScrollFactor(0.6);
        var galaxy = this.add.image(5345 + 1024, 327 + 1024, 'space', 'galaxy').setBlendMode(1).setScrollFactor(0.6);
        this.add.image(908, 3922, 'space', 'gas-giant').setOrigin(0).setScrollFactor(0.6);
        this.add.image(3140, 2974, 'space', 'brown-planet').setOrigin(0).setScrollFactor(0.6).setScale(0.8).setTint(0x882d2d);
        this.add.image(6052, 4280, 'space', 'purple-planet').setOrigin(0).setScrollFactor(0.6);

        for (var i = 0; i < 8; i++) {
            this.add.image(Phaser.Math.Between(0, this.WORLD_WIDTH), Phaser.Math.Between(0, this.WORLD_HEIGHT), 'space', 'eyes').setBlendMode(1).setScrollFactor(0.8);
        }

        //this.stars = this.add.tileSprite(this.game_width / 2, this.game_height / 2, this.game_width, this.game_height, 'stars').setScrollFactor(0);
        this.stars = this.add.tileSprite(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT, 'stars').setScrollFactor(0);        

        this.tweens.add({
            targets: galaxy,
            angle: 360,
            duration: 100000,
            ease: 'Linear',
            loop: -1
        });
    }

    createShip(){
        this.ship = new Ship({
            scene: this,
            key: 'ship',
            texture: 'space',
            x: this.WORLD_WIDTH / 2,
            y: this.WORLD_HEIGHT / 2
                //x: 48, //this.WORLD_WIDTH/2,
                //y: 48 //this.WORLD_HEIGHT/2 //this.sys.game.config.height - 48 - 48
        });

        this.cameras.main.startFollow(this.ship);

        this.bullets = this.physics.add.group({
            classType: Bullet,
            maxSize: 30,
            runChildUpdate: true
        });
        this.ship.assignBullets(this.bullets);

        this.createTrail(this.ship);
    }

    createTrail(source){
        var particles = this.add.particles('space');

        var emitterTrail = particles.createEmitter({
            frame: 'blue',
            speed: 100,
            lifespan: {
                onEmit: function (particle, key, t, value)
                {
                    return Phaser.Math.Percent(source.body.speed, 0, 300) * 500;
                }
            },
            alpha: {
                onEmit: function (particle, key, t, value)
                {
                    return Phaser.Math.Percent(source.body.speed, 0, 300);
                }
            },
            angle: {
                onEmit: function (particle, key, t, value)
                {
                    var v = Phaser.Math.Between(-10, 10);
                    return (source.angle - 180) + v;
                }
            },
            scale: { start: 0.2, end: 0 },
            blendMode: 'ADD'
        });
        emitterTrail.startFollow(source);         
    }

    createAsteroids(){

        this.textures.addSpriteSheetFromAtlas('asteroid1-sheet', { atlas: 'space', frame: 'asteroid1', frameWidth: 96 });
        this.textures.addSpriteSheetFromAtlas('asteroid2-sheet', { atlas: 'space', frame: 'asteroid2', frameWidth: 96 });
        this.textures.addSpriteSheetFromAtlas('asteroid3-sheet', { atlas: 'space', frame: 'asteroid3', frameWidth: 96 });
        this.textures.addSpriteSheetFromAtlas('asteroid4-sheet', { atlas: 'space', frame: 'asteroid4', frameWidth: 64 });
    
        this.anims.create({ key: 'asteroid1-anim', frames: this.anims.generateFrameNumbers('asteroid1-sheet', { start: 0, end: 24 }), frameRate: 20, repeat: -1 });
        this.anims.create({ key: 'asteroid2-anim', frames: this.anims.generateFrameNumbers('asteroid2-sheet', { start: 0, end: 24 }), frameRate: 20, repeat: -1 });
        this.anims.create({ key: 'asteroid3-anim', frames: this.anims.generateFrameNumbers('asteroid3-sheet', { start: 0, end: 24 }), frameRate: 20, repeat: -1 });
        this.anims.create({ key: 'asteroid4-anim', frames: this.anims.generateFrameNumbers('asteroid4-sheet', { start: 0, end: 23 }), frameRate: 20, repeat: -1 });        
        //this.add.sprite(4300, this.WORLD_HEIGHT/2).play('asteroid1-anim');
        //this.add.sprite(4400, this.WORLD_HEIGHT/2).play('asteroid2-anim');
        //this.add.sprite(4500, this.WORLD_HEIGHT/2).play('asteroid3-anim');
        //this.add.sprite(4600, this.WORLD_HEIGHT/2).play('asteroid4-anim');
        this.asteroidsGroup = this.physics.add.group();
        /*
        #this stuff, in particular runChildUpdate is not working, had to run manually in the update function
        this.asteroidsGroup = this.physics.add.group({
            classType: Asteroid,   
            runChildUpdate: true
        });*/

        console.log('asteroidsGroup: '+this.asteroidsGroup);
        

        for (var i = 0; i < this.MAX_ASTEROIDS; i++){
            let asteroidType = 'asteroid'+Phaser.Math.RND.integerInRange(1, 4)+'-anim';
            let asteroidX = Phaser.Math.RND.integerInRange(0, this.WORLD_WIDTH);
            let asteroidY = Phaser.Math.RND.integerInRange(0, this.WORLD_HEIGHT);
            var asteroid = new Asteroid( {scene:this, key: asteroidType, x:asteroidX, y:asteroidY, type:'BIG'} );        
        }
        console.log('asteroids: '+this.asteroidsArray.length)    
    } 

    collideShip(ship, asteroid){
        console.log('BOOM'); 

        asteroid.createChild();
        asteroid.createChild();
        asteroid.destroy();
        ship.config.scene.cameras.main.shake(400, 0.005);
    }

    collideBullet(bullet, asteroid){
        console.log('BLAM '+asteroid);
        
        bullet.destroy();

        asteroid.createChild();
        asteroid.createChild();
        asteroid.createChild();

        asteroid.destroy();

    }

    // not used anymore
    collideAsteroid(a1, a2){
        console.log('CRASH');

        /*
        a1.createChild();
        a1.createChild();
        a1.destroy();

        a2.createChild();
        a2.createChild();
        a2.destroy();
        */
    }



    updateScore(score, time) {
        //this.text.setPosition(ship.x, ship.y - 30);
        var outstr = "";

        if (this.ship != null) {
            this.text.setPosition(this.ship.x-400, this.ship.y - 400);
            outstr += 'Ship(x:' + this.ship.x.toFixed(2) + ', y:' + this.ship.y.toFixed(2) + ')';
        }
        outstr += '\n'+'asteroids count: '+this.asteroidsGroup.getLength();
        outstr += '\n'+'time: '+time;
        this.text.setText(outstr);
        //text.setText('Event.progress: ' + asteroidTimedEvent.getProgress().toString().substr(0, 4));     
    }

    update(time, delta) {
	    //this.physics.collide(this.ship, this.asteroidsGroup);
	    //this.physics.collide(this.asteroidsGroup, this.asteroidsGroup);
	    //this.physics.collide(this.bullets, this.asteroidsGroup);
             

        this.updateScore(0, time)
        this.ship.update(this.player_keys, time, delta);

        this.asteroidsArray.forEach(function(asteroid) {
            asteroid.update();
        });

        //this.physics.arcade.collide(ship, asteroids);
        //this.physics.arcade.collide(asteroids, asteroids);
        //this.physics.arcade.collide(asteroids, bullets, hitAsteroid);

        // parallax
        this.bg.tilePositionX += this.ship.body.deltaX() * 0.5;
        this.bg.tilePositionY += this.ship.body.deltaY() * 0.5;

        this.stars.tilePositionX += this.ship.body.deltaX() * 2;
        this.stars.tilePositionY += this.ship.body.deltaY() * 2;

    }
}
export default GameScene;