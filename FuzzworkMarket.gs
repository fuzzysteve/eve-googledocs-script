/**
 * @function
 * @alias loadRegionAggregates
 * @summary Requires a list of typeids, so something like Types!A:A
 * Returns aggregated market data for given type IDs from https://market.fuzzwork.co.uk.
 *
 * @description The function takes 3 arguments: 
 * typeIds (an array of type IDs),
 * regionId (a string representing the region ID),
 * and showHeaders (a flag indicating whether to include headers in the output).
 * The function returns an array of market data, with each row representing a type ID.
 * The function uses UrlFetchApp.fetch to retrieve data from the website and parse it as JSON.
 * The retrieved data is then processed and formatted into a 2D array, with the headers included based on the showHeaders argument.
 * The Math.random() * 1000 calculation is used to introduce a random sleep time between requests to the server in order to reduce the load on the server.
 *
 * @see https://docs.google.com/spreadsheets/d/1IixV0eNqg19FE6cLzb83G1Ucb0Otl-Jnvm6csAlPKwo/edit?usp=sharing for an example
 *
 * @param {number[]} dirtyTypeIds - An array of type IDs to retrieve market data for.
 * @param {number} regionId - The region ID from which to retrieve market data.
 * @param {boolean} showHeaders - A flag indicating whether to include headers in the output.
 *
 * @returns {Array} - An array of market data, with each row representing a type ID.
 *
 * @throws {Error} If dirtyTypeIds is falsey.
 */
function loadRegionAggregates(
  typeIds = false,
  regionId = 10000002,
  showHeaders = true
) {
  const prices = [];

  const baseUrl = `https://market.fuzzwork.co.uk/aggregates/`;
  const options = { method: `get`, payload: `` };

  if (!typeIds) {
    throw new Error(`Invalid "dirtyTypeIds" variable!`);
  } else {

    const typeIdCleaner = (dirtyTypeIds) => [
      ...new Set(dirtyTypeIds
        .flat(Infinity)
        .filter(Number)
        .sort((a, b) => a - b)
      )
    ];
    const cleanTypeIds = typeIdCleaner(typeIds);

    if (showHeaders) {
      prices.push([
        `Type ID`,

        `Buy Weighted Average`,
        `Buy Median`,
        `Buy Volume`,
        `Buy Order Count`,
        //`Lowest Bid`,
        `Highest Bid`,
        `Top 5% Average`,

        `Sell Weighted Average`,
        `Sell Median`,
        `Sell Volume`,
        `Sell Order Count`,
        `Lowest Offer`,
        //`Highest Offer`,
        `Bottom 5% Average`
      ]);
    }
    
    while (cleanTypeIds.length > 0) {
      Utilities.sleep(Math.random() * 5000);

      const chunkSize = Math.min(100, cleanTypeIds.length);

      const typeChunk = cleanTypeIds.splice(0, chunkSize);
      const encodedTypes = typeChunk.join(`,`);

      const query = `?region=${regionId}&types=${encodedTypes}`;
      const url = `${baseUrl}${query}`;

      const json = JSON.parse(UrlFetchApp.fetch(url, options).getContentText());

      typeChunk.forEach(type => {
        const { buy, sell } = json[type];
        prices.push([
          +type,

          +buy.weightedAverage,
          +buy.median,
          +buy.volume,
          +buy.orderCount,
          //+buy.min,
          +buy.max,
          +buy.percentile,

          +sell.weightedAverage,
          +sell.median,
          +sell.volume,
          +sell.orderCount,
          +sell.min,
          //+sell.max,
          +sell.percentile
        ]);
      });
    }

    return prices;
  }
}
