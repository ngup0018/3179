const fs = require('fs');
const path = require('path');

const GEO = path.join(__dirname, '..', 'data', 'abs_sa2_boundaries_simplified.geojson');
const CSV = path.join(__dirname, '..', 'data', 'census_sa2_clean.csv');
const OUT = path.join(__dirname, '..', 'data', 'census_sa2_with_names.csv');

// safe CSV split (splits on commas not inside quotes)
function csvSplit(line) {
  return line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
}
function csvEscape(val) {
  if (val === null || val === undefined) return '';
  const s = String(val);
  if (s.includes('"')) return '"' + s.replace(/"/g, '""') + '"';
  if (s.includes(',') || s.includes('\n') || s.includes('\r')) return '"' + s + '"';
  return s;
}

try {
  const geo = JSON.parse(fs.readFileSync(GEO, 'utf8'));
  const nameByCode = new Map();
  if (geo && Array.isArray(geo.features)) {
    for (const f of geo.features) {
      const p = f.properties || {};
      const code = String(p.SA2_CODE21 || p.SA2_MAIN11 || p.SA2_CODE || '').trim();
      const name = (p.SA2_NAME21 || p.SA2_NAME || '').trim();
      if (code) nameByCode.set(code, name || code);
    }
  } else {
    console.warn('geojson features not found or invalid');
  }

  const csvText = fs.readFileSync(CSV, 'utf8');
  const lines = csvText.split(/\r?\n/);
  if (lines.length < 2) throw new Error('CSV appears empty or only header');

  const headerLine = lines[0].trim();
  const header = csvSplit(headerLine).map(h => h.trim());
  // find code and name header indexes (case-insensitive)
  function findHeaderIdx(cands) {
    const low = header.map(h => h.toLowerCase());
    for (const c of cands) {
      const i = low.indexOf(c.toLowerCase());
      if (i >= 0) return i;
    }
    return -1;
  }

  const codeIdx = findHeaderIdx(['SA2_CODE21','SA2_CODE','SA2_MAIN11','sa2_code21']);
  let nameIdx = findHeaderIdx(['SA2_NAME21','SA2_NAME','SA2_NAME_21','region_name']);

  // if name column not present, append it
  if (nameIdx === -1) {
    header.push('SA2_NAME21');
    nameIdx = header.length - 1;
  }

  const outLines = [];
  outLines.push(header.map(csvEscape).join(','));

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line || !line.trim()) continue;
    const cols = csvSplit(line);
    // ensure cols length matches header length
    while (cols.length < header.length) cols.push('');
    const code = (codeIdx >= 0 ? (cols[codeIdx] || '').trim() : '') || '';
    let name = '';
    // prefer existing CSV name if present
    if (nameIdx >= 0 && cols[nameIdx] && cols[nameIdx].trim()) {
      name = cols[nameIdx].trim().replace(/^"|"$/g, '');
    }
    if (!name && code) {
      const gname = nameByCode.get(code);
      if (gname) name = gname;
    }
    if (!name && code) name = code; // fallback to code
    // write back
    cols[nameIdx] = name;
    outLines.push(cols.map(csvEscape).join(','));
  }

  fs.writeFileSync(OUT, outLines.join('\n'), 'utf8');
  console.log('Wrote', OUT);
  console.log('You can now point your viz to:', path.relative(process.cwd(), OUT));
} catch (err) {
  console.error('Error:', err.message || err);
  process.exit(1);
}