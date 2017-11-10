/*
A function for loading system industry indexes.


*/


function loadIndexes() {
  
  var url="https://esi.tech.ccp.is/latest/industry/systems/?datasource=tranquility"
  
  var parameters = {method : "get", payload : ""};
  var jsonFeed = UrlFetchApp.fetch(url, parameters).getContentText();
  
  data = JSON.parse(jsonFeed)
  
  var systems=new Array()
  systems.push(['id','manufacturing','time efficiency','material efficiency','copying','invention','reaction']);
  if (data) {
    for (var i = 0; i < data.length; i++) {
      var system=new Object()
      for (var j =0; j< data[i].cost_indices.length;j++) {
        system[data[i].cost_indices[j].activity]=data[i].cost_indices[j].cost_index;
      }
      systems.push([data[i].solar_system_id,
                    system['manufacturing'],
                    system['researching_time_efficiency'],
                    system['researching_material_efficiency'],
                    system['copying'],
                    system['invention'],
                    system['reaction'],
                    ]);
      
    }
  }
  return systems
  
}
