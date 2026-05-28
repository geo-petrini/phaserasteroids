
export function createSmokeFX(x, y, scene) {
    let emitterSmoke = scene.add.particles(x, y, 'smoke', {
        speed: { min: 1, max: 10 },
        angle: { min: 0, max: 270 },
        scale: { start: 0.5, end: 0 },
        alpha: { start: 1, end: 0 },
        blendMode: 'SCREEN',
        active: true,
        lifespan: 600,
    });
    emitterSmoke.explode();
}

export function createFlameFX(x, y, scene) {
    let emitterFlame = scene.add.particles(x, y, 'flame', {
        speed: { min: 1, max: 10 },
        angle: { min: 0, max: 270 },
        scale: { start: 0.5, end: 1 },
        alpha: { start: 0.5, end: 0 },
        blendMode: 'SCREEN',
        active: true,
        lifespan: 600,
    });
    emitterFlame.explode();
    scene.sounds['explosion_short'].play();
}

export function createBlastFX(x, y, scene) {
    let emitterBlast = scene.add.particles(x, y, 'blastwave', {
        speed: { min: 0, max: 0 },
        angle: { min: 0, max: 270 },
        scale: { start: 0.1, end: 0.8 },
        alpha: { start: 0.5, end: 0 },
        blendMode: 'SCREEN',
        active: true,
        lifespan: 600,
    });
    emitterBlast.explode();

    scene.sounds['sbabaam'].play();
    scene.sounds['asteroid_explosion_1'].play();
}


export function createTrail(source, scene) {
    var emitterTrail = scene.add.particles(0, 0, 'space',
        {
            frame: 'blue',
            speed: 100,
            emitting: false,
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
    return emitterTrail
}
