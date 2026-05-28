import * as fx from '../sprites/fx.js'

export default class ShipThrusters {
  constructor(scene, scaleX, forwardThrusters, lateralThrusters, shipRef) {
    this.forwardEmitters = []
    this.lateralEmitters = []
    this.shipRef = shipRef
    const ps = scaleX

    if (forwardThrusters) {
      for (const t of forwardThrusters) {
        const e = scene.add.particles(0, 0, 'smoke', {
          speed: { min: 10 * ps, max: 50 * ps },
          angle: { onEmit: () => (shipRef.angle + 180) + Phaser.Math.Between(-20, 20) },
          scale: { start: ps, end: ps * 0.2 },
          alpha: { start: 0.6, end: 0 },
          lifespan: 400,
          emitting: false,
          blendMode: 'ADD',
        })
        this.forwardEmitters.push({ emitter: e, ox: t.x, oy: t.y })
      }
    }

    if (lateralThrusters) {
      for (const t of lateralThrusters) {
        const side = t.y >= 0 ? 1 : -1
        const e = scene.add.particles(0, 0, 'smoke', {
          speed: { min: 10 * ps, max: 40 * ps },
          angle: { onEmit: () => (shipRef.angle + 90 * side) + Phaser.Math.Between(-15, 15) },
          scale: { start: ps * 0.8, end: ps * 0.1 },
          alpha: { start: 0.5, end: 0 },
          lifespan: 300,
          emitting: false,
          blendMode: 'ADD',
        })
        this.lateralEmitters.push({ emitter: e, ox: t.x, oy: t.y, side })
      }
    }
  }

  update(shipX, shipY, rotation, scaleX, isAccel, rotDir) {
    const s = scaleX
    const cos = Math.cos(rotation)
    const sin = Math.sin(rotation)

    for (const fe of this.forwardEmitters) {
      fe.emitter.setPosition(
        shipX + (fe.ox * s) * cos - (fe.oy * s) * sin,
        shipY + (fe.ox * s) * sin + (fe.oy * s) * cos
      )
      fe.emitter.emitting = isAccel
    }

    for (const le of this.lateralEmitters) {
      le.emitter.setPosition(
        shipX + (le.ox * s) * cos - (le.oy * s) * sin,
        shipY + (le.ox * s) * sin + (le.oy * s) * cos
      )
      le.emitter.emitting = rotDir !== 0
    }
  }

  destroy() {
    for (const fe of this.forwardEmitters) { fe.emitter.emitting = false; fe.emitter.destroy() }
    for (const le of this.lateralEmitters) { le.emitter.emitting = false; le.emitter.destroy() }
  }
}
