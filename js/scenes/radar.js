export default class Radar {
    constructor (scene){
        this.scene = scene
        this.scene.radarGraphics = this.scene.add.graphics({ lineStyle: { width: 2, color: 0x0000aa } });
        this.g = this.scene.radarGraphics;
        this.lines = []
        this.DEBUGLINES = false
        this.DOT_RADIUS = 2
        this.DOT_LINE_SIZE = 2
        this.DOT_LINE_COLOR = Phaser.Display.Color.GetColor32(200, 200, 210, 128);

        this.DBG_LINE_COLOR = Phaser.Display.Color.GetColor32(0, 0, 210, 128);
    }
  
    update() {
        this.lines = []
        this.g.clear();
        //this.scene.asteroidsArray.forEach( this.drawLine, this );
        this.drawRect()
        this.scene.asteroidsArray.forEach( this.drawIntersection, this );

    }

    drawIntersection(asteroid){
        this.g.lineStyle(this.DOT_LINE_SIZE, this.DOT_LINE_COLOR);

        try{
            let point = this.pointOnRect(asteroid.x, asteroid.y, this.rect.x, this.rect.y, this.rect.x+this.rect.width, this.rect.y+this.rect.height, true)
            let circle = new Phaser.Geom.Circle(point.x, point.y, this.DOT_RADIUS);
            this.g.strokeCircleShape(circle)
        } catch (error){
            //console.error(error)
        }
    }

    drawRect(){
        let margin = 10;
        let rectX = this.scene.cameras.main.scrollX;
        let rectY = this.scene.cameras.main.scrollY;
        let rectWidth = this.scene.cameras.main.width;
        let rectHeight = this.scene.cameras.main.height;
        this.rect = new Phaser.Geom.Rectangle(rectX + margin, rectY + margin, rectWidth- margin*2, rectHeight-margin*2);
        if (this.DEBUGLINES){
            this.g.lineStyle(2, 0x00bb00);
            this.g.strokeRectShape(this.rect);
        }
    }

    drawLine(asteroid){
        var line = new Phaser.Geom.Line(this.scene.ship.x, this.scene.ship.y, asteroid.x, asteroid.y);
        if (this.DEBUGLINES){
            this.g.lineStyle(2, this.DBG_LINE_COLOR);
            this.g.strokeLineShape(line)
        }
        this.lines.push(line);
    }

    pointOnRect(x, y, minX, minY, maxX, maxY, validate) {
        //assert minX <= maxX;
        //assert minY <= maxY;
        if (validate && (minX < x && x < maxX) && (minY < y && y < maxY)) 
            throw "Point " + [x,y] + " cannot be inside " + "the rectangle: " + [minX, minY] + " - " + [maxX, maxY] + ".";
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