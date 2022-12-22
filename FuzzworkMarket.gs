/**
 * Returns aggregated market data for given type IDs from https://market.fuzzwork.co.uk.
 * @param {array} typeIds - A 2-dimensional array of type ID numbers
 * @param {number | string} regionId - The ID number for the Region for which to get data
 * @param {boolean} showHeaders - If true, the first "row" of the results will contain column headers
 * @returns {array} prices
 */
function loadRegionAggregates(
  typeIds,
  regionId = 10000002,
  showHeaders = true
) {
  const prices = [];
  try {
    if (typeof typeIds === `undefined`) {
      throw `Required variable, "typeIds" is not defined!`;
    }
    const dirtyTypeIds = [];
    const url = `https://market.fuzzwork.co.uk/aggregates/?region=${regionId}&types=`;
    const options = { method: `get`, payload: `` };
    typeIds.forEach(row => {
      row.forEach(cell => {
        if (typeof cell === `number`) {
          dirtyTypeIds.push(cell);
        }
      });
    });
    const cleanTypeIds = dirtyTypeIds.filter((value, index, array) => {
      return array.indexOf(value) === index;
    });
    if (showHeaders) {
      prices.push([
        `Type ID`,
        `Buy volume`,
        `Buy Weighted Average`,
        `Max Buy`,
        `Min Buy`,
        `Buy Std Dev`,
        `Median Buy`,
        `Percentile Buy Price`,
        `Sell volume`,
        `Sell Weighted Average`,
        `Max sell`,
        `Min Sell`,
        `Sell Std Dev`,
        `Median Sell`,
        `Percentile Sell Price`
      ]);
    }
    function chunks(array, size = 100) {
      try {
        if (typeof array === `undefined`) {
          throw `Required variable, "array" is not defined!`;
        }
        if (!array) return [];
        const chunk = array.splice(0, size);
        return !chunk.length ? array : [chunk].concat(chunks(array, size));
      } catch (error) {
        // TODO (developer) Handle Exception
        console.error(
          `chunk({${typeof array}} ${array}, {${typeof size}} ${size}) failed with error: ${error.message
          }.`
        );
      }
    }
    chunks(cleanTypeIds, 100).forEach(chunk => {
      Utilities.sleep(Math.random() * 200);
      const urlTypes = chunk.join(',').replace(/,$/, '');
      const json = JSON.parse(
        UrlFetchApp.fetch(`${url}${urlTypes}`, options).getContentText()
      );
      if (json) {
        chunk.forEach(entry => {
          const price = [
            parseInt(entry),
            parseInt(json[entry].buy.volume),
            parseInt(json[entry].buy.weightedAverage),
            parseFloat(json[entry].buy.max),
            parseFloat(json[entry].buy.min),
            parseFloat(json[entry].buy.stddev),
            parseFloat(json[entry].buy.median),
            parseFloat(json[entry].buy.percentile),
            parseInt(json[entry].sell.volume),
            parseFloat(json[entry].sell.weightedAverage),
            parseFloat(json[entry].sell.max),
            parseFloat(json[entry].sell.min),
            parseFloat(json[entry].sell.stddev),
            parseFloat(json[entry].sell.median),
            parseFloat(json[entry].sell.percentile)
          ];
          prices.push(price);
        });
      }
    });
  } catch (error) {
    // TODO (developer) Handle Exception
    prices.push(error.message);
    console.error(
      `loadRegionAggregates({${typeof typeIds}} ${typeIds}, {${typeof regionId}} ${regionId}, {${typeof showHeaders}} ${showHeaders}) failed with error: ${error.message
      }.`
    );
  } finally {
    return prices;
  }
}
