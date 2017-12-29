/*

Creates 2 new sheets, and 2 new menu options.

Paste into the script editor, then run the onOpen() function. it'll ask for some privileges. grant them, then go back to the sheet. 
you'll have a new API menu, with 2 options. each option will create the sheet it needs.



*/


function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('API')
      .addItem('Update Indexes', 'loadIndexes')
      .addItem('Update Industry Prices', 'updateIndustryPrices')
      .addToUi();
}


function loadIndexes() {
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
 
  try {ss.setActiveSheet(ss.getSheetByName("indexes"));}
  catch (e) {ss.insertSheet("indexes");}
  
  var indexsheet=ss.getSheetByName("indexes")
  indexsheet.clear()
  var url="https://esi.tech.ccp.is/v1/industry/systems/?datasource=tranquility"
  
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
  indexsheet.insertRowsAfter(1,systems.length)
  indexsheet.getRange(indexsheet.getLastRow()+1, 1, systems.length, systems[0].length).setValues(systems)
  var rows = indexsheet.getRange(2, 1, indexsheet.getLastRow() - 1, indexsheet.getLastColumn());
  rows.sort(1)
}
    
    

function updateIndustryPrices() {
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  try {ss.setActiveSheet(ss.getSheetByName("prices"));}
  catch (e) {ss.insertSheet("prices");}
  
  var pricesheet=ss.getSheetByName("prices")
  pricesheet.clear()
  
  var url="https://esi.tech.ccp.is/v1/markets/prices/?datasource=tranquility"
  
  var parameters = {method : "get", payload : ""};
  var jsonFeed = UrlFetchApp.fetch(url, parameters).getContentText();
  
  data = JSON.parse(jsonFeed)
  
  var prices=new Array()
  prices.push(['id','average','adjusted']);
  if (data) {
    for (var i = 0; i < data.length; i++) {
      prices.push([data[i].type_id,
                    data[i].average_price,
                    data[i].adjusted_price,
                    ]);
      
    }
  }
  pricesheet.insertRowsAfter(1,prices.length)
  pricesheet.getRange(pricesheet.getLastRow()+1, 1, prices.length, prices[0].length).setValues(prices)
  var rows = pricesheet.getRange(2, 1, pricesheet.getLastRow() - 1, pricesheet.getLastColumn());
  rows.sort(1)
  
}
