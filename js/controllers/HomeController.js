angular.module('app').controller('HomeController', HomeController);
//@ngInject
function HomeController($scope, XlsxService) {
  // body...
  var data = [
    [
      [1, 2, 3],
      [4, 5, 6]
    ],
    [
      [7, 2, 3],
      [4, 5, 6]
    ]
  ];

  XlsxService.writeXlsx(data, 'heddllo.xls', ['hello1', 'khelosd']);
}
