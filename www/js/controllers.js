angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
  
})

.controller('SearchController', function($scope, $state, locateService) {
	$scope.getLocation = function() {
		
		
		// CHECK IF BROSWER GEOLOCATION IS AVAILABLE
		//if (navigator.geolocation) {
			locateService.getLocation().then(
				function (result) {
					console.log(result);
					var geometry = {
						lng: result.coords.longitude,
						lat: result.coords.latitude
					}
					$state.go('app.map', {pGeometry: geometry});
				},
				function (error) {
					console.error(error);
					alert("Sorry, no geolocation services are available. Please allow permission to use location services.");
				});
		//}
		//else {
		//	alert("Sorry, no geolocation services are available. Please allow permission to use location services.");
		//}
	}
})


.controller('BrowseController', function($scope, $state, $ionicLoading, remoteService) {
	$ionicLoading.show({
      template: 'Loading...'
    });
	
	remoteService.getFeatures().then(
		function (result) {
			var features = result.data.features;
			$scope.features = features;
			console.log(features);
			
			$ionicLoading.hide();
		},
		function (error) {
			console.error(error);
			$ionicLoading.hide();
		});
		
	$scope.onListItemClick = function(geometry) {
		$state.go('app.map', {pGeometry: geometry});
	}
})

.controller('MapController', function(esriLoader, $scope, $stateParams, $ionicSideMenuDelegate) {
	$scope.$on('$ionicView.enter', function(){
		$ionicSideMenuDelegate.canDragContent(false);
		
		if ($stateParams.pGeometry)
			$scope.centerMap();
	});
	$scope.$on('$ionicView.leave', function(){
		$ionicSideMenuDelegate.canDragContent(true);
	});
	
	$scope.map = {
		center: {
			lng: -157.8583,
            lat: 21.5
        },
        zoom: 10,
		basemap: "hybrid"
    };
	
	$scope.centerMap = function() {
		console.log($stateParams);
		var geometry = $stateParams.pGeometry;
		//-155.9913758, lat: 19.8271119
		$scope.map.center.lng = geometry.lng;
		$scope.map.center.lat = geometry.lat;
		$scope.map.zoom = 16;
	}
	
	
$scope.onMapLoad = function(map) {

            // this example requires other Esri modules like graphics, symbols, and toolbars
            // so we load them up front using the esriLoader
            esriLoader.require([
                'esri/toolbars/draw',
                'esri/symbols/SimpleMarkerSymbol', 'esri/symbols/SimpleLineSymbol',
                'esri/symbols/PictureFillSymbol', 'esri/symbols/CartographicLineSymbol',
                'esri/graphic',
                'esri/Color'
            ], function(
                Draw,
                SimpleMarkerSymbol, SimpleLineSymbol,
                PictureFillSymbol, CartographicLineSymbol,
                Graphic,
                Color
            ) {

                var tb;

                // markerSymbol is used for point and multipoint, see //raphaeljs.com/icons/#talkq for more examples
                var markerSymbol = new SimpleMarkerSymbol();
                markerSymbol.setPath('M16,4.938c-7.732,0-14,4.701-14,10.5c0,1.981,0.741,3.833,2.016,5.414L2,25.272l5.613-1.44c2.339,1.316,5.237,2.106,8.387,2.106c7.732,0,14-4.701,14-10.5S23.732,4.938,16,4.938zM16.868,21.375h-1.969v-1.889h1.969V21.375zM16.772,18.094h-1.777l-0.176-8.083h2.113L16.772,18.094z');
                markerSymbol.setColor(new Color('#00FFFF'));

                // lineSymbol used for freehand polyline, polyline and line.
                var lineSymbol = new CartographicLineSymbol(
                    CartographicLineSymbol.STYLE_SOLID,
                    new Color([255, 0, 0]), 10,
                    CartographicLineSymbol.CAP_ROUND,
                    CartographicLineSymbol.JOIN_MITER, 5
                );

                // fill symbol used for extent, polygon and freehand polygon, use a picture fill symbol
                // the images folder contains additional fill images, other options: sand.png, swamp.png or stiple.png
                var fillSymbol = new PictureFillSymbol(
                    // 'images/mangrove.png',
                    '//developers.arcgis.com/javascript/samples/graphics_add/images/mangrove.png',
                    new SimpleLineSymbol(
                        SimpleLineSymbol.STYLE_SOLID,
                        new Color('#000'),
                        1
                    ),
                    42,
                    42
                );

                // get a local reference to the map object once it's loaded
                // and initialize the drawing toolbar
                function initToolbar(mapObj) {
                    map = mapObj;
                    tb = new Draw(map);
                    tb.on('draw-end', function(e) {
                        $scope.$apply(function() {
                            addGraphic(e);
                        });
                    });

                    // set the active tool once a button is clicked
                    $scope.activateDrawTool = activateDrawTool;
                }

                function activateDrawTool(tool) {
                    map.disableMapNavigation();
                    tb.activate(tool.toLowerCase());
                }

                function addGraphic(evt) {
                    //deactivate the toolbar and clear existing graphics
                    tb.deactivate();
                    map.enableMapNavigation();

                    // figure out which symbol to use
                    var symbol;
                    if (evt.geometry.type === 'point' || evt.geometry.type === 'multipoint') {
                        symbol = markerSymbol;
                    } else if (evt.geometry.type === 'line' || evt.geometry.type === 'polyline') {
                        symbol = lineSymbol;
                    } else {
                        symbol = fillSymbol;
                    }

                    map.graphics.add(new Graphic(evt.geometry, symbol));
                }

                // bind the toolbar to the map
                initToolbar(map);
            });

        };

	
	
});
