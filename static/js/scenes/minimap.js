export default class MiniMap {
    constructor(scene) {
        this.scene = scene
        this.size = 160
        this.margin = 10
        this.bgColor = 0x002244
        this.borderColor = 0x4488ff
        this.shipColor = 0x00ff00
        this.asteroidColor = 0xff4444

        this.g = scene.add.graphics()
        this.g.setScrollFactor(0)
        this.g.setDepth(100)
    }

    update(worldW, worldH) {
        const cam = this.scene.cameras.main
        const x = cam.width - this.size - this.margin
        const y = this.margin
        const ship = this.scene.ship
        const shipX = ship.x / worldW
        const shipY = ship.y / worldH

        this.g.clear()

        this.g.fillStyle(this.bgColor, 0.8)
        this.g.fillRect(x, y, this.size, this.size)
        this.g.lineStyle(1, this.borderColor, 1)
        this.g.strokeRect(x, y, this.size, this.size)

        for (const asteroid of this.scene.asteroidsArray) {
            const ax = x + (asteroid.x / worldW) * this.size
            const ay = y + (asteroid.y / worldH) * this.size
            this.g.fillStyle(this.asteroidColor, 0.6)
            this.g.fillPoint(ax, ay, 2)
        }

        const sx = x + shipX * this.size
        const sy = y + shipY * this.size
        this.g.fillStyle(this.shipColor, 1)
        this.g.fillPoint(sx, sy, 4)
    }
}
