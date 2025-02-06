// @ts-nocheck

(()=>{

  /**
   * 
   * @param {string} id
   * @returns {Promise<string | undefined>} the code of the next chapter
   */
  function checkForUpdate(id) {
    console.log('Checking for update');
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(undefined);
      }, 3000);
    });

    return fetch(`/api/checkNext/${id}`)
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to fetch the next chapter');
        }
      })
      .then((data) => {
        return data.code;
      })
      .catch((error) => {
        console.error(error);
        return undefined;
      });
  }

  /**
   * 
   * @returns {function(number): [number | null, Promise<void>]}
   */
  function genWaitSeconds() {
    const blocker = document.getElementById('blocker');
    const counter = document.getElementById('counter');

    if (!blocker || !counter) {
      console.error("Couldn't find the blocker or counter element");
      return () => [null, Promise.resolve()];
    }

    return function(seconds) {
      blocker.classList.remove('hide');

      let count = seconds;
      counter.innerHTML = `${count}`;

      /**
       * @type {(function(any): void) | undefined}
       */
      let resolver;

      const promise = new Promise((resolve) => {
        resolver = resolve;
      });

      const interval = setInterval(() => {
        count--;
        counter.innerHTML = `${count}`;

        if (count <= 0) {
          clearInterval(interval);
          blocker.classList.add('hide');
          if (resolver) {
            resolver(undefined);
          }
        }
      }, 1000);

      setTimeout(() => {
        clearInterval(interval);
        blocker.classList.add('hide');
      }, seconds * 1000 + 100);

      return [interval, promise];
    }
  }

  const waitSeconds = genWaitSeconds();

  if ("content" in document.createElement("template")) {
    const chapterSection = document.getElementById('chapters');
    const chapterTemplate = document.getElementById('chapter-item-template');

    if (!chapterSection || !chapterTemplate) {
      console.error("Couldn't find the chapter section or the chapter template");
      return;
    }

    if (!(chapterTemplate instanceof HTMLTemplateElement)) {
      console.error("The chapter template is not an HTML template element");
      return;
    }

    // Load the chapters from the local storage
    /**
     * @type {Chapter[]}
     */
    const chapters = JSON.parse(localStorage.getItem('chapters')??'[]');

    // draw the chapters
    chapters.forEach((chapter, index) => {
      /**
       * @type {DocumentFragment}
       */
      // @ts-ignore
      const clone = chapterTemplate.content.cloneNode(true);
      
      clone.querySelector('.chapter-title').textContent = chapter.name;
      clone.querySelector('.chapter-number').textContent = chapter.cap;
      
      // ANCHOR
      const chapterAnchor = clone.querySelector('a');
      chapterAnchor.href = chapter.url;

      // - BUTTONS SECTION
      const chapterSideSection = clone.querySelector('.chapter-side');
      const viewNextAnchor = chapterSideSection.querySelector('a.contents');
      const reloadButton = clone.querySelector('.reload-chapter-alert');
      
      //* RELOAD BUTTON
      reloadButton.addEventListener('click', async () => {
        const _ = waitSeconds(12);
        const code = await checkForUpdate(chapter.code);
        if (code) {
          chapter.next = code;
          localStorage.setItem('chapters', JSON.stringify(chapters));
          viewNextAnchor.href = `/viewer/${code}`;
          chapterSideSection.classList.add('alert');
        }
      });

      //* VIEW NEXT ANCHOR
      viewNextAnchor.href = `/viewer/${chapter.next}`;


      if (!chapter.next) {
        chapterSideSection.classList.remove('alert');
      } else {
        chapterSideSection.classList.add('alert');
      }


      chapterSection.appendChild(clone);
    });
  } else {
    console.error("Your browser doesn't support HTML template elements");
  }
})()