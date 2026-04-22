require('dotenv').config();
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const PEXELS_KEY = process.env.PEXELS_KEY;

const MIME = {
  '.html': 'text/html', '.css': 'text/css',
  '.js': 'application/javascript', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Pexels proxy endpoint
  if (req.method === 'GET' && req.url.startsWith('/api/images')) {
    const query = new URL(req.url, 'http://localhost').searchParams.get('q') || 'fashion';
    const pexelsReq = https.request({
      hostname: 'api.pexels.com',
      path: `/v1/search?query=${encodeURIComponent(query)}&per_page=3&orientation=portrait`,
      method: 'GET',
      headers: { 'Authorization': PEXELS_KEY }
    }, pexelsRes => {
      let data = '';
      pexelsRes.on('data', d => data += d);
      pexelsRes.on('end', () => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(data);
      });
    });
    pexelsReq.on('error', e => { res.writeHead(500); res.end('{}'); });
    pexelsReq.end();
    return;
  }

  // Groq proxy endpoint
  if (req.method === 'POST' && req.url === '/api/chat') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
      const parsed = JSON.parse(body);
      const payload = JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: parsed.messages
      });
      const options = {
        hostname: 'api.groq.com',
        path: '/openai/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Length': Buffer.byteLength(payload)
        }
      };
      const proxyReq = https.request(options, proxyRes => {
        let data = '';
        proxyRes.on('data', d => data += d);
        proxyRes.on('end', () => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(data);
        });
      });
      proxyReq.on('error', e => {
        res.writeHead(500);
        res.end(JSON.stringify({ error: e.message }));
      });
      proxyReq.write(payload);
      proxyReq.end();
    });
    return;
  }

  // Serve static files
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'text/plain' });
    res.end(data);
  });
});

server.listen(3000, () => console.log('StyleHub running at http://localhost:3000'));
