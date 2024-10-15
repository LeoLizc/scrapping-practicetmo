import app from './app.js';
import http from 'http';
import https from 'https';
import fs from 'fs';

import config from './config.js';

const httpServer = http.createServer(app);

httpServer.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

if (
  config.ssl
  && config.ssl.key
  && config.ssl.cert
) {
  const httpsServer = https.createServer({
    key: fs.readFileSync(config.ssl.key),
    cert: fs.readFileSync(config.ssl.cert),
  }, app);

  httpsServer.listen(config.ssl.port, () => {
    console.log(`Server running on port ${config.ssl.port}`);
  });
}