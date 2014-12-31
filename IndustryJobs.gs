/*
Call this function like:
=loadJobs("corp",4324234,"7okqZ1gOyG43243243242342qb2wkyd21C",90926985)
=loadJobs("corp",4324234,"7okqZ1gOyG43243243242342qb2wkyd21C",90926985,1)
and get all your jobs loaded into the sheet. I'd suggest doing it on a blank sheet,
rather than in a sheet you have useful information on.

The optional parameter at the end doesn't care what the value is, just if something is set or not. if it is, then the history is pulled


It's 
jobID
installerID
installerName
facilityID
solarSystemID
solarSystemName
stationID
activityID
blueprintID
blueprintTypeID
blueprintTypeName
blueprintLocationID
outputLocationID
runs
successfulRuns
cost
teamID
licensedRuns
probability
productTypeID
productTypeName
status
timeInSeconds
startDate
endDate
pauseDate
completedDate
completedCharacterID



*/

function loadJobs(type, keyID, vCode, characterID,history){
   if (typeof history == 'undefined'){
        historyurl='';
  } else {
        historyurl='History';
  }
  var jobs= new Array();
  jobs.push(["jobID","installerID","installerName","facilityID","solarSystemID","solarSystemName","stationID","activityID","blueprintID","blueprintTypeID","blueprintTypeName"
       ,"blueprintLocationID","outputLocationID","runs","successfulRuns","cost","teamID","licensedRuns","probability","productTypeID","productTypeName","status","timeInSeconds",
       "startDate","endDate","pauseDate","completedDate","completedCharacterID"]);
  status={1:"Active",2:"Paused",3:"Ready",101:"Delivered",102:"Cancelled",103:"Reverted"};
  var url = "https://api.eveonline.com/"+type+"/IndustryJobs"+historyurl+".xml.aspx?keyID="+keyID+"&vCode="+vCode+"&characterID="+characterID;
  var parameters = {method : "get", payload : ""};
  var xmlFeed = UrlFetchApp.fetch(url, parameters).getContentText();
  var xml = XmlService.parse(xmlFeed);
  
  if(xml) {
    var rows=xml.getRootElement().getChild("result").getChild("rowset").getChildren("row");
    for(var i = 0; i < rows.length; i++) {  
        job=[parseInt(rows[i].getAttribute('jobID').getValue()),
            parseInt(rows[i].getAttribute('installerID').getValue()),
            rows[i].getAttribute('installerName').getValue(),
            parseInt(rows[i].getAttribute('facilityID').getValue()),
            parseInt(rows[i].getAttribute('solarSystemID').getValue()),
            rows[i].getAttribute('solarSystemName').getValue(),
            parseInt(rows[i].getAttribute('stationID').getValue()),
            parseInt(rows[i].getAttribute('activityID').getValue()),
            parseInt(rows[i].getAttribute('blueprintID').getValue()),
            parseInt(rows[i].getAttribute('blueprintTypeID').getValue()),
            rows[i].getAttribute('blueprintTypeName').getValue(),
            parseInt(rows[i].getAttribute('blueprintLocationID').getValue()),
            parseInt(rows[i].getAttribute('outputLocationID').getValue()),
            parseInt(rows[i].getAttribute('runs').getValue()),
            parseInt(rows[i].getAttribute('successfulRuns').getValue()),
            parseFloat(rows[i].getAttribute('cost').getValue()),
            parseInt(rows[i].getAttribute('teamID').getValue()),
            parseInt(rows[i].getAttribute('licensedRuns').getValue()),
            rows[i].getAttribute('probability').getValue(),
            parseInt(rows[i].getAttribute('productTypeID').getValue()),
            rows[i].getAttribute('productTypeName').getValue(),
            status[parseInt(rows[i].getAttribute('status').getValue())],
            parseInt(rows[i].getAttribute('timeInSeconds').getValue()),
            rows[i].getAttribute('startDate').getValue(),
            rows[i].getAttribute('endDate').getValue(),
            rows[i].getAttribute('pauseDate').getValue(),
            rows[i].getAttribute('completedDate').getValue(),
            parseInt(rows[i].getAttribute('completedCharacterID').getValue())
       ];
      jobs.push(job);
    }
  }
return jobs;
}


