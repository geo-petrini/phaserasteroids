import Ship from '../ship/Ship.js'
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

        this.manifest = this.registry.get('worldManifest');
        if (!this.manifest) {
            console.error('no world manifest');
            return;
        }

        this.WORLD_WIDTH = this.manifest.world.width;
        this.WORLD_HEIGHT = this.manifest.world.height;
        this.MAX_ASTEROIDS = this.manifest.asteroids.length;
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
        if (this.manifest.nebula) {
            for (let i = 0; i < this.manifest.nebula.length; i++) {
                const n = this.manifest.nebula[i];
                this.add.image(n.x, n.y, `nebula_${i}`).setScrollFactor(0.3).setAlpha(0.6);
            }
        }

        if (this.manifest.planets) {
            for (let i = 0; i < this.manifest.planets.length; i++) {
                const p = this.manifest.planets[i];
                this.add.image(p.x, p.y, `planet_${i}`).setScrollFactor(0.6);
            }
        }

        if (this.manifest.galaxies) {
            for (let i = 0; i < this.manifest.galaxies.length; i++) {
                const g = this.manifest.galaxies[i];
                const galaxy = this.add.image(g.x, g.y, `galaxy_${i}`).setBlendMode(1).setScrollFactor(0.6);
                this.tweens.add({
                    targets: galaxy,
                    angle: 360,
                    duration: 100000,
                    ease: 'Linear',
                    loop: -1
                });
            }
        }

        if (this.manifest.eyes) {
            for (let i = 0; i < this.manifest.eyes.length; i++) {
                const e = this.manifest.eyes[i];
                this.add.image(e.x, e.y, `eye_${i}`).setBlendMode(1).setScrollFactor(0.8);
            }
        }

        if (this.manifest.stars) {
            for (let li = 0; li < this.manifest.stars.length; li++) {
                const factor = 0.2 + li * 0.3;
                this.add.tileSprite(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT, `stars_${li}`).setScrollFactor(0).setAlpha(1 - li * 0.3);
            }
        }
    }

    createShip(shipData) {
        const def = { scene: this, key: 'ship', texture: 'ship-fallback', x: this.WORLD_WIDTH / 2, y: this.WORLD_HEIGHT / 2, keys: this.player_keys }

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
        if (shipData.shieldCapacity) def.shieldCapacity = shipData.shieldCapacity
        if (shipData.shieldRecharge) def.shieldRecharge = shipData.shieldRecharge

        this.ship = new Ship(def)
        this.bulletGroups = this.ship.weapons.getBulletGroups()

        this.cameras.main.startFollow(this.ship)
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
        if (this.ship) this.ship.destroy()
        this.bulletGroups = null
        this.createShip(shipData)
        if (this.ASTEROIDS_INITIALIZED) {
            if (this.collider_ship_asteroids) {
                this.physics.world.removeCollider(this.collider_ship_asteroids)
                this.collider_ship_asteroids = null
            }
            if (this.collider_bullets_asteroids) {
                this.physics.world.removeCollider(this.collider_bullets_asteroids)
                this.collider_bullets_asteroids = null
            }
            this.collider_ship_asteroids = this.physics.add.collider(this.ship, this.asteroidsGroup, this.collideShipAsteroid)
            this.collider_bullets_asteroids = this.physics.add.collider(this.bulletGroups, this.asteroidsGroup, this.collideBulletAsteroid)
        }
    }

    createAsteroids() {
        this.asteroidsGroup = this.physics.add.group();

        console.log('asteroidsGroup: ' + this.asteroidsGroup);

        for (let i = 0; i < this.manifest.asteroids.length; i++) {
            const a = this.manifest.asteroids[i];
            const asteroid = new Asteroid({ scene: this, x: a.x, y: a.y, key: `asteroid_${i}`, type: 'BIG', manifest: a });
        }

        this.collider_ship_asteroids = this.physics.add.collider(this.ship, this.asteroidsGroup, this.collideShipAsteroid);
        this.collider_bullets_asteroids = this.physics.add.collider(this.bulletGroups, this.asteroidsGroup, this.collideBulletAsteroid);

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
        Asteroid.spawnPending();

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
        }
    }
}
export default GameScene;
