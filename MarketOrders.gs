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

function loadMarketOrders(type, keyID, vCode, characterID){
  var moment = Moment.load()
  var orders= new Array();
  var url = "https://api.eveonline.com/"+type+"/MarketOrders.xml.aspx?keyID="+keyID+"&vCode="+vCode+"&characterID="+characterID;
  var parameters = {method : "get", payload : ""};
  var xmlFeed = UrlFetchApp.fetch(url, parameters).getContentText();
  var xml = XmlService.parse(xmlFeed);
  if(xml) {
    var rows=xml.getRootElement().getChild("result").getChild("rowset").getChildren("row");
    for(var i = 0; i < rows.length; i++) {
      order=[rows[i].getAttribute("orderID").getValue(),
                 rows[i].getAttribute("charID").getValue(),
                 rows[i].getAttribute("stationID").getValue(),
                 parseInt(rows[i].getAttribute("volEntered").getValue()),
                 parseInt(rows[i].getAttribute("volRemaining").getValue()),
                 parseInt(rows[i].getAttribute("minVolume").getValue()),
                 rows[i].getAttribute("orderState").getValue(),
                 rows[i].getAttribute("typeID").getValue(),
                 parseInt(rows[i].getAttribute("range").getValue()),
                 rows[i].getAttribute("accountKey").getValue(),
                 rows[i].getAttribute("duration").getValue(),
                 parseFloat(rows[i].getAttribute("escrow").getValue()),
                 parseFloat(rows[i].getAttribute("price").getValue()),
                 rows[i].getAttribute("bid").getValue(),
                 rows[i].getAttribute("issued").getValue(),
             moment(rows[i].getAttribute("issued").getValue(),"YYYY-MM-DD HH:mm:ss").add('days',parseInt(rows[i].getAttribute("duration").getValue())).format("YYYY-MM-DD HH:mm:ss")
            ];
      orders.push(order);
    }
  }
  return orders;
}




function loadMarketOrdersResolved(type, keyID, vCode, characterID){
  var moment = Moment.load()
  var orders= new Array();
  var url = "https://api.eveonline.com/"+type+"/MarketOrders.xml.aspx?keyID="+keyID+"&vCode="+vCode+"&characterID="+characterID;
  var parameters = {method : "get", payload : ""};
  var xmlFeed = UrlFetchApp.fetch(url, parameters).getContentText();
  var xml = XmlService.parse(xmlFeed);
  
  
  var orderStates = {0:'Open',1:'Closed',2:'Expired/fulfilled',3:'Cancelled',4:'Pending',5:'Character Deleted'};
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var stationSheet = ss.getSheetByName("station");
  var typeidSheet = ss.getSheetByName("typeid");

  var stations=stationSheet.getDataRange().getValues();
  var stationArray = new Array();
  for(var i = 0; i < stations.length; i++) {
    var key = stations[i][0]+'_';
    stationArray[key] = stations[i][1];
  }
  
  var typeids=typeidSheet.getDataRange().getValues();
  var typeidArray = new Array();
  for(var i = 0; i < typeids.length; i++) {
    var key = typeids[i][0]+'_';
    typeidArray[key] = typeids[i][1];
  }
  
  if(xml) {
    var rows=xml.getRootElement().getChild("result").getChild("rowset").getChildren("row");
    for(var i = 0; i < rows.length; i++) {
      order=[rows[i].getAttribute("orderID").getValue(),
                 rows[i].getAttribute("charID").getValue(),
                 stationArray[rows[i].getAttribute("stationID").getValue()+'_'],
                 parseInt(rows[i].getAttribute("volEntered").getValue()),
                 parseInt(rows[i].getAttribute("volRemaining").getValue()),
                 parseInt(rows[i].getAttribute("minVolume").getValue()),
                 orderStates[rows[i].getAttribute("orderState").getValue()],
                 typeidArray[rows[i].getAttribute("typeID").getValue()+'_'],
                 parseInt(rows[i].getAttribute("range").getValue()),
                 rows[i].getAttribute("accountKey").getValue(),
                 rows[i].getAttribute("duration").getValue(),
                 parseFloat(rows[i].getAttribute("escrow").getValue()),
                 parseFloat(rows[i].getAttribute("price").getValue()),
             parseInt(rows[i].getAttribute("bid").getValue())?'Buy':'Sell',
                 rows[i].getAttribute("issued").getValue(),
             moment(rows[i].getAttribute("issued").getValue(),"YYYY-MM-DD HH:mm:ss").add('days',parseInt(rows[i].getAttribute("duration").getValue())).format("YYYY-MM-DD HH:mm:ss")
            ];
      orders.push(order);
    }
  }
  return orders;
}
