export async function getHTMLID(id) {
  try {
    const fetchOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'text/html',
        Referer: 'https://visortmo.com',
      },
    }

    const response = await fetch(`https://visortmo.com/view_uploads/${id}`, fetchOptions);

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`Failed to fetch HTML with status ${response.status}`);
    }

    /**
     * @type {string}
     */
    const htmlString = response.data;

    const ogUrlMatch = htmlString.match(/<meta property="og:url" content="([^"]+)"\/?>/);
    const ogUrl = ogUrlMatch ? ogUrlMatch[1] : '';

    if (ogUrl.startsWith('https://visortmo.com/viewer')) {
      console.log('caso 1')
      // Extract the id from the URL
      const sections = ogUrl.split('/');
      const id = sections[sections.length - 2];

      return id;
    } else if (ogUrl.startsWith('https://visortmo.com/view_uploads')) {
      console.log('caso 2')
      const id = extractUniqid(htmlString);

      if (id) {
        return id;
      }
    }

  } catch (error) {
    console.error(error);
  }
  return 'nose';
}

function extractUniqid(html) {
  const regex = /uniqid:\s*'([^']+)'/;
  const match = html.match(regex);
  return match ? match[1] : null;
}