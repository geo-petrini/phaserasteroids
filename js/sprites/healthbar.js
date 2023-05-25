export default class HealthBar {

    constructor({ scene, x = 0, y = 0, width = 80, height = 16, fill_color = 0x00ff00, warn_color = 0xffff00, danger_color = 0xff0000, border_color = 0x000000, empty_color = 0xffffff }) {
        this.bar = new Phaser.GameObjects.Graphics(scene);

        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
        this.margin = 1;
        this.value = 100;
        this.p = this.width / 100;
        this.fill_color = fill_color
        this.warn_color = warn_color
        this.danger_color = danger_color
        this.border_color = border_color
        this.empty_color = empty_color
        this.visible = true

        this.draw();

        scene.add.existing(this.bar);
    }

    decrease(amount) {
        this.value -= amount;

        if (this.value < 0) {
            this.value = 0;
        }

        this.draw();

        return (this.value === 0);
    }

    increase(amount) {
        this.value += amount;

        if (this.value > 100) {
            this.value = 100;
        }

        this.draw();

        return (this.value === 100);
    }

    draw() {
        this.bar.visible = this.visible


        this.bar.clear();

        //  BG
        this.bar.fillStyle(this.border_color);
        this.bar.fillRect(this.x, this.y, this.width, this.height);

        //  Health

        this.bar.fillStyle(this.empty_color);
        this.bar.fillRect(this.x + 2, this.y + 2, this.width - this.margin * 2, this.height - this.margin * 2);

        if (this.value < 30) {
            this.bar.fillStyle(this.danger_color);
        }
        else if (this.value < 50) {
            this.bar.fillStyle(this.warn_color);
        }
        else {
            this.bar.fillStyle(this.fill_color);
        }

        var d = Math.floor(this.p * this.value);

        this.bar.fillRect(this.x + 2, this.y + 2, d, this.height - this.margin * 2);

    }

}