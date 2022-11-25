export default class Radar {
    constructor (scene){
        this.scene = scene
        this.scene.radarGraphics = this.scene.add.graphics();
        this.g = this.scene.radarGraphics;
        //this.g.setScrollFactor(0)
        //this.g = new Phaser.GameObjects.Graphics(scene);
        this.DEBUGLINES = false
        this.DOT_MAX_SIZE = 5 //maximum size
        this.DOT_LINE_SIZE = 1
        this.DOT_LINE_COLOR = Phaser.Display.Color.GetColor(200, 200, 200);
        this.DOT_FILL_COLOR = Phaser.Display.Color.GetColor(100, 100, 100);
        this.DBG_LINE_COLOR = Phaser.Display.Color.GetColor(0, 0, 210);
    }
  
    update() {
        this.g.clear();
        this.drawRect();

        if (this.DEBUGLINES){
            this.scene.asteroidsArray.forEach( this.drawLine, this );
        }
        
        this.scene.asteroidsArray.forEach( this.drawIntersection, this );
        this.g.setAlpha(0.5);
    }

    drawIntersection(asteroid){
        this.g.lineStyle(this.DOT_LINE_SIZE, this.DOT_LINE_COLOR);
        this.g.fillStyle(this.DOT_FILL_COLOR);

        try{
            const pointCoords = this.pointOnRect(
                asteroid.x, 
                asteroid.y, 
                this.rect.x, 
                this.rect.y, 
                this.rect.x + this.rect.width, 
                this.rect.y + this.rect.height, 
                true
                );

            const distance = this.getAsteroidDistance(asteroid);
            const vicinity = this.getAsteroidVicinity(distance);
            const point_size = Math.max(this.DOT_MAX_SIZE * vicinity, 1);
            this.g.fillPoint(pointCoords.x, pointCoords.y, point_size);
            //const point = new Phaser.Geom.Point(pointCoords.x, pointCoords.y, point_size);
            //this.g.fillPointShape(point, point_size);
        } catch (error){
            console.error(error)
        }
    }

    getAsteroidDistance(asteroid){
        const l1 = this.scene.ship.x - asteroid.x;
        const l2 = this.scene.ship.y - asteroid.y;
        return Math.sqrt(l1*l1+l2*l2)
    }

    getAsteroidVicinity(distance){
        const minDistance = Math.max(this.scene.cameras.main.width, this.scene.cameras.main.height)
        //const minDistance = Math.max(this.scene.game_width, this.scene.game_height)
        return minDistance/distance
    }

    drawRect(){
        const margin = this.DOT_MAX_SIZE;
        const rectX = this.scene.cameras.main.scrollX;
        const rectY = this.scene.cameras.main.scrollY;
        //const rectWidth = this.scene.game_width ;
        //const rectHeight = this.scene.game_height 
        const rectWidth = this.scene.cameras.main.width;
        const rectHeight = this.scene.cameras.main.height;
        this.rect = new Phaser.Geom.Rectangle(rectX + margin, rectY + margin, rectWidth-margin*2, rectHeight-margin*2);
        if (this.DEBUGLINES){
            this.g.lineStyle(2, 0x00bb00);
            this.g.strokeRectShape(this.rect);
        }
    }

    drawLine(asteroid){
        var line = new Phaser.Geom.Line(this.scene.ship.x, this.scene.ship.y, asteroid.x, asteroid.y);
        this.g.lineStyle(2, this.DBG_LINE_COLOR);
        this.g.strokeLineShape(line)
    }

    pointOnRect(x, y, minX, minY, maxX, maxY, validate) {
        //assert minX <= maxX;
        //assert minY <= maxY;
        if (validate && (minX < x && x < maxX) && (minY < y && y < maxY)) 
            //throw "Point " + [x,y] + " cannot be inside " + "the rectangle: " + [minX, minY] + " - " + [maxX, maxY] + ".";
            return false
        var midX = (minX + maxX) / 2;
        var midY = (minY + maxY) / 2;
        // if (midX - x == 0) -> m == ±Inf -> minYx/maxYx == x (because value / ±Inf = ±0)
        var m = (midY - y) / (midX - x);
    
        if (x <= midX) { // check "left" side
            var minXy = m * (minX - x) + y;
            if (minY <= minXy && minXy <= maxY)
                return {x: minX, y: minXy};
        }
    
        if (x >= midX) { // check "right" side
            var maxXy = m * (maxX - x) + y;
            if (minY <= maxXy && maxXy <= maxY)
                return {x: maxX, y: maxXy};
        }
    
        if (y <= midY) { // check "top" side
            var minYx = (minY - y) / m + x;
            if (minX <= minYx && minYx <= maxX)
                return {x: minYx, y: minY};
        }
    
        if (y >= midY) { // check "bottom" side
            var maxYx = (maxY - y) / m + x;
            if (minX <= maxYx && maxYx <= maxX)
                return {x: maxYx, y: maxY};
        }
    
        // edge case when finding midpoint intersection: m = 0/0 = NaN
        if (x === midX && y === midY) return {x: x, y: y};
    
        // Should never happen :) If it does, please tell me!
        throw "Cannot find intersection for " + [x,y]  + " inside rectangle " + [minX, minY] + " - " + [maxX, maxY] + ".";
    }    
  }