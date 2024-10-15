import config from "./config.js";

/**
 * 
 * @param {string} htmlString 
 * @returns 
 */
export function extractDisqusIdentifier(htmlString) {
  const regex = /this.page.identifier = ['"]([^'"]+)['"]/;

  const match = htmlString.match(regex);
  return match ? match[1] : null;
}

/**
 * 
 * @param {string} htmlString 
 * @returns 
 */
export function validateTMOUrl(url) {
  const regex = new RegExp(`^${config.webDomain}/viewer/[a-z0-9]+/(paginated|cascade)?$`);
  return regex.test(url);
}

/**
 * 
 * @param {string} url 
 * @returns 
 */
export function extractTMOId(url) {
  const regex = new RegExp(`${config.webDomain}/viewer/([a-z0-9]+)/(paginated|cascade)?$`);
  const match = url.match(regex);
  return match ? match[1] : null;
}