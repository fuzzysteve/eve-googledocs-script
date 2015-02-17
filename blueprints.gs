/*

Call this function like:
=loadBlueprints("corp",4324234,"7okqZ1gOyG43243243242342qb2wkyd21C",90926985)

and get all your blueprints loaded into the sheet. I'd suggest doing it on a blank sheet,
rather than in a sheet you have useful information on.

It's 'blueprint ID','location ID','Typeid of blueprint','name of blueprint','which hangar it's in',
'quantity. -2 for a BPC, -1 for a BPO, a number for stacked BPOs',TE,ME,'runs, -1 for a BPO'

*/
/**
* Creates a table of information on blueprints retrieved from the EVE API.
* @param {string} type This should be set to "char" or "corp" depending on the type of API key in use.
* @param {number} keyID This should be set to the keyID given by your API key.
* @param {string} vCode This should be set to the verification code given by your API key.
* @param {number} characterID This should be set to the specific character for which you would like to retrieve the blueprint data.
* @returns A table with information in the following order: 'blueprint ID','location ID','Typeid of blueprint','name of blueprint','which hangar it's in', 'quantity. -2 for a BPC, -1 for a BPO, a number for stacked BPOs',TE,ME,'runs, -1 for a BPO'
* @customfunction
*/
function loadBlueprints(type, keyID, vCode, characterID){
  var blueprints= new Array();
  var url = "https://api.eveonline.com/"+type+"/Blueprints.xml.aspx?keyID="+keyID+"&vCode="+vCode+"&characterID="+characterID;
  var parameters = {method : "get", payload : ""};
  var xmlFeed = UrlFetchApp.fetch(url, parameters).getContentText();
  var xml = XmlService.parse(xmlFeed);
  
  if(xml) {
    var rows=xml.getRootElement().getChild("result").getChild("rowset").getChildren("row");
    for(var i = 0; i < rows.length; i++) {  
      blueprint=[rows[i].getAttribute("itemID").getValue(),
                 rows[i].getAttribute("locationID").getValue(),
                 rows[i].getAttribute("typeID").getValue(),
                 rows[i].getAttribute("typeName").getValue(),
                 rows[i].getAttribute("flagID").getValue(),
                 rows[i].getAttribute("quantity").getValue(),
                 rows[i].getAttribute("timeEfficiency").getValue(),
                 rows[i].getAttribute("materialEfficiency").getValue(),
                 rows[i].getAttribute("runs").getValue()]
      blueprints.push(blueprint);
    }
  }
return blueprints;
}
