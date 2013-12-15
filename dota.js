$(document).ready(function(){
    WIDTH = $(window).width();
    HEIGHT = $(window).height();

    CANVAS = document.getElementById("canvas");
    CTX = CANVAS.getContext("2d");
    
    CANVAS.width = $(window).width();
    CANVAS.height = $(window).height();
    
    PLAYER_SPAWN = [{'x': 100, 'y': HEIGHT - 100}, {'x': WIDTH - 100, 'y': 100}]
});


function startGame() {
    init();
    renderScene();
}


function init() {
    
    HEROES[PLAYER_TEAM].push(PLAYER_HERO);
    for (var i=0; i<PLAYERS_PER_TEAM * 2; i++) {
        var team = Math.floor(i/PLAYERS_PER_TEAM);
        if (i != PLAYER_NO) {
            HEROES[team].push( new Hero(PLAYER_SPAWN[team], team, i) );
        }
    }
    
    TOWERS[0].push( new Tower({'x':300,         'y': HEIGHT - 130 },   0) );//turnur echipa 0
    TOWERS[1].push( new Tower({'x':WIDTH - 300, 'y': 130},             1) );//turn echipa 1
    TOWERS[0].push( new Tower({'x':500,         'y': HEIGHT - 180 },   0) );//turn echipa 0
    TOWERS[1].push( new Tower({'x':WIDTH - 500, 'y': 180},             1) );//turn echipa 1
 
    HEROBASES.push( new HeroBase({'x': 50,          'y': HEIGHT - 50 }, 0));
    HEROBASES.push( new HeroBase({'x': WIDTH - 50,  'y': 50 },          1));
    
    
    $(document).on("click", function(e){
        var foundTarget = false;
        var target;
        
        for (var i=0; i<TOWERS[(PLAYER_TEAM+1)%2].length; i++) {
            var tower = TOWERS[(PLAYER_TEAM+1)%2][i];
            var x = tower.pos.x - PLAYER_HERO.pos.x;
            var y = tower.pos.y - PLAYER_HERO.pos.y;
            var distance = x*x + y*y;
            
            var x2 = tower.pos.x - e.pageX;
            var y2 = tower.pos.y - e.pageY;
            var distance2 = x2*x2 + y2*y2;
            
            if (distance <= PLAYER_HERO.attackRange * PLAYER_HERO.attackRange 
                && distance2 <= tower.drawRadius * tower.drawRadius ) {
                target = tower;
                foundTarget = true;
                console.log("found target");
                break;
            }
        }
         
        if (!foundTarget) {
            for (var i=0; i<MINIONS[(PLAYER_TEAM+1)%2].length; i++) {
                var minion = MINIONS[(PLAYER_TEAM+1)%2][i];
                var x = minion.pos.x - PLAYER_HERO.pos.x;
                var y = minion.pos.y - PLAYER_HERO.pos.y;
                var distance = x*x + y*y;
                
                var x2 = tower.pos.x - e.pageX;
                var y2 = tower.pos.y - e.pageY;
                var distance2 = x2*x2 + y2*y2;
            
                if (distance <= PLAYER_HERO.attackRange * PLAYER_HERO.attackRange
                    && distance2 <= minion.drawRadius * minion.drawRadius) {
                    target = minion;
                    foundTarget = true;
                    console.log("found target");
                    break;
                }
            }  
        }
        
        if (!foundTarget) {
            for (var i=0; i<HEROES[(PLAYER_TEAM+1)%2].length; i++) {
                var hero = HEROES[(PLAYER_TEAM+1)%2][i];
                var x = hero.pos.x - PLAYER_HERO.pos.x;
                var y = hero.pos.y - PLAYER_HERO.pos.y;
                var distance = x*x + y*y;
                
                var x2 = tower.pos.x - e.pageX;
                var y2 = tower.pos.y - e.pageY;
                var distance2 = x2*x2 + y2*y2;
            
                if (distance <= PLAYER_HERO.attackRange * PLAYER_HERO.attackRange
                    && distance2 <= hero.drawRadius * hero.drawRadius ) {
                    target = hero;
                    foundTarget = true;
                    console.log("found target");
                    break;
                }
            }
        }
        
        var currentTimestamp = new Date().getTime() / 1000;
        if(foundTarget && currentTimestamp - PLAYER_HERO.lastAttackTimestamp > 1) {
            PLAYER_HERO.lastAttackTimestamp = currentTimestamp;
            FIREBALLS.push(new Fireball({'x': PLAYER_HERO.pos.x, 'y': PLAYER_HERO.pos.y}, target, PLAYER_HERO.dmg));
            socket.emit("new attack", {
                player: PLAYER_NO,
                team: PLAYER_TEAM,
                target: target
            });
        }
        
        if (!foundTarget) {
            PLAYER_HERO.goTo({'x': e.pageX, 'y': e.pageY});
            
            socket.emit("new move", {
                player: PLAYER_NO,
                team: PLAYER_TEAM,
                x: e.pageX,
                y: e.pageY
            });
        }
    });
    
    $(document).on("keypress", function(e){
        if (e.keyCode == 97) { // == a
            TOGGLE_ANIMATION = !TOGGLE_ANIMATION;
        }
    });
}

 

