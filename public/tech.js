const socket = io()
const active = document.querySelector('.js-active')
const buzzList = document.querySelector('.buzz-in')
const clear = document.querySelector('.js-clear')
const question = document.querySelector('.js-question')
const pause = document.querySelector('.pause')
const logo = document.querySelector('.js-logo')
const music = document.querySelector('.js-music')
const reveal = document.querySelector('.js-reveal')
const soundFX = document.querySelector('.js-fx')
const introMusic = document.querySelector('.js-intro-music')
const showdownMusic = document.querySelector('.js-showdown-music')
const currentQuestionNumber = document.querySelector('.js-total-questions span')
const timer = document.querySelector('.timer-host')

const answers = document.querySelector('.js-answers')
const choices = document.querySelector('.js-choices')
const lock = document.querySelector('.js-lock')
const viewquestion = document.querySelector('.js-view-question')
const note = document.querySelector('.js-note')
const musicVol = document.querySelector('input[name="musicVol"]')
const timerVol = document.querySelector('input[name="timerVol"]')
const currQuestion = document.querySelector('input[name="curQ"]')


lock.addEventListener('click', lockChoice)
musicVol.addEventListener('change', updateMusicVol)
timerVol.addEventListener('change', updateTimerVol)
currQuestion.addEventListener('change', updateCurrQuestion)

let pauseTime = false
let pauseMusic = true
let pauseSoundFX = false
let pauseIntroMusic = true
let pauseShowdownMusic = true

const Q_DELAY = 2500
let QTime = 0
let QTimer = null

let score = {}

const getScoreInfo = () => {
  score = JSON.parse(localStorage.getItem('score')) || {}
}

window.addEventListener('DOMContentLoaded', getScoreInfo)

socket.on('connected', (data) => {
  pauseTime = data.pauseTime
  pauseMusic = data.pauseMusic
  pauseSoundFX = data.pauseSoundFX
  pauseIntroMusic = data.pauseIntroMusic
  pauseShowdownMusic = data.pauseShowdownMusic

  musicVol.value = data.musicVol *100
  musicVol.dataset.before = musicVol.value
  timerVol.value = data.timerVol *100
  timerVol.dataset.before = timerVol.value

  if (data.questionReady ) {
       displayChoices(data)
    }

    active.innerText = `${data.users.length} joined`

})

socket.on('active', (numberActive) => {
  active.innerText = `${numberActive} joined`
})

socket.on('buzzes', (buzzes) => {
  buzzList.innerHTML = buzzes.length ? `Team ${buzzes[0]}` : ''
})

clear.addEventListener('click', () => {
  socket.emit('clear')
})

logo.addEventListener('click', () => {
  socket.emit('logo')
})


pause.addEventListener('click', pauseTimer)
music.addEventListener('click', toogleMusic)
soundFX.addEventListener('click', toogleSoundFX)
introMusic.addEventListener('click', toogleIntroMusic)
showdownMusic.addEventListener('click', toogleShowdownMusic)
reveal.addEventListener('click', revealAnswer)
question.addEventListener('click', showQuestion)

function revealAnswer(){
    socket.emit('lock', '')
}

function pauseTimer() {
    pauseTime = !pauseTime
    socket.emit('pauseTime', pauseTime)
    setPauseTimerStatus()
}

function setPauseTimerStatus() {
    if (pauseTime) {
        pause.classList.add('is-paused')
    } else {
        pause.classList.remove('is-paused')
    }
}

function toogleMusic() {
    pauseMusic = !pauseMusic
    socket.emit('pauseMusic', pauseMusic)
    if (pauseMusic) {
        music.classList.add('is-paused')
    } else {
        music.classList.remove('is-paused')
    }
}

function toogleIntroMusic() {
    pauseIntroMusic = !pauseIntroMusic
    socket.emit('pauseIntroMusic', pauseIntroMusic)
    if (pauseIntroMusic) {
        introMusic.classList.add('is-paused')
    } else {
        introMusic.classList.remove('is-paused')
    }
}

