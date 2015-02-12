/*

Example Sheet
https://docs.google.com/spreadsheets/d/1d3ixNx5hF5kfj2Zl3g46ODi3mqrb-AB7FDz4p4_8DCo/edit?usp=sharing


*/
/**
* Creates a table of outpost information from the EVE API.
* @return A table with columns of information in the following order: station ID, station name, station TypeID, solar system ID, owning corporation ID, owning corporation name.
* @customfunction
*/
function loadOutposts(){
  var outposts= new Array();
  var url = "https://api.eveonline.com/eve/ConquerableStationList.xml.aspx";
  var parameters = {method : "get", payload : ""};
  var xmlFeed = UrlFetchApp.fetch(url, parameters).getContentText();
  var xml = XmlService.parse(xmlFeed);
  if(xml) {
    var rows=xml.getRootElement().getChild("result").getChild("rowset").getChildren("row");
    for(var i = 0; i < rows.length; i++) {
      outpost=[rows[i].getAttribute("stationID").getValue(),
                 rows[i].getAttribute("stationName").getValue(),
                 rows[i].getAttribute("stationTypeID").getValue(),
                 rows[i].getAttribute("solarSystemID").getValue(),
                 rows[i].getAttribute("corporationID").getValue(),
                 rows[i].getAttribute("corporationName").getValue()
                 ]
      outposts.push(outpost);
    }
  }
  return outposts;
}
