function greet () {
  const greetingModal = new bootstrap.Modal(document.getElementById('greetingModal'))
  greetingModal.show()
}

function instruct () {
  const instructionModal = new bootstrap.Modal(document.getElementById('instructionModal'))
  instructionModal.show()
}

const cacheNameUnused = 'greeted' // to clear the previous cache version
function deleteCache (cacheName) {
  caches
    .has(cacheName)
    .then(hasCache => {
      if (hasCache) {
        return caches.delete(cacheName)
      }
    })
    .catch(err => console.log(err))
}

function checkIndexPageFootprint () {
  if (!sessionStorage.getItem('visited') && !sessionStorage.getItem('played')) {
    greet()
  } else if (!sessionStorage.getItem('played')) {
    instruct()
  }
}

deleteCache(cacheNameUnused)
checkIndexPageFootprint()
