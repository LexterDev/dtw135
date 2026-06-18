const LEVEL_SCORES  = [1500, 1500, 2000, 2500, 2500]
const WORLD_NAMES   = ['W1-1', 'W1-2', 'W1-3', 'W2-1', 'W2-2']
const LEVEL_NAMES   = ['EL GUARDIÁN','EL CARTÓGRAFO','EL EXPLORADOR','EL NÚCLEO','EL PORTAL']

const gameState = {
  current: 1,
  totalScore: 0,
  coins: 0,
  geo: { lat: null, lng: null },
  levels: [
    { id: 1, unlocked: true,  completed: false, score: 0 },
    { id: 2, unlocked: false, completed: false, score: 0 },
    { id: 3, unlocked: false, completed: false, score: 0 },
    { id: 4, unlocked: false, completed: false, score: 0 },
    { id: 5, unlocked: false, completed: false, score: 0 },
  ]
}

function showLevel(n) {
  document.querySelectorAll('.level-screen').forEach(s => s.style.display = 'none')
  document.getElementById(`level-${n}`).style.display = 'block'
  gameState.current = n
  updateHUD()
}

function updateHUD() {
  const n = gameState.current
  document.getElementById('hud-score').textContent =
    String(gameState.totalScore).padStart(6, '0')
  document.getElementById('hud-world').textContent = WORLD_NAMES[n - 1]
  document.getElementById('hud-coins').textContent =
    `🪙×${String(gameState.coins).padStart(2, '0')}`
}

function completeLevel(n) {
  const level = gameState.levels[n - 1]
  if (level.completed) return
  level.completed = true
  level.score = LEVEL_SCORES[n - 1]
  gameState.totalScore += LEVEL_SCORES[n - 1]
  gameState.coins++
  if (n < 5) gameState.levels[n].unlocked = true
  updateHUD()
  Audio.play('complete')
}

function goToNextLevel(n) {
  if (n >= 5) { showVictory(); return; }
  Audio.play('stageClear')
  const overlay = document.getElementById('stage-clear-overlay')
  overlay.querySelector('.sc-world').textContent =
    `${WORLD_NAMES[n - 1]}: ${LEVEL_NAMES[n - 1]}`
  overlay.querySelector('.sc-pts').textContent = `+${LEVEL_SCORES[n - 1]} PTS`
  overlay.style.opacity = '0'
  overlay.style.display = 'flex'
  requestAnimationFrame(() => { overlay.style.opacity = '1' })

  document.getElementById('sc-btn-continue').onclick = () => {
    overlay.style.opacity = '0'
    setTimeout(() => {
      overlay.style.display = 'none'
      showLevel(n + 1)
    }, 400)
  }
}

function showVictory() {
  Audio.play('stageClear')
  const v = document.getElementById('victory-overlay')
  document.getElementById('victory-score').textContent =
    String(gameState.totalScore).padStart(6, '0')
  v.style.display = 'flex'
  document.getElementById('victory-restart').onclick = () => {
    location.reload()
  }
}

function showAlert(elId, success, msg) {
  const el = document.getElementById(elId)
  el.textContent = msg
  el.className = `nes-alert ${success ? 'nes-alert-success' : 'nes-alert-error'}`
  el.style.display = 'block'
}

function enableBtn(id, className = 'nes-btn-primary') {
  const btn = document.getElementById(id)
  btn.disabled = false
  btn.className = `nes-btn ${className}`
}

// Exponer para el tutor
window.goToLevel = function(n) {
  if (n >= 1 && n <= 5) showLevel(n)
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  // Acceso directo opcional vía URL, ej. ?nivel=3 — mismo alcance que goToLevel(n)
  const nivel = parseInt(new URLSearchParams(location.search).get('nivel'), 10)
  showLevel(nivel >= 1 && nivel <= 5 ? nivel : 1)
})
