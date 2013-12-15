var Hero = function(pos, team, player) 
{
    this.spawn = {'x': pos.x, 'y': pos.y, 'hp': 200};
    this.pos = pos;
    this.team = team;
    this.hp = this.spawn.hp;
    this.velocity = null;
    this.dest = null;
    this.dmg = 20;
    this.attackRange = 70;
    this.move_speed = 2;
    this.lastAttackTimestamp = 0;
    
    // drawing variables
    this.player = player;
    this.drawRadius = 10;
    this.drawImages = [
        new Image(),
        new Image(),
        new Image(),
        new Image(),
        new Image(),
        new Image()
    ];
    this.drawImages[0].src = "images/hero0.png";
    this.drawImages[1].src = "images/hero1.png";
    this.drawImages[2].src = "images/hero1.png";
    this.drawImages[3].src = "images/hero1.png";
    this.drawImages[4].src = "images/hero1.png";
    this.drawImages[5].src = "images/hero1.png";
    this.colors = ["#ffff99", "#99ffff"];
    
    
    this.draw = function() {
        CTX.fillStyle = this.colors[this.team];
        CTX.beginPath();
            CTX.arc(this.pos.x, this.pos.y, this.drawRadius, 0, 2*Math.PI);
        CTX.closePath();
        CTX.fill();
        
        CTX.strokeStyle = this.colors[this.team];
        CTX.beginPath();
            CTX.arc(this.pos.x, this.pos.y, this.attackRange, 0, 2*Math.PI);
        CTX.closePath();
        CTX.stroke();
        
        CTX.drawImage(this.drawImages[this.player], this.pos.x - 20, this.pos.y - 20, 40, 40);
    }
    
    this.update = function() {
        this.move();
    }
    
    this.takeDmg = function(dmg) {
        this.hp -= dmg;
        if (this.hp <= 0) {
            this.pos = {'x': this.spawn.x, 'y': this.spawn.y};
            this.hp = this.spawn.hp;
        }
    }
    
    this.goTo = function(dest) {
        this.dest = dest;
        
        // calculate velocity
        var vector = {
            'x': (this.dest.x - this.pos.x)  ,
            'y': (this.dest.y - this.pos.y) 
        };
        
        // normalize vector
        var length = Math.sqrt( (this.dest.y - this.pos.y)*(this.dest.y - this.pos.y) + (this.dest.x - this.pos.x)*(this.dest.x - this.pos.x) );
        vector.x = vector.x / length;
        vector.y = vector.y / length;
       
        this.velocity = {
            'x': this.move_speed * vector.x ,
            'y': this.move_speed * vector.y
        };
       
    }
    
    
    this.move = function() {
        if (this.velocity) {
            this.pos.x += this.velocity.x;
            this.pos.y += this.velocity.y;
            
            if (Math.abs(this.pos.x - this.dest.x) < 1 && Math.abs(this.pos.y - this.dest.y) < 1) {
                
                this.velocity = null;
            }
        }
    }
    
    this.attack = function() {
        
    }
}



var Tower = function(pos, team) 
{
    this.pos = pos;
    this.team = team;
    this.hp = 200;
    this.dmg = 20;
    this.attackRange = 100;
    this.drawRadius = 20;
    this.colors = ["#ff0000", "#0000ff"];
    this.lastAttackTimestamp = 0;
     this.drawImages = [
        new Image(),
        new Image()
    ];
    this.drawImages[0].src = "images/tower0.png";
    this.drawImages[1].src = "images/tower1.png";
    
    this.draw = function() {
        CTX.fillStyle = this.colors[this.team];
        CTX.beginPath();
            CTX.arc(this.pos.x, this.pos.y, this.drawRadius, 0, 2*Math.PI);
        CTX.closePath();
        CTX.fill();
        
        CTX.strokeStyle = this.colors[this.team];
        CTX.beginPath();
            CTX.arc(this.pos.x, this.pos.y, this.attackRange, 0, 2*Math.PI);
        CTX.closePath();
        CTX.stroke();
        
        CTX.drawImage(this.drawImages[this.team], this.pos.x - 35, this.pos.y - 35, 70, 70);
    }
    
    this.update = function() {
        this.attack();
    }
    
    this.takeDmg = function(dmg) {
        this.hp -= dmg;
        if (this.hp <= 0) {
            DEAD_TOWERS[this.team].push(this);
        }
    }
    
    this.attack = function() {
        var found = false;
       
        // find a minion
        if(!found){
        for (var i=0; i<MINIONS[(this.team+1)%2].length; i++) {
            var minion = MINIONS[(this.team+1)%2][i];
            var x = minion.pos.x - this.pos.x;
            var y = minion.pos.y - this.pos.y;
            var distance = x*x + y*y;
            var currentTimestamp = new Date().getTime() / 1000;
            if (distance <= this.attackRange * this.attackRange && currentTimestamp - this.lastAttackTimestamp > 1) {
                this.lastAttackTimestamp = currentTimestamp;
                FIREBALLS.push(new Fireball({'x': this.pos.x, 'y': this.pos.y}, minion, this.dmg));
                found = true;
                break;
                }
            }
        }
        // find a hero
        if (!found ) {
            for (var i=0; i<HEROES[(this.team+1)%2].length; i++) {
                var hero = HEROES[(this.team+1)%2][i];
                var x = hero.pos.x - this.pos.x;
                var y = hero.pos.y - this.pos.y;
                var distance = x*x + y*y;
                var currentTimestamp = new Date().getTime() / 1000;
                if (distance <= this.attackRange * this.attackRange && currentTimestamp - this.lastAttackTimestamp > 1 ) {
                    this.lastAttackTimestamp = currentTimestamp;
                    FIREBALLS.push(new Fireball({'x': this.pos.x, 'y': this.pos.y}, hero, this.dmg));
                    found = true;
                    break;
                }
            }
        }
    }
}


