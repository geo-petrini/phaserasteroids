TODO

Better ship-asteroid collision
- ship collision box to circle
- add a shield hit animation
- remove shield amount by asteroid size or velocity
- when shield depleted destroy ship (PARTIAL)
- split asteroid  
- added healthbar with damage and regenerations
- shake camera (DONE)

Better asteoid generation
- ISSUE currently 800 asteroids are created (this.WORLD_WIDTH*0.1), it takes some time to generate them
- create asteroids based on ship vicinity

Particles
- implement new system https://newdocs.phaser.io/docs/3.60.0/Phaser.GameObjects.Particles.ParticleEmitter

Radar
- implement a minimap/radar that shows the asteroids location (DONE)
- fix stuttering (possible cause: camera bounds, maybe use the text canvas)

Screen
- implement some kind of game boundaries (wall loop?)
- resize game screen to fill page (RE-DONE)
- dynamically resize game screen (RE-DONE)

Gameplay
- make asteroids more dangerous (faster by size)
- asteroid size affects damage to ship
- improve ship handling (DONE)
- add phaser energy bank (DONE)
- implement powerups (buy at station or drops)
    - handling
    - speed
    - slowmotion
    - fire rate
    - more blasters
    - superweapon (seismic bomb/clear radius)

Ship
- add alternative controls from keyboard keys, eg touch control with https://yoannmoi.net/nipplejs/, https://rexrainbow.github.io/phaser3-rex-notes/docs/site/virtualjoystick/
- improve healthbars follow mode
- update healthbars with event (this.addListener())

Effects
- size explosion by asteroid size
- change blaster origin (currently it starts from ship center and is visible when firing) (FIXED BY SHIP DEPTH-LEVEL)
- change ship trail 
    - current origin from ship center and visible over ship (FIXED BY SHIP DEPTH-LEVEL)
    - trail keeps firing even when thrusters are not active (SOLVED)

Sounds
- add sounds for everything (ship, blaster, explosions)
- add music
- add music/sound control (mute/volume level)

UI
- options
- in-game gui (in progress)
- debugger console

SHIP EDITOR
- editor grid 9x9
- elements:
  - hull
    - cabin (1x2)
    - connector S 1x1
    - connector M 2x2
    - connector L 3x3
  - generator
    - level 1: 1x1, energy generation: 2pt / 1 second
    - level 2: 1x2, energy generation: 5pt / 1 second
    - level 3: 1x3, energy generation: 8pt / 1 second
  - thrusters
    - forward level 1: 1x1, accelleration: 20, particle color: red
    - forward level 2: 1x2, accelleration: 55, particle color: yellow
    - forward level 3: 1x3, accelleration: 70, particle color: blue
    - lateral level 1: rotation: 20, particle color: red
    - lateral level 2: rotation: 55, particle color: yellow
  - shields
    - generator level 1: 1x1, recharge: 1pt / 2 second
    - generator level 2: 2x2, recharge: 2pt / 3 second
    - generator level 3: 2x3, recharge: 4pt / 2 second
    - capacitor level 1: 1x1, charge: 40 pt 
    - capacitor level 1: 2x1, charge: 90 pt 
    - capacitor level 1: 3x2, charge: 150 pt 
  - weapons
    - gun level 1: 1x1
    - gun (tracking) level 1: 2x1
    - gun (turret) level 1: 3x3, rotation: 30
  - drag and drop

CUSTOM SHIP
- ship is created via ship editor
- rules:
  - only 1 cabin
  - min 1 generator
  - min 1 thruster
- each thruster adds to total ship accelleration or lateral movement (depending on type)
- each shield adds to shield generation for shield_hb
- each generator adds to energy_hb


links
https://phaserplugins.com/
https://jsfehler.github.io/phaser-ui-tools/
https://github.com/Flaxis/slick-ui
https://github.com/samme/phaser-plugin-game-scale
https://github.com/samme/phaser-sprite-gui  (v2) -> https://github.com/SilverTree7622/Phaser3_GUI_Inspector (v3)
https://github.com/koreezgames/phaser3-particle-editor
https://github.com/ivopc/phaser3-illuminated
https://github.com/GaryStanton/phaser3-merged-input
https://github.com/samme/phaser-component-health
https://rexrainbow.github.io/phaser3-rex-notes/docs/site/ui-overview/

https://github.com/JHAvrick/phaser3-transitions
https://github.com/netgfx/Phaser-tooltip

https://codepen.io/samme/pen/dydxxYv    https://cdn.jsdelivr.net/npm/phaser-plugin-debug-draw@7.0.0/dist/phaser-plugin-debug-draw.umd.js

fps meter: https://github.com/mrdoob/stats.js/

https://stackoverflow.com/questions/61327843/phaser-3-with-nipplejs-and-cordova-not-working-in-ios

https://gamedevacademy.org/how-to-debug-phaser-games/
https://ship.shapewright.com/
https://sketchfab.com/feed