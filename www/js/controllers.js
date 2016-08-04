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
				mapService.setShowCurrentGeolocationSymbol(true);
				
				$state.go('app.map');
			},
			function (error) {
				console.error(error);
				alert("Sorry, no geolocation services are available. Please allow permission to use location services.");
			});
	}
})

.controller('SearchController', function($scope, $state, mapService) {
	$scope.islands = mapService.getIslandList();
	$scope.chargeFees = mapService.getChargeFeeList();
	
	$scope.data = {};	
	$scope.data.selectedIsland = $scope.islands.all;
	$scope.data.selectedChargeFee = $scope.chargeFees.any;

	$scope.submit = function(data) {

		// CLEAR PREVIOUS DEFINITION
		mapService.clearDefinitionExpression();
		
		var selections = {};
		
		var island = data.selectedIsland.label;
		var chargeFee = data.selectedChargeFee.label;
		
		selections = {
			island: island,
			chargeFee: chargeFee
		}
		
		mapService.buildDefinitionExpression(selections);
				
		mapService.setCenterZoomIsland(island);
		mapService.setShowCurrentGeolocationSymbol(false);
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
			//console.log(features);
			
			$ionicLoading.hide();
		},
		function (error) {
			console.error(error);
			$ionicLoading.hide();
		});
		
	$scope.onListItemClick = function(attributes) {
		var data = {
			attributes: attributes
		};

		$state.go('app.detail', data);		
	
	}
})

.controller('DetailController', function($scope, $stateParams, $state, mapService) {
	$scope.attributes = $stateParams.attributes;
	
	$scope.geolocateOnMap = function(geolocation) {
		mapService.setCenter(geolocation);
		mapService.setZoom(16);
		mapService.clearDefinitionExpression();
		mapService.setShowCurrentGeolocationSymbol(true);
		
		$state.go('app.map');				
	}

})

