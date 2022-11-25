import Ship from '../sprites/ship.js'
import Bullet from '../sprites/bullet.js'
import Asteroid from '../sprites/asteroid.js';

import Menu from './menu.js';
import MiniMap from './minimap.js';
import Radar from './radar.js';


class GameScene extends Phaser.Scene {
    asteroidsArray = [];

    constructor(test) {
        super({
            key: 'GameScene'
        });
    }

    preload() {
        this.canvas = this.sys.game.canvas;
        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });        
    }

    create() {
        console.log('gamescene create');
        let { game_width, game_height } = this.sys.game.canvas;
        this.game_width = game_width;
        this.game_height = game_height;
        this.WORLD_WIDTH = 8000;
        this.WORLD_HEIGHT = 8000;
        //this.MAX_ASTEROIDS = this.WORLD_WIDTH*0.1;
        //this.MAX_ASTEROIDS = 80;
        this.MAX_ASTEROIDS = 800;
        this.ASTEROIDS_INITIALIZED = false;
        this.MENU_INITIALIZED = false;
        this.CAMERA_ZOOMED = false;

        this.createBackground();
        
        var spaceAtlasTexture = this.textures.get('space');
        var spaceFrames = spaceAtlasTexture.getFrameNames();

        this.player_keys = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),

            alt_up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            alt_left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            alt_right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            alt_down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),  

            fire: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
            turbo: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
        };
        this.createShip();
        //this.createAsteroids(); moved in update
    
        //this.MKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
        this.toggleMenuKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.physics.world.drawDebug = false;
        this.toggleDebug = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        this.toggleMapZoom = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
        this.createSounds();

        // UI
        this.ui_container = this.add.container()
        this.ui_container.setScrollFactor(0)

        this.text = this.add.text(32, 32, { color: '#fff' });
        //this.text.setScrollFactor(0);
        this.radar = new Radar(this);


        this.ui_container.add(this.text)
        //this.ui_container.add(this.radar)

        /*
        attempts at using containers for separating elements from main camera does not work properly
        radar throws errors
        ship not redered
        bullets not rendered
        new asteroids not rendered
        */
        
        //this.ui_container.add(this.radar)

        //this.cameras.main.ignore(this.ui_container);        
        
        //this.ui_camera = this.cameras.add(0, 0, this.game_width, this.game_height);
        //this.ui_camera.ignore(this.ship)

        //PhaserGUIAction(this);  //takes a very long time to load when asteroids are created here, moved to update
        console.log('gamescene ready');
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

    DEPRECATED_createMinimap(){
        let margin = 10
        let minimapWidth = 400
        let minimapHeight = 200
        let minimapX = this.game_width - minimapWidth - margin;
        let minimapY = this.game_height - minimapHeight - margin
        this.minimap = this.cameras.add(minimapX, minimapY, minimapWidth, minimapHeight).setZoom(0.2).setName('mini');
        this.minimap.setBackgroundColor(0x002244);
        //this.minimap.scrollX = 1600;
        //this.minimap.scrollY = 300;        
    }

    createShip(){
        this.ship = new Ship({
            scene: this,
            key: 'ship',
            texture: 'space',
            x: this.WORLD_WIDTH / 2,
            y: this.WORLD_HEIGHT / 2,
            keys: this.player_keys
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
            let asteroidKey = 'asteroid'+Phaser.Math.RND.integerInRange(1, 4)+'-anim';
            let asteroidX = Phaser.Math.RND.integerInRange(0, this.WORLD_WIDTH);
            let asteroidY = Phaser.Math.RND.integerInRange(0, this.WORLD_HEIGHT);
            var asteroid = new Asteroid( {scene:this, x:asteroidX, y:asteroidY, key: asteroidKey, type:'BIG'} );        
        }
        
        this.physics.add.collider(this.ship, this.asteroidsGroup, this.collideShipAsteroid);
        //this.physics.add.collider(this.asteroidsGroup,this.asteroidsGroup, this.collideAsteroid);
        this.physics.add.collider(this.bullets, this.asteroidsGroup, this.collideBulletAsteroid);

        console.log('asteroids: '+this.asteroidsArray.length)
    } 

    createSounds(){
        this.sounds = {}

        this.sounds['laser'] = this.sound.add('laser_single');
        this.sounds['sbabaam'] = this.sound.add('sbabaam');
        this.sounds['explosion_short'] = this.sound.add('explosion_short');
        this.sounds['asteroid_explosion_1'] = this.sound.add('asteroid_explosion_1');
    }

    collideShipAsteroid(ship, asteroid){
        console.log('BOOM'); 

        ship.damage(10);    //TODO damage on asteroid size and speed

        asteroid.createChild();
        asteroid.createChild();
        asteroid.destroy();
        ship.config.scene.cameras.main.shake(400, 0.005);
    }

    collideBulletAsteroid(bullet, asteroid){
        console.log('BLAM '+asteroid);
        
        bullet.destroy();

        asteroid.createChild();
        asteroid.createChild();
        asteroid.createChild();

        let arr = asteroid.scene.asteroidsArray;
        let asteroidIndex = arr.indexOf(asteroid);
        if (asteroidIndex > -1){
            arr.splice(asteroidIndex, 1);
        }
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


    updateUI(){
        //TODO update ui_cam in case the window size changes
    }

    updateScore(score, time) {
        //this.text.setPosition(ship.x, ship.y - 30);
        var outstr = "";
        
        if (this.cameras.cameras !==undefined) {
            //this.text.setPosition(this.cameras.main.scrollX+50, this.cameras.main.scrollY+50);
            outstr += '\n'+'Camera('+ 'sx: '+this.cameras.main.scrollX.toFixed(2) +','+ 'sy: '+this.cameras.main.scrollY.toFixed(2)+')';
        }

        if (this.minimap !==undefined) {
            outstr += '\n'+'Minimap('+ 'sx: '+this.minimap.scrollX.toFixed(2) +','+ 'sy: '+this.minimap.scrollY.toFixed(2)+')';
        }        
        //if (this.ship != null && this.scene.cameras !==undefined) {
        if (this.ship != null ) {
            //let textX = this.scene.cameras.main.centerX - this.scene.cameras.main.width/2;
            //let textY = this.scene.cameras.main.centerY - this.scene.cameras.main.height/2;
            //this.text.setPosition(textX, textY);
            //this.text.setPosition(this.ship.x+50, this.ship.y+50);
            outstr += '\n'+'Ship(x:' + this.ship.x.toFixed(2) + ', y:' + this.ship.y.toFixed(2) + ')';
        }


        outstr += '\n'+'asteroids count: '+this.asteroidsGroup.getLength();
        outstr += '\n'+'time: '+time;
        this.text.setText(outstr);
        //text.setText('Event.progress: ' + asteroidTimedEvent.getProgress().toString().substr(0, 4));     
    }

    update(time, delta) {
        //this.sys.game.debug.text(this.sys.game.time.fps, 5, 14, '#00ff00');
        if (Phaser.Input.Keyboard.JustDown(this.toggleDebug)) {
            if (this.physics.world.drawDebug) {
              this.physics.world.drawDebug = false;
              this.physics.world.debugGraphic.clear();
            }
            else {
              this.physics.world.drawDebug = true;
            }
        }

	    //this.physics.collide(this.ship, this.asteroidsGroup);
	    //this.physics.collide(this.asteroidsGroup, this.asteroidsGroup);
	    //this.physics.collide(this.bullets, this.asteroidsGroup);
        if (this.ASTEROIDS_INITIALIZED == false){
            this.createAsteroids()
            this.ASTEROIDS_INITIALIZED = true;
        }


        //if (this.MKey.isDown) //not working as there is no delay
        //https://labs.phaser.io/edit.html?src=src/input/keyboard/key%20down%20duration.js&v=3.55.2
        //https://labs.phaser.io/edit.html?src=src/input/keyboard/key%20down%20delay.js&v=3.55.2

        if (this.input.keyboard.checkDown( this.toggleMapZoom, 250 ))
        {
            this.CAMERA_ZOOMED = !this.CAMERA_ZOOMED
            
        }
        
        if (this.CAMERA_ZOOMED){
            this.cameras.main.zoom= 0.2
        }
        else{
            this.cameras.main.zoom =1
        }


        if (this.input.keyboard.checkDown( this.toggleMenuKey, 250 ))
        {
            if (this.MENU_INITIALIZED == false){
                this.menu = new Menu(this);
                this.MENU_INITIALIZED = true;
            }

            if (this.menu.isOpen()){
                this.menu.close();
            }else{
                this.menu.open();
            }
        }        
        

        this.updateScore(0, time)
        this.ship.update(this.player_keys, time, delta);

        this.asteroidsArray.forEach(function(asteroid) {
            asteroid.update();
        });

        this.radar.update();

        //this.physics.arcade.collide(ship, asteroids);
        //this.physics.arcade.collide(asteroids, asteroids);
        //this.physics.arcade.collide(asteroids, bullets, hitAsteroid);

        // parallax
        this.bg.tilePositionX += this.ship.body.deltaX() * 0.5;
        this.bg.tilePositionY += this.ship.body.deltaY() * 0.5;

        this.stars.tilePositionX += this.ship.body.deltaX() * 2;
        this.stars.tilePositionY += this.ship.body.deltaY() * 2;

        
        //this.minimap.scrollX = Phaser.Math.Clamp(this.ship.x + 200, 0, this.WORLD_WIDTH);
        //this.minimap.scrollY = Phaser.Math.Clamp(this.ship.y + 200, 0, this.WORLD_WIDTH);
    }
}
export default GameScene;