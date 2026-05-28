import RNG from './RNG.js';

class ProceduralAssets {

    static generateBase(scene) {
        const g = scene.make.graphics({ add: false });
        this._shipFallback(scene, g);
        this._bullet(scene, g);
        this._fx(scene, g);
        g.destroy();
    }

    static generateWorld(scene, manifest) {
        const g = scene.make.graphics({ add: false });
        this._stars(scene, g, manifest);
        this._nebula(scene, g, manifest);
        this._planets(scene, g, manifest);
        this._galaxies(scene, g, manifest);
        this._eyes(scene, g, manifest);
        this._asteroids(scene, g, manifest);
        g.destroy();
    }

    static generate(scene, manifest) {
        this.generateBase(scene);
        this.generateWorld(scene, manifest);
    }

    static _stars(scene, g, manifest) {
        const layers = manifest.stars || [];
        for (let li = 0; li < layers.length; li++) {
            const points = layers[li];
            const key = `stars_${li}`;
            const w = manifest.world.width;
            const h = manifest.world.height;
            const tex = scene.textures.createCanvas(key, w, h);
            const ctx = tex.getContext();
            ctx.clearRect(0, 0, w, h);
            for (const pt of points) {
                const b = Math.min(pt.brightness || 200, 255);
                ctx.fillStyle = `rgb(${b},${b},${b})`;
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, Math.max(pt.radius, 1), 0, Math.PI * 2);
                ctx.fill();
            }
            tex.refresh();
        }
    }

    static _drawBlob(g, cx, cy, radius, color, alpha) {
        g.fillStyle(color, alpha);
        g.fillCircle(cx, cy, radius);
    }

    static _nebula(scene, g, manifest) {
        const list = manifest.nebula || [];
        for (let i = 0; i < list.length; i++) {
            const n = list[i];
            const key = `nebula_${i}`;
            const r = Math.ceil(n.radius);
            const d = r * 2;
            const tex = scene.textures.createCanvas(key, d, d);
            const ctx = tex.getContext();
            const rng = new RNG(n.seed || i * 9999);
            const cx = r, cy = r;
            for (const c of n.palette) {
                const subR = rng.nextFloat(r * 0.3, r * 0.9);
                const ox = rng.nextFloat(-r * 0.3, r * 0.3);
                const oy = rng.nextFloat(-r * 0.3, r * 0.3);
                const grad = ctx.createRadialGradient(cx + ox, cy + oy, 0, cx + ox, cy + oy, subR);
                grad.addColorStop(0, c);
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(cx, cy, subR, 0, Math.PI * 2);
                ctx.fill();
            }
            tex.refresh();
        }
    }

    static _planets(scene, g, manifest) {
        const list = manifest.planets || [];
        for (let i = 0; i < list.length; i++) {
            const p = list[i];
            const key = `planet_${i}`;
            const r = Math.ceil(p.radius);
            const d = r * 2;
            const tex = scene.textures.createCanvas(key, d, d);
            const ctx = tex.getContext();
            const rng = new RNG(p.seed || i * 7777);
            const cx = r, cy = r;
            for (const c of p.palette) {
                const bandH = rng.nextFloat(r * 0.15, r * 0.4);
                const bandY = rng.nextFloat(-r * 0.3, r * 0.3);
                ctx.fillStyle = c;
                ctx.beginPath();
                ctx.ellipse(cx, cy + bandY, r * 0.8, bandH, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.strokeStyle = p.palette[p.palette.length - 1];
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();
            tex.refresh();
        }
    }

    static _galaxies(scene, g, manifest) {
        const list = manifest.galaxies || [];
        for (let i = 0; i < list.length; i++) {
            const gx = list[i];
            const key = `galaxy_${i}`;
            const r = Math.ceil(gx.radius);
            const d = r * 2;
            const tex = scene.textures.createCanvas(key, d, d);
            const ctx = tex.getContext();
            const rng = new RNG(gx.seed || i * 5555);
            const cx = r, cy = r;
            const arms = rng.nextInt(2, 5);
            for (let a = 0; a < arms; a++) {
                const angle = (a / arms) * Math.PI * 2;
                const armLen = rng.nextFloat(r * 0.6, r);
                for (let s = 0; s < 30; s++) {
                    const t = s / 30;
                    const dist = t * armLen;
                    const spread = t * r * 0.3;
                    const aOff = angle + t * 3 + rng.nextFloat(-spread, spread);
                    const sx = cx + Math.cos(aOff) * dist;
                    const sy = cy + Math.sin(aOff) * dist;
                    const b = Math.floor(200 - t * 150);
                    const sz = Math.max(1, Math.floor(3 - t * 2));
                    ctx.fillStyle = `rgba(${b},${Math.floor(b * 0.6)},${Math.floor(b * 0.8)},${0.6 - t * 0.3})`;
                    ctx.beginPath();
                    ctx.arc(sx, sy, sz, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            tex.refresh();
        }
    }

    static _eyes(scene, g, manifest) {
        const list = manifest.eyes || [];
        for (let i = 0; i < list.length; i++) {
            const e = list[i];
            const key = `eye_${i}`;
            const r = Math.ceil(e.radius);
            const d = r * 2;
            g.clear();
            g.fillStyle(0xffffff);
            g.fillCircle(r, r, r);
            g.fillStyle(0x000000);
            g.fillCircle(r, r, r * 0.6);
            g.fillStyle(0xffffff);
            g.fillCircle(r - r * 0.2, r - r * 0.2, r * 0.15);
            g.generateTexture(key, d, d);
        }
    }

    static _asteroids(scene, g, manifest) {
        const list = manifest.asteroids || [];
        for (let i = 0; i < list.length; i++) {
            const a = list[i];
            const key = `asteroid_${i}`;
            const r = Math.ceil(a.radius);
            const d = r * 2 + 8;
            const cx = d / 2, cy = d / 2;
            const rng = new RNG(a.seed || i * 3333);
            const color = Phaser.Display.Color.HSLToColor(a.hue / 360, a.sat / 100, a.light / 100);
            const colorInt = color.color;
            g.clear();
            g.fillStyle(colorInt);
            const segments = rng.nextInt(7, 13);
            const pts = [];
            for (let s = 0; s < segments; s++) {
                const angle = (s / segments) * Math.PI * 2;
                const rad = r * rng.nextFloat(0.7, 1.0);
                pts.push({ x: cx + Math.cos(angle) * rad, y: cy + Math.sin(angle) * rad });
            }
            g.beginPath();
            g.moveTo(pts[0].x, pts[0].y);
            for (let s = 1; s < pts.length; s++) {
                g.lineTo(pts[s].x, pts[s].y);
            }
            g.closePath();
            g.fillPath();
            g.lineStyle(1, 0x000000, 0.3);
            g.strokePath();
            g.generateTexture(key, d, d);
        }
    }

    static _shipFallback(scene, g) {
        g.clear();
        g.fillStyle(0x4488ff);
        g.beginPath();
        g.moveTo(4, 0);
        g.lineTo(28, 16);
        g.lineTo(4, 32);
        g.lineTo(10, 16);
        g.closePath();
        g.fillPath();
        g.fillStyle(0x88ccff);
        g.fillRect(12, 10, 12, 12);
        g.generateTexture('ship-fallback', 32, 32);
    }

    static _bullet(scene, g) {
        g.clear();
        g.fillStyle(0xffffff);
        g.fillCircle(4, 4, 3);
        g.generateTexture('bullet', 8, 8);
    }

    static _fx(scene, g) {
        const fxDefs = [
            { key: 'smoke', color: 0xaaaaaa, r: 8 },
            { key: 'blastwave', color: 0xff8800, r: 16 },
            { key: 'flame', color: 0xff4400, r: 6 },
            { key: 'particle', color: 0xffffff, r: 3 },
        ];
        for (const def of fxDefs) {
            g.clear();
            g.fillStyle(def.color);
            g.fillCircle(def.r, def.r, def.r);
            g.generateTexture(def.key, def.r * 2, def.r * 2);
        }
    }
}

export default ProceduralAssets;
