/*
* Loads names from ESI, using ids
* @param nameids A range where the nameids can be found
* @return the names of the people
* @customfunction
*/

function nameloader(nameIDs) {

  if (typeof nameIDs == 'undefined'){
    throw 'need name ids';
  }

  var names = new Array();
  var dirtynameids = new Array();
  var cleannameids = new Array();
  var url="https://esi.evetech.net/latest/universe/names/?datasource=tranquility";
  
   nameIDs.forEach (function (row) {
    row.forEach ( function (cell) {
      if (typeof(cell) === 'number' ) {
        dirtynameids.push(cell);
      }
    });
  });
    cleannameids = dirtynameids.filter(function(v,i,a) {
    return a.indexOf(v)===i;
  });
  
  var parameters = {method : "post", payload : ""};
  
  var o,j,temparray,chunk = 100;
  for (o=0,j=cleannameids.length; o < j; o+=chunk) {
    temparray = cleannameids.slice(o,o+chunk);
    parameters['payload']=JSON.stringify(temparray)
    var jsonfeed = UrlFetchApp.fetch(url, parameters).getContentText();
    var datafeed=JSON.parse(jsonfeed);
    for(var i = 0; i < datafeed.length; i++) {
     var namedata=[parseInt(datafeed[i]['id']),datafeed[i]['name']];
     names.push(namedata);
    }
  }
  return names;  
}
