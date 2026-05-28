import ShipEditor from '../editor/ShipEditor.js'

class ShipConfigScene extends Phaser.Scene {

    constructor() {
        super({ key: 'ShipConfigScene' })
    }

    create() {
        console.log('ship editor create')

        this.cameras.main.setBackgroundColor('#0a0a1a')

        this.editor = new ShipEditor(this)

        this.add.text(60, 30, 'SHIP EDITOR', {
            fontSize: '16px', color: '#8888ff',
        })

        // this.add.text(580, 30, 'ELEMENTS', {
        //     fontSize: '16px', color: '#8888ff',
        // })

        this.toggleKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.O)
    }

    update(time, delta) {
        if (this.input.keyboard.checkDown(this.toggleKey, 250)) {
            this.input.stopPropagation()
            if (this.registry.get('shipData')) {
                this.scene.start('GameScene')
            }
        }
    }
}
export default ShipConfigScene;
