const spareText = ['Artificial Intelligence (AI) has become an integral part of our lives, revolutionizing various industries and altering the way we perceive the world. With its advancements, AI applications are ubiquitous, ranging from smart assistants to autonomous vehicles. The benefits are undeniable, as AI enhances efficiency, accuracy, and convenience across sectors such as healthcare, finance, and manufacturing. However, concerns accompany the accelerated adoption of AI. Ethical considerations arise regarding data privacy, bias in algorithms, and potential job displacement. Acknowledging these challenges, researchers and policymakers strive to develop responsible AI frameworks. AI\'s transformative capabilities promise both incredible opportunities and substantial responsibilities. It is crucial to strike a balance between innovation and safeguards, ensuring AI remains a force for good in our rapidly evolving world. Embracing this technological marvel with vigilance and wisdom will lead us toward a brighter future where AI and humanity coexist harmoniously.', 'apple bicycle butterfly chocolate dolphin eiffel tower forest friendship galaxy guitar happiness journey keyboard library marathon moonlight mountain parrot pineapple rainbow serendipity serenity strawberry summer sunshine telescope universe waterfall whisper winter salad hiked lake jagged shield defies lake shade flake dish gas fake deal skate hiked badge aisle flash gasp jail quiet rude tower rope equip rapid idea port diary water dart ear duty riot wheat proud quiet patio wire quiz box mix zinc save mice bean zoom cube oven vice sum maze bike voice foam nix tube vine scan maze analyze biology chemistry democracy equation fascinating geography historical imagination journalism knowledge literature mathematics negotiation opportunity psychology questionnaire revolutionary sustainable technology unique variable wildlife xenophobia youthful zeal abundant benevolent collaboration diligent ephemeral fortitude gravity harmonious integrity jubilant kinetic luminous metaphor nostalgia']
let spareTextIndex = 0

const words = document.getElementById('words')
const timer = document.querySelector('.timer')
const resetBtn = document.getElementById('reset')
const switchBtn = document.getElementById('switch')
const WPM = document.querySelector('.WPM')
const AR = document.querySelector('.AR')
const comment = document.getElementById('comment')
const greetingModal = document.getElementById('greetingModal')
const instructionModal = document.getElementById('instructionModal')
let id = 0
let currentSpan
let list
let keydownTimes = 0
let timerID
let typeAllowed = true

