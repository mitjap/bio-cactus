function MapCtrl($scope, $document, socket) {
    $scope.map = [[]];
    $scope.name = "N/A";
    $scope.pose = {x: -1, y: -1};
    
    socket.on('init', function(data) {
        $scope.name = data.name;
        $scope.pose = data.pose;
        $scope.map = data.fields;
        
        for (var y = 0; y < $scope.map.length; y++) {
            for (var x = 0; x < $scope.map[y].length; x++) {
                if (!$scope.map[y][x]) $scope.map[y][x] = "";
            }
        }
        
        console.log($scope.map);
    });
    socket.on('new_user', function(data) {
        $scope.map[data.pose.y][data.pose.x] = data.name;
    });
    socket.on('clear', function(pose) {
        $scope.map[pose.y][pose.x] = "";
    });
    
    socket.on('move', function(data) {
        $scope.map[data.to.y][data.to.x] = $scope.map[data.from.y][data.from.x];
        $scope.map[data.from.y][data.from.x] = "";
        
        if (data.from.x == $scope.pose.x && data.from.y == $scope.pose.y) {
            $scope.pose = data.to;   
        }
    });
    
    
    $scope.move = function (direction) {
        console.log(direction);
        socket.emit('move', direction);   
    }
    
    $document.bind('keydown', function(e) {
        var dir = { x: 0, y: 0 };
        
        switch (e.keyCode) {
            case 37: dir.x = -1; break;
            case 38: dir.y = -1; break;
            case 39: dir.x = +1; break;
            case 40: dir.y = +1; break;
            default: break;
        };
                
        if (dir.x || dir.y) {
            $scope.move(dir);       
        }
                
    });
}