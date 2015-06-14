/*
https://docs.google.com/spreadsheets/d/17XjDQRArWKfYEA6xWmSwgsE6gDp_Lbj0lZdtxHIFe5A/edit?usp=sharing
*/
function loadKills(){
  var kills= new Array();
  var url = "https://api.eveonline.com/map/Kills.xml.aspx";
  var parameters = {method : "get", payload : ""};
  var xmlFeed = UrlFetchApp.fetch(url, parameters).getContentText();
  var xml = XmlService.parse(xmlFeed);
  if(xml) {
    var rows=xml.getRootElement().getChild("result").getChild("rowset").getChildren("row");
    for(var i = 0; i < rows.length; i++) {
      system=[parseInt(rows[i].getAttribute("solarSystemID").getValue()),
                 parseInt(rows[i].getAttribute("shipKills").getValue()),
                 parseInt(rows[i].getAttribute("factionKills").getValue()),
                 parseInt(rows[i].getAttribute("podKills").getValue()),
                 ]
      kills.push(system);
    }
  }
  return kills;
}
