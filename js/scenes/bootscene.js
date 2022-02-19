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
            this.sys.game.config.width / 2 - 50,
            this.sys.game.config.height / 2 - 20, {
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

        // Register a load progress event to show a load bar
        this.load.on('progress', (value) => {
            progress.clear();
            progress.fillStyle(0xffffff, 1);
            progress.fillRect(0, this.sys.game.config.height / 2, this.sys.game.config.width * value, 20);
            text.setText('<< LOADING >>')
        });

        // Register a load complete event to launch the title screen when all files are loaded
        this.load.on('complete', () => {
            // prepare all animations, defined in a separate file
            progress.destroy();
            text.destroy();
            console.log('load complete');
            this.scene.start('GameScene');
        });

        // load stuff
        this.load.image('background', 'assets/nebula.jpg');
        this.load.image('stars', 'assets/stars.png');
        this.load.atlas('space', 'assets/space.png', 'assets/space.json');
        this.load.image('asteroid1', 'assets/asteroid1.png');
        this.load.image('asteroid2', 'assets/asteroid2.png');
        this.load.image('asteroid3', 'assets/asteroid3.png');
        this.load.image('asteroid4', 'assets/asteroid4.png');
        this.load.image('smoke', 'assets/smoke.png');
        this.load.image('blastwave', 'assets/blastwave1.png');
        this.load.image('flame', 'assets/muzzleflash7.png');

        this.load.audio('laser_single',  ['sounds/laser_single.wav']);
        this.load.audio('sbabaam',  ['sounds/sbabaam.wav']);
        this.load.audio('explosion_short',  ['sounds/explosion_short.wav']);
        this.load.audio('asteroid_explosion_1',  ['sounds/asteroid_explosion_1.wav']);
    }
}

export default BootScene;