var Minion = function(pos, team) 
{
    this.pos = pos;
    this.team = team;
    this.hp = 80;
    this.dmg = 5;
    this.attackRange = 60;
    this.detectRange = 130;
    
    this.move_speed = 1;
    this.velocity = null;
    this.dest = null;
    this.lastAttackTimestamp = 0;
    
     // drawing variables
    this.drawRadius = 15;
    this.drawImages = [
        new Image(),
        new Image()
    ];
    this.drawImages[0].src = "images/minion0.png";
    this.drawImages[1].src = "images/minion1.png";
    this.colors = ["#ffff99", "#99ffff"];
    
    this.draw = function() {
        CTX.fillStyle = this.colors[this.team];
        CTX.beginPath();
            CTX.arc(this.pos.x, this.pos.y, this.drawRadius, 0, 2*Math.PI);
        CTX.closePath();
        CTX.fill();
        
        CTX.strokeStyle = this.colors[this.team];
        CTX.beginPath();
            CTX.arc(this.pos.x, this.pos.y, this.attackRange, 0, 2*Math.PI);
        CTX.closePath();
        CTX.stroke();
        
        CTX.strokeStyle = this.colors[this.team];
        CTX.beginPath();
            CTX.arc(this.pos.x, this.pos.y, this.detectRange, 0, 2*Math.PI);
        CTX.closePath();
        CTX.stroke();
        
        CTX.drawImage(this.drawImages[this.team], this.pos.x - 16, this.pos.y - 16, 32, 32);
    }
    
    this.update = function() {
        if (!this.attack()) {
            this.move();
        }
    }
    
    this.takeDmg = function(dmg) {
        this.hp -= dmg;
        if (this.hp <= 0) {
            DEAD_MINIONS[this.team].push(this);
        }
    }
    
    this.goTo = function(dest) {
        this.dest = dest;
        
        // calculate velocity
        var vector = {
            'x': (this.dest.x - this.pos.x)  ,
            'y': (this.dest.y - this.pos.y) 
        };
        
        // normalize vector
        var length = Math.sqrt( (this.dest.y - this.pos.y)*(this.dest.y - this.pos.y) + (this.dest.x - this.pos.x)*(this.dest.x - this.pos.x) );
        vector.x = vector.x / length;
        vector.y = vector.y / length;
       
        this.velocity = {
            'x': this.move_speed * vector.x ,
            'y': this.move_speed * vector.y
        };
    }
    
    
    this.move = function() {
        // find next enemy tower
        var closest_dist = Infinity;
        var closest_x, closest_y;
        
        for (var i=0; i<TOWERS[(this.team+1)%2].length; i++) {
            var tower = TOWERS[(this.team+1)%2][i];
            var x = tower.pos.x - this.pos.x;
            var y = tower.pos.y - this.pos.y;
            var distance = x*x + y*y;
            if (distance < closest_dist) {
                closest_dist = distance;
                closest_x = tower.pos.x;
                closest_y = tower.pos.y;
            }
        };
        
        for (var i=0; i<HEROES[(this.team+1)%2].length; i++) {
            var hero = HEROES[(this.team+1)%2][i];
            var x = hero.pos.x - this.pos.x;
            var y = hero.pos.y - this.pos.y;
            var distance = x*x + y*y;
            if (distance < this.detectRange * this.detectRange) {
                closest_x = hero.pos.x;
                closest_y = hero.pos.y;
                break;
            }
        };
        
        
        this.goTo({'x': closest_x, 'y': closest_y});
        
        this.pos.x += this.velocity.x;
        this.pos.y += this.velocity.y;
        
        if (Math.abs(this.pos.x - this.dest.x) < 1 && Math.abs(this.pos.y - this.dest.y) < 1) {
            this.velocity = null;
        }
    }
    
    this.attack = function() {
        var closest_dist = Infinity;
        var target;
        var found = false;

        for (var i=0; i<TOWERS[(this.team+1)%2].length; i++) {
            var tower = TOWERS[(this.team+1)%2][i];
            var x = tower.pos.x - this.pos.x;
            var y = tower.pos.y - this.pos.y;
            var distance = x*x + y*y;
            if (distance < closest_dist && distance <= this.attackRange * this.attackRange) {
                closest_dist = distance;
                target = tower;
                found = true;
            }
        }
         
        for (var i=0; i<MINIONS[(this.team+1)%2].length; i++) {
            var minion = MINIONS[(this.team+1)%2][i];
            var x = minion.pos.x - this.pos.x;
            var y = minion.pos.y - this.pos.y;
            var distance = x*x + y*y;
            if (distance < closest_dist && distance <= this.attackRange * this.attackRange) {
                closest_dist = distance;
                target = minion;
                found = true;
            }
        }  
        
        for (var i=0; i<HEROES[(this.team+1)%2].length; i++) {
            var hero = HEROES[(this.team+1)%2][i];
            var x = hero.pos.x - this.pos.x;
            var y = hero.pos.y - this.pos.y;
            var distance = x*x + y*y;
            if (distance < closest_dist && distance <= this.attackRange * this.attackRange) {
                closest_dist = distance;
                target = hero;
                found = true;
            }
        }
        
        var currentTimestamp = new Date().getTime() / 1000;
        if(found && currentTimestamp - this.lastAttackTimestamp > 1) {
            this.lastAttackTimestamp = currentTimestamp;
            FIREBALLS.push(new Fireball({'x': this.pos.x, 'y': this.pos.y}, target, this.dmg));
        }
        
        return found;
    }
    
}




