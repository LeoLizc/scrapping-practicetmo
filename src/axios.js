import axios from "axios";
import https from "https";
import config from "./config.js";
import adapter from "./node_modules/axios/lib/adapters/fetch.js";

const IMAGE_SERVICE_URL = `${config.imgDomain}/uploads`; // Cambia esto a la URL real
const CLEAR_SERVICE_URL = `${config.webDomain}/view_uploads`; // Cambia esto a la URL real
const HTML_SERVICE_URL = `${config.webDomain}/viewer`; // Cambia esto a la URL real

export const imageInstance = axios.create({
  adapter,
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  }),
  headers: {
    Referer: config.webDomain
  },
  baseURL: IMAGE_SERVICE_URL
});

export const clearInstance = axios.create({
  adapter,
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  }),
  headers: {
    Referer: config.webDomain
  },
  baseURL: CLEAR_SERVICE_URL
});

export const htmlInstance = axios.create({
  adapter,
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  }),
  headers: {
    Referer: config.webDomain
  },
  baseURL: HTML_SERVICE_URL
});