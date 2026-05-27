export default class Bullet extends Phaser.Physics.Arcade.Image {
    constructor(scene) {
        super(scene, 0, 0, 'space', 'blaster')
        this.setScale(0.3)
        this.setBlendMode(1)
        this.setDepth(1)
        this.speed = 1000
        this.lifespan = 500
        this._temp = new Phaser.Math.Vector2()
    }

    fire(ship, posX, posY, angleRad) {
        this.lifespan = 500
        this.setActive(true)
        this.setVisible(true)

        const x = posX !== undefined ? posX : ship.x
        const y = posY !== undefined ? posY : ship.y
        const a = angleRad !== undefined ? angleRad : ship.rotation

        this.setPosition(x, y)
        this.body.reset(x, y)
        this.body.setSize(this.width, this.height, true)
        this.setAngle(Phaser.Math.RadToDeg(a))

        this.scene.physics.velocityFromRotation(a, this.speed, this.body.velocity)
        this.body.velocity.x *= 2
        this.body.velocity.y *= 2
    }

    fireAt(ship, angleRad) {
        this.fire(ship, ship.x, ship.y, angleRad)
    }

    update(time, delta) {
        this.lifespan -= delta
        if (this.lifespan <= 0) {
            this.setActive(false)
            this.setVisible(false)
            this.body.stop()
        }
    }
}
