/*

This is one of the more complex ones to set up.

I'll probably write up something specific for it at some point, but the blog below covers much of what is needed.

https://www.fuzzwork.co.uk/2017/03/14/using-esi-google-sheets/

you'll need a workbook with 4 sheets.
journal
transactions
typeids
config

Journal and transactions should be either empty, or with a header row.

typeids should have a list of the typeids for market types, in the form typeid, name,typeid. The easy way to do this is just stick 
=IMPORTDATA("https://www.fuzzwork.co.uk/market/marketitems.csv") in A1


Config should be set up as per the blog post (with the named ranges and so on). The refresh token will need to be set up for the character wallet scope.

Once that's all done, you can add the code below to the script editor, then reopen the sheet. It should have a new API menu item
which has an update wallet bit. new entries go to the bottom (but you can sort at will)

*/


var typeidArray = new Array();

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('API')
      .addItem('Update Wallet', 'updateWallet')
      .addItem('Get Maxes', 'getMax')
      .addItem('Clear Maxes', 'clearMax')
      .addToUi();
}

function getSetup() {
 var config={};
 var namedRanges = SpreadsheetApp.getActiveSpreadsheet().getNamedRanges();
 for (var i = 0; i < namedRanges.length; i++) {
   switch (namedRanges[i].getName()) {
     case 'clientid':
       config.clientid=namedRanges[i].getRange().getCell(1, 1).getValue() ;
       break;
     case 'secret':
       config.secret=namedRanges[i].getRange().getCell(1, 1).getValue() ;
       break;
     case 'refresh':
       config.refreshtoken=namedRanges[i].getRange().getCell(1, 1).getValue() ;
       break;
   }

 }
 var documentProperties = PropertiesService.getDocumentProperties();
 config.expires = documentProperties.getProperty('oauth_expires');
 config.access_token = documentProperties.getProperty('access_token')
 config.maxtransactionid=documentProperties.getProperty('maxtransactionid')
 config.maxjournalid=documentProperties.getProperty('maxjournalid')
 return config;
}

function getMax() {
  var documentProperties = PropertiesService.getDocumentProperties();
  maxid=documentProperties.getProperty('maxtransactionid');
  SpreadsheetApp.getUi().alert('max transaction id is:'+maxid);
  maxid=documentProperties.getProperty('maxjournalid');
  SpreadsheetApp.getUi().alert('max journal id is:'+maxid);
}

function clearMax() {
  var documentProperties = PropertiesService.getDocumentProperties();
  documentProperties.setProperty('maxtransactionid',0);
  documentProperties.setProperty('maxjournalid',0);
}

function getAccessToken(config) {
  
  if (Date.now()>config.expires) {

  var url = 'https://login.eveonline.com/oauth/token?'
    + 'grant_type=refresh_token'
    + '&refresh_token='+config.refreshtoken;
  
  var code=Utilities.base64Encode(config.clientid+':'+config.secret);
  
  var headers = {
    'Authorization': 'Basic '+code,
    'Content-Type': 'application/x-www-form-urlencoded',
    };
  var parameters = {
    'method': 'post',
    'headers': headers,
    };
  var response = UrlFetchApp.fetch(url, parameters).getContentText();
  var json = JSON.parse(response);
  var access_token = json['access_token'];
  
  config.access_token=access_token;
  config.expires=Date.now()+1200000
  var documentProperties = PropertiesService.getDocumentProperties();
  documentProperties.setProperty('access_token',access_token)
  documentProperties.setProperty('oauth_expires',config.expires)
  
  
  }

  return config;
  
}



function updateWallet() {

  var config=getSetup();
  
  config=getAccessToken(config);
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var transactionsheet=ss.getSheetByName("transactions")
  var journalsheet=ss.getSheetByName("journal")
  var typessheet=ss.getSheetByName("typeids")
  
  var typeids = typessheet.getDataRange().getValues();
  for (var i = 0; i < typeids.length; i++) {
    var key = typeids[i][0];
    typeidArray[key] = typeids[i][1];
  }
  
  var url = 'https://esi.tech.ccp.is/latest/characters/90926985/wallet/transactions/?datasource=tranquility';
  
  //transactions
  
  var parameters = {method : "get", headers : {'Authorization':'Bearer '+ config.access_token,'X-User-Agent':'Steve Ronuken Wallet Updater'}};
  newmax=0;
  var jsonFeed = UrlFetchApp.fetch(url, parameters).getContentText();
  var json = JSON.parse(jsonFeed);
  if(json) {
    for(i in json) {
      if (parseInt(json[i].transaction_id)>config.maxtransactionid) {
        transactionsheet.appendRow(
          [json[i].transaction_id,
          json[i].date,
          json[i].location_id,
          json[i].type_id,
          typeidArray[parseInt(json[i].type_id)],
          json[i].unit_price,
          json[i].quantity,
          json[i].client_id,
          json[i].is_buy,
          json[i].is_personal,
          json[i].journal_ref_id]
        );
        if (parseInt(json[i].transaction_id)>newmax){
          newmax=parseInt(json[i].transaction_id);
        }
      }
    }
    if (newmax>config.maxtransactionid) {
      var documentProperties = PropertiesService.getDocumentProperties();
      documentProperties.setProperty('maxtransactionid',newmax)
    }
  }
  

  var url = 'https://esi.tech.ccp.is/latest/characters/90926985/wallet/journal/?datasource=tranquility';
  newmax=0;
  var jsonFeed = UrlFetchApp.fetch(url, parameters).getContentText();
  var json = JSON.parse(jsonFeed);
  if(json) {
    for(i in json) {
      if (parseInt(json[i].ref_id)>config.maxjournalid) {
        transaction=[
          json[i].ref_id,
          json[i].ref_type,
          json[i].date,
          json[i].first_party_id,
          json[i].first_party_type,
          json[i].second_party_id,
          json[i].second_party_type,
          json[i].amount,
          json[i].balance,
          json[i].reason
        ];
        if (json[i].extra_info!=null) {
          transaction.push(json[i].extra_info.transaction_id)
          transaction.push(json[i].extra_info.system_id)
          transaction.push(json[i].extra_info.character_id)
          if (json[i].extra_info.transaction_id!=null) {
            transaction.push("=vlookup("+json[i].extra_info.transaction_id+",transactions!A:G,5,false)")    
          }
        }
        journalsheet.appendRow(transaction)
        if (parseInt(json[i].ref_id)>newmax){
          newmax=parseInt(json[i].ref_id);
        }
      }
    }
    if (newmax>config.maxjournalnid) {
      var documentProperties = PropertiesService.getDocumentProperties();
      documentProperties.setProperty('maxjournalid',newmax)
    }
  }
} 
