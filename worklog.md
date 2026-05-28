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
- **Fix dual-start bug**: rimossa chiamata `scene.start('GameScene')` quando c'è saved ship — avvia solo `ShipConfigScene`, evita che GameScene venga stoppata prima di essere usata

### `js/scenes/gamescene.js`
- Rimosse chiamate a `textures.addSpriteSheetFromAtlas` (non esiste in Phaser 4)
- Fix debug toggle: aggiunto null-check per `debugGraphic.clear()`
- Rimosso metodo deprecato `DEPRECATED_createMinimap()`
- Aggiunto `this.canvas` preload minimale
- Integrato nuovo MiniMap
- **Scene lifecycle fix**: sostituito `scene.switch()` con `scene.start()` per il toggle editor
- Rimosso `_pendingCustomShip` / `_pendingShipVersion` / `_appliedShipVersion` — registry è unica fonte di verità, `scene.start()` chiama `create()` che legge `shipData` dal registry

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
- **Per-thruster emitters custom**: forwardEmitters/lateralEmitters creati per ogni thruster custom
- **Scale-aware positions**: offset thruster e weapon moltiplicati per `this.scaleX` in `_updateThrusterEmitters()`, `_fire()`, `_fireTracking()`
- **Scale-aware particles**: dimensioni e velocità particelle scalate con `ps = this.scaleX` (es. `scale: { start: ps, end: ps * 0.2 }`)
- **Energy gen**: `ENERGY_GEN` da shipData, usato in `_rechargeEnergy()` insieme a `WEAPONS_RECHARGE_AMOUNT`
- **Tracking visuals**: `trackGraphics` (Graphics, depth 2) disegna linea rossa da ogni tracking weapon nella direzione del turret + X rossa sul target
- **Target assignment**: `_assignTargets()` ordina asteroidi per distanza, assegna uno diverso a ogni tracking weapon (non più un singolo target per tutte)

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
- Griglia 13×13 con celle da 48px
- Palette elementi (Cabin, Connector S/M/L, Generator L1-3, Thruster L1-3, Shield L1-3, Gun L1, Track Gun)
- Drag & drop dalla palette alla griglia con ghost snapping
- Elementi piazzati ri-draggabili per riposizionamento
- Drag fuori griglia per eliminare
- Ogni elemento ha colore e dimensione diversa (quadrati colorati, nessuna sprite)
- `gridLayout` embedded dentro `shipData` (stessa struttura salvata su localStorage/registry)
- `_loadGridFromShipData()` in constructor carica layout da `shipData.gridLayout` (registry → localStorage)
- `buildShip()` salva `gridLayout` nello stats prima di chiamare `_saveShip()`
- Pulsante rosso **CLEAR** accanto a BUILD SHIP — svuota la griglia con `clearGrid()`

### `js/scenes/shipconfig.js` — REWRITE
- Integrato ShipEditor come scena principale
- Tasto O per alternare tra editor e GameScene (`scene.switch` → `scene.start`)
- Sfondo scuro #0a0a1a
- Rimosso `scene.switch('GameScene')` su create con saved ship (inutile dopo fix lifecycle)
- `scene.start('GameScene')` invece di `start() + switch()` — elimina race condition scene lifecycle

## Bug custom ship emitters — root cause

### Problema: emitter (thrusters e gun) non funzionavano dopo build ship

**Causa 1 — Scene lifecycle (`scene.switch` vs `scene.start`)**:
- `bootscene.js` chiamava `scene.start('GameScene')` e subito dopo `scene.start('ShipConfigScene')`
- Il secondo `start` stoppava GameScene, mettendola in stato "stopped" (non "sleeping")
- `scene.switch('GameScene')` in ShipConfigScene falliva silenziosamente perché `switch` richiede la target in stato "sleeping"
- GameScene non riceveva mai i dati custom (`forwardThrusters`, `weaponPositions`) dal registry
- **Fix**: sostituiti tutti `scene.switch()` con `scene.start()` — ogni transizione ricrea la scena fresh, `create()` legge il registry

