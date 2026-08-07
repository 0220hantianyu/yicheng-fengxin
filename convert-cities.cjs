// Convert QWeather China-City-List CSV to JSON for Mock adapter
const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, 'china-cities-raw.csv');
const outDir = path.join(__dirname, 'server', 'src', 'data');
const outPath = path.join(outDir, 'china-cities.json');

fs.mkdirSync(outDir, { recursive: true });

const content = fs.readFileSync(csvPath, 'utf-8');
const lines = content.split(/\r?\n/);

// Line 0 is version, Line 1 is header
const header = lines[1].split(',');
const dataLines = lines.slice(2);

// Find column indices
const cols = {};
header.forEach((h, i) => { cols[h.trim()] = i; });

console.log('Header columns:', JSON.stringify(cols));
console.log('Total data lines:', dataLines.length);

const cities = [];
const seenIds = new Set();
let errors = 0;

for (let idx = 0; idx < dataLines.length; idx++) {
  const line = dataLines[idx];
  if (!line || !line.trim()) continue;
  
  // Simple CSV parse (handle quotes)
  const parts = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQuote = !inQuote; continue; }
    if (ch === ',' && !inQuote) { parts.push(cur); cur = ''; continue; }
    cur += ch;
  }
  parts.push(cur);

  const idIdx = cols['Location_ID'];
  const nameIdx = cols['Location_Name_ZH'];
  const latIdx = cols['Latitude'];
  const lonIdx = cols['Longitude'];
  const adm1Idx = cols['Adm1_Name_ZH'];
  const adm2Idx = cols['Adm2_Name_ZH'];
  const countryIdx = cols['Country_Region_ZH'];

  if (idIdx === undefined || nameIdx === undefined) {
    errors++;
    continue;
  }

  const locId = (parts[idIdx] || '').trim();
  if (!locId || seenIds.has(locId)) continue;
  seenIds.add(locId);

  const nameZh = (parts[nameIdx] || '').trim();
  if (!nameZh) continue;

  cities.push({
    name: nameZh,
    id: locId,
    lat: (parts[latIdx] || '').trim(),
    lon: (parts[lonIdx] || '').trim(),
    adm1: (parts[adm1Idx] || '').trim(),
    adm2: (parts[adm2Idx] || '').trim(),
    country: (parts[countryIdx] || '').trim(),
  });
}

fs.writeFileSync(outPath, JSON.stringify(cities, null, 2), 'utf-8');

console.log('Generated ' + cities.length + ' cities -> ' + outPath);
console.log('File size: ' + fs.statSync(outPath).size + ' bytes');
console.log('Errors: ' + errors);

console.log('\n--- Sample (first 5) ---');
cities.slice(0, 5).forEach(c => console.log('  ' + c.name + ' (' + c.adm1 + ' ' + c.adm2 + ') id=' + c.id));

console.log('\n--- Xishuangbanna search ---');
cities.filter(c => c.name.includes('西双版纳') || c.adm1.includes('西双版纳') || c.adm2.includes('西双版纳'))
  .forEach(c => console.log('  ' + c.name + ' (' + c.adm1 + ' ' + c.adm2 + ') id=' + c.id));

console.log('\n--- Yunnan cities ---');
const yunnan = cities.filter(c => c.adm1.includes('云南'));
console.log('Total Yunnan cities: ' + yunnan.length);
yunnan.slice(0, 10).forEach(c => console.log('  ' + c.name + ' (' + c.adm2 + ')'));
