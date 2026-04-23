const questions = [
  {
    text: "What is the capital of France?",
    options: ["Paris", "London", "Berlin", "Madrid"],
    answer: 0
  },
  {
    text: "What is the capital of Germany?",
    options: ["Berlin", "London", "Madrid", "Paris"],
    answer: 0
  },
  {
    text: "What is the capital of Italy?",
    options: ["Rome", "London", "Madrid", "Paris"],
    answer: 0
  },
  {
    text: "What is the capital of Spain?",
    options: ["Madrid", "London", "Berlin", "Paris"],
    answer: 3
  },
  {
    text: "What is the capital of Portugal?",
    options: ["Lisbon", "London", "Berlin", "Paris"],
    answer: 0
  },
  {
    text: "What is the capital of Greece?",
    options: ["Athens", "London", "Berlin", "Paris"],
    answer: 0
  },
  {
    text: "What is the capital of Japan?",
    options: ["Tokyo", "London", "Berlin", "Paris"],
    answer: 0
  },
  {
    text: "What is the capital of China?",
    options: ["Beijing", "London", "Berlin", "Paris"],
    answer: 0
  },
  {
    text: "What is the capital of India?",
    options: ["New Delhi", "London", "Berlin", "Paris"],
    answer: 0
  },
  {
    text: "What is the capital of Brazil?",
    options: ["Brasilia", "London", "Berlin", "Paris"],
    answer: 0
  },
  



]

const questionText = document.querySelector(".question-text")
const optionsBox = document.querySelector(".options")
const helperText = document.querySelector(".helper-text")
const progressFill = document.querySelector(".progress-fill")
const progressText = document.querySelector(".progress-text")
const quizCard = document.querySelector(".quiz-card")
const resultCard = document.querySelector(".result-card")
const resultTitle = document.querySelector(".result-title")
const resultScore = document.querySelector(".result-score")
const resultMessage = document.querySelector(".result-message")
const nextBtn = document.getElementById("nextBtn")
const restartBtn = document.getElementById("restartBtn")
const playAgainBtn = document.getElementById("playAgainBtn")

let current = 0
let score = 0
let locked = false
let selectedIndex = null

function setProgress() {
  const step = (current / questions.length) * 100
  progressFill.style.width = `${Math.round(step)}%`
  progressText.textContent = `${current}/${questions.length}`
}

function renderQuestion() {
  const item = questions[current]
  quizCard.classList.remove("fade")
  void quizCard.offsetWidth
  quizCard.classList.add("fade")
  questionText.textContent = item.text
  optionsBox.innerHTML = ""
  helperText.textContent = "Tap an option to lock in your answer."
  locked = false
  selectedIndex = null
  nextBtn.disabled = true
  nextBtn.textContent = current === questions.length - 1 ? "Submit" : "Next"
  item.options.forEach((label, index) => {
    const btn = document.createElement("button")
    btn.className = "option"
    btn.type = "button"
    btn.setAttribute("role", "radio")
    btn.setAttribute("aria-checked", "false")
    btn.innerHTML = `<span>${String.fromCharCode(65 + index)}</span><p>${label}</p>`
    btn.addEventListener("click", () => handleSelect(index, btn))
    optionsBox.appendChild(btn)
  })
  setProgress()
}

function handleSelect(index, btn) {
  if (locked) return
  const optionButtons = [...document.querySelectorAll(".option")]
  optionButtons.forEach(o => {
    o.classList.remove("selected")
    o.setAttribute("aria-checked", "false")
  })
  btn.classList.add("selected")
  btn.setAttribute("aria-checked", "true")
  selectedIndex = index
  helperText.textContent = "Ready? Hit next to check your answer."
  nextBtn.disabled = false
}

function revealAnswer() {
  const item = questions[current]
  const optionButtons = [...document.querySelectorAll(".option")]
  optionButtons.forEach((btn, index) => {
    if (index === item.answer) btn.classList.add("correct")
    if (index === selectedIndex && index !== item.answer) btn.classList.add("wrong")
  })
  if (selectedIndex === item.answer) {
    score++
    helperText.textContent = "Nice, that was correct."
  } else {
    helperText.textContent = "Good try. Watch how the correct one lights up."
  }
}

function handleNext() {
  if (!locked) {
    locked = true
    revealAnswer()
    nextBtn.textContent = current === questions.length - 1 ? "Finish" : "Continue"
    return
  }
  if (current < questions.length - 1) {
    current++
    renderQuestion()
  } else {
    showResult()
  }
}

function scoreMessage(ratio) {
  if (ratio === 1) return "Excellent, a perfect brain run."
  if (ratio >= 0.7) return "Great job, you are thinking like a developer."
  if (ratio >= 0.4) return "Good, a bit more practice will make it shine."
  return "Try again, every attempt wires your brain better."
}

function showResult() {
  const ratio = score / questions.length
  resultTitle.textContent = ratio >= 0.7 ? "Well played!" : "You can beat this."
  resultScore.textContent = `You scored ${score} / ${questions.length}`
  resultMessage.textContent = scoreMessage(ratio)
  quizCard.hidden = true
  resultCard.hidden = false
  resultCard.classList.add("show")
}

function resetQuiz() {
  current = 0
  score = 0
  locked = false
  selectedIndex = null
  resultCard.hidden = true
  quizCard.hidden = false
  helperText.textContent = "Tap an option to lock in your answer."
  restartBtn.style.opacity = "1"
  restartBtn.style.pointerEvents = "auto"
  renderQuestion()
}

const navLinks = document.querySelectorAll(".nav-link")

function scrollToSection(id) {
  const el = id === "quiz" ? quizCard : document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
}

navLinks.forEach(btn => {
  btn.addEventListener("click", () => scrollToSection(btn.dataset.target))
})

nextBtn.addEventListener("click", handleNext)
restartBtn.addEventListener("click", resetQuiz)
playAgainBtn.addEventListener("click", resetQuiz)

resetQuiz()

