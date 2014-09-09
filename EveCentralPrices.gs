/*

Takes a bunch of typeids from a list (duplicates are fine. multidimensional is fine) and returns a bunch of rows 
with relevant price data.

TypeID,Buy Volume,Buy average,Buy max,Buy min,Buy Std deviation,Buy median,Buy Percentile,
Sell Volume,Sell Average,Sell Max,Sell Min,Sell std Deviation,Sell Median,sell Percentile



I'd suggest loading price data into a new sheet, then using vlookup to get the bits you care about in your main sheet.

=loadPrices(A1:A28)
=loadPrices(A1:A28,10000002)
=loadPrices(A1:A28,10000002,47)



An example below:

https://docs.google.com/spreadsheets/d/1f9-4cb4Tx64Do-xmHhELSwZGahZ2mTTkV7mKDBRPrrY/edit?usp=sharing

*/
function loadPrices(priceIDs,regionID,cachebuster){
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
  var xmlFeed = UrlFetchApp.fetch(url+cleanTypeIds.join("&typeid="), parameters).getContentText();
  var xml = XmlService.parse(xmlFeed);
  
  if(xml) {
    var rows=xml.getRootElement().getChild("marketstat").getChildren("type");
    for(var i = 0; i < rows.length; i++) {
      var price=[rows[i].getAttribute("id").getValue(),
                 rows[i].getChild("buy").getChild("volume").getValue(),
                 rows[i].getChild("buy").getChild("avg").getValue(),
                 rows[i].getChild("buy").getChild("max").getValue(),
                 rows[i].getChild("buy").getChild("min").getValue(),
                 rows[i].getChild("buy").getChild("stddev").getValue(),
                 rows[i].getChild("buy").getChild("median").getValue(),
                 rows[i].getChild("buy").getChild("percentile").getValue(),
                 rows[i].getChild("sell").getChild("volume").getValue(),
                 rows[i].getChild("sell").getChild("avg").getValue(),
                 rows[i].getChild("sell").getChild("max").getValue(),
                 rows[i].getChild("sell").getChild("min").getValue(),
                 rows[i].getChild("sell").getChild("stddev").getValue(),
                 rows[i].getChild("sell").getChild("median").getValue(),
                 rows[i].getChild("sell").getChild("percentile").getValue()];
      prices.push(price);
    }
  }
  return prices;
}
