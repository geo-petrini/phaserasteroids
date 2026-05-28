import Ship from '../ship/Ship.js'
import Bullet from '../sprites/bullet.js'
import Asteroid from '../sprites/asteroid.js';

import Options from './options.js';
import MiniMap from './minimap.js';
import Radar from './radar.js';


class GameScene extends Phaser.Scene {
    options = new Options()
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
        console.log('gamescene create');

        this.WORLD_WIDTH = 8000;
        this.WORLD_HEIGHT = 8000;
        this.MAX_ASTEROIDS = 80;
        this.ASTEROIDS_INITIALIZED = false;
        this.MENU_INITIALIZED = false;
        this.cameraZoomIndex = 0;

        this.createBackground();
        this.createKeys();

        this.createSounds();

        const shipData = this.registry.get('shipData')
        this.createShip(shipData || {})

        this.ui_container = this.add.container()
        this.ui_container.setScrollFactor(0)

        this.text = this.add.text(32, 32, '', { color: '#fff' });
        this.radar = new Radar(this);
        this.minimap = new MiniMap(this);

        this.ui_container.add(this.text)

        console.log('gamescene ready');
    }

    createBackground() {
        this.bg = this.add.tileSprite(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT, 'background').setScrollFactor(0);

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

        this.stars = this.add.tileSprite(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT, 'stars').setScrollFactor(0);

        this.tweens.add({
            targets: galaxy,
            angle: 360,
            duration: 100000,
            ease: 'Linear',
            loop: -1
        });
    }

    createShip(shipData) {
        const def = { scene: this, key: 'ship', texture: 'space', x: this.WORLD_WIDTH / 2, y: this.WORLD_HEIGHT / 2, keys: this.player_keys }

        if (shipData.textureKey && this.textures.exists(shipData.textureKey)) {
            def.texture = shipData.textureKey
            def.scale = this.computeShipScale(shipData)
        }
        if (shipData.accel) def.accel = shipData.accel
        if (shipData.rotation) def.rotation = shipData.rotation
        if (shipData.energyGen) def.energyGen = shipData.energyGen
        if (shipData.forwardThrusters) def.forwardThrusters = shipData.forwardThrusters
        if (shipData.lateralThrusters) def.lateralThrusters = shipData.lateralThrusters
        if (shipData.weaponPositions) def.weaponPositions = shipData.weaponPositions

        this.ship = new Ship(def)

        this.cameras.main.startFollow(this.ship)

        this.bullets = this.physics.add.group({
            classType: Bullet,
            maxSize: 30,
            runChildUpdate: true
        })
        this.ship.assignBullets(this.bullets)
    }

    computeShipScale(shipData) {
        let w = 48
        if (this.textures.exists(shipData.textureKey)) {
            const tex = this.textures.get(shipData.textureKey)
            w = tex.getSourceImage().width
        }
        const desiredW = 48
        return Math.min(1, desiredW / w)
    }

    rebuildShip(shipData) {
        if (this.ship) {
            this.ship.destroy()
        }
        if (this.bullets) {
            this.bullets.destroy()
        }
        this.createShip(shipData)
        if (this.ASTEROIDS_INITIALIZED) {
            this.physics.world.removeCollider(this.collider_ship_asteroids)
            this.physics.world.removeCollider(this.collider_bullets_asteroids)
            this.collider_ship_asteroids = this.physics.add.collider(this.ship, this.asteroidsGroup, this.collideShipAsteroid)
            this.collider_bullets_asteroids = this.physics.add.collider(this.bullets, this.asteroidsGroup, this.collideBulletAsteroid)
        }
    }

    createAsteroids() {
        this.anims.create({ key: 'asteroid1-anim', frames: this.anims.generateFrameNumbers('asteroid1-sheet', { start: 0, end: 24 }), frameRate: 20, repeat: -1 });
        this.anims.create({ key: 'asteroid2-anim', frames: this.anims.generateFrameNumbers('asteroid2-sheet', { start: 0, end: 24 }), frameRate: 20, repeat: -1 });
        this.anims.create({ key: 'asteroid3-anim', frames: this.anims.generateFrameNumbers('asteroid3-sheet', { start: 0, end: 24 }), frameRate: 20, repeat: -1 });
        this.anims.create({ key: 'asteroid4-anim', frames: this.anims.generateFrameNumbers('asteroid4-sheet', { start: 0, end: 23 }), frameRate: 20, repeat: -1 });

        this.asteroidsGroup = this.physics.add.group();

        console.log('asteroidsGroup: ' + this.asteroidsGroup);

        for (var i = 0; i < this.MAX_ASTEROIDS; i++) {
            let asteroidKey = 'asteroid' + Phaser.Math.RND.integerInRange(1, 4) + '-anim';
            let asteroidX = Phaser.Math.RND.integerInRange(0, this.WORLD_WIDTH);
            let asteroidY = Phaser.Math.RND.integerInRange(0, this.WORLD_HEIGHT);
            var asteroid = new Asteroid({ scene: this, x: asteroidX, y: asteroidY, key: asteroidKey, type: 'BIG' });
        }

        this.collider_ship_asteroids = this.physics.add.collider(this.ship, this.asteroidsGroup, this.collideShipAsteroid);
        this.collider_bullets_asteroids = this.physics.add.collider(this.bullets, this.asteroidsGroup, this.collideBulletAsteroid);

        console.log('asteroids: ' + this.asteroidsArray.length)
    }

    createKeys() {
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

        this.toggleMenuKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.O);
        this.physics.world.drawDebug = false;
        this.toggleDebug = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        this.toggleMapZoom = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
    }

    createSounds() {
        this.sounds = {}

        this.sounds['laser'] = this.sound.add('laser_single');
        this.sounds['sbabaam'] = this.sound.add('sbabaam');
        this.sounds['explosion_short'] = this.sound.add('explosion_short');
        this.sounds['asteroid_explosion_1'] = this.sound.add('asteroid_explosion_1');
    }

    collideShipAsteroid(ship, asteroid) {
        console.log('BOOM');

        ship.damage(10);

        asteroid.createChild();
        asteroid.createChild();
        asteroid.destroy();
        ship.config.scene.cameras.main.shake(400, 0.005);
    }

    collideBulletAsteroid(bullet, asteroid) {
        console.log('BLAM ' + asteroid);

        bullet.destroy();

        asteroid.createChild();
        asteroid.createChild();
        asteroid.createChild();

        let arr = asteroid.scene.asteroidsArray;
        let asteroidIndex = arr.indexOf(asteroid);
        if (asteroidIndex > -1) {
            arr.splice(asteroidIndex, 1);
        }
        asteroid.destroy();
    }

    updateScore(time) {
        var outstr = "";

        if (this.cameras.cameras !== undefined) {
            outstr += '\n' + 'Camera(' + 'sx: ' + this.cameras.main.scrollX.toFixed(2) + ',' + 'sy: ' + this.cameras.main.scrollY.toFixed(2) + ')';
        }

        if (this.ship != null) {
            outstr += '\n' + this.ship.toString()
        }

        outstr += '\n' + 'asteroids count: ' + this.asteroidsGroup.getLength();
        outstr += '\n' + 'time: ' + time;
        this.text.setText(outstr);
    }

    update(time, delta) {

        if (this.ASTEROIDS_INITIALIZED == true) {
            this.collider_ship_asteroids.active = this.options.player_enable_ship_asteroids_collision;
            this.collider_bullets_asteroids.active = this.options.player_enable_bullets_asteroids_collision;
        }

        if (!this.ship || this.ship.removedFromScene() || this.ship.status == 'destroyed') {
            console.log('GAME OVER')
        } else {
            if (Phaser.Input.Keyboard.JustDown(this.toggleDebug)) {
                if (this.physics.world.drawDebug) {
                    this.physics.world.drawDebug = false;
                    if (this.physics.world.debugGraphic) {
                        this.physics.world.debugGraphic.clear();
                    }
                } else {
                    this.physics.world.drawDebug = true;
                }
            }

            if (this.ASTEROIDS_INITIALIZED == false) {
                this.createAsteroids()
                this.ASTEROIDS_INITIALIZED = true;
            }

            if (this.input.keyboard.checkDown(this.toggleMapZoom, 250)) {
                this.cameraZoomIndex = (this.cameraZoomIndex + 1) % this.options.camera_zoom_levels.length
            }

            this.cameras.main.zoom = this.options.camera_zoom_levels[this.cameraZoomIndex]

            if (this.input.keyboard.checkDown(this.toggleMenuKey, 250)) {
                this.input.stopPropagation();
                this.scene.start('ShipConfigScene');
            }

            this.radar.update();
            this.minimap.update(this.WORLD_WIDTH, this.WORLD_HEIGHT);

            
            this.asteroidsArray.forEach(function (asteroid) {
                asteroid.update();
            });
            this.ship.update(this.player_keys, time, delta);

            this.updateScore(time)

            if (typeof this.ship !== 'undefined' && typeof this.ship.body !== 'undefined') {
                this.bg.tilePositionX += this.ship.body.deltaX() * 0.5;
                this.bg.tilePositionY += this.ship.body.deltaY() * 0.5;

                this.stars.tilePositionX += this.ship.body.deltaX() * 2;
                this.stars.tilePositionY += this.ship.body.deltaY() * 2;
            }
        }
    }
}
export default GameScene;
