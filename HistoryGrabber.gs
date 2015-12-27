function loadAllVolumes(typeID,regionID){
  if (typeof regionID == 'undefined'){
    regionID=10000002;
  }
  if (typeof typeID == 'undefined'){
    throw 'need typeid';
  }

  var prices = new Array();
  var url="https://public-crest.eveonline.com/market/"+regionID+"/types/"+typeID+"/history/";
  
  var parameters = {method : "get", payload : ""};
  var jsonFeed = UrlFetchApp.fetch(url, parameters).getContentText();
  var volumes = new Array();
  
  if (data) {
    for (var i = 0; i < data.items.length; i++) {
      volumes.push(data.items[i].volume);
    }
  }
  
  return volumes;
}

function loadVolume(typeID,regionID){
  if (typeof regionID == 'undefined'){
    regionID=10000002;
  }
  if (typeof typeID == 'undefined'){
    throw 'need typeid';
  }

  var prices = new Array();
  var url="https://public-crest.eveonline.com/market/"+regionID+"/types/"+typeID+"/history/";
  
  var parameters = {method : "get", payload : ""};
  var jsonFeed = UrlFetchApp.fetch(url, parameters).getContentText();
  var volumes = new Array();
  
  data = JSON.parse(jsonFeed)
  var d = new Date();
  d.setDate(d.getDate() - 1);
  month=d.getMonth()+1;
  yesterday=d.getFullYear()+"-"+month+"-"+d.getDate()+"T00:00:00";
  
    if (data) {
    for (var i = 0; i < data.items.length; i++) {
      if (data.items[i].date == yesterday) {
        volumes.push(data.items[i].volume);
      }
    }
  }
  
  return volumes;
}
