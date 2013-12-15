var socket = io.connect();


socket.on("new player", function(data) {
    console.log("got new player message");
    $(".middle").empty();
    for (var i=0; i < data.per_team * 2; i++) {
        var jPlayer = $("<div class='player'></div>");
        $(".middle").append(jPlayer);
        if (i < data.team0 + data.team1) {
            jPlayer.css("background-image", "url('images/player.png')");
        } else {
            jPlayer.css("background-image", "url('images/player_off.png')");
        }
    }
    PLAYERS_PER_TEAM = data.per_team;
});

socket.on("start game", function(data){
    PLAYER_TEAM = data.team;
    PLAYER_NO = data.player;
    PLAYER_HERO = new Hero(PLAYER_SPAWN[PLAYER_TEAM], PLAYER_TEAM, PLAYER_NO);
    
    setTimeout(function() {
        $(".cover").hide();
        startGame();
    }, 2000);
    console.log("start game");
});


socket.on("new move", function(data){
    HEROES[data.team][data.player - data.team * PLAYERS_PER_TEAM].goTo({'x': data.x, 'y': data.y})
    console.log("new move");
});


socket.on("new attack", function(data){
    console.log("new attack");
    var hero = HEROES[data.team][data.player - data.team * PLAYERS_PER_TEAM];
    FIREBALLS.push(new Fireball({'x': hero.pos.x, 'y': hero.pos.y}, data.target, hero.dmg));
});
