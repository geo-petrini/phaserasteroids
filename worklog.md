# Worklog - Migrazione Phaser 3.70.0 → Phaser 4.1.0

## Analisi iniziale

Progetto: phaserasteroids (Phaser 3.70.0, arcade physics, 8000x8000 world)
Dipendenze: Phaser CDN, rexUI plugin (inutilizzato), dat.GUI (inutilizzato)

### Problemi riscontrati

1. **Radar a scatti** - `Graphics` senza `setScrollFactor(0)`, disegnava in coordinate mondo causando lag di 1 frame con la camera
2. **MiniMap a scatti** - Estendeva `Camera` con scroll manuale, stesso problema di lag
3. **Bullet** - Usava `Phaser.Class` (pattern deprecato)
4. **Asteroid animations** - Usava `textures.addSpriteSheetFromAtlas` (rimosso in Phaser 4)
5. **HealthBar** - `this.danger_value =` bug sintattico (dangling assignment)
6. **Asset loading** - Asteroidi caricati come `image` invece che `spritesheet`

## Modifiche apportate

### `index.html`
- CDN: `phaser@3.70.0` → `phaser@4.1.0`
- Rimossi script tag rexUI e commenti vari

### `js/main.js`
- Rimossi `pixelArt: true` e `roundPixels: true` (non più supportati in Phaser 4)
- `arcade.debug: false` (default)

### `js/scenes/bootscene.js`
- Asteroidi caricati come spritesheet direttamente:
  - `asteroid1-3`: 480×480, frame 96×96 (25 frames)
  - `asteroid4`: 512×192, frame 64×64 (24 frames)

### `js/scenes/gamescene.js`
- Rimosse chiamate a `textures.addSpriteSheetFromAtlas` (non esiste in Phaser 4)
- Fix debug toggle: aggiunto null-check per `debugGraphic.clear()`
- Rimosso metodo deprecato `DEPRECATED_createMinimap()`
- Aggiunto `this.canvas` preload minimale
- Integrato nuovo MiniMap

### `js/scenes/radar.js` — REWRITE
- **Causa stutter**: `Graphics` senza `setScrollFactor(0)`, calcoli in coordinate mondo
- **Fix**: `this.g.setScrollFactor(0)` + coordinate schermo (world - camera scroll)
- Algoritmo: slab method per ray-rectangle intersection
- Skip asteroidi già visibili a schermo (non mostrare dot)
- Vicinanza = viewport size / distanza → dot size variabile

### `js/scenes/minimap.js` — REWRITE
- **Causa stutter**: Estensione di `Camera` con scroll manuale
- **Fix**: Graphics overlay con `setScrollFactor(0)`, mapping lineare mondo→schermo
- Angolo alto-destra, 160×160px, sfondo blu scuro
- Asteroidi: punti rossi, Nave: punto verde

### `js/scenes/shipconfig.js`
- Rimosso `this.load.scenePlugin('rexuiplugin')` (non più supportato, inutilizzato)

### `js/sprites/bullet.js` — REWRITE
- **Prima**: `Phaser.Class({ Extends: Phaser.Physics.Arcade.Image, ... })`
- **Dopo**: `export default class Bullet extends Phaser.Physics.Arcade.Image`
- Stessa logica, pattern moderno ES6

### `js/sprites/ship.js`
- Aggiunto `this.setAlpha(0.8)` — ship semi-trasparente
- `_repositionHealthBars()`: coordinate schermo usando `cam.width/2, cam.height/2` invece di `this.x - cam.scrollX` (elimina lag da camera scroll)
- Trail emitter: `startFollow(this) + emitting = true` quando accelera, `stopFollow() + emitting = false` quando no

### `js/sprites/asteroid.js`
- `body.setCircle(Math.max(this.width, ...))` → `body.setCircle(Math.max(this.displayWidth, ...))`
- Rimosso `body.updateBounds()` (superfluo)

### `js/sprites/fx.js`
- `createTrail`: emitter creato a (0,0) con `emitting: false` (nessun follow nel config)
- In Phaser 4 il config `follow: source` non accetta un game object (solo Vector2Like)
- `startFollow(target)` nell'update della ship imposta il seguimento ogni frame

### `js/sprites/healthbar.js` — REWRITE
- Rimosso bug `this.danger_value =` (dangling assignment)
- Aggiunto `this.bar.setScrollFactor(0)` — Graphics ancorata allo schermo
- `pixel_value` calcolato su larghezza interna (`width - margin*2`) invece che totale — fix fillRect 1px extra
- Ordine draw corretto: bordo → sfondo vuoto → barra piena sopra (prima la barra piena veniva coperta)
- Aggiunto helper `parseColor(hex)` esternalizzato in `js/utils/helpers.js`
- Nuovo metodo `_fill(hex)` che supporta colori `0xRRGGBBAA` con canale alpha

### `js/utils/helpers.js` — NUOVO
- `parseColor(hex)`: se > 0xFFFFFF assume formato `0xRRGGBBAA`, separa RGB e alpha (0-1)

### `js/sprites/shipeditor.js` — NUOVO
- Griglia 9×9 con celle da 48px
- Palette elementi (Cabin, Generator L1-3, Thruster L1-3, Shield L1-3, Gun L1, Track Gun)
- Drag & drop dalla palette alla griglia con ghost snapping
- Elementi piazzati ri-draggabili per riposizionamento
- Click destro per rimuovere elemento
- Ogni elemento ha colore e dimensione diversa (quadrati colorati, nessuna sprite)

### `js/scenes/shipconfig.js` — REWRITE
- Integrato ShipEditor come scena principale
- Tasto O per alternare tra editor e GameScene (`scene.switch`)
- Sfondo scuro #0a0a1a

## Note su Phaser 4

- `Phaser.Input.Keyboard.JustDown(key)` → se non funziona, usare `key.justDown`
- `debugGraphic.clear()` → se rimosso, avvolgere in try/catch
- API core (Scene, Physics, Input, Tweens, Camera) sono "likely unchanged" per il migration guide
