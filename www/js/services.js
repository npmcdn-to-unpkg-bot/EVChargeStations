angular.module('starter.services', [])

.factory('remoteService', function($http) {
	var service = {};
	var featureServiceUrl = "http://services6.arcgis.com/GppfEaYzw3YLUhtB/arcgis/rest/services/Hawaii_Public_Electric_Vehicle_Charging_Stations/FeatureServer/0";
	
	service.getFeatures = function() {
		return $http({
				method: 'GET',
				url: featureServiceUrl + "/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=&units=esriSRUnit_Meter&outFields=*&returnGeometry=true&multipatchOption=&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&quantizationParameters=&sqlFormat=none&f=pjson"
		});
	}
	
	return service;
})

.factory('locateService', function($q) {
	var service = {};
	
	service.getLocation = function() {
		var deferred = $q.defer();
		navigator.geolocation.getCurrentPosition(
			function(position) {
				deferred.resolve(position);
			},
			function (error) {
				deferred.reject(error);
			});
		return deferred.promise;
	}
	
	return service;
})

.factory('mapService', function(esriRegistry, esriLoader) {
	var service = {};
	
	const ISLAND = {
		all: {
			geolocation: {
				lat: 20.7,
				lng: -157.8583
			},
			zoom: 7,
			label: "All"
		},
		hawaii: {
			geolocation: {
				lat: 19.65904501936837,
				lng: -155.56443991237202
			},
			zoom: 8,
			label: "Hawaii"
		},
		kauai: {
			geolocation: {
				lat: 22.04355712195575,
				lng: -159.48930563502853
			},
			zoom: 10,
			label: "Kauai"
		},
		maui: {
			geolocation: {
				lat: 20.807645111688178,
				lng: -156.32386984401285
			},
			zoom: 10,
			label: "Maui"
		},
		oahu: {
			geolocation: {
				lat: 21.489018269313952,
				lng: -157.9319936233096
			},
			zoom: 10,
			label: "Oahu"
		}
	};
	
	const CHARGE_FEE = {
		any: {
			label: 'Any'
		},
		free: {
			label: 'Free'
		},
		paid: {
			label: 'Paid'
		}
	};
	
	// DEFAULTS TO ENTIRE ISLAND CHAIN
	var geolocation = ISLAND.all.geolocation;
	
	var zoom = ISLAND.all.zoom;
	var basemap = "topo";
	var definitionExpression = "";
	var showCurrentGeolocationSymbol = false;
	
	service.setCenter = function(input) {
		geolocation = input;
	}
	
	service.getCenter = function() {
		return geolocation;
	}
	
	service.setZoom = function(input) {
		zoom = input;
	}
	
	service.getZoom = function() {
		return zoom;
	}
	
	service.setCenterZoomIsland = function(island) {
		if (island == "Kauai") {
			geolocation = ISLAND.kauai.geolocation;
			zoom = ISLAND.kauai.zoom;
		}
		else if (island == "Oahu") {
			geolocation = ISLAND.oahu.geolocation;
			zoom = ISLAND.oahu.zoom;
		}
		else if (island == "Maui") {
			geolocation = ISLAND.maui.geolocation;
			zoom = ISLAND.maui.zoom;
		}
		else if (island == "Hawaii") {
			geolocation = ISLAND.hawaii.geolocation;
			zoom = ISLAND.hawaii.zoom;
		}
		else {
			geolocation = ISLAND.all.geolocation;
			zoom = ISLAND.all.zoom;
		}
	}
	
	service.setBasemap = function(input) {
		basemap = input;
	}
	
	service.getBasemap = function() {
		return basemap;
	}
	
	service.setDefinitionExpression = function(input) {
		definitionExpression = input;
	}
	
	service.getDefinitionExpression = function() {
		return definitionExpression;
	}
	
	service.buildDefinitionExpression = function(input) {
		var islandDefinition = "1=1";
		var chargeFeeDefinition = "1=1";
		var definition = "";
		
		var island = input.island;
		var chargeFee = input.chargeFee;
		
		if (island != "All")
			islandDefinition = "Island='" + island + "'";
	
		if (chargeFee != "Any")
			chargeFeeDefinition = "Charge_Fees='" + chargeFee + "'";
		
			definition = islandDefinition + " AND " + chargeFeeDefinition;
		
		this.setDefinitionExpression(definition);
	}
	
	service.clearDefinitionExpression = function() {
		definitionExpression = "";
	}
	
	service.setShowCurrentGeolocationSymbol = function(input) {
		showCurrentGeolocationSymbol = input;
	}
	
	service.getShowCurrentGeolocationSymbol = function() {
		return showCurrentGeolocationSymbol;
	}
	
	service.getIslandList = function() {
		return ISLAND;
	}
	
	service.getChargeFeeList = function() {
		return CHARGE_FEE;
	}
	
	service.mapCenterAndZoom = function(input) {
		esriRegistry.get('evcsMap').then(function(map){
			esriLoader.require([
					'esri/symbols/SimpleMarkerSymbol', 'esri/symbols/SimpleLineSymbol', 'esri/Color',
					'esri/graphic', 'esri/geometry/Point'
				], function(
					SimpleMarkerSymbol, SimpleLineSymbol, Color,
					Graphic, Point
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

				var currentPoint = new Point(input.lng, input.lat);
				var currentGeolocation = new Graphic(currentPoint, marker);

				if (service.getShowCurrentGeolocationSymbol()) {
					map.graphics.clear();
					map.graphics.add(currentGeolocation);
				}
				else {
					map.graphics.remove(currentGeolocation);
				}
				
				map.centerAndZoom(currentPoint, 15);
			
				});
		});
	}
	
	return service;
})