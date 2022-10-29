TODO

Better ship-asteroid collision
- ship collision box to circle
- add a shield hit animation
- remove shield amount by asteroid size or velocity
- when shield depleted destroy ship
- split asteroid  
- shake camera (DONE)

Better asteoid generation
- ISSUE currently 800 asteroids are created (this.WORLD_WIDTH*0.1), it takes some time to generate them
- create asteroids based on ship vicinity

Radar
- implement a minimap/radar that shows the asteroids location

Screen
- implement some kind of game boundaries (wall loop?)
- resize game screen to fill page (DONE)
- dynamically resize game screen

Gameplay
- make asteroids more dangerous (faster by size)
- asteroid size affects damage to ship
- improve ship handling
- implement powerups (buy at station or drops)
    - handling
    - speed
    - slowmotion
    - fire rate
    - more blasters
    - superweapon (seismic bomb/clear radius)

Effects
- size explosion by asteroid size
- change blaster origin (currently it starts from ship center and is visible when firing)
- change ship trail 
    - current origin from ship center and visible over ship
    - trail keeps firing even when thrusters are not active

Sounds
- add sounds for everything (ship, blaster, explosions)
- add music
- add music/sound control (mute/volume level)

UI
- options
- in-game gui (eg: radar)
- debugger console

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

https://github.com/JHAvrick/phaser3-transitions
https://github.com/netgfx/Phaser-tooltip

https://codepen.io/samme/pen/dydxxYv    https://cdn.jsdelivr.net/npm/phaser-plugin-debug-draw@7.0.0/dist/phaser-plugin-debug-draw.umd.js