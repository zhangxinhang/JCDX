angular.module('app').directive('loading', loading);

function loading() {
  return {
    restrict: 'AE',
    transclude: true,
    templateUrl: 'views/loading.html'
  };
}
