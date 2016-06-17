function cloneObject(obj) {
	if (obj === null || typeof obj !== 'object') {
		return obj;
	}
	var temp = obj.constructor();
	for (var key in obj) {
		temp[key] = cloneObject(obj[key]);
	}
	return temp;
}

// the library that does the actual work...
var flybaseauth = cloneObject(hello);

(function (flybaseauth) {
	if(typeof angular !== 'undefined') {
		angular.module('ngFlybaseauth', [])
		.provider('flybaseauth', function () {
			this.$get = function () {
				return flybaseauth;
			};
			this.init = function (services, options) {
				flybaseauth.init(services, options);
			};
		});
	}
})(flybaseauth);