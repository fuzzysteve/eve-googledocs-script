/*

This is one of the more complex ones to set up.

I'll probably write up something specific for it at some point, but the blog below covers much of what is needed.

https://www.fuzzwork.co.uk/2017/03/14/using-esi-google-sheets/

you'll need a workbook with 4 sheets.
journal
transactions
typeids
config
corpjournal
corptransactions

Journal and transactions should be either empty, or with a header row.

typeids should have a list of the typeids for market types, in the form typeid, name,typeid. The easy way to do this is just stick 
=IMPORTDATA("https://www.fuzzwork.co.uk/market/marketitems.csv") in A1


Config should be set up as per the blog post (with the named ranges and so on). The refresh token will need to be set up for the character wallet scope and corp wallet scope if you're using that bit

Once that's all done, you can add the code below to the script editor, 
edit the two character ids (CHARACTERIDGOESHERE) to be the right character, edit the two corpids if you'll be using them; then reopen the sheet. 
It should have a new API menu item which has an update wallet bit. new entries go to the bottom (but you can sort at will)

*/
const typeidArray = {};

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('API')
    .addItem('Update Wallet', 'updateWallet')
    .addItem('Update Corp Wallet', 'updateCorpWallet')
    .addItem('Get Maxes', 'getMax')
    .addItem('Clear Maxes', 'clearMax')
    .addToUi();
}

function getSetup() {
  const config = {};
  const namedRanges = SpreadsheetApp.getActiveSpreadsheet().getNamedRanges();
  for (const namedRange of namedRanges) {
    switch (namedRange.getName()) {
      case 'clientid':
        config.clientid = namedRange.getRange().getCell(1, 1).getValue();
        break;
      case 'secret':
        config.secret = namedRange.getRange().getCell(1, 1).getValue();
        break;
      case 'refresh':
        config.refreshtoken = namedRange.getRange().getCell(1, 1).getValue();
        break;
    }
  }

  const documentProperties = PropertiesService.getDocumentProperties();
  config.expires = documentProperties.getProperty('oauth_expires');
  config.access_token = documentProperties.getProperty('access_token');
  config.maxtransactionid = documentProperties.getProperty('maxtransactionid');
  config.maxjournalid = documentProperties.getProperty('maxjournalid');
  config.maxcorpjournalid = documentProperties.getProperty('maxcorpjournalid');
  config.maxcorptransactionid = documentProperties.getProperty('maxcorptransactionid');
  return config;
}

function getMax() {
  const documentProperties = PropertiesService.getDocumentProperties();
  let maxid = documentProperties.getProperty('maxtransactionid');
  SpreadsheetApp.getUi().alert('max transaction id is:' + maxid);
  maxid = documentProperties.getProperty('maxjournalid');
  SpreadsheetApp.getUi().alert('max journal id is:' + maxid);
  maxid = documentProperties.getProperty('maxcorpjournalid');
  SpreadsheetApp.getUi().alert('max corp journal id is:' + maxid);
}

function clearMax() {
  const documentProperties = PropertiesService.getDocumentProperties();
  documentProperties.setProperty('maxtransactionid', 0);
}

