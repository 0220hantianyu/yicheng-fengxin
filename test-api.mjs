import http from 'http';

function testApi(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3001${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

try {
  const health = await testApi('/api/health');
  console.log('HEALTH:', health);

  const status = await testApi('/api/weather/status');
  console.log('STATUS:', status);

  const geo = await testApi('/api/geo/search?q=%E5%8C%97%E4%BA%AC');
  console.log('GEO:', geo);

  console.log('\n=== ALL API TESTS PASSED ===');
} catch (e: any) {
  console.error('TEST FAILED:', e.message);
  process.exit(1);
}