var Fireball = function(start, target, dmg) {
    this.pos = start;
    this.target = target;
    this.dmg = dmg;
    this.move_speed = 3;
    this.velocity = null;
    this.dest = null;
    
    // for drawing
    this.drawRadius = 5;
    this.drawImages = [
        new Image()
    ];
    this.drawImages[0].src = "images/fireball0.png";
    
    this.draw = function() {
        CTX.fillStyle = "#ff00ff";
        CTX.beginPath();
            CTX.arc(this.pos.x, this.pos.y, this.drawRadius, 0, 2*Math.PI);
        CTX.closePath();
        CTX.fill();
        
        CTX.drawImage(this.drawImages[0], this.pos.x - 18, this.pos.y - 18, 36, 36);
    }
    
    this.update = function() {
        this.move();
    }
    
    this.move = function() {
        var dest = this.target.pos;
        // calculate velocity
        var vector = {
            'x': (dest.x - this.pos.x)  ,
            'y': (dest.y - this.pos.y) 
        };
        
        // normalize vector
        var length = Math.sqrt( (dest.y - this.pos.y)*(dest.y - this.pos.y) + (dest.x - this.pos.x)*(dest.x - this.pos.x) );
        vector.x = vector.x / length;
        vector.y = vector.y / length;
       
        this.velocity = {
            'x': this.move_speed * vector.x ,
            'y': this.move_speed * vector.y
        };
        
        // update position
        this.pos.x += this.velocity.x;
        this.pos.y += this.velocity.y;
        
        if (Math.abs(this.pos.x - dest.x) < 2 && Math.abs(this.pos.y - dest.y) < 2) {
            this.detonate();
        }
    }
    
    this.detonate = function() {
        this.target.takeDmg(this.dmg);
        DETONATED.push(this);
    }
}



var HeroBase = function(pos, team) {
    this.pos = pos;
    this.team = team;
    this.hp = 1000;
    this.lastSpawnTimestamp = 0;
    
    this.drawImages = [
        new Image(),
        new Image()
    ];
    this.drawImages[0].src = "images/base.png";
    this.drawImages[1].src = "images/base.png";
    this.drawRadius = 15;
    this.colors = ["#ffffdd", "#ddffff"];
    
    this.draw = function() {
        CTX.fillStyle = this.colors[this.team];
        CTX.beginPath();
            CTX.arc(this.pos.x, this.pos.y, this.drawRadius, 0, 2*Math.PI);
        CTX.closePath();
        CTX.fill();
        
        CTX.drawImage(this.drawImages[this.team], this.pos.x - 40, this.pos.y - 16, 80, 55);
    }
    
   
    this.update = function() {
        var currentTimestamp = new Date().getTime() / 1000;
        if (currentTimestamp - this.lastSpawnTimestamp  >= 10) {
            this.lastSpawnTimestamp = currentTimestamp;
            MINIONS[this.team].push( new Minion({'x': this.pos.x,  'y': this.pos.y}, this.team) );
            console.log("new minion");
        }
    }
}


