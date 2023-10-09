// Import required libraries
const fetch = require('node-fetch');

// Function to load volumes
async function loadVolumes(typeID, regionID = 10000002) {
  if (typeof typeID === 'undefined') {
    throw new Error('Need typeid');
  }

  const url = `https://crest-tq.eveonline.com/market/${regionID}/history/?type=https://crest-tq.eveonline.com/inventory/types/${typeID}/`;
  const response = await fetch(url);
  const data = await response.json();

  if (!data) {
    return [];
  }

  return data.items.map((item) => item.volume);
}

// Function to zero-fill a number
function zeroFill(number, width) {
  const numberStr = number.toString();
  if (numberStr.length >= width) {
    return numberStr;
  }

  const padding = '0'.repeat(width - numberStr.length);
  return padding + numberStr;
}

// Function to load volumes for the last 30 days
async function loadThirtyDayVolumes(typeID, regionID = 10000002) {
  if (typeof typeID === 'undefined') {
    throw new Error('Need typeid');
  }

  const url = `https://crest-tq.eveonline.com/market/${regionID}/history/?type=https://crest-tq.eveonline.com/inventory/types/${typeID}/`;
  const response = await fetch(url);
  const data = await response.json();

  if (!data) {
    return [];
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return data.items
    .filter((item) => new Date(item.date) >= thirtyDaysAgo)
    .map((item) => item.volume);
}

// Example usage:
async function main() {
  try {
    const typeID = 12345; // Replace with your desired type ID
    const allVolumes = await loadVolumes(typeID);
    const thirtyDayVolumes = await loadThirtyDayVolumes(typeID);
    console.log('All Volumes:', allVolumes);
    console.log('30-Day Volumes:', thirtyDayVolumes);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
