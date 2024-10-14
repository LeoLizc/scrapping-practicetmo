(function() {
  const anchors = document.querySelectorAll('.chapter-arrow a');

  for (let i = 0; i < anchors.length; i++) {
    let anchor = anchors[i];
    if (
      anchor.hasAttribute('x-failed')
      && anchor.hasAttribute('raw-id')
    ) {
      console.log('Fetching new ID for anchor:', anchor);
      const rawId = anchor.getAttribute('raw-id');
      let attempts = 0;
      const maxAttempts = 2;

      function fetchNewId() {
        fetch(`/api/clear/${rawId}`, {
          headers: {
            Referer: window.location.href,
          }
        })
          .then(response => response.json())
          .then(data => {
            if (data) {
              anchor.removeAttribute('x-failed');
              anchor.removeAttribute('raw-id');
              anchor.setAttribute('href', `/viewer/${data}`);
              console.log('New ID fetched for anchor:', anchor);
            } else if (attempts < maxAttempts) {
              attempts++;
              setTimeout(fetchNewId, 30_000);
            } else {
              console.error('Failed to fetch new ID for anchor:', anchor);
            }
          })
          .catch(error => {
            console.error('Error fetching new ID:', error);
            if (attempts < maxAttempts) {
              attempts++;
              setTimeout(fetchNewId, 30_000);
            } else {
              console.error('Failed to fetch new ID for anchor:', anchor);
            }
          });
      }

      fetchNewId();
    }
  }
})()