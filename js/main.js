//import "https://cdn.jsdelivr.net/npm/phaser@3.15.1/dist/phaser-arcade-physics.min.js";
//import "https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser-arcade-physics.min.js";
import BootScene from './scenes/bootscene.js';
import GameScene from './scenes/gamescene.js';
import ShipConfigScene from './scenes/shipconfig.js';
//import RexUIPlugin from './js/vendor/rexuiplugin.min.js';

// var SET_WIDTH=window.clientWidth;
// var SET_HEIGHT=window.clientHeight;
// var SET_WIDTH=window.innerWidth;
// var SET_HEIGHT=window.innerHeight;
var SET_WIDTH=1024;
var SET_HEIGHT=768;

const config = {
    // For more settings see <https://github.com/photonstorm/phaser/blob/master/src/boot/Config.js>
    type: Phaser.AUTO,
    pixelArt: true,
    roundPixels: true,
    parent: 'phaser-content',
    scale:{
        mode: Phaser.Scale.RESIZE ,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
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
        GameScene,
        ShipConfigScene
    ]
};

// window.addEventListener('resize', () => {
//     game.scale.resize(window.innerWidth, window.innerHeight);
// });

const game = new Phaser.Game(config); // eslint-disable-line no-unused-vars
