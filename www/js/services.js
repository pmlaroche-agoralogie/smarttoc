angular.module('starter.services', [])
.factory('Questions', function($http) {
	return {
		all: function(query) {
			return $http.get('http://restitution.altotoc.fr/services/questions/'+query.sid)
		}
	};
})

.factory('Charts', function($http) {
	return {
		all: function(query) {
			return $http.get('http://restitution.altotoc.fr/services/data/'+query.sid+'/'+query.in+'/'+query.out)
		}
	};
});