**Causa 2 — Scale non applicata a offset e particelle**:
- `computeShipScale()` calcola `48/texWidth` per ridimensionare la sprite (tipicamente 0.2–0.5)
- Ma `_updateThrusterEmitters()`, `_fire()`, `_fireTracking()` usavano offset grezzi in pixel texture (da griglia editor 48px/cella)
- Anche le particelle degli emitter usavano scale fisse (`start: 1, end: 0.2`) indipendentemente dalla scala nave
- **Fix**: tutti gli offset moltiplicati per `this.scaleX`, particle scale e speed scalate con `ps = this.scaleX`

## Refactor 2026-05-28 — per-component weapon stats, shield/hull damage, energy wiring

### Obiettivo
- Ogni arma ha il proprio `fireInterval` ed `energyPerShot` gestiti da `WeaponComponent`
- `ShipWeapons.fireAll()` delega a ogni `WeaponComponent.fire()` invece di `fireFixed`/`fireTracking` separati
- Collisioni danneggiano prima gli scudi poi lo scafo
- Scudo si ricarica consumando energia (1 energy/tick)
- Generatori alimentano `energyGen` per la ricarica energia armi
- Dati arma (`fireIntervall`, `energyUsage`) passati da JSON → ShipData → WeaponComponent

### `js/ship/WeaponComponent.js`
- `energyHb.decrease(1)` → `decrease(this.energyPerShot)` — ogni arma consuma il proprio `energyUsage` dal JSON (Gun L1: 5, Track Gun: 8)

### `js/ship/ShipWeapons.js` — REWRITE
- Crea array `this.weapons` di istanze `WeaponComponent` (una per posizione arma)
- Espone `this.trackingWeapons` / `this.fixedWeapons` come filtri
- Singolo metodo `fireAll()` itera su tutte le armi, ogni `WeaponComponent` gestisce il proprio cooldown (`lastFired` + `fireInterval`)

### `js/ship/ShipHealth.js` — REWRITE
- `damage(amount)`: assorbe con gli scudi prima, eccesso passa allo scafo
- `rechargeShield(amount, energyHb)`: consuma 1 energia, restituisce `amount` scudo
- `shield_hb.max_value` impostato da `shieldCapacity` (aggregato dei componenti scudo)

### `js/ship/ShipTargeting.js` — REWRITE
- Costruttore accetta `trackingWeapons` (array di `WeaponComponent`) invece di offset/turretAngles separati
- `_updateTurretAngles()` scrive su `w.turretAngle` direttamente
- `_drawTargetingLasers()` legge `w.x`, `w.y`, `w.turretAngle` dai weapon component

### `js/ship/Ship.js`
- Rimossi: `FIRE_INTERVAL`, `WEAPONS_BULLET_DISCHARGE`, `lastFired`
- Aggiunti: `SHIELD_CAPACITY`, `SHIELD_RECHARGE` da config
- Firing: `this.weapons.fireAll()` chiamato ogni frame con fire key (ogni arma si auto-gates)
- Shield recharge timer nell'update loop
- `ShipHealth` e `ShipTargeting` costruiti con nuovi parametri

### `js/editor/ShipData.js`
- Posizioni arma includono `fireIntervall` ed `energyUsage` dal componente JSON

### `js/scenes/gamescene.js`
- Passa `shieldCapacity` e `shieldRecharge` da `shipData` al config Ship

## Refactor 2026-05-28 — per-weapon bullet pools

### Obiettivo
- Ogni `WeaponComponent` crea e gestisce il proprio `Phaser.Physics.Arcade.Group` di proiettili
- `bulletsPool`, `bulletSpeed`, `bulletLifespan`, `bulletColor`, `bulletSize` letti da `weapons.json`
- ShipWeapons e GameScene non possiedono più un unico group centralizzato
- Ship.destroy() pulisce tutti i subsystem compresi i gruppi di proiettili
- rebuildShip() verifica che i vecchi collider siano rimossi prima di crearne di nuovi

### `js/sprites/bullet.js`
- `fire()` accetta 5° parametro `opts = {}` con `{speed, lifespan}`
- Usa `opts.speed || this.speed` per velocity, `opts.lifespan || 500` per lifespan
- Rimossa assegnazione hardcoded `this.lifespan = 500`

