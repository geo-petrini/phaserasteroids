// 3.1 create the beam class
// 3.1 NOTE dont forget to add this file in the index.html file
class Beam extends Phaser.GameObjects.Sprite{
  constructor(scene){

    var x = scene.player.x;
    var y = scene.player.y - 16;

    super(scene, x, y, "beam");

    // 3.2 add to scene
    scene.add.existing(this);

    // 3.3
    this.play("beam_anim");
    scene.physics.world.enableBody(this);
    this.body.velocity.y = - 250;


    // 4.2 add the beam to the projectiles group
    scene.projectiles.add(this);

  }


  update(){

    // 3.4 Frustum culling
    if(this.y < 32 ){
      this.destroy();
    }
  }
}
