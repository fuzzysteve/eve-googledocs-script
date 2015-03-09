/*

Takes a bunch of typeids from a list (duplicates are fine. multidimensional is fine) and returns a bunch of rows 
with relevant price data.

TypeID,Buy Volume,Buy average,Buy max,Buy min,Buy Std deviation,Buy median,Buy Percentile,
Sell Volume,Sell Average,Sell Max,Sell Min,Sell std Deviation,Sell Median,sell Percentile



I'd suggest loading price data into a new sheet, then using vlookup to get the bits you care about in your main sheet.

loadRegionPrices defaults to the Forge
loadSystemPrices defaults to Jita


=loadRegionPrices(A1:A28)
=loadRegionPrices(A1:A28,10000002)
=loadRegionPrices(A1:A28,10000002,47)

=loadSystemPrices(A1:A28)






An example below:

https://docs.google.com/spreadsheets/d/1f9-4cb4Tx64Do-xmHhELSwZGahZ2mTTkV7mKDBRPrrY/edit?usp=sharing

*/
/*
* Loads prices for a given set of typeIDs for a specific region using Eve-Central's data.
* @param priceIDs A range where the item typeIDs are found.
* @param regionID The region to query.
* @param {number} cachebuster Increment this variable to refresh the data.
* @return The price data in multiple columns in the following order: TypeID,Buy Volume,Buy average,Buy max,Buy min,Buy Std deviation,Buy median,Buy Percentile,Sell Volume,Sell Average,Sell Max,Sell Min,Sell std Deviation,Sell Median,sell Percentile. This is suitable for use with VLOOKUP.
* @customfunction
*/
function loadRegionPrices(priceIDs,regionID,cachebuster){
  if (typeof regionID == 'undefined'){
    regionID=10000002;
  }
  if (typeof priceIDs == 'undefined'){
    throw 'need typeids';
  }
  if (typeof cachebuster == 'undefined'){
    cachebuster=1;
  }
  var prices = new Array();
  var dirtyTypeIds = new Array();
  var cleanTypeIds = new Array();
  var url="http://api.eve-central.com/api/marketstat?cachebuster="+cachebuster+"&regionlimit="+regionID+"&typeid=";
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
  var parameters = {method : "get", payload : ""};
  
  var o,j,temparray,chunk = 100;
  for (o=0,j=cleanTypeIds.length; o < j; o+=chunk) {
    temparray = cleanTypeIds.slice(o,o+chunk);
    Utilities.sleep(100);
    var xmlFeed = UrlFetchApp.fetch(url+temparray.join("&typeid="), parameters).getContentText();
    var xml = XmlService.parse(xmlFeed);
    if(xml) {
      var rows=xml.getRootElement().getChild("marketstat").getChildren("type");
      for(var i = 0; i < rows.length; i++) {
        var price=[parseInt(rows[i].getAttribute("id").getValue()),
                   parseInt(rows[i].getChild("buy").getChild("volume").getValue()),
                   parseFloat(rows[i].getChild("buy").getChild("avg").getValue()),
                   parseFloat(rows[i].getChild("buy").getChild("max").getValue()),
                   parseFloat(rows[i].getChild("buy").getChild("min").getValue()),
                   parseFloat(rows[i].getChild("buy").getChild("stddev").getValue()),
                   parseFloat(rows[i].getChild("buy").getChild("median").getValue()),
                   parseFloat(rows[i].getChild("buy").getChild("percentile").getValue()),
                   parseInt(rows[i].getChild("sell").getChild("volume").getValue()),
                   parseFloat(rows[i].getChild("sell").getChild("avg").getValue()),
                   parseFloat(rows[i].getChild("sell").getChild("max").getValue()),
                   parseFloat(rows[i].getChild("sell").getChild("min").getValue()),
                   parseFloat(rows[i].getChild("sell").getChild("stddev").getValue()),
                   parseFloat(rows[i].getChild("sell").getChild("median").getValue()),
                   parseFloat(rows[i].getChild("sell").getChild("percentile").getValue())];
        prices.push(price);
      }
    }
  }
  return prices;
}

/*
* Loads prices for a given set of typeIDs for a specific region using Eve-Central's data.
* @param priceIDs A range where the item typeIDs are found.
* @param systemID The system to query.
* @param {number} cachebuster Increment this variable to refresh the data.
* @return The price data in multiple columns in the following order: TypeID,Buy Volume,Buy average,Buy max,Buy min,Buy Std deviation,Buy median,Buy Percentile,Sell Volume,Sell Average,Sell Max,Sell Min,Sell std Deviation,Sell Median,sell Percentile. This is suitable for use with VLOOKUP.
* @customfunction
*/
function loadSystemPrices(priceIDs,systemID,cachebuster){
  if (typeof systemID == 'undefined'){
    systemID=30000142;
  }
  if (typeof priceIDs == 'undefined'){
    throw 'need typeids';
  }
  if (typeof cachebuster == 'undefined'){
    cachebuster=1;
  }
  var prices = new Array();
  var dirtyTypeIds = new Array();
  var cleanTypeIds = new Array();
  var url="http://api.eve-central.com/api/marketstat?cachebuster="+cachebuster+"&usesystem="+systemID+"&typeid=";
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
  var parameters = {method : "get", payload : ""};
  
  var o,j,temparray,chunk = 100;
  for (o=0,j=cleanTypeIds.length; o < j; o+=chunk) {
    temparray = cleanTypeIds.slice(o,o+chunk);
    var xmlFeed = UrlFetchApp.fetch(url+temparray.join("&typeid="), parameters).getContentText();
    var xml = XmlService.parse(xmlFeed);
    if(xml) {
      var rows=xml.getRootElement().getChild("marketstat").getChildren("type");
      for(var i = 0; i < rows.length; i++) {
        var price=[parseInt(rows[i].getAttribute("id").getValue()),
                   parseInt(rows[i].getChild("buy").getChild("volume").getValue()),
                   parseFloat(rows[i].getChild("buy").getChild("avg").getValue()),
                   parseFloat(rows[i].getChild("buy").getChild("max").getValue()),
                   parseFloat(rows[i].getChild("buy").getChild("min").getValue()),
                   parseFloat(rows[i].getChild("buy").getChild("stddev").getValue()),
                   parseFloat(rows[i].getChild("buy").getChild("median").getValue()),
                   parseFloat(rows[i].getChild("buy").getChild("percentile").getValue()),
                   parseInt(rows[i].getChild("sell").getChild("volume").getValue()),
                   parseFloat(rows[i].getChild("sell").getChild("avg").getValue()),
                   parseFloat(rows[i].getChild("sell").getChild("max").getValue()),
                   parseFloat(rows[i].getChild("sell").getChild("min").getValue()),
                   parseFloat(rows[i].getChild("sell").getChild("stddev").getValue()),
                   parseFloat(rows[i].getChild("sell").getChild("median").getValue()),
                   parseFloat(rows[i].getChild("sell").getChild("percentile").getValue())];
        prices.push(price);
      }
    }
  }
  return prices;
}
