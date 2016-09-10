angular.module('app').controller('HomeController', HomeController);
//@ngInject
function HomeController($scope, XlsxService, $rootScope, $location) {
  // body...
  // 
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
    $location.path('/data');

  }




}