### `js/ship/WeaponComponent.js` — REWRITE
- Importa `Bullet` per `classType` del group
- Costruttore: salva `bulletsPool`, `bulletSpeed`, `bulletLifespan` da `offset`
- Parsa `bulletColor` string → `Number` per `setTint()`
- Parsa `bulletSize` "WxH" → `bulletScaleX/Y` per `setScale()`
- Nuovo `createBulletGroup(scene)`: `scene.physics.add.group({ classType: Bullet, maxSize, runChildUpdate: true })`
- `fire()`: rimuove parametro `bullets`, usa `this.group.get()`. Passa `{speed, lifespan}` opts a `bullet.fire()`. Applica tint e scale dopo fire.
- Nuovo `destroy()`: distrugge `this.group`

### `js/ship/ShipWeapons.js` — REWRITE
- Rimossi `this.bullets`, `assignBullets()`
- Costruttore chiama `_createBulletGroups()` internamente
- `fireAll()`: non riceve più `bullets`
- Nuovo `getBulletGroups()`: ritorna array dei gruppi di tutte le armi
- Nuovo `destroy()`: itera `this.weapons`, chiama `w.destroy()`

### `js/ship/Ship.js`
- Nuovo override `destroy()`: pulisce thrusters, targeting, weapons, health → `super.destroy()`

### `js/editor/ShipData.js`
- Posizioni arma includono `bulletsPool`, `bulletSpeed`, `bulletLifespan`, `bulletColor`, `bulletSize`

### `js/scenes/gamescene.js`
- Rimossi: `import Bullet`, creazione `this.bullets` group, `assignBullets()`
- Dopo `new Ship(def)`: `this.bulletGroups = this.ship.weapons.getBulletGroups()`
- `createAsteroids()`: collider usa `this.bulletGroups` (array, Phaser accetta array di group)
- `rebuildShip()`: non distrugge più `this.bullets`. Verifica vecchi collider con null-check prima di rimuoverli. Azzera `this.bulletGroups` prima di ricreare.

## Piano — Grafica 100% Procedurale (DA IMPLEMENTARE)

### Obiettivo
Eliminare tutti gli asset esterni (spritesheet, immagini, atlas) e generare ogni texture via codice usando Graphics + Canvas API.

### Nuovi file

#### `js/procedural/RNG.js`
Seme RNG deterministico per texture basate su seed.

#### `js/procedural/PerlinNoise.js`
Value noise 2D + interpolazione cosine. Usato per versione A della nebula.

#### `js/procedural/ProceduralAssets.js`
Generatore principale. Metodo statico `generate(scene)` chiamato dal bootscene.

### Texture da generare

| Texture | Dim | Tecnica |
|---------|-----|---------|
| `bullet_gun1` | 1×5 (da JSON) | Graphics fillRect + dettaglio punta |
| `bullet_trackgun` | 2×4 (da JSON) | Graphics fillRect, più largo |
| `particle_flame` | 16×8 | Graphics pixel-art fiamma a goccia |
| `particle_smoke` | 12×12 | Graphics cerchio sfumato |
| `particle_blast` | 32×32 | Graphics cerchio + 8 raggi |
| `asteroid_1..4` | 96×96 | Graphics poligono irregolare (12 vertici, RNG con seed) |
| `stars_tile` | 256×256 | Canvas 2D puntini bianchi, tileable |
| `stars_bright` | 256×256 | Canvas 2D stelle luminose rare, tileable |
| `nebula_a` | 512×512 | Canvas 2D + Perlin noise 4 ottave, color mapping |
| `nebula_b` | 512×512 | Graphics blob semitrasparenti ADD |
| `planet_*` (×5) | 64×64 | Graphics cerchio + bande/cratere/swirl |
| `galaxy` | 128×128 | Graphics spirale ellittica + puntini |
| `eye` | 32×16 | Graphics ellisse + pupilla |
| `ship_fallback` | 48×48 | Graphics triangolo (quando nessuna custom ship) |

### File da modificare

- `bootscene.js` — rimuovere tutti i `this.load.image/spritesheet/atlas`, tenere solo audio. Chiamare `ProceduralAssets.generate(this)` dopo `registry.load()`
- `sprites/bullet.js` — texture fallback, WeaponComponent imposta texture specifica via `bullet.setTexture()`
- `sprites/asteroid.js` — REWRITE: rimuovere `this.play()`, ruotare in `update()`, texture statica
- `scenes/gamescene.js` — 4 layer parallasse (nebula A, nebula B, stars back, stars front), pianeti/eye con scrollFactor, rimuovere `anims.create` asteroidi
- `sprites/fx.js` — sostituire `'smoke'/'flame'/'blastwave'` con `'particle_smoke'/'particle_flame'/'particle_blast'`
- `ship/ShipThrusters.js` — `'smoke'` → `'particle_flame'`, aggiungere `tint: t.color`
- `ship/WeaponComponent.js` — dopo `group.get()`: `bullet.setTexture(\`bullet_$\{weaponId\}\`)`
- `editor/ShipData.js` — passare `weaponId` nelle weapon positions

