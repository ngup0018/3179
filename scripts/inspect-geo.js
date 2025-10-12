const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'data', 'abs_sa2_boundaries.geojson');
const raw = fs.readFileSync(p, 'utf8');
const geo = JSON.parse(raw);
const features = geo.features || [];
console.log('features', features.length);
const stats = features.map((f, i) => {
  const type = f.geometry && f.geometry.type;
  let coords = [];
  if (!f.geometry) return {i, type: 'null', name: f.properties && f.properties.SA2_NAME21};
  if (type === 'Polygon') {
    coords = f.geometry.coordinates.flat(1);
  } else if (type === 'MultiPolygon') {
    coords = f.geometry.coordinates.flat(2);
  } else {
    coords = [];
  }
  const lons = coords.map(c => c[0]);
  const lats = coords.map(c => c[1]);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const extent = (maxLon - minLon) * (maxLat - minLat);
  return {i, name: f.properties && f.properties.SA2_NAME21, code: f.properties && f.properties.SA2_CODE21, type, minLon, maxLon, minLat, maxLat, extent, coordsCount: coords.length};
});
const sorted = stats.filter(s => s && s.coordsCount).sort((a,b)=>b.extent - a.extent);
console.log('Top 10 largest extents (approx):');
console.log(sorted.slice(0,10));
const geomCounts = stats.reduce((acc,s)=>{acc[s.type]= (acc[s.type]||0)+1; return acc},{});
console.log('geometry type counts:', geomCounts);
const extreme = sorted[0];
console.log('Largest extent feature:', extreme);
