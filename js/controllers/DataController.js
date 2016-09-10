angular.module('app').controller('DataController', DataController);
//@ngInject
function DataController($scope, XlsxService, $rootScope) {
  // body...
  // 
  var thisc = this;
  console.log('is enter');

  function getAgencys() {
    var data = _.groupBy(XlsxService.tempXlsData, function(data) {
      return data.agencyName;
    });
    XlsxService.keysWithDatas = data;
    var keys = _.keys(data);

    var lastData = _.dropWhile(keys, function(d) {
      return d == 'undefined' || d == '机构名称';
    });
    console.log('keys', lastData);
    $scope.agencys = lastData;
  }
  getAgencys();


  this.export = function(agencyName) {
    if (!agencyName) {
      sweetAlert("请选择机构!", "", "error");
      return;
    }

    console.log('OneAgencyDatas', XlsxService.keysWithDatas[agencyName]);
    saveData(XlsxService.keysWithDatas[agencyName], agencyName);
  }

  function saveData(agencyDatas, agencyName) {
    var policyNameKeys = {};
    var lastpolicyIndex = 0;
    var headerNames = ['全部数据'];
    var templateData = [
      ['查询年月', '用户号码', '机构编号', '机构名称', '政策名称', '酬金类型', '追溯原因', '金额', '首次结算时间', '政策名称简化']
    ]
    var datas = [
      []
    ];
    datas[0] = _.clone(templateData);
    _.forEach(agencyDatas, function(agencyData, key) {
      var policyIndex = 0;
      if (policyNameKeys[agencyData.policyShortName]) {
        policyIndex = policyNameKeys[agencyData.policyShortName];
      } else {
        lastpolicyIndex = lastpolicyIndex + 1;
        policyNameKeys[agencyData.policyShortName] = lastpolicyIndex;
        policyIndex = lastpolicyIndex;
        datas[policyIndex] = _.clone(templateData);
        headerNames.push(agencyData.policyShortName);
      }
      var dataTemplate = [agencyData.queryDate,
        agencyData.phone, agencyData.agencyCode,
        agencyData.agencyName, agencyData.policyName,
        agencyData.remunerationType,
        agencyData.reason, agencyData.amount,
        agencyData.firstDate, agencyData.policyShortName
      ]
      datas[policyIndex].push(dataTemplate)
      datas[0].push(dataTemplate)
    });

    console.log('headerNames', headerNames);
    XlsxService.writeXlsx(datas, agencyName + '.xlsx', headerNames);
  }
}
