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
  data = JSON.parse(jsonFeed)
  var volumes = new Array();
  
  if (data) {
    for (var i = 0; i < data.items.length; i++) {
      volumes.push(data.items[i].volume);
    }
  }
  
  return volumes;
}


function zeroFill( number, width )
{
  width -= number.toString().length;
  if ( width > 0 )
  {
    return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
  }
  return number + ""; // always return a string
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
  yesterday=d.getFullYear()+"-"+zeroFill(month,2)+"-"+zeroFill(d.getDate(),2)+"T00:00:00";
  
    if (data) {
    for (var i = 0; i < data.items.length; i++) {
      if (data.items[i].date == yesterday) {
        volumes.push(data.items[i].volume);
      }
    }
  }
  
  return volumes;
}



function loadThirtyDayVolume(typeID,regionID){
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
  time=Date.UTC(d.getFullYear(),d.getMonth()+1,d.getDate())
  from = time - 2.592e+9
 
    if (data) {
    for (var i = 0; i < data.items.length; i++) {
      year=data.items[i].date.substring(0,4)
      month=data.items[i].date.substring(5,7)
      day=data.items[i].date.substring(8,10)
      
      if (Date.UTC(year,month,day) >= from) {
       volumes.push(data.items[i].volume)
      }
    }
  }
  
  return volumes;
}
