var Bullet = new Phaser.Class({

    Extends: Phaser.Physics.Arcade.Image,

    initialize: function Bullet (scene)
    {
        Phaser.Physics.Arcade.Image.call(this, scene, 0, 0, 'space', 'blaster');
        this.setScale(0.3);		
        this.setBlendMode(1);
        this.setDepth(1);
        this.speed = 1000;
        this.lifespan = 500;

        this._temp = new Phaser.Math.Vector2();
    },

    fire: function (ship)
    {
        this.lifespan = 500;

        this.setActive(true);
        this.setVisible(true);
        // this.setRotation(ship.rotation);
        this.setAngle(ship.body.rotation);
        this.setPosition(ship.x, ship.y);
        this.body.reset(ship.x, ship.y);
        this.body.setSize(this.width, this.height, true);

        // ship.body.advancePosition(10, this._temp);

        // this.setPosition(this._temp.x, this._temp.y);
        // this.body.reset(this._temp.x, this._temp.y);

        //  if ship is rotating we need to add it here
        // var a = ship.body.angularVelocity;

        // if (ship.body.speed !== 0)
        // {
        //     var angle = Math.atan2(ship.body.velocity.y, ship.body.velocity.x);
        // }
        // else
        // {
            var angle = Phaser.Math.DegToRad(ship.body.rotation);
        // }

        // this.body.world.velocityFromRotation(angle, this.speed + ship.body.speed, this.body.velocity);
        this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);

        this.body.velocity.x *= 2;
        this.body.velocity.y *= 2;
    },

    update: function (time, delta)
    {
        this.lifespan -= delta;

        if (this.lifespan <= 0)
        {
            this.setActive(false);
            this.setVisible(false);
            this.body.stop();
        }
    }

});

export default Bullet;