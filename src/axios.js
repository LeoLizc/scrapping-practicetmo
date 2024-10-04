import axios from "axios";
import https from "https";

const IMAGE_SERVICE_URL = 'https://imgtmo.com/uploads'; // Cambia esto a la URL real
const CLEAR_SERVICE_URL = 'https://zonatmo.com/view_uploads'; // Cambia esto a la URL real
const HTML_SERVICE_URL = 'https://zonatmo.com/viewer'; // Cambia esto a la URL real

export const imageInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  }),
  headers: {
    Referer: 'https://zonatmo.com'
  },
  baseURL: IMAGE_SERVICE_URL
});

export const clearInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  }),
  headers: {
    Referer: 'https://zonatmo.com'
  },
  baseURL: CLEAR_SERVICE_URL
});

export const htmlInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  }),
  headers: {
    Referer: 'https://zonatmo.com'
  },
  baseURL: HTML_SERVICE_URL
});