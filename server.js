var express = require('express');
var path = require('path');
var socket = require('socket.io');
var routes = require('./routes');
var http = require('http');

var app = express();
var server = http.createServer(app);
var io = socket.listen(server);

// all environments
app.configure(function () {
	app.set('port', process.env.PORT || 3000);
	app.set('views', path.join(__dirname, 'views'));
	app.set('view engine', 'jade');
	
    app.use(express.cookieParser());
	app.use(express.urlencoded());
	app.use(express.json());

	app.use(express.static(path.join(__dirname, 'public')));

	app.use(express.session({ secret: 'Top secret string. Hush hush!' }));

	// development only
	if ('development' == app.get('env')) {
		app.use(express.logger());
		app.use(express.errorHandler());
	}
});

app.get('/', routes.index);

app.get('/partials/:name', function (req, res)
 { var name = req.params.name;
   res.render('partials/' + name);
});


function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var fields = [[null, null, null, null, null], 
              [null, null, null, null, null], 
              [null, null, null, null, null], 
              [null, null, null, null, null], 
              [null, null, null, null, null]];

var field_size = 5;

var get_username = function() {
    var i = 0;
    return function() {
        return 'Usr' + i++;    
    }
}();


var get_free_pose = function() {
    console.log(fields);
    console.log(fields[0]); 
    for (var i = 0; i < field_size * field_size; i++) {
        var y = Math.floor(i / field_size);
        var x = i % field_size;
        
        if (!(fields[y][x])) {
            return { y: y, x: x };   
        }
    }
    return null;
};

var init_pose = function(name) {
    var pose = get_free_pose();
    if (pose) {
        fields[pose.y][pose.x] = name;    
    }
    return pose;
}

var move = function(pose, direction) {
    var new_pose = { y: (pose.y + direction.y + field_size) % field_size,
                     x: (pose.x + direction.x + field_size) % field_size};
    
    if (!fields[new_pose.y][new_pose.x]) {
        fields[new_pose.y][new_pose.x] = fields[pose.y][pose.x];
        fields[pose.y][pose.x] = null;
        return new_pose;
    } else {
        return null;
    }
}

var clear = function(pose) {
    fields[pose.y][pose.x] = null;
};

io.sockets.on('connection', function (socket) {
    var name = get_username();
    var pose = init_pose(name);
    
    socket.set('name', name);
    socket.set('pose', pose);
    
    socket.emit('init', { name: name, pose: pose, fields: fields });
    socket.broadcast.emit('new_user', { name: name, pose: pose });
    
    socket.on('move', function (direction) {
        
        socket.get('pose', function(err, pose) {
            console.log(pose);
            console.log(direction);
            
            var new_pose = move(pose, direction);
            if (new_pose) {
                socket.set('pose', new_pose);
                io.sockets.emit('move', { from: pose, to: new_pose });
            }
        });
    });
    
    socket.on('disconnect', function () {
        socket.get('pose', function(err, pose) {
            clear(pose);
            socket.broadcast.emit('clear', pose);
        });
    });
});

server.listen(app.get('port'));
