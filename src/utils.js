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