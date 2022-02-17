# phaserasteroids
Phaser3 Asteroids implementation

![ship](https://github.com/geo-petrini/phaserasteroids/blob/main/assets/ship.png?raw=true)

TODO

Better ship-asteroid collision
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