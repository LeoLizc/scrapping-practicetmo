/**
 * @typedef {Object} Chapter
 * @property {string} name the name of the manga
 * @property {string} cap the name of the chapter
 * @property {string} url the complete url of the chapter
 * @property {string} code the code of the chapter
 * @property {string | undefined} next the code of the next chapter 
 */

(() => {
  const STORAGE_KEY = 'chapters';

  const url = window.location.href;
  const urlCode = url.split('/').pop();
  const title = document.title;
  const [name, cap] = title.split(' - ').filter(Boolean);

  /**
   * @type {Chapter[]}
   */
  const chapters = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  const index = chapters.findIndex((chapter) => chapter.name === name);

  const nextArrowDiv = document.querySelector('.chapter-next');
  const nextAnchor = nextArrowDiv?.querySelector('a');
  const nextUrl = nextAnchor?.href;
  const nextCode = nextUrl?.split('/').pop();

  /**
   * @type {Chapter}
   */
  const chapter = {
    name,
    cap,
    url,
    code: urlCode,
    next: nextCode,
  };

  if (index !== -1) {
    chapters[index] = chapter;
  } else {
    chapters.push(chapter);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(chapters));
})();