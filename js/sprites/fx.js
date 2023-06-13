
export function createSmokeFX(x, y, scene) {
    let emitterSmoke = scene.add.particles('smoke').createEmitter({
        x: x,
        y: y,
        speed: { min: 1, max: 10 },
        angle: { min: 0, max: 270 },
        scale: { start: 0.5, end: 0 },
        alpha: { start: 1, end: 0 },
        blendMode: 'SCREEN',
        active: true,
        lifespan: 600, //milliseconds
    });
    emitterSmoke.explode();
}

export function createFlameFX(x, y, scene) {
    let emitterFlame = scene.add.particles('flame').createEmitter({
        x: x,
        y: y,
        speed: { min: 1, max: 10 },
        angle: { min: 0, max: 270 },
        scale: { start: 0.5, end: 1 },
        alpha: { start: 0.5, end: 0 },
        blendMode: 'SCREEN',
        active: true,
        lifespan: 600, //milliseconds
    });
    emitterFlame.explode();
    scene.sounds['explosion_short'].play();
}

export function createBlastFX(x, y, scene) {
    let emitterBlast = scene.add.particles('blastwave').createEmitter({
        x: x,
        y: y,
        speed: { min: 0, max: 0 },
        angle: { min: 0, max: 270 },
        scale: { start: 0.1, end: 0.8 },
        alpha: { start: 0.5, end: 0 },
        blendMode: 'SCREEN',
        active: true,
        lifespan: 600, //milliseconds
    });
    emitterBlast.explode();

    scene.sounds['sbabaam'].play();
    scene.sounds['asteroid_explosion_1'].play();
}


export function createTrail(source, scene) {
    var particles = scene.add.particles('space');
    //TODO refactor this for v 3.60, see doc https://newdocs.phaser.io/docs/3.60.0/Phaser.GameObjects.Particles.ParticleEmitter
    var emitterTrail = particles.createEmitter({
        frame: 'blue',
        speed: 100,
        lifespan: {
            onEmit: function (particle, key, t, value) {
                return Phaser.Math.Percent(source.body.speed, 0, 300) * 500;
            }
        },
        alpha: {
            onEmit: function (particle, key, t, value) {
                return Phaser.Math.Percent(source.body.speed, 0, 300);
            }
        },
        angle: {
            onEmit: function (particle, key, t, value) {
                var v = Phaser.Math.Between(-10, 10);
                return (source.angle - 180) + v;
            }
        },
        scale: { start: 0.2, end: 0 },
        blendMode: 'ADD'
    });
    emitterTrail.startFollow(source);
}