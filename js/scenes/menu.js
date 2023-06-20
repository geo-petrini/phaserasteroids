const COLOR_BACKGROUND = 0x181d80;
const COLOR_PRIMARY = 0x5e92f3;
const COLOR_LIGHT = 0x5eb0f3;
const FONT_SIZE = '24px';
class Menu {



    constructor(scene) {
        console.log('menu constructor begin');
        this.scene = scene;
        this.menuWidth = 500
        this.dialog = undefined;
        this.createDialog();
        this.close();
        console.log('dialog: ' + this.toString());
        console.log('menu constructor end');
    }

    createDialog() {
        //https://rexrainbow.github.io/phaser3-rex-notes/docs/site/ui-dialog/
        //https://rexrainbow.github.io/phaser3-rex-notes/docs/site/ui-overview/#demos
        //https://codepen.io/rexrainbow/pen/oQjMWE

        //https://codepen.io/rexrainbow/pen/NEpjmP

        /*
        center menu in the camera view
        */
        let backgroundRoundedRectangle = this.scene.rexUI.add.roundRectangle(0, 0, 100, 100, 20, COLOR_BACKGROUND)
        backgroundRoundedRectangle.setAlpha(0.5);

        var weapons_recharge = this.createNumberSlider({ label_text: 'Weapons' })
        weapons_recharge.on('valuechange', function (newValue, oldValue, weapons_recharge) {
            console.lob(newValue)
        })
                
        var hull_repair = this.createNumberSlider({ label_text: 'Repair' })

        this.dialog = this.scene.rexUI.add.dialog({
            x: this.calcXPosition(),
            y: this.calcYPosition(),
            width: this.menuWidth,


            background: backgroundRoundedRectangle,

            title: this.createLabel('Title').setDraggable(),

            toolbar: [
                this.createLabel('O'),
                this.createLabel('X')
            ],

            leftToolbar: [
                this.createLabel('A'),
                this.createLabel('B')
            ],

            content: this.createLabel('Content'),

            description: this.createLabel('Description'),

            choices: [
                this.createLabel('Choice0'),
                this.createLabel('Choice1'),
                this.createLabel('Choice2'),
                weapons_recharge,
                hull_repair,
            ],

            actions: [
                this.createLabel('Action0'),
                this.createLabel('Action1')
            ],

            space: {
                left: 20,
                right: 20,
                top: -20,
                bottom: -20,

                title: 25,
                titleLeft: 30,
                content: 25,
                description: 25,
                descriptionLeft: 20,
                descriptionRight: 20,
                choices: 25,

                toolbarItem: 5,
                choice: 15,
                action: 15,
            },

            expand: {
                title: false,
                // content: false,
                // description: false,
                // choices: false,
                // actions: true,
            },

            align: {
                title: 'center',
                // content: 'left',
                // description: 'left',
                // choices: 'left',
                actions: 'right', // 'center'|'left'|'right'
            },

            click: {
                mode: 'release'
            }
        })



        this.dialog.setDraggable('background')   // Draggable-background
        this.dialog.layout()
        // this.dialog.drawBounds(this.add.graphics(), 0xff0000)
        //this.dialog.popUp(1000);

        /*
        var tween = this.tweens.add({
            targets: this.dialogdialog,
            scaleX: 1,
            scaleY: 1,
            ease: 'Bounce', // 'Cubic', 'Elastic', 'Bounce', 'Back'
            duration: 1000,
            repeat: 0, // -1: infinity
            yoyo: false
        });
        */

        this.scene.print = this.scene.add.text(0, 0, '');
        // this.dialog.on('button.click', function (button, groupName, index, pointer, event) {
        //     console.log(groupName + '-' + index + ': ' + button.text);
        // }, this)
        this.dialog.on('button.over', function (button, groupName, index, pointer, event) {
            try {
                button.getElement('background').setStrokeStyle(1, 0xffffff);
            } catch (error) {

            }
        })
        this.dialog.on('button.out', function (button, groupName, index, pointer, event) {
            try {
                button.getElement('background').setStrokeStyle();
            } catch (error) {

            }
        });


    }

    createLabel(text) {
        return this.scene.rexUI.add.label({
            width: 40, // Minimum width of round-rectangle
            height: 40, // Minimum height of round-rectangle

            background: this.scene.rexUI.add.roundRectangle(0, 0, 100, 40, 20, COLOR_PRIMARY),

            text: this.scene.add.text(0, 0, text, { fontSize: FONT_SIZE }),

            space: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10
            }
        });
    }


    createNumberSlider({ value = 0, value_min = 0, value_max = 100, gap = 1, label_text = '' } = {}) {
        //https://codepen.io/rexrainbow/pen/jXWebo
        //https://rexrainbow.github.io/phaser3-rex-notes/docs/site/ui-numberbar/
        console.log(arguments)
        var range = value_max - value_min
        var bar = this.scene.rexUI.add.numberBar({
            width: 40,
            height: 40,
            //background: this.scene.rexUI.add.roundRectangle(0, 0, 0, 0, 20, COLOR_PRIMARY),
            icon: this.scene.add.text(0, 0, label_text, { fontSize: FONT_SIZE }),
            slider: {
                track: this.scene.rexUI.add.roundRectangle(0, 0, 0, 0, 20, COLOR_PRIMARY),
                indicator: this.scene.rexUI.add.roundRectangle(0, 0, 0, 0, 20, COLOR_LIGHT),
                input: 'click',
                gap: gap / range,
            },
            text: this.scene.add.text(0, 0, '', { fontSize: FONT_SIZE }),
            space: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10,

                icon: 10,
                slider: 10,
            },
            // valuechangeCallback: function (value, oldValue, object) {
            //     value = (value * range) + value_min;
            //     object.text = value;
            // },
        })
        return bar;
    }

    calcXPosition() {
        let menuCenterX = this.scene.cameras.main.scrollX + 10 + this.menuWidth / 2;
        return menuCenterX;
    }

    calcYPosition() {
        let menuCenterY = this.scene.cameras.main.scrollY + this.scene.cameras.main.height / 2;
        return menuCenterY
    }

    isOpen() {
        console.log('dialog visible: ' + this.toString());
        if (this.dialog.scaleX == 0 || this.dialog.scaleY == 0) {
            return false;
        } else {
            return true;
        }
        //return this.dialog.visible;
    }

    open() {
        console.log('dialog visible: ' + 'opening');
        //this.dialog.show();
        //this.dialog.layout();
        this.dialog.scaleX = 1;
        this.dialog.scaleY = 1;
        this.dialog.x = this.calcXPosition();
        this.dialog.y = this.calcYPosition();
        this.dialog.popUp(100);
    }

    close() {
        console.log('dialog visible: ' + 'closing');
        //this.dialog = undefined;
        this.dialog.scaleDown(100);
        this.dialog.scaleX = 0;
        this.dialog.scaleY = 0;
        //this.dialog.hide();
        //this.dialog.layout();
        //this.scene.hide(this.dialog);
        //this.dialog.scaleDownDestroy(100);
        //this = undefined;
    }

    toString() {
        let str = '';
        str += '(dialog: x:' + this.dialog.x + ', y: ' + this.dialog.y + ', visible: ' + this.dialog.visible + ', scalex:' + this.dialog.scaleX + ', scaley: ' + this.dialog.scaleY + ')';
        return str;
    }
}

export default Menu;