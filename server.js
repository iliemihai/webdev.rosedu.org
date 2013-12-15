var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , fs = require('fs');
  
// var globals = require("./globals.js");



server.listen(process.env.PORT, process.env.IP);
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});


/*
        make connection to files
*/
app.get('/style.css', function (req, res) {
	fs.createReadStream(__dirname + '/style.css').pipe(res);
});
app.get('/jquery.js', function (req, res) {
	fs.createReadStream(__dirname + '/jquery.js').pipe(res);
});
app.get('/client.js', function (req, res) {
	fs.createReadStream(__dirname + '/client.js').pipe(res);
});
app.get('/dota.js', function (req, res) {
	fs.createReadStream(__dirname + '/dota.js').pipe(res);
});
app.get('/globals.js', function (req, res) {
	fs.createReadStream(__dirname + '/globals.js').pipe(res);
});
app.get('/classes.js', function (req, res) {
	fs.createReadStream(__dirname + '/classes.js').pipe(res);
});

// images
app.get('/images/map.png', function (req, res) {
	fs.createReadStream(__dirname + '/images/map.png').pipe(res);
});
app.get('/images/hero0.png', function (req, res) {
	fs.createReadStream(__dirname + '/images/hero0.png').pipe(res);
});
app.get('/images/hero1.png', function (req, res) {
	fs.createReadStream(__dirname + '/images/hero1.png').pipe(res);
});
app.get('/images/minion0.png', function (req, res) {
	fs.createReadStream(__dirname + '/images/minion0.png').pipe(res);
});
app.get('/images/minion1.png', function (req, res) {
	fs.createReadStream(__dirname + '/images/minion1.png').pipe(res);
});
app.get('/images/player.png', function (req, res) {
	fs.createReadStream(__dirname + '/images/player.png').pipe(res);
});
app.get('/images/player_off.png', function (req, res) {
	fs.createReadStream(__dirname + '/images/player_off.png').pipe(res);
});
app.get('/images/tower0.png', function (req, res) {
	fs.createReadStream(__dirname + '/images/tower0.png').pipe(res);
});
app.get('/images/tower1.png', function (req, res) {
	fs.createReadStream(__dirname + '/images/tower1.png').pipe(res);
});
app.get('/images/fireball0.png', function (req, res) {
	fs.createReadStream(__dirname + '/images/fireball0.png').pipe(res);
});
app.get('/images/base.png', function (req, res) {
	fs.createReadStream(__dirname + '/images/base.png').pipe(res);
});


var G = {
    players_per_team: 1
}
var gameInstances = [{
    team0: [],
    team1: []
}];
var instance = 0;

io.sockets.on('connection', function (socket) 
{
    if (gameInstances[instance].team0.length < G.players_per_team) { // player accepted in team 0
        gameInstances[instance].team0.push(socket);
        io.sockets.emit("new player", {
            'team0': gameInstances[instance].team0.length, 
            'team1': gameInstances[instance].team1.length, 
            'per_team': G.players_per_team
        });
    } 
    else if (gameInstances[instance].team1.length < G.players_per_team) { // player accepted in team 1
        gameInstances[instance].team1.push(socket);
        io.sockets.emit("new player", {
            'team0': gameInstances[instance].team0.length, 
            'team1': gameInstances[instance].team1.length, 
            'per_team': G.players_per_team
        });
        
        //check if ready to play
        if (gameInstances[instance].team1.length == G.players_per_team) {
            for (var i=0; i<G.players_per_team; i++) {
                gameInstances[instance].team0[i].emit('start game', {team: 0, player: i});
                gameInstances[instance].team1[i].emit('start game', {team: 1, player: G.players_per_team + i});
            }
            instance++;
            gameInstances.push({
                team0: [],
                team1: []
            });
        }
    }


    socket.on("disconnect", function(){
        
    });

	socket.on('new move', function (data) {
	    var foundInstance = -1;
	    for (var i=0; i<instance; i++) {
	        if (gameInstances[i].team0.indexOf(this) > -1 || gameInstances[i].team1.indexOf(this) > -1) {
	            foundInstance = i;
	            break;
	        }
	    }
	    if (foundInstance > -1) {
	        for (var i=0; i<G.players_per_team; i++) {
	            if (gameInstances[foundInstance].team0[i] != this)
                    gameInstances[foundInstance].team0[i].emit('new move', data);
                if (gameInstances[foundInstance].team1[i] != this)
                    gameInstances[foundInstance].team1[i].emit('new move', data);
            }
	    }
	});
	
	
	socket.on('new attack', function (data) {
	    var foundInstance = -1;
	    for (var i=0; i<instance; i++) {
	        if (gameInstances[i].team0.indexOf(this) > -1 || gameInstances[i].team1.indexOf(this) > -1) {
	            foundInstance = i;
	            break;
	        }
	    }
	    if (foundInstance > -1) {
	        for (var i=0; i<G.players_per_team; i++) {
	            if (gameInstances[foundInstance].team0[i] != this)
                    gameInstances[foundInstance].team0[i].emit('new attack', data);
                if (gameInstances[foundInstance].team1[i] != this)
                    gameInstances[foundInstance].team1[i].emit('new attack', data);
            }
	    }
	});
});
