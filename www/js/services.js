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