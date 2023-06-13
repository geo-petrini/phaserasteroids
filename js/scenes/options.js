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
    }

}

export default Options;