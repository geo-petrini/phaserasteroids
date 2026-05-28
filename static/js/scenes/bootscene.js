import { registry } from '../components/index.js'
import ProceduralAssets from '../procedural/ProceduralAssets.js'

class BootScene extends Phaser.Scene {

    constructor(test) {
        super({
            key: 'BootScene'
        });
    }

    preload() {
        console.log('loading...');
        const progress = this.add.graphics();
        const text = this.add.text(
            this.sys.game.scale.width / 2 - 50,
            this.sys.game.scale.height / 2 - 50,
            {
                color: '#fff',
                stroke: '#f00',
                strokeThickness: 1,
                align: 'center',
                shadow: {
                    offsetX: 0,
                    offsetY: 1,
                    color: '#F00',
                    blur: 10,
                    stroke: true,
                    fill: true
                },
            }
        )

        ProceduralAssets.generateBase(this);

        this.load.on('progress', (value) => {
            progress.clear();
            progress.fillStyle(0xffffff, 1);
            progress.fillRect(0, this.sys.game.scale.height / 2, this.sys.game.scale.width * value, 20);
            text.setText('<< LOADING >>')
        });

        this.load.on('complete', () => {
            progress.destroy();
            text.destroy();
            console.log('load complete');

            this._loadWorld().then(() => {
                registry.load().then(() => {
                    this._loadShip()
                    this.scene.start('ShipConfigScene');
                })
            })
        });

        this.load.audio('laser_single', ['sounds/laser_single.wav']);
        this.load.audio('sbabaam', ['sounds/sbabaam.wav']);
        this.load.audio('explosion_short', ['sounds/explosion_short.wav']);
        this.load.audio('asteroid_explosion_1', ['sounds/asteroid_explosion_1.wav']);
        this.cameras.main.fadeOut(150);
    }

    async _loadWorld() {
        try {
            const resp = await fetch('/api/world');
            const manifest = await resp.json();
            this.registry.set('worldManifest', manifest);
            ProceduralAssets.generateWorld(this, manifest);
            console.log('world generated', manifest);
        } catch (err) {
            console.error('failed to load world', err);
        }
    }

    _loadShip(){
        const saved = localStorage.getItem('phaserAsteroidsShip')
        if (saved) {
            const data = JSON.parse(saved)
            this.registry.set('shipData', data)
            this.registry.set('shipDataVersion', 1)
        }
    }
}

export default BootScene;