/*****************************************************/

window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame        || 
    window.webkitRequestAnimationFrame                || 
    window.mozRequestAnimationFrame                        || 
    window.oRequestAnimationFram                        || 
    window.msRequestAnimationFrame                        || 
    function( callback ){
        window.setTimeout(callback, 1000 / 60);
    };
})();



function renderScene() {
    if (TOGGLE_ANIMATION) {
        CTX.clearRect(0, 0, WIDTH, HEIGHT);
        
        $.each(TOWERS[0], function(index, tower) {
            tower.update();
            tower.draw();
        });
        $.each(TOWERS[1], function(index, tower) {
            tower.update();
            tower.draw();
        });
        // remove dead towers
        $.each(DEAD_TOWERS[0], function(index, dead) {
            var index = TOWERS[0].indexOf(dead);
            TOWERS[0].splice(index, 1);
        });   
        $.each(DEAD_TOWERS[1], function(index, dead) {
            var index = TOWERS[1].indexOf(dead);
            TOWERS[1].splice(index, 1);
        });   
        DEAD_TOWERS = [[],[]];
        
        
        $.each(HEROBASES, function(index, herobase) {
            herobase.update();
            herobase.draw();
        });
        
        
        $.each(MINIONS[0], function(index, minion) {
            minion.update();
            minion.draw();
        });
        $.each(MINIONS[1], function(index, minion) {
            minion.update();
            minion.draw();
        });
        // remove dead minions
        $.each(DEAD_MINIONS[0], function(index, dead) {
            var index = MINIONS[0].indexOf(dead);
            MINIONS[0].splice(index, 1);
        });   
        $.each(DEAD_MINIONS[1], function(index, dead) {
            var index = MINIONS[1].indexOf(dead);
            MINIONS[1].splice(index, 1);
        });   
        DEAD_MINIONS = [[],[]];
        
        
        $.each(HEROES[0], function(index, hero) {
            hero.update();
            hero.draw();
        });
        $.each(HEROES[1], function(index, hero) {
            hero.update();
            hero.draw();
        });
        
        
        $.each(FIREBALLS, function(index, fireball) {
            fireball.update();
            fireball.draw();
        });
        // remove detonated fireballs
        $.each(DETONATED, function(index, fireball) {
            var index = FIREBALLS.indexOf(fireball);
            FIREBALLS.splice(index, 1);
        });   
        DETONATED = [];
        
        
        // draw my hero destination
        if (PLAYER_HERO.velocity) {
            CTX.strokeStyle = "#55bb55";
            CTX.beginPath();
                CTX.arc(PLAYER_HERO.dest.x, PLAYER_HERO.dest.y, 15, 0, 2*Math.PI);
            CTX.closePath();
            CTX.stroke();
        }
    }
    requestAnimFrame(renderScene);
}
 