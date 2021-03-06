angular.module('app').factory('XlsxService', XlsxService);
//@ngInject
function XlsxService($rootScope) {
  var retObj = {};

  retObj.tempXlsData = null;

  retObj.writeXlsx = function(data, filename, defineSheetNames) {
    function datenum(v, date1904) {
      if (date1904) v += 1462;
      var epoch = Date.parse(v);
      return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
    }

    function to_json(workbook) {
      var result = [];
      workbook.SheetNames.forEach(function(sheetName) {
        var roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
        if (roa.length > 0) {
          result.push(roa);
        }
      });
      return result;
    }

    function sheet_from_array_of_arrays(data, opts) {
      var ws = {};
      var range = {
        s: {
          c: 10000000,
          r: 10000000
        },
        e: {
          c: 0,
          r: 0
        }
      };
      for (var R = 0; R != data.length; ++R) {
        for (var C = 0; C != data[R].length; ++C) {
          if (range.s.r > R) range.s.r = R;
          if (range.s.c > C) range.s.c = C;
          if (range.e.r < R) range.e.r = R;
          if (range.e.c < C) range.e.c = C;
          var cell = {
            v: data[R][C]
          };
          if (cell.v == null) continue;
          var cell_ref = XLSX.utils.encode_cell({
            c: C,
            r: R
          });

          if (typeof cell.v === 'number') cell.t = 'n';
          else if (typeof cell.v === 'boolean') cell.t = 'b';
          else if (cell.v instanceof Date) {
            cell.t = 'n';
            cell.z = XLSX.SSF._table[14];
            cell.v = datenum(cell.v);
          } else cell.t = 's';

          ws[cell_ref] = cell;
        }
      }
      if (range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
      return ws;
    }

    /* original data */
    function Workbook() {
      if (!(this instanceof Workbook)) return new Workbook();
      this.SheetNames = [];
      this.Sheets = {};
    }
    var wb = new Workbook();


    for (var i = 0; i < data.length; i++) {
      var sheetName = defineSheetNames[i];
      wb.SheetNames.push(sheetName);
      wb.Sheets[sheetName] = sheet_from_array_of_arrays(data[i]);
    }



    /* add worksheet to workbook */
    var wbout = XLSX.write(wb, {
      bookType: 'xlsx',
      bookSST: true,
      type: 'binary'
    });

    function s2ab(s) {
      var buf = new ArrayBuffer(s.length);
      var view = new Uint8Array(buf);
      for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
      return buf;
    };
    saveAs(new Blob([s2ab(wbout)], {
      type: "application/octet-stream"
    }), filename);
  }

  retObj.readXlsOrXlsx = function(file, fields) {
    function fixdata(data) {
      var o = "",
        l = 0,
        w = 10240;
      for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)));
      o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
      return o;
    }

    function to_json_xls(workbook) {
      var result = [];
      var i = 0;
      workbook.SheetNames.forEach(function(sheetName) {
        //console.log(sheetName);
        var roa = XLS.utils.sheet_to_row_object_array(workbook.Sheets[sheetName], {
          header: fields
        });
        if (roa.length > 0) {
          result.push(roa);
        }
      });
      return result;
    }

    function process_wb_xls(wb) {
      retObj.tempXlsData = to_json_xls(wb)[0];
      $rootScope.isXlsxLoading = false;
      $rootScope.$apply('isXlsxLoading');
      console.log(retObj.tempXlsData);
    }

    function to_json_xlsx(workbook) {
      var result = [];
      var i = 0;
      workbook.SheetNames.forEach(function(sheetName) {
        //console.log(sheetName);
        var roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName], {
          header: fields
        });
        if (roa.length > 0) {
          result.push(roa);
        }
      });
      return result;
    }

    function process_wb_xlsx(wb) {
      retObj.tempXlsData = to_json_xlsx(wb)[0];
      $rootScope.isXlsxLoading = false;
      $rootScope.$apply('isXlsxLoading');
      console.log(retObj.tempXlsData);
    }

    function handleFile(file) {
      var f = file;
      var reader = new FileReader();
      var filenameSplit = f.name.split('.');
      if (filenameSplit[filenameSplit.length - 1].toLowerCase() === 'xls') {
        reader.onload = function(e) {
          var data = e.target.result;
          var arr = fixdata(data);
          var wb = XLS.read(btoa(arr), {
            type: 'base64'
          });
          process_wb_xls(wb);
        };
        reader.readAsArrayBuffer(f);
      } else if (filenameSplit[filenameSplit.length - 1].toLowerCase() === 'xlsx') {
        reader.onload = function(e) {
          var data = e.target.result;
          var arr = fixdata(data);
          var wb = XLSX.read(btoa(arr), {
            type: 'base64'
          });
          process_wb_xlsx(wb);
        };
        reader.readAsArrayBuffer(f);
      }
    }
    handleFile(file);
  }
  return retObj;
}
