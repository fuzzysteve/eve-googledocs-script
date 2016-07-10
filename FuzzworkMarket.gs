function loadRegionAggregates(priceIDs,regionID){
  if (typeof regionID == 'undefined'){
    regionID=10000002;
  }
  if (typeof priceIDs == 'undefined'){
    throw 'Need a list of typeids';
  }

  var prices = new Array();
  var dirtyTypeIds = new Array();
  var cleanTypeIds = new Array();
  var url="https://market.fuzzwork.co.uk/aggregates/?region="+regionID+"&types="
  
  priceIDs.forEach (function (row) {
    row.forEach ( function (cell) {
     if (typeof(cell) === 'number' ) {
        dirtyTypeIds.push(cell);
      }
    });
  });
  cleanTypeIds = dirtyTypeIds.filter(function(v,i,a) {
    return a.indexOf(v)===i;
  });
  prices.push(['TypeID','Buy volume','Buy Weighted Average','Max Buy','Min Buy','Buy Std Dev','Median Buy','Percentile Buy Price','Sell volume','Sell Weighted Average','Max sell','Min Sell','Sell Std Dev','Median Sell','Percentile Sell Price'])
  var parameters = {method : "get", payload : ""};
  
  var o,j,temparray,chunk = 100;
  for (o=0,j=cleanTypeIds.length; o < j; o+=chunk) {
    temparray = cleanTypeIds.slice(o,o+chunk);
    Utilities.sleep(100);
    var types=temparray.join(",").replace(/,$/,'')
    var jsonFeed = UrlFetchApp.fetch(url+types, parameters).getContentText();
    var json = JSON.parse(jsonFeed);
    if(json) {
      for(i in json) {
        var price=[parseInt(i),
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
                   parseFloat(json[i].sell.percentile)];
        prices.push(price);
      }
    }
  }
  return prices;
}
