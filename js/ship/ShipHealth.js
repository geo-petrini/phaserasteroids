import HealthBar from '../sprites/healthbar.js'

export default class ShipHealth {
  constructor(scene, bodyWidth) {
    this.bodyWidth = bodyWidth
    this.hull_hb = new HealthBar({ scene, width: 32, height: 4, border_color: 0x00000000 })
    this.energy_hb = new HealthBar({ scene, width: 32, height: 4, fill_color: 0xff9c00, border_color: 0x00000000 })
    this.shield_hb = new HealthBar({ scene, width: 32, height: 4, fill_color: 0x00ffff, border_color: 0x00000000 })
  }

  reposition(cam) {
    const sx = cam.width / 2
    const sy = cam.height / 2
    const bw = this.bodyWidth
    const v = 4

    this.hull_hb.x = sx - bw / 2
    this.hull_hb.y = sy + bw
    this.hull_hb.draw()

    this.energy_hb.x = sx - bw / 2
    this.energy_hb.y = sy + bw + v
    this.energy_hb.draw()

    this.shield_hb.x = sx - bw / 2
    this.shield_hb.y = sy + bw + v * 2
    this.shield_hb.draw()
  }

  damage(amount) { this.hull_hb.decrease(amount) }

  explode() {
    this.hull_hb.visible = false
    this.energy_hb.visible = false
    this.shield_hb.visible = false
  }

  destroy() {
    this.hull_hb.destroy()
    this.energy_hb.destroy()
    this.shield_hb.destroy()
  }
}
