/*
The beginning of a loader for a character sheet.


=loadSheet(keyid,"vcode",characterid)

it prepends all skill typeids with skill-, this is so, 
if you expand it to also pull things like implants, you can still easily look them up.


To pull a specific skill value:
=vlookup("skill-3303",Sheet1!A:C,3,false)


If you want to do it differently replace
  skill=['skill-'+skills[j].getAttribute("typeID").getValue(),
  
  with
  
  skill=['skill',parseInt(skills[j].getAttribute("typeID").getValue()),

=query(Sheet1!A:D,CONCATENATE("select D where A='skill' and B=",B2,""))


Which is a little messier to look at and use.

*/


function loadSheet(keyID, vCode, characterID){
  var sheet= new Array();
  var url = "https://api.eveonline.com/char/charactersheet.xml.aspx?keyID="+keyID+"&vCode="+vCode+"&characterID="+characterID;
  var parameters = {method : "get", payload : ""};
  var xmlFeed = UrlFetchApp.fetch(url, parameters).getContentText();
  var xml = XmlService.parse(xmlFeed);
  if(xml) {
    var rows=xml.getRootElement().getChild("result").getChildren("rowset");
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].getAttribute("name").getValue()=='skills') {
        var skills=rows[i].getChildren("row")
        for(var j = 0; j < skills.length; j++) {
          skill=['skill-'+skills[j].getAttribute("typeID").getValue(),
                 parseInt(skills[j].getAttribute("skillpoints").getValue()),
                 parseInt(skills[j].getAttribute("level").getValue()),
                 parseInt(skills[j].getAttribute("published").getValue())
                ]
          sheet.push(skill);
        }
      }
    }
  }
  return sheet;
}
