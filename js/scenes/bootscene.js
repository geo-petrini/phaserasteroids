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

            const saved = localStorage.getItem('phaserAsteroidsShip')
            if (saved) {
                const data = JSON.parse(saved)
                this.registry.set('shipData', data)
                this.registry.set('shipDataVersion', 1)
                this.scene.start('GameScene');
                this.scene.start('ShipConfigScene');
            } else {
                this.scene.start('ShipConfigScene');
            }
        });

        this.load.image('background', 'assets/nebula.jpg');
        this.load.image('stars', 'assets/stars.png');
        this.load.atlas('space', 'assets/space.png', 'assets/space.json');
        this.load.spritesheet('asteroid1-sheet', 'assets/asteroid1.png', { frameWidth: 96, frameHeight: 96 });
        this.load.spritesheet('asteroid2-sheet', 'assets/asteroid2.png', { frameWidth: 96, frameHeight: 96 });
        this.load.spritesheet('asteroid3-sheet', 'assets/asteroid3.png', { frameWidth: 96, frameHeight: 96 });
        this.load.spritesheet('asteroid4-sheet', 'assets/asteroid4.png', { frameWidth: 64, frameHeight: 64 });
        this.load.image('smoke', 'assets/smoke.png');
        this.load.image('blastwave', 'assets/blastwave1.png');
        this.load.image('flame', 'assets/muzzleflash7.png');
        this.load.image('ship-big', 'assets/ship-upscaled.png');

        this.load.audio('laser_single', ['sounds/laser_single.wav']);
        this.load.audio('sbabaam', ['sounds/sbabaam.wav']);
        this.load.audio('explosion_short', ['sounds/explosion_short.wav']);
        this.load.audio('asteroid_explosion_1', ['sounds/asteroid_explosion_1.wav']);
        this.cameras.main.fadeOut(150);
    }
}

export default BootScene;
