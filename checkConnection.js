const http = require('http');

const options = {
  hostname: '127.0.0.1',
  port: 8000,
  path: '/',
  method: 'GET',
  timeout: 9000,
};

const req = http.request(options, (res) => {
  console.log('Response received!');
});

req.on('error', (e) => {
  console.error(`Request error: ${e.message}`);
});

req.end();
