/**
 * Reworked from https://gist.github.com/kriberg/abcae71b80213ae36b8f as google changed the way you handle xml
 *
 * load
 * https://www.fuzzwork.co.uk/resources/typeids.csv into a sheet called typeid
 * https://www.fuzzwork.co.uk/resources/stations.csv into a sheet called station
 *
 * you can always use =importdata() to do the import, if you want to. it'll make the sheet a bit slower, but things will update automatically.
 *
 **/

// globals to avoid stack size roof
var assets = new Array();
var stationArray = new Array();
var typeidArray = new Array();

function office2station(locationID) {
	var locid = parseInt(locationID);
	if (locid >= 66000000 && locid <= 66014933)
		return locid - 6000001;
	if (locid >= 66014934 && locid <= 67999999)
		return locid - 6000000;
	return locid;

}

function parseAssets(rows, parent, locationID, location) {
	for (var i = 0; i < rows.length; i++) {
		rawQuantity = null;

		if (rows[i].getAttribute("locationID")) {
			locationID = office2station(rows[i].getAttribute("locationID").getValue());

			if (stationArray) {
				var key = locationID + "_";
				if (stationArray[key])
					locationID = stationArray[key];
			}
		}
		if (location) {
			if (location != locationID) {
				continue;
			}
		}
		if (rows[i].getAttribute("rawQuantity")) {
			rawQuantity = rows[i].getAttribute("rawQuantity").getValue();
		}
		var asset = [rows[i].getAttribute("itemID").getValue(),
			rows[i].getAttribute("typeID").getValue(),
			parseInt(rows[i].getAttribute("typeID").getValue()),
			parseInt(rows[i].getAttribute("quantity").getValue()),
			rows[i].getAttribute("flag").getValue(),
			rows[i].getAttribute("singleton").getValue(),
			rawQuantity,
			locationID,
			parent];

		if (typeidArray) {
			var key = asset[1] + "_";
			if (typeidArray[key])
				asset[1] = typeidArray[key];
		}
		assets.push(asset);
		if (rows[i].getChild("rowset")) {
			parseAssets(rows[i].getChild("rowset").getChildren("row"),
				asset[0],
				asset[7]);
		}
	}
}

/**
 * @param {string} type api key type. corp or char
 * @param {number} keyID api key id
 * @param {string} vCode api vcode
 * @param {number} characterID Character id for api key
 * @param {number=} location location id to limit to. Optional
 * @return {array} array of assets
 * @customfunction
 */

function assetList(type, keyID, vCode, characterID, location) {
	var url = "https://api.eveonline.com/" + type + "/AssetList.xml.aspx?keyID=" + keyID + "&vCode=" + vCode + "&characterID=" + characterID;
	var parameters = {
		method : "get",
		payload : ""
	};

	var xmlFeed = UrlFetchApp.fetch(url, parameters).getContentText();
	var xml = XmlService.parse(xmlFeed);

	var ss = SpreadsheetApp.getActiveSpreadsheet();
	var stationSheet = ss.getSheetByName("station");
	var typeidSheet = ss.getSheetByName("typeid");
	var stations = stationSheet.getDataRange().getValues();
	for (var i = 0; i < stations.length; i++) {
		var key = stations[i][0] + '_';
		stationArray[key] = stations[i][1];
	}
	var typeids = typeidSheet.getDataRange().getValues();
	for (var i = 0; i < typeids.length; i++) {
		var key = typeids[i][0] + '_';
		typeidArray[key] = typeids[i][1];
	}
	assets.push(["item id", "Type Name", "Type ID", "quantity", "flag", "singleton", "raw Quantity", "location id", "parent"]);
	if (xml) {
		var rows = xml.getRootElement().getChild("result").getChild("rowset").getChildren("row");
		parseAssets(rows, null, null, location);
	}
	return assets;
}
