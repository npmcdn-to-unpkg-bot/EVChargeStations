angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
  
})

.controller('HomeController', function($scope, $state, locateService, mapService) {
	$scope.getLocation = function() {
		locateService.getLocation().then(
			function (result) {
				console.log(result);
				var geolocation = {
					lng: result.coords.longitude,
					lat: result.coords.latitude
				}
				
				mapService.setCenter(geolocation);
				mapService.setZoom(16);
				
				$state.go('app.map');
			},
			function (error) {
				console.error(error);
				alert("Sorry, no geolocation services are available. Please allow permission to use location services.");
			});
	}
})

.controller('SearchController', function($scope, $state, mapService) {
	$scope.islands = [
		{
			id: 1,
			label: 'All'
		},
		{
			id: 2,
			label: 'Hawaii'
		},
		{
			id: 3,
			label: 'Kauai'
		},
		{
			id: 4,
			label: 'Maui'
		},
		{
			id: 5,
			label: 'Oahu'
		}
	];
	
	$scope.selected = $scope.islands[0];

	$scope.search = function(selected) {
		
		var island = selected.label;
		
		var definition = "1=1";
		if (selected.id != 1) {
			// SET CENTER/ZOOM FOR EACH ISLAND
			definition = "Island='" + island + "'";
		}
		
		mapService.setCenterZoomIsland(island);
		
		mapService.setDefinitionExpression(definition);
		$state.go('app.map');
	}
})


.controller('BrowseController', function($scope, $rootScope, $state, $ionicLoading, remoteService, esriRegistry, esriLoader, mapService) {
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
		
	$scope.onListItemClick = function(geolocation) {
		
		mapService.setCenter(geolocation);
		mapService.setZoom(16);
		mapService.setDefinitionExpression("1=1");
		
		$state.go('app.map');		
		
	}
})

.controller('DetailController', function($ionicLoading) {
	$ionicLoading.show({
      template: 'Loading...'
    });
	

	$ionicLoading.hide();

})

.controller('MapController', function(esriLoader, $scope, $stateParams, $ionicSideMenuDelegate, mapService) {
	$scope.$on('$ionicView.enter', function(){
		$ionicSideMenuDelegate.canDragContent(false);
	});
	$scope.$on('$ionicView.leave', function(){
		$ionicSideMenuDelegate.canDragContent(true);
	});

	// INITIALIZE MAP OBJECT
	$scope.map = {};
	
	$scope.map.basemap = mapService.getBasemap();
	$scope.map.center = mapService.getCenter();
	$scope.map.zoom = mapService.getZoom();
	
	$scope.definitionExpression = mapService.getDefinitionExpression();
	
	
	$scope.onMapLoad = function(map) {
	


            // this example requires other Esri modules like graphics, symbols, and toolbars
            // so we load them up front using the esriLoader
            esriLoader.require([
                'esri/toolbars/draw',
                'esri/symbols/SimpleMarkerSymbol', 'esri/symbols/SimpleLineSymbol',
                'esri/symbols/PictureFillSymbol', 'esri/symbols/CartographicLineSymbol',
                'esri/graphic',
				'esri/geometry/Point',
                'esri/Color'
            ], function(
                Draw,
                SimpleMarkerSymbol, SimpleLineSymbol,
                PictureFillSymbol, CartographicLineSymbol,
                Graphic, Point,
                Color
            ) {

                var tb;

                // markerSymbol is used for point and multipoint, see //raphaeljs.com/icons/#talkq for more examples
var line = new SimpleLineSymbol();
line.setStyle(SimpleLineSymbol.STYLE_DASH);
line.setWidth(6);
line.setColor(new Color([169, 0, 230, 1]));

var marker = new SimpleMarkerSymbol();
marker.setOffset(0, 0);
marker.setColor(new Color([223, 115, 255, 0.52]));
marker.setSize(25);
marker.setOutline(line);

var currentGeolocation = new Graphic(new Point(mapService.getCenter().lng, mapService.getCenter().lat), marker);
// TESTING
map.graphics.add(currentGeolocation);

map.graphics.remove(currentGeolocation);
				
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
