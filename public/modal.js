function greeting () {
  const greetingModal = new bootstrap.Modal(document.getElementById('greeting-modal'))
  greetingModal.show()
}

function cacheIndexPage () {
  caches
    .has('greeted')
    .then(hasCache => {
      if (!hasCache) {
        greeting()
        caches.open('greeted').then(cache => cache.add('/'))
      }
    })
    .catch(err => console.log(err))
}

cacheIndexPage()
