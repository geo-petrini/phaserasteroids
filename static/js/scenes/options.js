class Options{

    constructor(){
        this.initValues();
    }

    initValues(){
        this.display_debug = false;
        this.display_radar = false;
        this.player_hull_repair_amount = 0.001;
        this.player_weapons_recharge_amount = 0.05;
        this.player_enable_ship_asteroids_collision = true;
        this.player_enable_bullets_asteroids_collision = true;

        this.volume_bullets = 1.0;
        this.volume_explosions = 1.0;

        this.camera_zoom_levels = [1, 0.5, 0.2, 3, 2];
    }

}

export default Options;