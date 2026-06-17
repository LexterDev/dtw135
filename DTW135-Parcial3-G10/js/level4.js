function generateSensorData20k() {
  const data = []
  for (let i = 0; i < 20000; i++) {
    data.push({
      temp:     Math.random() * 35 + 10,
      humidity: Math.random() * 75 + 20
    })
  }
  return data
}

function initLevel4() {
  const btnProcess = document.getElementById('l4-btn-process')
  const btnNext    = document.getElementById('l4-btn-next')
  const progWrap   = document.getElementById('l4-progress-wrap')
  const progFill   = document.getElementById('l4-progress-fill')
  const progLabel  = document.getElementById('l4-progress-label')
  const statCard   = document.getElementById('l4-stat-card')

  btnProcess.addEventListener('click', () => {
    Audio.play('click')
    btnProcess.disabled = true
    btnProcess.textContent = '⏳ PROCESANDO...'
    progWrap.style.display = 'block'

    const data   = generateSensorData20k()
    const worker = new Worker('workers/worker4.js')
    worker.postMessage(data)

    worker.onmessage = (e) => {
      if (e.data.type === 'progress') {
        const pct = e.data.value
        progFill.style.width  = pct + '%'
        progLabel.textContent = `PROCESANDO DATOS... ${pct}%`
      } else if (e.data.type === 'result') {
        const { stats } = e.data
        document.getElementById('l4-temp-avg').textContent = stats.temp.avg + '°C'
        document.getElementById('l4-temp-max').textContent = stats.temp.max + '°C'
        document.getElementById('l4-temp-min').textContent = stats.temp.min + '°C'
        document.getElementById('l4-hum-avg').textContent  = stats.humidity.avg + '%'
        document.getElementById('l4-hum-max').textContent  = stats.humidity.max + '%'
        document.getElementById('l4-hum-min').textContent  = stats.humidity.min + '%'
        document.getElementById('l4-count').textContent    = stats.count.toLocaleString()
        progWrap.style.display  = 'none'
        statCard.style.display  = 'block'
        btnProcess.textContent  = '✔ PROCESADO'
        btnProcess.className    = 'nes-btn nes-btn-success'
        showAlert('l4-alert', true, '✔ ANÁLISIS COMPLETADO — ESTADÍSTICAS LISTAS')
        Audio.play('complete')
        completeLevel(4)
        enableBtn('l4-btn-next')
        worker.terminate()
      }
    }

    worker.onerror = (e) => {
      showAlert('l4-alert', false, '✖ ERROR en el Worker: ' + e.message)
      Audio.play('error')
      btnProcess.disabled = false
      btnProcess.textContent = '▶ REINTENTAR'
    }
  })

  btnNext.addEventListener('click', () => {
    if (!gameState.levels[3].completed) { Audio.play('locked'); return; }
    Audio.play('click')
    goToNextLevel(4)
  })
}

document.addEventListener('DOMContentLoaded', initLevel4)
