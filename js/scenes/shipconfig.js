class ShipConfigScene extends Phaser.Scene {

    constructor(test) {
        super({
            key: 'ShipConfigScene'
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
        console.log('ship config create');

        let { game_width, game_height } = this.canvas;
        this.game_width = game_width;
        this.game_height = game_height;
        console.log(`game size ${this.game_width}:${this.game_height}`)
        var ship = this.add.image(200, 200, 'space', 'ship').setOrigin(0);
        ship.setScale(3)

        this.scene.switch('GameScene');
        console.log('ship config ready');

        this.toggleMenuKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.O);
    }    

    update(time, delta) {
        if (this.input.keyboard.checkDown(this.toggleMenuKey, 250)) {
            this.input.stopPropagation();
            this.scene.switch('GameScene');
        }        
    }
}
export default ShipConfigScene;