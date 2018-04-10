const socket = io()
const form = document.querySelector('.js-join')
const joined = document.querySelector('.js-joined')

const buzzer = document.querySelector('.js-buzzer')
const joinedInfo = document.querySelector('.js-joined-info')
const answers = document.querySelector('.js-answers')

let user = {}

const getUserInfo = () => {
  user = JSON.parse(localStorage.getItem('user')) || {}
  if (user.team) {
    form.querySelector('[name=team]').value = user.team
  }
}
const saveUserInfo = () => {
  localStorage.setItem('user', JSON.stringify(user))
}

window.addEventListener('DOMContentLoaded', getUserInfo)
// buzzer.disabled = true

form.addEventListener('submit', (e) => {
  e.preventDefault()
  user.team = form.querySelector('[name=team]').value
  socket.emit('join', user)
  saveUserInfo()
  joinedInfo.innerText = `Team ${user.team}`
  form.classList.add('hidden')
  joined.classList.remove('hidden')
})

buzzer.addEventListener('click', (e) => {
  socket.emit('buzz', user)
  window.navigator.vibrate(300)
})


socket.on('connected', (data) => {
  if (data.questionReady)
      enableBuzzer()
  else
      disableBuzzer()
  first(data)
})

socket.on('first', (data) => {
    first(data)
})

socket.on('clear', () => {
    buzzer.classList.remove('first')
    closeChoice()
})

socket.on('enableBuzzer', () => {
   enableBuzzer()
})

socket.on('disableBuzzer', () => {
    disableBuzzer()
})


function first(data) {
    if ( user.team === data.first) {
        buzzer.classList.add('first')
        if (!data.lock) {
            displayChoices(data)
        } else {
            closeChoice()
        }
    }
}

 function displayChoices(data) {
    answers.innerHTML = ''
    if ( data.choices && data.choices.length && user.team === data.first ) {
        answers.classList.remove('hidden')
        buzzer.classList.add('hidden')
        let html = '<ul class="view-answers">';

        data.choices.forEach( (answer, i) => {
            html += `<li>
                    <label for="${answer}" class="label">
                    ${answer}
                </label></li>`
        })
        html += '</ul>'
        answers.innerHTML = html
    }
}

function disableBuzzer() {
    buzzer.disabled = true
}

function enableBuzzer() {
    buzzer.disabled = false
}

 function closeChoice() {
    answers.classList.add('hidden')
    buzzer.classList.remove('hidden')
    answers.innerHTML = ''
}