### Asset da eliminare
`space.png` + `space.json`, `asteroid1-4.png`, `nebula.jpg`, `stars.png`, `smoke.png`, `blastwave1.png`, `muzzleflash7.png`

### Parallasse layers
| Layer | Texture | scrollFactor | Vel paral |
|-------|---------|-------------|-----------|
| Nebula A | tileSprite `nebula_a` | 0 | 0.05× |
| Nebula B | tileSprite `nebula_b` | 0 | 0.08× |
| Stars back | tileSprite `stars_tile` | 0 | 0.2× |
| Stars front | tileSprite `stars_bright` | 0 | 0.5× |
| Pianeti (×7) | image `planet_*` | 0.6 | auto |
| Galaxy | image `galaxy` | 0.6 | auto + tween |
| Eyes (×8) | image `eye` | 0.8 | auto |

### Ship custom texture
TextureGenerator.js è già procedurale (Graphics + generateTexture). Non toccare.

## Implementazione 2026-05-28 — Server world manifest + client procedural assets

### Obiettivo
- Server genera mondo JSON con posizioni/seeds per asteroidi, pianeti, stelle, nebulose, galassie, occhi
- Client genera tutte le texture via Graphics (nessun asset esterno)
- Sessioni salvabili/caricabili su server
- Admin UI per parametri di generazione

### Nuovi file

#### `config/procedural.json`
Parametri di default per generazione mondo (35 valori): conteggio asteroidi (80), min/max radii, velocità, tinte; conteggio stelle (400) e layers parallasse (2); nebulose (3) con palette colore; pianeti (4); galassie (2); occhi (6); dimensioni mondo (4096×4096).

#### `modules/procedural.py`
`generate_world(seed=...)` → manifest JSON deterministico:
- 80 asteroidi con x, y, vx, vy, radius, hue, sat, light, seed (per texture RNG)
- 2 layers stelle con x, y, radius, brightness
- 3 nebulose con x, y, radius, palette, seed
- 4 pianeti con x, y, radius, palette, seed
- 2 galassie con x, y, radius, seed
- 6 occhi con x, y, radius, seed
- `save_session/load_session/list_sessions` → JSON file in `data/sessions/`

#### `static/js/procedural/RNG.js`
Mulberry32 PRNG deterministico — `next()`, `nextInt(min, max)`, `nextFloat(min, max)`, `pick(arr)`. Stesso seed → stessa sequenza.

#### `static/js/procedural/ProceduralAssets.js`
`generateBase(scene)` — texture sempre disponibili:
- `ship-fallback` (32×32 triangolo)
- `bullet` (8×8 cerchio bianco)
- `smoke`/`blastwave`/`flame`/`particle` (cerchi colorati)

`generateWorld(scene, manifest)` — texture da manifest:
- `stars_X` (canvas per layer con puntini in posizioni)
- `nebula_X` (canvas con radial gradients da palette)
- `planet_X` (canvas con bande ellittiche)
- `galaxy_X` (canvas con spirale di puntini)
- `eye_X` (Graphics: bianco → nero → pupilla)
- `asteroid_X` (Graphics: poligono irregolare 7-13 vertici con hue/sat/light)

### File modificati

#### `routes/api.py`
Aggiunti endpoint:
- `GET /api/world?seed=` — genera e ritorna manifest JSON
- `POST /api/sessions` — salva stato gioco, ritorna session ID
- `GET /api/sessions/<id>` — carica sessione
- `GET /api/sessions` — lista sessioni

#### `routes/admin.py`
- Aggiunto `GET/POST /admin/procedural` — form per editare tutti i parametri in `procedural.json`
- Aggiunto `GET /admin/sessions` — lista sessioni salvate

#### `templates/admin/procedural.html`
Nuovo: form retro-styled con campi per world, asteroidi, stelle, nebulose, pianeti, galassie, occhi.

