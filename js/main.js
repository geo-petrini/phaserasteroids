import BootScene from './scenes/bootscene.js';
import GameScene from './scenes/gamescene.js';
import ShipConfigScene from './scenes/shipconfig.js';

var SET_WIDTH = 1024;
var SET_HEIGHT = 768;

const config = {
    type: Phaser.AUTO,
    parent: 'phaser-content',
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    width: SET_WIDTH,
    height: SET_HEIGHT,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [
        BootScene,
        GameScene,
        ShipConfigScene
    ]
};

const game = new Phaser.Game(config);