.controller('MapController', function(esriLoader, $scope, $stateParams, $ionicSideMenuDelegate, $ionicPopover, locateService, mapService, esriRegistry) {
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
	
	$ionicPopover.fromTemplateUrl('templates/map_popover.html', {
		scope: $scope,
	}).then(function(popover) {
		$scope.popover = popover;
	});
	
	$scope.findNearestStation = function() {
		
		// GET CURRENT LOCATION
		
		esriRegistry.get('evcsMap').then(function(map){
            /*
			map.on('click', function(e) {
                $scope.$apply(function() {
                    $scope.map.point = e.mapPoint;
					console.log(e.mapPoint);
                });
            });
			*/
			
			
			esriLoader.require([
					"esri/IdentityManager",
					'esri/toolbars/draw',
					'esri/symbols/SimpleMarkerSymbol', 'esri/symbols/SimpleLineSymbol',
					'esri/graphic', 'esri/geometry/Point',
					'esri/Color',
					'esri/layers/GraphicsLayer', 'esri/renderers/SimpleRenderer',
					'esri/tasks/ClosestFacilityTask', 'esri/tasks/ClosestFacilityParameters',
					'esri/tasks/FeatureSet',
					"esri/tasks/RouteTask", "esri/tasks/RouteParameters",
					"esri/geometry/webMercatorUtils",
					"dojo/_base/array"
				], function(
					IdentityManager,
					Draw,
					SimpleMarkerSymbol, SimpleLineSymbol,
					Graphic, Point,
					Color,
					GraphicsLayer, SimpleRenderer,
					ClosestFacilityTask, ClosestFacilityParameters,
					FeatureSet,
					RouteTask, RouteParameters,
					webMercatorUtils,
					array
				) {


				

				
				
				var line = new SimpleLineSymbol();
				line.setStyle(SimpleLineSymbol.STYLE_DASH);
				line.setWidth(6);
				line.setColor(new Color([169, 0, 230, 1]));

				var marker = new SimpleMarkerSymbol();
				marker.setOffset(0, 0);
				marker.setColor(new Color([223, 115, 255, 0.52]));
				marker.setSize(25);
				marker.setOutline(line);
				
				// GET CURRENT LOCATION
				var currentPoint = new Point(webMercatorUtils.lngLatToXY(mapService.getCenter().lng, mapService.getCenter().lat),map.spatialReference);
				var currentGeolocation = new Graphic(currentPoint);

				

				
		var incidentGraphicsLayer = new GraphicsLayer();
		var incidentRenderer = new SimpleRenderer(marker);
        incidentGraphicsLayer.setRenderer(incidentRenderer);
		incidentGraphicsLayer.add(currentGeolocation);
		map.addLayer(incidentGraphicsLayer);
		
		var incidents = new FeatureSet();
        incidents.features = incidentGraphicsLayer.graphics;
				
				
				
				
				
				
				
				params = new ClosestFacilityParameters();
				params.incidents = incidents;

    			params.impedenceAttribute = "Miles";      
			    params.defaultCutoff = 10.0;      
			    params.returnIncidents = false;
			    params.returnRoutes = true;
			    params.returnDirections = true;

		
		

		routeGraphicLayer = new GraphicsLayer();
        
        var routePolylineSymbol = new SimpleLineSymbol(
          SimpleLineSymbol.STYLE_SOLID, 
          new Color([255,0,0]), 
          4.0
        );
        var routeRenderer = new SimpleRenderer(routePolylineSymbol);
        routeGraphicLayer.setRenderer(routeRenderer);

        map.addLayer(routeGraphicLayer);
				

				
		var facilityPointSymbol = new SimpleMarkerSymbol(
          SimpleMarkerSymbol.STYLE_SQUARE, 
          20,
          new SimpleLineSymbol(
            SimpleLineSymbol.STYLE_SOLID,
            new Color([26,26,1]), 2
          ),
          new Color([255,0,0,0.90])
        ); 

		
		var facilitiesGraphicsLayer = new GraphicsLayer();
		var facilityRenderer = new SimpleRenderer(facilityPointSymbol);
        facilitiesGraphicsLayer.setRenderer(facilityRenderer);
       
        map.addLayer(facilitiesGraphicsLayer);
		
		
        // TESTING
		facilitiesGraphicsLayer.add(new Graphic(new Point(-17580710,2432955,map.spatialReference)));
		facilitiesGraphicsLayer.add(new Graphic(new Point(-17578710,2432955,map.spatialReference)));
   
        var facilities = new FeatureSet();
        facilities.features = map.getLayer(map.graphicsLayerIds[0]).graphics;
        // TESTING
		
		
		
		
		//var facilities = new FeatureSet(map.getLayersVisibleAtScale()[1].graphics);
        params.facilities = facilities;
		
		console.log("Parameters");
		console.log(params);
				
		closestFacilityTask = new ClosestFacilityTask("https://route.arcgis.com/arcgis/rest/services/World/ClosestFacility/NAServer/ClosestFacility_World");

		closestFacilityTask.solve(params, function(solveResult){
			console.log("Solve");
			console.log(solveResult);
			
			array.forEach(solveResult.routes, function(route, index){
			//build an array of route info
			var attr = array.map(solveResult.directions[index].features, function(feature){
			  return feature.attributes.text;
			});
					
			routeGraphicLayer.add(route);
			});
			
		});
				
			
				
				
				
				
				
				
				
				
				
						
			}); // CLOSE ESRI REQUIRE
		}); // CLOSE ESRIREGISTRY
	}
	
	$scope.onMapLoad = function(map) {
	
            esriLoader.require([
                'esri/toolbars/draw',
                'esri/symbols/SimpleMarkerSymbol', 'esri/symbols/SimpleLineSymbol',
                'esri/graphic', 'esri/geometry/Point',
                'esri/Color',
				"esri/layers/GraphicsLayer", "esri/renderers/SimpleRenderer",
				"esri/tasks/ClosestFacilityTask", "esri/tasks/ClosestFacilityParameters"
            ], function(
                Draw,
                SimpleMarkerSymbol, SimpleLineSymbol,
                Graphic, Point,
                Color,
				GraphicsLayer, SimpleRenderer,
				ClosestFacilityTask, ClosestFacilityParameters
            ) {

				var line = new SimpleLineSymbol();
				line.setStyle(SimpleLineSymbol.STYLE_DASH);
				line.setWidth(6);
				line.setColor(new Color([169, 0, 230, 1]));

				var marker = new SimpleMarkerSymbol();
				marker.setOffset(0, 0);
				marker.setColor(new Color([223, 115, 255, 0.52]));
				marker.setSize(25);
				marker.setOutline(line);

				var currentPoint = new Point(mapService.getCenter().lng, mapService.getCenter().lat);
				var currentGeolocation = new Graphic(currentPoint, marker);

				if (mapService.getShowCurrentGeolocationSymbol())
					map.graphics.add(currentGeolocation);
				else
					map.graphics.remove(currentGeolocation);
				
            });
        };
});
