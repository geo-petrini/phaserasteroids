export default class Radar {
    constructor(scene) {
        this.scene = scene
        this.g = scene.add.graphics()
        this.g.setScrollFactor(0)
        this.DEBUGLINES = false
        this.DOT_MAX_SIZE = 5
        this.DOT_LINE_SIZE = 1
        this.DOT_LINE_COLOR = 0xc8c8c8
        this.DOT_FILL_COLOR = 0x646464
        this.DBG_LINE_COLOR = 0x0000d2
    }

    update() {
        this.g.clear()

        const cam = this.scene.cameras.main
        const margin = this.DOT_MAX_SIZE
        this.rectX = margin
        this.rectY = margin
        this.rectW = cam.width - margin * 2
        this.rectH = cam.height - margin * 2

        if (this.DEBUGLINES) {
            this.g.lineStyle(2, 0x00bb00)
            this.g.strokeRect(this.rectX, this.rectY, this.rectW, this.rectH)
        }

        const ship = this.scene.ship
        if (!ship) return

        this.scene.asteroidsArray.forEach(asteroid => {
            this.drawIntersection(asteroid, cam, ship)
        })

        this.g.setAlpha(0.5)
    }

    drawIntersection(asteroid, cam, ship) {
        const sx = cam.width / 2
        const sy = cam.height / 2

        const ax = sx + (asteroid.x - ship.x)
        const ay = sy + (asteroid.y - ship.y)

        if (ax >= this.rectX && ax <= this.rectX + this.rectW &&
            ay >= this.rectY && ay <= this.rectY + this.rectH) {
            return
        }

        const dist = Math.sqrt((ax - sx) ** 2 + (ay - sy) ** 2)
        if (dist < 1) return

        const point = this.rayIntersectRect(sx, sy, ax, ay, this.rectX, this.rectY, this.rectW, this.rectH)
        if (!point) return

        const minDim = Math.max(this.rectW, this.rectH)
        const vicinity = minDim / dist
        const pointSize = Math.max(this.DOT_MAX_SIZE * vicinity, 1)

        this.g.lineStyle(this.DOT_LINE_SIZE, this.DOT_LINE_COLOR)
        this.g.fillStyle(this.DOT_FILL_COLOR)
        this.g.fillPoint(point.x, point.y, pointSize)
    }

    rayIntersectRect(x1, y1, x2, y2, rx, ry, rw, rh) {
        const dx = x2 - x1
        const dy = y2 - y1

        const left = (rx - x1) / dx
        const right = (rx + rw - x1) / dx
        const top = (ry - y1) / dy
        const bottom = (ry + rh - y1) / dy

        const tMin = Math.max(Math.min(left, right), Math.min(top, bottom))
        const tMax = Math.min(Math.max(left, right), Math.max(top, bottom))

        if (tMax < 0 || tMin > tMax || tMin > 1) return null

        const t = tMin < 0 ? tMax : tMin
        return { x: x1 + dx * t, y: y1 + dy * t }
    }
}
