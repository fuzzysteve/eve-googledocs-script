function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('API')
      .addItem('Update Prices', 'updatePrices')
      .addToUi();
}


function updatePrices(){

  
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var resultsheet=ss.getSheetByName("prices")
  var typessheet=ss.getSheetByName("typeids")

  var regionID = typessheet.getRange("A1").getValues()[0,0];

  //clear out the old prices
  resultsheet.clear();
  
  

  
  var prices = new Array();
  var dirtyTypeIds = new Array();
  var cleanTypeIds = new Array();
  var url="https://market.fuzzwork.co.uk/aggregates/?region="+regionID+"&types="
  
  
  // fill in all the typeids to lookup.
  var len = typessheet.getLastRow()
  for(var i = 2 ; i < len +1  ; i++){
    var typeid = typessheet.getRange("A"+i).getValue(); 
    if (typeof(typeid) === 'number' ) {
        dirtyTypeIds.push(typeid);
      }
  }
  
  // Deduplicate the list
  cleanTypeIds = dirtyTypeIds.filter(function(v,i,a) {
    return a.indexOf(v)===i;
  });
  
  // add a header row
  resultsheet.appendRow(['TypeID','Buy volume','Buy Weighted Average','Max Buy','Min Buy','Buy Std Dev','Median Buy','Percentile Buy Price','Sell volume','Sell Weighted Average','Max sell','Min Sell','Sell Std Dev','Median Sell','Percentile Sell Price'])
  var parameters = {method : "get", payload : ""};
  
  
  // go through the typeids, 100 at a time.
  var o,j,temparray,chunk = 100;
  for (o=0,j=cleanTypeIds.length; o < j; o+=chunk) {
    temparray = cleanTypeIds.slice(o,o+chunk);
    Utilities.sleep(100);
    var types=temparray.join(",").replace(/,$/,'')
    var jsonFeed = UrlFetchApp.fetch(url+types, parameters).getContentText();
    var json = JSON.parse(jsonFeed);
    if(json) {
      for(i in json) {
        resultsheet.appendRow([parseInt(i),
                   parseInt(json[i].buy.volume),
                   parseInt(json[i].buy.weightedAverage),
                   parseFloat(json[i].buy.max),
                   parseFloat(json[i].buy.min),
                   parseFloat(json[i].buy.stddev),
                   parseFloat(json[i].buy.median),
                   parseFloat(json[i].buy.percentile),
                   parseInt(json[i].sell.volume),
                   parseFloat(json[i].sell.weightedAverage),
                   parseFloat(json[i].sell.max),
                   parseFloat(json[i].sell.min),
                   parseFloat(json[i].sell.stddev),
                   parseFloat(json[i].sell.median),
                   parseFloat(json[i].sell.percentile)]);
      }
    }
  }
}
