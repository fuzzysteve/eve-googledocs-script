async function loadAllVolumes(typeID, regionID = 10000002) {
  if (typeof typeID === 'undefined') {
    throw new Error('need typeid');
  }

  const url = `https://crest-tq.eveonline.com/market/${regionID}/history/?type=https://crest-tq.eveonline.com/inventory/types/${typeID}/`;
  const response = await fetch(url);
  const data = await response.json();
  const volumes = data.items.map(item => item.volume);

  return volumes;
}

function zeroFill(number, width) {
  const numStr = number.toString();
  width -= numStr.length;
  
  if (width > 0) {
    return '0'.repeat(width + (/\./.test(number) ? 2 : 1)) + numStr;
  }
  
  return numStr;
}

async function loadVolume(typeID, regionID = 10000002) {
  if (typeof typeID === 'undefined') {
    throw new Error('need typeid');
  }

  const url = `https://crest-tq.eveonline.com/market/${regionID}/history/?type=https://crest-tq.eveonline.com/inventory/types/${typeID}/`;
  const response = await fetch(url);
  const data = await response.json();
  const volumes = [];
  
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const month = d.getMonth() + 1;
  const yesterday = `${d.getFullYear()}-${zeroFill(month, 2)}-${zeroFill(d.getDate(), 2)}T00:00:00`;
  
  data.items.forEach(item => {
    if (item.date === yesterday) {
      volumes.push(item.volume);
    }
  });
  
  return volumes;
}

async function loadThirtyDayVolume(typeID, regionID = 10000002) {
  if (typeof typeID === 'undefined') {
    throw new Error('need typeid');
  }

  const url = `https://crest-tq.eveonline.com/market/${regionID}/history/?type=https://crest-tq.eveonline.com/inventory/types/${typeID}/`;
  const response = await fetch(url);
  const data = await response.json();
  const volumes = [];

  const d = new Date();
  const time = Date.UTC(d.getFullYear(), d.getMonth() + 1, d.getDate());
  const from = time - 2.592e+9;

  data.items.forEach(item => {
    const year = item.date.substring(0, 4);
    const month = item.date.substring(5, 7);
    const day = item.date.substring(8, 10);

    if (Date.UTC(year, month, day) >= from) {
      volumes.push(item.volume);
    }
  });

  return volumes;
}
