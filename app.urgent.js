angular.module('app', ['ngRoute', 'ui.select', 'ngSanitize', 'ngFileUpload']).config(config);

/**
 * @ngInject
 */
function config($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'views/home.html'
  }).when('/count', {
    templateUrl: 'views/home.html'
  }).when('/data', {
    templateUrl: 'views/data.html'
  }).when('/countdata', {
    templateUrl: 'views/data.html'
  });
}
