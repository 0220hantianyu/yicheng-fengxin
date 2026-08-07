console.log('START');
const http = require('http');
http.get('http://localhost:3001/api/health', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('HEALTH:', data);
    process.exit(0);
  });
}).on('error', (e) => {
  console.log('ERROR:', e.message);
  process.exit(1);
});
