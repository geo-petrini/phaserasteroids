var SET_WIDTH=1024;
var SET_HEIGHT=864;
var WORLD_WIDTH=8000;
var WORLD_HEIGHT=8000;


var config = {
    type: Phaser.AUTO,
    width: SET_WIDTH,
    height: SET_HEIGHT,
    parent: 'phaser-example',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var bg;
var stars;
var ship;
var bullets;
var lastFired = 0;
var cursors;
var fire;
var asteroidsMax = 20;
var asteroidsArray;
var asteroidTimedEvent;
var text;

var game = new Phaser.Game(config);

function preload ()
{
    this.load.image('background', 'assets/nebula.jpg');
    this.load.image('stars', 'assets/stars.png');
    this.load.atlas('space', 'assets/space.png', 'assets/space.json');
}

function create ()
{
	console.log('create');
	text = this.add.text(32, 32);
	
    //  Prepare some spritesheets and animations

    this.textures.addSpriteSheetFromAtlas('mine-sheet', { atlas: 'space', frame: 'mine', frameWidth: 64 });
    this.textures.addSpriteSheetFromAtlas('asteroid1-sheet', { atlas: 'space', frame: 'asteroid1', frameWidth: 96 });
    this.textures.addSpriteSheetFromAtlas('asteroid2-sheet', { atlas: 'space', frame: 'asteroid2', frameWidth: 96 });
    this.textures.addSpriteSheetFromAtlas('asteroid3-sheet', { atlas: 'space', frame: 'asteroid3', frameWidth: 96 });
    this.textures.addSpriteSheetFromAtlas('asteroid4-sheet', { atlas: 'space', frame: 'asteroid4', frameWidth: 64 });

    this.anims.create({ key: 'mine-anim', frames: this.anims.generateFrameNumbers('mine-sheet', { start: 0, end: 15 }), frameRate: 20, repeat: -1 });
    this.anims.create({ key: 'asteroid1-anim', frames: this.anims.generateFrameNumbers('asteroid1-sheet', { start: 0, end: 24 }), frameRate: 20, repeat: -1 });
    this.anims.create({ key: 'asteroid2-anim', frames: this.anims.generateFrameNumbers('asteroid2-sheet', { start: 0, end: 24 }), frameRate: 20, repeat: -1 });
    this.anims.create({ key: 'asteroid3-anim', frames: this.anims.generateFrameNumbers('asteroid3-sheet', { start: 0, end: 24 }), frameRate: 20, repeat: -1 });
    this.anims.create({ key: 'asteroid4-anim', frames: this.anims.generateFrameNumbers('asteroid4-sheet', { start: 0, end: 23 }), frameRate: 20, repeat: -1 });

    //  World size is 8000 x 6000

    bg = this.add.tileSprite(SET_WIDTH/2, SET_HEIGHT/2, SET_WIDTH, SET_HEIGHT, 'background').setScrollFactor(0);

    //  Add our planets, etc

    this.add.image(512, 680, 'space', 'blue-planet').setOrigin(0).setScrollFactor(0.6);
    this.add.image(2833, 1246, 'space', 'brown-planet').setOrigin(0).setScrollFactor(0.6);
    this.add.image(3875, 531, 'space', 'sun').setOrigin(0).setScrollFactor(0.6);
    var galaxy = this.add.image(5345 + 1024, 327 + 1024, 'space', 'galaxy').setBlendMode(1).setScrollFactor(0.6);
    this.add.image(908, 3922, 'space', 'gas-giant').setOrigin(0).setScrollFactor(0.6);
    this.add.image(3140, 2974, 'space', 'brown-planet').setOrigin(0).setScrollFactor(0.6).setScale(0.8).setTint(0x882d2d);
    this.add.image(6052, 4280, 'space', 'purple-planet').setOrigin(0).setScrollFactor(0.6);

    for (var i = 0; i < 8; i++)
    {
        this.add.image(Phaser.Math.Between(0, WORLD_WIDTH), Phaser.Math.Between(0, WORLD_HEIGHT), 'space', 'eyes').setBlendMode(1).setScrollFactor(0.8);
    }

    stars = this.add.tileSprite(SET_WIDTH/2, SET_HEIGHT/2, SET_WIDTH, SET_HEIGHT, 'stars').setScrollFactor(0);	
	
    var Bullet = new Phaser.Class({

        Extends: Phaser.Physics.Arcade.Image,

        initialize: function Bullet (scene)
        {
            Phaser.Physics.Arcade.Image.call(this, scene, 0, 0, 'space', 'blaster');
			this.setScale(0.3);		
            this.setBlendMode(1);
            this.setDepth(1);
            this.speed = 1000;
            this.lifespan = 1000;

            this._temp = new Phaser.Math.Vector2();
        },

        fire: function (ship)
        {
            this.lifespan = 1000;

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

	var Asteroid = new Phaser.Class({

        Extends: Phaser.Physics.Arcade.Sprite,
		initialize: function Asteroid (scene)
        {
			Phaser.Physics.Arcade.Sprite.call(this, scene, 0, 0, 'space', 'blaster');
		//let asteroid = this.add.sprite(WORLD_WIDTH/2, WORLD_HEIGHT/2).play('asteroid4-anim');
		//asteroid.setScale(Phaser.Math.FloatBetween(1, 0.6));
		//asteroid.setRotation(Phaser.Math.FloatBetween(0, 1));
		//asteroid.body.velocity = new Phaser.Math.Vector2(Phaser.Math.RND.integerInRange(-30, 30), Phaser.Math.RND.integerInRange(-30, 30));
		//asteroid.body.angularVelocity = rng.between(0, 300);		
		/*this.asteroidsGroup.add(asteroid, true);
		this.asteroidsArray.push(asteroid);			
            Phaser.Physics.Arcade.Image.call(this, scene, 0, 0, 'space', 'blaster');
			this.setScale(0.3);		
            this.setBlendMode(1);
            this.setDepth(1);
            this.speed = 1000;
            this.lifespan = 1000;

            this._temp = new Phaser.Math.Vector2();
        },*/
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
	})


	//ship trail
    var particles = this.add.particles('space');

    var emitter = particles.createEmitter({
        frame: 'blue',
        speed: 100,
        lifespan: {
            onEmit: function (particle, key, t, value)
            {
                return Phaser.Math.Percent(ship.body.speed, 0, 300) * 500;
            }
        },
        alpha: {
            onEmit: function (particle, key, t, value)
            {
                return Phaser.Math.Percent(ship.body.speed, 0, 300);
            }
        },
        angle: {
            onEmit: function (particle, key, t, value)
            {
                var v = Phaser.Math.Between(-10, 10);
                return (ship.angle - 180) + v;
            }
        },
        scale: { start: 0.2, end: 0 },
        blendMode: 'ADD'
    });

    bullets = this.physics.add.group({
        classType: Bullet,
        maxSize: 30,
        runChildUpdate: true
    });

    ship = this.physics.add.image(WORLD_WIDTH/2, WORLD_HEIGHT/2, 'space', 'ship').setDepth(2);
	ship.setScale(0.5);
    ship.setDrag(200);
    ship.setAngularDrag(150);
    ship.setMaxVelocity(700);	//wrong axes https://phaser.discourse.group/t/arcade-physics-incorrect-velocity-vector-when-trying-to-fly-forward/4126

    emitter.startFollow(ship);

    this.cameras.main.startFollow(ship);

    cursors = this.input.keyboard.createCursorKeys();
    fire = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.add.sprite(4300, WORLD_HEIGHT/2).play('asteroid1-anim');
    this.add.sprite(4400, WORLD_HEIGHT/2).play('asteroid2-anim');
    this.add.sprite(4500, WORLD_HEIGHT/2).play('asteroid3-anim');
    this.add.sprite(4600, WORLD_HEIGHT/2).play('asteroid4-anim');


	
    asteroidsGroup = this.physics.add.group({
        classType: Asteroid,
        maxSize: 30,
        runChildUpdate: true
    });	
	
	// New logic for handling the asteroids
	this.asteroidsGroup = this.physics.add.group();
	this.asteroidsArray = [];	
	
	for (var i = 0; i < asteroidsMax; i++){
		/*
		let asteroid = this.add.sprite(WORLD_WIDTH/2, WORLD_HEIGHT/2).play('asteroid4-anim');
		asteroid.setScale(Phaser.Math.FloatBetween(1, 0.6));
		asteroid.setRotation(Phaser.Math.FloatBetween(0, 1));
		//asteroid.body.velocity = new Phaser.Math.Vector2(Phaser.Math.RND.integerInRange(-30, 30), Phaser.Math.RND.integerInRange(-30, 30));
		//asteroid.body.angularVelocity = rng.between(0, 300);		
		this.asteroidsGroup.add(asteroid, true);
		this.asteroidsArray.push(asteroid);
		*/
	}
	asteroidTimedEvent = this.time.addEvent({
		delay: 1000,
		callback: this.addAsteroid,
		callbackScope: this,
		loop: true,
	});

    this.tweens.add({
        targets: galaxy,
        angle: 360,
        duration: 100000,
        ease: 'Linear',
        loop: -1
    });
}

function addAsteroid() {
	console.log('addAsteroid');
  //let asteroid = new Asteroid(this, 0, 0, 'asteroid1-anim', 0);
  //let asteroid = this.add.sprite(this.ship.x, this.ship.y, 'asteroid1-anim').play('asteroid1-anim');
  /*let asteroid = this.add.sprite(WORLD_WIDTH/2, WORLD_HEIGHT/2).play('asteroid4-anim');
  asteroid.setScale(Phaser.Math.FloatBetween(1, 0.6));
  this.asteroidsGroup.add(asteroid, true);
  this.asteroidsArray.push(asteroid);
  */
}


function update (time, delta)
{
	
	//this.physics.arcade.collide(ship, asteroids);
	//this.physics.arcade.collide(asteroids, asteroids);
	//this.physics.arcade.collide(asteroids, bullets, hitAsteroid);
  
	text.setPosition(ship.x, ship.y-30);
	text.setText('bla');
	//text.setText('Event.progress: ' + asteroidTimedEvent.getProgress().toString().substr(0, 4));
	
    if (cursors.left.isDown)
    {
        ship.setAngularVelocity(-150);
    }
    else if (cursors.right.isDown)
    {
        ship.setAngularVelocity(150);
    }
    else
    {
        ship.setAngularVelocity(0);
    }

    if (cursors.up.isDown)
    {
        this.physics.velocityFromRotation(ship.rotation, 600, ship.body.acceleration);
    }
    else
    {
        ship.setAcceleration(0);
    }

    if (fire.isDown && time > lastFired)
    {
        var bullet = bullets.get();

        if (bullet)
        {
            bullet.fire(ship);
            lastFired = time + 100;
        }
    }
	

	// parallax
    bg.tilePositionX += ship.body.deltaX() * 0.5;
    bg.tilePositionY += ship.body.deltaY() * 0.5;

    stars.tilePositionX += ship.body.deltaX() * 2;
    stars.tilePositionY += ship.body.deltaY() * 2;
}


/*
function hitAsteroid(asteroid, bullet) {
  function buildAsteroid(angle) {
    var a = asteroids.getFirstExists(false);
    if (a) {
      a.height = asteroid.height / 2;
      a.body.height = asteroid.body.height / 2;
      a.width = asteroid.width / 2;
      a.body.width = asteroid.body.width / 2;
      a.reset(asteroid.x, asteroid.y);
      a.angle = angle;
      a.body.angularVelocity = rng.between(0, 300);
      game.physics.arcade.velocityFromAngle(a.angle - 90, 200, a.body.velocity);
      a.body.updateBounds();
    }
  }
  if (asteroid.height > 20) {
    buildAsteroid(bullet.angle + 35);
    buildAsteroid(bullet.angle - 35);
  }
  bullet.kill();
  asteroid.kill();
}*/