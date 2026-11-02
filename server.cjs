const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
const files = new Set(['index.html', 'app.js', 'workout-plan.js', 'styles.css']);
const port = Number(process.env.PORT || 4173);
const server = http.createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const file = pathname === '/' ? 'index.html' : pathname.slice(1);
  if (!files.has(file)) { res.writeHead(404); res.end('Not found'); return; }
  try {
    const content = await fs.readFile(path.join(__dirname, file));
    res.writeHead(200, { 'Content-Type': types[path.extname(file)], 'Cache-Control': 'no-cache' });
    res.end(content);
  } catch { res.writeHead(500); res.end('Could not read file'); }
});
server.on('error', error => { console.error(`Không mở được ứng dụng: ${error.message}`); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`Nhịp Tập: http://127.0.0.1:${port}`));