function getAccessToken(config) {
  if (Date.now() > config.expires) {
    const url = 'https://login.eveonline.com/oauth/token?' +
      'grant_type=refresh_token' +
      '&refresh_token=' + config.refreshtoken;

    const code = Utilities.base64Encode(config.clientid + ':' + config.secret);

    const headers = {
      'Authorization': 'Basic ' + code,
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    const parameters = {
      'method': 'post',
      'headers': headers,
    };
    const response = UrlFetchApp.fetch(url, parameters).getContentText();
    const json = JSON.parse(response);
    const access_token = json['access_token'];

    config.access_token = access_token;
    config.expires = Date.now() + 1200000;
    const documentProperties = PropertiesService.getDocumentProperties();
    documentProperties.setProperty('access_token', access_token);
    documentProperties.setProperty('oauth_expires', config.expires);
  }

  return config;
}

function updateWallet(characterId) {
  const config = getSetup();
  config.getAccessToken(config);

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const transactionsheet = ss.getSheetByName('transactions');
  const journalsheet = ss.getSheetByName('journal');
  const typessheet = ss.getSheetByName('typeids');

  const typeids = typessheet.getDataRange().getValues();
  for (const row of typeids) {
    const key = row[0];
    typeidArray[key] = row[1];
  }

  const url = `https://esi.evetech.net/latest/characters/${characterId}/wallet/transactions/?datasource=tranquility`;

  const parameters = {
    method: 'get',
    headers: {
      'Authorization': 'Bearer ' + config.access_token,
      'X-User-Agent': 'Steve Ronuken Wallet Updater'
    }
  };

  let newmax = 0;
  const jsonFeed = UrlFetchApp.fetch(url, parameters).getContentText();
  const json = JSON.parse(jsonFeed);

  if (json) {
    for (const item of json) {
      if (parseInt(item.transaction_id) > config.maxtransactionid) {
        transactionsheet.appendRow([
          item.transaction_id,
          item.date,
          item.location_id,
          item.type_id,
          typeidArray[parseInt(item.type_id)],
          item.unit_price,
          item.quantity,
          item.client_id,
          item.is_buy,
          item.is_personal,
          item.journal_ref_id
        ]);

        if (parseInt(item.transaction_id) > newmax) {
          newmax = parseInt(item.transaction_id);
        }
      }
    }

    if (newmax > config.maxtransactionid) {
      const documentProperties = PropertiesService.getDocumentProperties();
      documentProperties.setProperty('maxtransactionid', newmax);
    }
  }

  const journalUrl = `https://esi.evetech.net/latest/characters/${characterId}/wallet/journal/?datasource=tranquility`;

  newmax = 0;
  const journalFeed = UrlFetchApp.fetch(journalUrl, parameters).getContentText();
  const journalJson = JSON.parse(journalFeed);

  if (journalJson) {
    for (const item of journalJson) {
      if (parseInt(item.ref_id) > config.maxjournalid) {
        const transaction = [
          item.ref_id,
          item.ref_type,
          item.date,
          item.first_party_id,
          item.first_party_type,
          item.second_party_id,
          item.second_party_type,
          item.amount,
          item.balance,
          item.reason
        ];

        if (item.extra_info !== null) {
          transaction.push(item.extra_info.transaction_id);
          transaction.push(item.extra_info.system_id);
          transaction.push(item.extra_info.character_id);

          if (item.extra_info.transaction_id !== null) {
            transaction.push('=vlookup(' + item.extra_info.transaction_id + ',transactions!A:G,5,false)');
          }
        }

        journalsheet.appendRow(transaction);

        if (parseInt(item.ref_id) > newmax) {
          newmax = parseInt(item.ref_id);
        }
      }
    }

    if (newmax > config.maxjournalid) {
      const documentProperties = PropertiesService.getDocumentProperties();
      documentProperties.setProperty('maxjournalid', newmax);
    }
  }
}

function updateCorpWallet(corpId) {
  const config = getSetup();
  config.getAccessToken(config);

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const transactionsheet = ss.getSheetByName('corptransactions');
  const journalsheet = ss.getSheetByName('corpjournal');
  const typessheet = ss.getSheetByName('typeids');

  const typeids = typessheet.getDataRange().getValues();
  for (const row of typeids) {
    const key = row[0];
    typeidArray[key] = row[1];
  }

  const parameters = {
    method: 'get',
    headers: {
      'Authorization': 'Bearer ' + config.access_token,
      'X-User-Agent': 'Steve Ronuken Wallet Updater'
    }
  };

  const url = `https://esi.evetech.net/latest/corporations/${corpId}/wallets/1/transactions/?datasource=tranquility`;

  let newmax = 0;
  const jsonFeed = UrlFetchApp.fetch(url, parameters).getContentText();
  const json = JSON.parse(jsonFeed);

  if (json) {
    for (const item of json) {
      if (parseInt(item.transaction_id) > config.maxcorptransactionid) {
        transactionsheet.appendRow([
          item.transaction_id,
          item.date,
          item.location_id,
          item.type_id,
          typeidArray[parseInt(item.type_id)],
          item.unit_price,
          item.quantity,
          item.client_id,
          item.is_buy,
          item.journal_ref_id
        ]);

        if (parseInt(item.transaction_id) > newmax) {
          newmax = parseInt(item.transaction_id);
        }
      }
    }

    if (newmax > config.maxcorptransactionid) {
      const documentProperties = PropertiesService.getDocumentProperties();
      documentProperties.setProperty('maxcorptransactionid', newmax);
    }
  }

  const journalUrl = `https://esi.evetech.net/latest/corporations/${corpId}/wallets/1/journal/?datasource=tranquility`;

  newmax = 0;
  const journalFeed = UrlFetchApp.fetch(journalUrl, parameters).getContentText();
  const journalJson = JSON.parse(journalFeed);

  if (journalJson) {
    for (const item of journalJson) {
      if (parseInt(item.ref_id) > config.maxcorpjournalid) {
        const transaction = [
          item.ref_id,
          item.ref_type,
          item.date,
          item.first_party_id,
          item.first_party_type,
          item.second_party_id,
          item.second_party_type,
          item.amount,
          item.balance,
          item.reason
        ];

        if (item.extra_info !== null) {
          transaction.push(item.extra_info.transaction_id);
          transaction.push(item.extra_info.system_id);
          transaction.push(item.extra_info.character_id);

          if (item.extra_info.transaction_id !== null) {
            transaction.push('=vlookup(' + item.extra_info.transaction_id + ',transactions!A:G,5,false)');
          }
        }

        journalsheet.appendRow(transaction);

        if (parseInt(item.ref_id) > newmax) {
          newmax = parseInt(item.ref_id);
        }
      }
    }

    if (newmax > config.maxcorpjournalid) {
      const documentProperties = PropertiesService.getDocumentProperties();
      documentProperties.setProperty('maxcorpjournalid', newmax);
    }
  }
}