function toogleShowdownMusic() {
    pauseShowdownMusic = !pauseShowdownMusic
    socket.emit('pauseShowdownMusic', pauseShowdownMusic)
    if (pauseShowdownMusic) {
        showdownMusic.classList.add('is-paused')
    } else {
        showdownMusic.classList.remove('is-paused')
    }
}

function toogleSoundFX() {
    pauseSoundFX = !pauseSoundFX
    socket.emit('pauseSoundFX', pauseSoundFX)
    if (pauseSoundFX) {
        soundFX.classList.add('is-paused')
    } else {
        soundFX.classList.remove('is-paused')
    }
}

function updateMusicVol() {
    socket.emit('volMusic', musicVol.value*0.01)
    musicVol.dataset.before = musicVol.value
}

function updateTimerVol() {
    socket.emit('volTimer', timerVol.value*0.01)
    timerVol.dataset.before = timerVol.value
}

function updateCurrQuestion() {
    if (currQuestion.validity.valid) {
        socket.emit('updateCurrentQuestion', currQuestion.value-2)
    }

}

function showQuestion() {
    socket.emit('showQuestion')
    socket.emit('questionClose')
}


socket.on('enableBuzzer', () => {
   enableChoice()
})

socket.on('disableBuzzer', () => {
   disableChoice()
})

socket.on('introTrackEnd', () => {
    pauseIntroMusic = true
    introMusic.classList.add('is-paused')
})

socket.on('question', (data) => {
    displayChoices(data)
})

socket.on('pauseQuestion', (pauseState) => {
    pauseTime = pauseState
   setPauseTimerStatus()
})

socket.on('sayAnswerShown', (item) => {
    const li = document.querySelector(`ul.host li:nth-child(${item})`)
    if (li) li.classList.remove('highlight')
})


socket.on('unLockLogo', () => {
   logo.disabled = false
})

socket.on('score', (answer, data) => {

   score[~~data.currentQuestion+1] = { team:data.first, answer:answer, correct: answer === data.answer }
   console.log(score)
   localStorage.setItem('score', JSON.stringify(score))
})

 function displayChoices(data) {

    choices.innerHTML = ''
    viewquestion.innerHTML = ''
    note.innerHTML = ''
    if ( data.choices && data.choices.length ) {
        lock.disabled = false
        reveal.disabled = false
        viewquestion.innerHTML = data.question
        note.innerHTML = data.note
        QTime = Math.ceil(data.question.split(" ").length/3)+2
        let html = '<ul class="view-answers host">';
        currentQuestionNumber.innerHTML = ~~data.currentQuestion+1
        currQuestion.value = ~~data.currentQuestion+1
        data.choices.forEach( (answer, i) => {
            html += `<li ${!data.lock ? 'class="highlight"' : ''}>
                    <input  type="radio"
                            name="answer"
                            value="${answer}"
                            id="${answer}"
                    > <label for="${answer}" class="label">
                    ${answer}
                </label></li>`
         })
         html += `</ul> <p> <big>Answer: ${data.answer}</big></p>`
         choices.innerHTML = html
         timer.innerHTML = QTime
         clearTimeout(QTimer)
         QTimer = setTimeout(countdown, Q_DELAY)
    }
}


function countdown() {
    if (QTime > 0) {
        QTime--
        timer.innerHTML = QTime
        QTimer = setTimeout(countdown, 1000)
    }
}

function lockChoice(){
    let answer = document.querySelector('input[name="answer"]:checked')

    if (answer) {
        answer = answer.value
        socket.emit('lock', answer)
    }

}

function disableChoice() {
    lock.disabled = true
    logo.disabled = true
    reveal.disabled = true
    document.querySelectorAll('input[name="answer"]').forEach( (input) =>{
        input.disabled = true
    })
}

function enableChoice() {
    lock.disabled = false
    logo.disabled = false
    reveal.disabled = false
    // question.disabled = false
    document.querySelectorAll('input[name="answer"]').forEach( (input) =>{
        input.disabled = false
    })
}