// Angular module, defining routes for the app
angular.module('game_app', ['ngRoute', 'game_app_services']).
	config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/map', {
                templateUrl: 'partials/map',
                controller: MapCtrl
            })
            .otherwise({ redirectTo: '/map' });
	}]);