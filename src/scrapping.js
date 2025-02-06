// @ts-check

import { JSDOM } from 'jsdom';
import { exampleInjectedJS } from './examplehtml.js';
import { clearInstance, htmlInstance } from './axios.js';
import config from './config.js';
import { extractDisqusIdentifier } from './utils.js';

/**
 * 
 * @param {string} id 
 * @returns {Promise<string | null>}
 */
export async function getHTMLID(id) {
  try {
    const response = await clearInstance.get(`/${id}`);

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`Failed to fetch HTML with status ${response.status}`);
    }

    /**
     * @type {string}
     */
    const htmlString = response.data;

    const ogUrlMatch = htmlString.match(/<meta property="og:url" content="([^"]+)"\/?>/);
    const ogUrl = ogUrlMatch ? ogUrlMatch[1] : '';

    if (ogUrl.startsWith(`${config.webDomain}/viewer`)) {
      // Extract the id from the URL
      const sections = ogUrl.split('/');
      const id = sections[sections.length - 2];

      return id;
    } else if (ogUrl.startsWith(`${config.webDomain}/view_uploads`)) {
      const id = extractUniqid(htmlString);

      if (id) {
        return id;
      }
    }

  } catch (error) {
    console.error(error);
  }
  return null;
}

function extractUniqid(html) {
  const regex = /uniqid:\s*'([^']+)'/;
  const match = html.match(regex);
  return match ? match[1] : null;
}

// Función para limpiar el HTML, eliminar <script> e <iframe> e inyectar el alert
export async function cleanAndInject(htmlString) {
  const disqusId = extractDisqusIdentifier(htmlString);
  const dom = new JSDOM(htmlString);
  const document = dom.window.document;

  // Eliminar todas las etiquetas <script>
  const scripts = document.querySelectorAll('script');
  scripts.forEach(script => script.remove());

  // Eliminar todas las etiquetas <iframe>
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach(iframe => iframe.remove());

  // Inyectar un script
  const newScript = document.createElement('script');
  newScript.type = 'text/javascript';
  newScript.textContent = exampleInjectedJS(disqusId);
  document.body.appendChild(newScript);

  // Convertir rutas relativas en absolutas (prefijando con 'http://localhost:3000')
  const baseURL = config.webDomain;

  // Procesar atributos href y src
  ['a[href]', 'img[src]', 'link[href]', 'script[src]'].forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      const attr = element.hasAttribute('href') ? 'href' : 'src';
      const url = element.getAttribute(attr);
      if (url && !url.startsWith('http') && !url.startsWith('//')) {
        // Prefijar la ruta relativa con la base URL
        element.setAttribute(attr, `${baseURL}${url.startsWith('/') ? '' : '/'}${url}`);
      }
    });
  });

  /**
   * 
   * @param {string | undefined | null} url 
   * @returns 
   */
  function processImageUrl(url) {
    if (url && url.startsWith('https://imgtmo.com/uploads/')) {
      const urlParts = url.split('/');
      const imageId = urlParts[urlParts.length - 1];
      const pageId = urlParts[urlParts.length - 2];
      const date = urlParts[urlParts.length - 3];
      return `/api/image/${date}/${pageId}/${imageId}`;
    }

    return null;
  }

  // Procesar imagenes absulutas
  ['img[src]'].forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      let url = element.getAttribute('src');
      let newUrl = processImageUrl(url);
      if (newUrl) {
        element.setAttribute('src', newUrl);
      }

      url = element.getAttribute('data-src');
      newUrl = processImageUrl(url);
      if (newUrl) {
        element.setAttribute('data-src', newUrl);
      }
    });
  });

  // add script https://cdn.jsdelivr.net/npm/lazyload@2.0.0-rc.2/lazyload.js to header
  const lazyLoadScript = document.createElement('script');
  lazyLoadScript.src = 'https://cdn.jsdelivr.net/npm/lazyload@2.0.0-rc.2/lazyload.js';
  document.head.appendChild(lazyLoadScript);

  // add script to initialize lazyload
  const lazyLoadInitScript = document.createElement('script');
  lazyLoadInitScript.textContent = `document.addEventListener("DOMContentLoaded", function() {
    let images = document.querySelectorAll('img.viewer-img');
    root = window;

    LazyLoad.prototype.init = function() {

      /* Without observers load everything and bail out early. */
      if (!root.IntersectionObserver) {
        this.loadImages();
        return;
      }

      let self = this;
      let observerConfig = {
        root: this.settings.root,
        rootMargin: this.settings.rootMargin,
        threshold: [this.settings.threshold]
      };

      this.observer = new IntersectionObserver(function(entries) {
        Array.prototype.forEach.call(entries, function (entry) {
          if (entry.isIntersecting) {
            self.observer.unobserve(entry.target);
            let src = entry.target.getAttribute(self.settings.src);
            let srcset = entry.target.getAttribute(self.settings.srcset);
            if ("img" === entry.target.tagName.toLowerCase()) {
              // Remove all target inline styles
              entry.target.setAttribute('style', '');
              if (src) {
                entry.target.src = src;
              }
              if (srcset) {
                entry.target.srcset = srcset;
              }
            } else {
              entry.target.style.backgroundImage = "url(" + src + ")";
            }
          }
        });
      }, observerConfig);

      Array.prototype.forEach.call(this.images, function (image) {
        self.observer.observe(image);
      });
    }
    
    new LazyLoad(images, {
      root: null,
      rootMargin: '50%',
      threshold: 0
    });
  });`;
  document.body.appendChild(lazyLoadInitScript);

  // añadir clases al body y al nav
  document.body.classList.add('dark-mode');
  document.querySelectorAll('nav')?.forEach(nav => nav.classList.add('navbar-dark', 'bg-dark'));

  // añadir clases al main-container
  document.querySelector('#main-container')?.classList.add('container-fluid', 'p-0')

  //replace next and previous anchor tags href
  const anchors = document.querySelectorAll('.chapter-arrow a');

  for (let i = 0; i < anchors.length; i++) {
    let anchor = anchors[i];
    let url = anchor.getAttribute('href');
    if (url && url.startsWith(`${config.webDomain}/view_uploads`)) {
      const id = url.slice(`${config.webDomain}/view_uploads`.length + 1).split('/')[0];
      const newId = await getHTMLID(id ?? '');

      if (newId) {
        anchor.setAttribute('href', `/viewer/${newId}`);
      } else {
        anchor.setAttribute('href', '#');
        anchor.toggleAttribute('x-failed');
        anchor.setAttribute('raw-id', id);
      }
    }
  }

  const viewerScript = document.createElement('script');
  viewerScript.src = '/scripts/viewer.js';
  document.body.appendChild(viewerScript);

  const saveChapScript = document.createElement('script');
  saveChapScript.src = '/scripts/chapter-saver.js';
  saveChapScript.type = 'module';
  document.head.appendChild(saveChapScript);

  const viewerStyle = document.createElement('link');
  viewerStyle.rel = 'stylesheet';
  viewerStyle.href = '/styles/viewer.css';
  document.head.appendChild(viewerStyle);

  return document.documentElement.outerHTML;
}

export async function getHTML(id) {
  try {
    const response = await htmlInstance.get(`/${id}/cascade`);

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`Failed to fetch HTML with status ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error(error);
  }

  return null;
}