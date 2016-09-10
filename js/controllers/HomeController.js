angular.module('app').controller('HomeController', HomeController);
//@ngInject
function HomeController($scope, XlsxService, $rootScope, $location, $route) {
  // body...
  // 
  console.log($route);
  var thisc = this;
  //XlsxService.writeXlsx(data, 'heddllo.xls', ['hello1', 'khelosd']);

  this.selectFile = function(file) {
    console.log(arguments);
    $scope.isLoading = true;
    if (!file) {
      return;
    }
    XlsxService.readXlsOrXlsx(file, ['queryDate', 'phone', 'agencyCode',
      'agencyName', 'policyName', 'remunerationType',
      'reason', 'amount', 'firstDate', 'policyShortName'
    ]);
    if ($route.current.$$route.originalPath == '/count') {
      $location.path('/countdata');
    } else {
      $location.path('/data');
    }


  }




}
