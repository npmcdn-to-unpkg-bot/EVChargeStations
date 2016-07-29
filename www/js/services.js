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

.factory('mapService', function() {
	var service = {};
	
	const ISLAND = {
		kauai: {
			geolocation: {
				lat: 22.04355712195575,
				lng: -159.48930563502853
			},
			zoom: 10
		},
		oahu: {
			geolocation: {
				lat: 21.489018269313952,
				lng: -157.9319936233096
			},
			zoom: 10
		},
		maui: {
			geolocation: {
				lat: 20.807645111688178,
				lng: -156.32386984401285
			},
			zoom: 10
		},
		hawaii: {
			geolocation: {
				lat: 19.65904501936837,
				lng: -155.56443991237202
			},
			zoom: 8
		},
		all: {
			geolocation: {
				lat: 20.7,
				lng: -157.8583
			},
			zoom: 7
		}
	};
	
	// DEFAULTS TO ENTIRE ISLAND CHAIN
	var geolocation = ISLAND.all.geolocation;
	
	var zoom = ISLAND.all.zoom;
	var basemap = "topo";
	var definitionExpression = "1=1";
	
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
	
	return service;
})