// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
//'use strict';
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'esri.map'])

.run(function($ionicPlatform, $templateCache, $http) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
	
	 $http.get('templates/map.html', {cache:$templateCache});

  });
})

.config(function($stateProvider, $urlRouterProvider) {
	$stateProvider

	.state('app', {
		url: '/app',
		abstract: true,
		templateUrl: 'templates/menu.html',
		controller: 'AppCtrl'
	})

	.state('app.home', {
		url: '/home',
		views: {
			'menuContent': {
				templateUrl: 'templates/home.html',
				controller: 'HomeController'
			}
		}
	})
  
	.state('app.search', {
		url: '/search',
		views: {
			'menuContent': {
				templateUrl: 'templates/search.html',
				controller: 'SearchController'
			}
		}
	})
	
	.state('app.browse', {
		url: '/browse',
		views: {
			'menuContent': {
				templateUrl: 'templates/browse.html',
				controller: 'BrowseController'
			}
		}
	})

	.state('app.stations', {
		url: '/stations',
		views: {
			'menuContent': {
				templateUrl: 'templates/stations.html',
				controller: 'StationsController'
			}
		}
    })
	
	.state('app.detail', {
		url: '/detail',
		params: {
			attributes: null
		},
		views: {
			'menuContent': {
				templateUrl: 'templates/detail.html',
				controller: 'DetailController'
			}
		}
    })
	
    .state('app.map', {
      url: '/map',
	  cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/map.html',
          controller: 'MapController',
		  controllerAs: 'vm'
        }
      }
    });	

	$urlRouterProvider.otherwise('/app/home');
});
