import { parseColor } from '../utils/helpers.js';

export default class HealthBar {

    constructor({ scene, x = 0, y = 0, width = 80, height = 16, fill_color = 0x00ff00, warn_color = 0xffff00, danger_color = 0xff0000, border_color = 0x000000, empty_color = 0xffffff, max_value = 100, danger_value = 30, warn_value = 50 }) {
        this.bar = new Phaser.GameObjects.Graphics(scene);
        this.bar.setScrollFactor(0);

        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
        this.margin = 1;
        this.max_value = max_value;
        this.value = this.max_value;

        this.pixel_value = (this.width - this.margin * 2) / this.max_value;


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

        if (this.value > this.max_value) {
            this.value = this.max_value;
        }

        this.draw();

        return (this.value === this.max_value);
    }

    _fill(hex) {
        const { color, alpha } = parseColor(hex);
        this.bar.fillStyle(color, alpha);
    }

    draw() {
        this.bar.visible = this.visible

        this.bar.clear();

        this._fill(this.border_color);
        this.bar.fillRect(this.x, this.y, this.width, this.height);

        this._fill(this.empty_color);
        this.bar.fillRect(this.x + 2, this.y + 2, this.width - this.margin * 2, this.height - this.margin * 2);

        let c
        if (this.value < 30) {
            c = this.danger_color;
        }
        else if (this.value < 50) {
            c = this.warn_color;
        }
        else {
            c = this.fill_color;
        }

        this._fill(c);
        var d = Math.floor(this.pixel_value * this.value);
        this.bar.fillRect(this.x + 2, this.y + 2, d, this.height - this.margin * 2);

    }

}
