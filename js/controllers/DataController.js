angular.module('app').controller('DataController', DataController);
//@ngInject
function DataController($scope, XlsxService, $rootScope, $route) {
  // body...
  // 
  var thisc = this;
  console.log('is enter');


  $scope.isBatch = $route.current.params.batch;


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

  this.batchExport = function(agencys) {
    _.forEach(agencys, function(agencyName) {
      thisc.export(agencyName);
    })

  }

  this.export = function(agencyName) {
    if (!agencyName) {
      sweetAlert("请选择机构!", "", "error");
      return;
    }

    console.log('OneAgencyDatas', XlsxService.keysWithDatas[agencyName]);
    if ($route.current.$$route.originalPath == '/countdata') {
      saveCountData(XlsxService.keysWithDatas[agencyName], agencyName);
    } else {
      saveData(XlsxService.keysWithDatas[agencyName], agencyName);
    }

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


  function saveCountData(agencyDatas, agencyName) {
    var KVFPdata = _.groupBy(agencyDatas, function(data) {
      return data.firstDate + ":" + data.policyShortName;
    });
    var headerNames = ['全部数据'];
    var templateData = [
      ['查询年月', '用户号码', '机构编号', '机构名称', '政策名称', '酬金类型', '追溯原因', '金额', '首次结算时间', '政策名称简化']
    ]
    var datas = [
      []
    ];
    var firstDates = {};
    var policyShortNames = {};

    datas[1] = _.clone(templateData);
    _.forEach(agencyDatas, function(agencyData, key) {
      if (!firstDates[agencyData.firstDate]) {
        firstDates[agencyData.firstDate] = 1;
      }
      if (!policyShortNames[agencyData.policyShortName]) {
        policyShortNames[agencyData.policyShortName] = 1;
      }
      var dataTemplate = [agencyData.queryDate,
        agencyData.phone, agencyData.agencyCode,
        agencyData.agencyName, agencyData.policyName,
        agencyData.remunerationType,
        agencyData.reason, agencyData.amount,
        agencyData.firstDate, agencyData.policyShortName
      ]
      datas[1].push(dataTemplate)
    });

    firstDates = _.orderBy(_.keys(firstDates));
    policyShortNames = _.orderBy(_.keys(policyShortNames));

    console.log('KVFPdata', KVFPdata);
    console.log('firstDates', firstDates);
    console.log('policyShortNames', policyShortNames);

    var countdata = [
      [''],
      ['']
    ];
    for (var i = 0; i < policyShortNames.length; i++) {
      countdata[0].push(policyShortNames[i]);
      countdata[0].push('');
      countdata[1].push('求和项:金额');
      countdata[1].push('计数项:数量');

    }
    countdata[1].push('求和项:金额');
    countdata[1].push('计数项:数量');
    for (var date = 0; date < firstDates.length; date++) {
      var rowData = [firstDates[date]];
      var sum = 0;
      var count = 0;
      for (var p = 0; p < policyShortNames.length; p++) {
        var minDatas = KVFPdata[firstDates[date] + ":" + policyShortNames[p]];
        var amount = 0;
        var quantity = 0;
        if (minDatas) {
          amount = _.sumBy(minDatas, function(o) {
            return parseFloat(o.amount);
          });
          quantity = minDatas.length;
          sum = sum + amount;
          count = count + quantity;
        }
        rowData.push(amount.toFixed(2));
        rowData.push(quantity);
      }
      rowData.push(sum.toFixed(2));
      rowData.push(count);

      countdata.push(rowData);
    }

    var colsum = 0;
    var colcount = 0;
    var lastRowData = ['总计'];
    for (var ci = 1; ci <= policyShortNames.length * 2 + 2; ci++) {
      var amount = 0;
      var quantity = 0;
      for (var rj = 2; rj < firstDates.length + 2; rj++) {
        amount = amount + parseFloat(countdata[rj][ci]);
        quantity = quantity + parseInt(countdata[rj][ci + 1])
      }
      lastRowData.push(amount.toFixed(2));
      lastRowData.push(quantity);
      ci++;
    }
    countdata.push(lastRowData);
    console.log('countdata', countdata);
    datas[0] = countdata;
    XlsxService.writeXlsx(datas, agencyName + '.xlsx', ['汇总表', '明细']);
  }


}
