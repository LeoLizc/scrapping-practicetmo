import dotenv from 'dotenv';

dotenv.config();

export const config = Object.freeze({
  myDomain: process.env.MY_DOMAIN || 'http://localhost:3000',
  webDomain: process.env.WEB_DOMAIN || 'https://zonatmo.com',
  webDomainName: process.env.WEB_DOMAIN_NAME || 'zonatmo',
  imgDomain: process.env.IMG_DOMAIN || 'https://imgtmo.com',
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'secret',

  ssl: {
    key: process.env.SSL_KEY || '',
    cert: process.env.SSL_CERT || '',
    port: process.env.SSL_PORT || 3443,
  }
});

export default config;