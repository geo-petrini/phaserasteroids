//import "https://cdn.jsdelivr.net/npm/phaser@3.15.1/dist/phaser-arcade-physics.min.js";
//import "https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser-arcade-physics.min.js";
import BootScene from './scenes/bootscene.js';
import GameScene from './scenes/gamescene.js';
//import RexUIPlugin from './js/vendor/rexuiplugin.min.js';

var SET_WIDTH=window.innerWidth;
var SET_HEIGHT=window.innerHeight;

const config = {
    // For more settings see <https://github.com/photonstorm/phaser/blob/master/src/boot/Config.js>
    type: Phaser.AUTO,
    pixelArt: true,
    roundPixels: true,
    parent: 'phaser-content',
    width: SET_WIDTH,
    height: SET_HEIGHT,
    physics: {
        default: 'arcade',  
        arcade: {
            debug: true
        }
    },
    scene: [
        BootScene,
        GameScene
    ]
};

const game = new Phaser.Game(config); // eslint-disable-line no-unused-vars
