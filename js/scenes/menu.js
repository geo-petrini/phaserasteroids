class Menu{
    constructor(scene){
        this.scene = scene
        this.createMenu();
    }

    createMenu(){
        //https://rexrainbow.github.io/phaser3-rex-notes/docs/site/ui-dialog/
        //https://rexrainbow.github.io/phaser3-rex-notes/docs/site/ui-overview/#demos
        //https://codepen.io/rexrainbow/pen/oQjMWE
        
        this.dialog = this.scene.rexUI.add.dialog({
            x: 400,
            y: 300,
            width: 500,
    
            background: this.scene.rexUI.add.roundRectangle(0, 0, 100, 100, 20, 0x1565c0),
    
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
                this.createLabel('Choice2')
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
        this.dialog.popUp(1000);
    
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
        this.dialog.on('button.click', function (button, groupName, index, pointer, event) {
            this.print.text += groupName + '-' + index + ': ' + button.text + '\n';
        }, this)
        this.dialog.on('button.over', function (button, groupName, index, pointer, event) {
            button.getElement('background').setStrokeStyle(1, 0xffffff);
        })
        this.dialog.on('button.out', function (button, groupName, index, pointer, event) {
            button.getElement('background').setStrokeStyle();
        });
    
    }
    
    createLabel(text) {
        return this.scene.rexUI.add.label({
            width: 40, // Minimum width of round-rectangle
            height: 40, // Minimum height of round-rectangle
          
            background: this.scene.rexUI.add.roundRectangle(0, 0, 100, 40, 20, 0x5e92f3),
    
            text: this.scene.add.text(0, 0, text, {
                fontSize: '24px'
            }),
    
            space: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10
            }
        });
    }
}

export default Menu;