#### `templates/admin/sessions.html`
Nuovo: tabella sessioni con ID e timestamp.

#### `templates/base.html`
Nav links: COMPONENTS → PROCEDURAL → SESSIONS

#### `static/js/scenes/bootscene.js`
- Rimossi: `load.image` (background, stars), `load.atlas` (space), `load.spritesheet` (asteroid1-4)
- Mantenuti: `load.audio` (suoni)
- `ProceduralAssets.generateBase(this)` chiamato subito in preload
- `_loadWorld()`: fetch `/api/world`, `ProceduralAssets.generateWorld(this, manifest)`, manifest salvato in registry
- Flusso: generateBase → audio load → fetch world → registry.load → start ShipConfigScene

#### `static/js/scenes/gamescene.js`
- `WORLD_WIDTH/HEIGHT` da manifest
- `createBackground()`: nebulose, pianeti, galassie (con tween rotazione), occhi, star layers
- `createAsteroids()`: usa manifest data, nessuna animazione
- Ship default texture: `'ship-fallback'`
- Rimosse animazioni asteroidi, `anims.create`, `space` atlas frames

#### `static/js/sprites/bullet.js`
- Texture `'space'/'blaster'` → `'bullet'`

#### `static/js/sprites/asteroid.js`
- Rimosso `this.play(config.key)` — texture statica

#### `static/js/sprites/fx.js`
- `createTrail()`: `'space'/'blue'` → `'particle'`

## Valutazione — Server-side generation

### Opzione A — World Manifest (ibrida, consigliata)

Server genera solo strutture descrittive (posizioni, seed, tipi) come JSON. Client genera texture via Graphics come già pianificato, ma ora con seed deterministici.

```
SERVER (al new game)                                      CLIENT
┌──────────────────────────────┐                          ┌──────────────────────────┐
│ RNG(seed) → posizioni        │── GET /api/world ───►   │ ProceduralAssets         │
│ asteroidi, pianeti,          │   { seed: 42,           │   .generate(scene,       │
│ stelle, galassia, ...        │     planets: [...],     │     manifest)            │
│ seeds per texture            │     asteroidSeeds: [...],│                          │
│ (asteroidi, pianeti)         │     ...                  │   → texture da seed      │
│                              │   }                     │   → oggetti in posizioni │
│ NO immagini                  │   ≈2KB JSON             │                          │
└──────────────────────────────┘                          └──────────────────────────┘
```

**Pro:** nessuna dipendenza server (no Pillow), payload minimo, stessa generazione texture già pianificata, partite deterministiche (stessi seed → stesso mondo), abilita multiplayer/replay, sviluppo veloce.

**Contro:** client fa comunque generazione texture (istantanea con Graphics).

### Opzione B — Server PIL (tutto server)

Server genera immagini vere via Pillow, servite come PNG via Flask. Client solo caricamento texture.

**Pro:** client non genera niente, logica centralizzata.

**Contro:** dipendenza Pillow pesante, ~300KB texture da scaricare per sessione (lento), non può tintare particelle thruster per-componente senza rigenerare texture, server load alto, codice Python + JS da mantenere in parallelo.

### Opzione C — Pixel JSON (thin client puro)

Server calcola pixel-per-pixel, invia come array. Client solo `putImageData`.

**Pro:** client massimamente sottile, sganciato da Phaser.

**Contro:** payload enorme (~320KB pixel grezzi per sessione), parsing JSON lento, putImageData non veloce su device deboli, compressione base64 tanto vale usare PNG. È reimplementare un formato immagine via JSON.

### Raccomandazione: Opzione A

Server aggiunge endpoint `POST /sessions` o `GET /api/world`. Client chiama fetch, riceve manifest, ProceduralAssets.generate(scene, manifest) usa seed del manifest. Il piano grafica procedurale rimane identico, si aggiungono solo:
- `routes/api.py` — endpoint `/api/world`
- `ProceduralAssets.generate(scene, manifest)` — parametri seed invece di Math.random()

## Note su Phaser 4

- `Phaser.Input.Keyboard.JustDown(key)` → se non funziona, usare `key.justDown`
- `debugGraphic.clear()` → se rimosso, avvolgere in try/catch
- API core (Scene, Physics, Input, Tweens, Camera) sono "likely unchanged" per il migration guide