function text2HTML (text) {
  let htmlText = ''
  if (Array.isArray(text)) {
    let spanId = 0
    text.forEach(word => {
      word.split('').forEach(e => {
        htmlText += `<span id="${spanId}" class="inwords">${e}</span>`
        spanId++
      })
      htmlText += `<span id="${spanId}" class="inwords space"> </span>`
      spanId++
    })
  } else {
    const typingArr = Array.from(text)
    typingArr.forEach((e, i) => {
      if (e === ' ') {
        htmlText += `<span id="${i}" class="inwords space">${e}</span>`
      } else {
        htmlText += `<span id="${i}" class="inwords">${e}</span>`
      }
    })
    htmlText += '<p id="testText" hidden></p>'
  }
  words.innerHTML = htmlText
}
function typeAChar (e) {
  if (id === 0 && !timerID) { // avoid setting the second timer when id === 0
    setTimer()
  }
  currentSpan = document.getElementById(id)
  if (!currentSpan) {
    sendResult()
    return
  }
  if (id % 720 === 0 && id !== 0) {
    currentSpan.scrollIntoView()
  }
  list = currentSpan.classList
  if (currentSpan.classList.contains('correct')) return
  if (e.key === currentSpan.textContent) {
    if (currentSpan.classList.contains('wrong')) {
      list.remove('wrong')
    }
    list.add('correct')
    keydownTimes++
    id++
  } else {
    if (!currentSpan.classList.contains('wrong') && !e.shiftKey) {
      // when space is wrong, make the mistake visible
      if (currentSpan.classList.contains('space')) {
        currentSpan.textContent = '_'
      }
      list.add('wrong')
    } else {
      // when space is originally wrong and then corrected
      if (currentSpan.classList.contains('space') && e.key === ' ') {
        currentSpan.textContent = ' '
        list.remove('wrong')
        list.add('correct')
        keydownTimes++
        id++
        return
      }
    }
    if (!e.shiftKey) {
      keydownTimes++
    }
  }
}
function calWPM () {
  const secsUsed = 60 - timer.textContent
  return Math.round(keydownTimes / 6 * 60 / secsUsed) // a word + a space = 6 keys generally
}
function calAccuracyRate () {
  return Math.round(id / keydownTimes * 100)
}
function giveComment (aWPM, aAR) {
  if (aWPM > 90 && aAR > 98) {
    return 'You are so fabulous!!! An expert!!!'
  } else if (aWPM >= 60 && aAR >= 95) {
    return 'Excellent!!'
  } else if (aWPM >= 38 && aAR <= 70) {
    return 'Accuracy rate is also important!'
  } else if (aWPM < 38) {
    return 'Come on! You can do better!'
  } else {
    return 'Good job!!'
  }
}
function sendResult () {
  clearInterval(timerID)
  timerID = null
  const aWPM = calWPM()
  const aAR = calAccuracyRate()
  const aComment = giveComment(aWPM, aAR)
  if (document.getElementById('submit-result') && !(document.getElementById('testText'))) {
    sessionStorage.setItem('wpm', aWPM)
    sessionStorage.setItem('ar', aAR)
    sessionStorage.setItem('comment', aComment)
    document.getElementById('wpm-input').value = aWPM
    document.getElementById('ar-input').value = aAR
    document.getElementById('comment-input').value = aComment
    document.getElementById('single-record-submit').click()
    return
  }
  WPM.textContent = aWPM
  AR.textContent = aAR
  comment.textContent = aComment
}
function setTimer () {
  timerID = setInterval(function () {
    timer.textContent -= 1
    if (timer.textContent === '0') {
      sendResult()
    }
  }, 1000)
}
function cleanClass () {
  const nodesArr = document.querySelectorAll('.inwords')
  nodesArr.forEach(e => e.classList.remove('correct', 'wrong'))
}
function reset () {
  if (timerID) {
    clearInterval(timerID)
    timerID = null
  }
  cleanClass()
  WPM.textContent = 0
  AR.textContent = 0
  timer.textContent = 60
  comment.textContent = ''
  id = 0
  keydownTimes = 0
}
function switchText () {
  typeAllowed = false
  axios.get('https://random-word-api.vercel.app/api?words=100')
    .then(response => {
      text2HTML(response.data)
      typeAllowed = true
    })
    .catch(() => {
      spareTextIndex = 1 - spareTextIndex
      text2HTML(spareText[spareTextIndex])
    })
}

document.addEventListener('keydown', e => {
  if (!(comment.textContent === '' && typeAllowed)) return
  typeAChar(e)
})
resetBtn.addEventListener('click', () => {
  resetBtn.blur()
  reset()
})
switchBtn.addEventListener('click', () => {
  switchBtn.blur()
  reset()
  switchText()
})

if (!sessionStorage.getItem('visited')) {
  greetingModal.addEventListener('show.bs.modal', function greetingStart () {
    typeAllowed = false
    sessionStorage.setItem('visited', true)

    greetingModal.addEventListener('hidden.bs.modal', function greetingEnd () {
      typeAllowed = true
      greetingModal.removeEventListener('show.bs.modal', greetingStart)
      greetingModal.removeEventListener('hidden.bs.modal', greetingEnd)
    })
  })
}
if (!sessionStorage.getItem('played')) {
  instructionModal.addEventListener('shown.bs.modal', function instructionStart () {
    typeAllowed = false
    sessionStorage.setItem('played', true)

    instructionModal.addEventListener('hidden.bs.modal', function instructionEnd () {
      typeAllowed = true
      instructionModal.removeEventListener('shown.bs.modal', instructionStart)
      instructionModal.removeEventListener('hidden.bs.modal', instructionEnd)
    })
  })
}
if (sessionStorage.getItem('wpm')) {
  WPM.textContent = sessionStorage.getItem('wpm')
  AR.textContent = sessionStorage.getItem('ar')
  comment.textContent = sessionStorage.getItem('comment')
  sessionStorage.removeItem('wpm')
  sessionStorage.removeItem('ar')
  sessionStorage.removeItem('comment')
  switchText()
} else {
  text2HTML('Try typing the sentences here, then press a random key when finished. You can change the text with the "switch text" button below.')
}
