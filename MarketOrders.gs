/* 
Because I'm doing some date math in this, this one's a trifle harder to use than some of the others.

You'll need to add the moment.js library to the libraries for this sheet. Do so by using the Resources menu, then libraries.
MHMchiX6c1bwSqGM1PZiW_PxhMjh3Sh48 is the key to find it. Select version 9 and add it.

The first version of the function just returns the raw data (plus a column for when it expires as that's handy)

The second version depends on additional sheets, to fill in type data and station data.
https://www.fuzzwork.co.uk/resources/typeids.csv into a sheet called typeid
https://www.fuzzwork.co.uk/resources/stations.csv into a sheet called station


You can do it with an importdata(), or paste it in. Pasting it will likely lead to better performance (as it won't reload it) but will need updating when new things come out.


=loadMarketOrders("char",57828,"5T7GHu8583497584qFDhSH5o5HdMoYqhe4pwDSNtsA",90926985)
=loadMarketOrdersResolved("char",57828,"5T7GHupiEtWTF9ZArmC895748935DhSH5o5HdMoYqhe4pwDSNtsA",90926985)

For a quick method, copy the example sheet, put in proper values for the keyid, vcode and character id, and remove the initial '

https://docs.google.com/spreadsheets/d/12abDsXyq-Lj_yctkmCY0moZYUVC8gTRWnPC9Z02O2v8/edit?usp=sharing

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
  
  var i,j,temparray,chunk = 100;
  for (i=0,j=cleanTypeIds.length; i < j; i+=chunk) {
    temparray = cleanTypeIds.slice(i,i+chunk);
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

function loadSystemPrices(priceIDs,systemID,cachebuster){
  if (typeof systemID == 'undefined'){
    regionID=30000142;
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
  var url="http://api.eve-central.com/api/marketstat?cachebuster="+cachebuster+"&usesystem="+regionID+"&typeid=";
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
  
  var i,j,temparray,chunk = 100;
  for (i=0,j=cleanTypeIds.length; i < j; i+=chunk) {
    temparray = cleanTypeIds.slice(i,i+chunk);
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
