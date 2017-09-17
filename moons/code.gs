function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('moons')
      .addItem('add moons', 'addMoons')
      .addToUi();
}

function romanToNumber(str1) {
    if(str1 == null) return -1;
    var num = char_to_int(str1.charAt(0));
    var pre, curr;

    for(var i = 1; i < str1.length; i++) {
        curr = char_to_int(str1.charAt(i));
        pre = char_to_int(str1.charAt(i-1));
        if(curr <= pre) {
            num += curr;
        } else {
            num = num - pre*2 + curr;
        }
    }

    return num;
}

function char_to_int(c){
    switch (c){
    case 'I': return 1;
    case 'V': return 5;
    case 'X': return 10;
    case 'L': return 50;
    case 'C': return 100;
    case 'D': return 500;
    case 'M': return 1000;
    default: return -1;
    }
}

function reformatName(name){
    var re=/(.*) (\w+?) \- Moon (\d+?)$/;

    m=re.exec(name);

    return Array(m[1],romanToNumber(m[2]),m[3]);

};


function addMoons() {
  var html = HtmlService.createHtmlOutputFromFile('input');
  SpreadsheetApp.getUi().showModalDialog(html, 'Enter Moon Data');
}  
  
function processMoon(moondata) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var moonsheet = ss.getSheetByName("moons");

  oreArray = moondata.match(/[^\r\n]+/g);
  var orere=/(.*)\s+([\d\.]+)$/;
  planet="";
  pivot=0;
  row=new Array();
  start=1;
  for (var i = 0, len = oreArray.length; i < len; i++) {
      if (oreArray[i][0] === " ") {
         ore=oreArray[i].trim();
         m=orere.exec(ore);
         ore=[m[1].m[2]];
          if (pivot) {
              row=row.concat(ore);
          } else {
              row=new Array();
              row=row.concat(planet,ore);
              moonsheet.appendRow(row)
          }
      } else {
          planet=reformatName(oreArray[i]);
          if (pivot) {
            if (!start) {
              moonsheet.appendRow(row);
            } else {
              start=0;
            }
            row=new Array();
            row=row.concat(planet);
          } 
      }

  }
}
