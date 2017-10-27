/*

This one is a bit harder to set up.

First, create a form. This must have a field called 'Moon data'. Capitalization is important. It can contain any other fields you want.

https://forms.google.com

Once the form exists, click on 'responses'. There will be a green icon. the tool tip will be 'view responses in google sheets.' hit it

this will create a new sheet.

create a new page on it called 'processed'

go to the script editor. paste in the code below.

name the project

then go to edit-> current project's triggers.

create a new trigger. 

should be: processMoon, from spreadsheet, on form submit.

When you save, it'll throw security warnings. work your way through them.

That should then be it.


*/
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


function processMoon(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var moonsheet = ss.getSheetByName("processed");
  
  moondata=e.namedValues['Moon data'][0]

  oreArray = moondata.match(/[^\r\n]+/g);
  var orere=/^\W*(\w+?\s?\w+?)\W+([\d.]+)\W+(\d+)\W+(\d+)\W+(\d+)\W+(\d+)\W*$/;
  planet="";
  pivot=0;
  row=new Array();
  start=1;
  for (var i = 0, len = oreArray.length; i < len; i++) {
    if (oreArray[i].substring(0,4) === "Moon") {
       continue;
    }
      if (oreArray[i][0] === " " || oreArray[i][0] === "\t") {
         ore=oreArray[i].trim().trim("\t");
         m=orere.exec(ore);
         ore=[m[1],m[2],m[3],m[4],m[5]];
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
