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

## Note su Phaser 4

- `Phaser.Input.Keyboard.JustDown(key)` → se non funziona, usare `key.justDown`
- `debugGraphic.clear()` → se rimosso, avvolgere in try/catch
- API core (Scene, Physics, Input, Tweens, Camera) sono "likely unchanged" per il migration guide
