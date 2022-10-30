export default class MiniMap extends Phaser.Cameras.Scene2D.Camera {
    constructor ({
      scene,
      x = 10,
      y = 10,
      width = 192,
      height = 192,
      zoom = 0.1,
      scroll = { x: 960, y: 960 }
    }) {
      super(x, y, width, height)
      this.scene = scene
      this.zoom = zoom
      this.scroll = scroll
    }
  
    init () {
      this.scene.cameras.cameras.push(this)
      this.scene.cameras.addExisting(this)
      this.setZoom(this.zoom)
      this.setScroll(this.scroll.x, this.scroll.y)
      return this
    }
  }