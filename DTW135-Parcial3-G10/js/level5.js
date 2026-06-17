function generateQuantumData250k() {
  const data = []
  for (let i = 0; i < 250000; i++) {
    let temp     = Math.random() * 35 + 10
    let humidity = Math.random() * 75 + 20
    let pressure = Math.random() * 70 + 980
    if (Math.random() < 0.1) temp     *= -1
    if (Math.random() < 0.1) humidity *= -1
    if (Math.random() < 0.1) pressure *= -1
    data.push({ temp, humidity, pressure })
  }
  return data
}

function renderTop10(containerId, values, unit) {
  const el = document.getElementById(containerId)
  el.innerHTML = values.map((v, i) =>
    `<div class="top-item">
       <span class="rank">#${i+1}</span>
       <span class="val">${v}${unit}</span>
     </div>`
  ).join('')
}

function initLevel5() {
  const btnProcess = document.getElementById('l5-btn-process')
  const btnExport  = document.getElementById('l5-btn-export')
  const progWrap   = document.getElementById('l5-progress-wrap')
  const progFill   = document.getElementById('l5-progress-fill')
  const progLabel  = document.getElementById('l5-progress-label')
  const statCard   = document.getElementById('l5-stat-card')
  let lastResult   = null

  btnProcess.addEventListener('click', () => {
    Audio.play('click')
    btnProcess.disabled = true
    btnProcess.textContent = '⏳ GENERANDO...'
    progWrap.style.display = 'block'

    const data   = generateQuantumData250k()
    btnProcess.textContent = '⏳ PROCESANDO...'
    const worker = new Worker('workers/worker5.js')
    worker.postMessage(data)

    worker.onmessage = (e) => {
      if (e.data.type === 'progress') {
        const pct = e.data.value
        progFill.style.width  = pct + '%'
        progLabel.textContent = `FILTRANDO Y CALCULANDO... ${pct}%`
      } else if (e.data.type === 'result') {
        lastResult = e.data.stats
        const s = lastResult

        renderTop10('l5-top10-temp', s.top10Temp, '°C')
        renderTop10('l5-top10-pres', s.top10Pres, 'hPa')
        document.getElementById('l5-avg-temp').textContent  = s.avgTemp + '°C'
        document.getElementById('l5-avg-hum').textContent   = s.avgHum  + '%'
        document.getElementById('l5-avg-pres').textContent  = s.avgPres + 'hPa'
        document.getElementById('l5-valid').textContent     = s.validCount.toLocaleString()
        document.getElementById('l5-filtered').textContent  = s.filteredCount.toLocaleString()

        progWrap.style.display = 'none'
        statCard.style.display = 'block'
        btnExport.style.display = 'inline-block'
        document.getElementById('l5-btn-victory').style.display = 'inline-block'
        btnProcess.textContent = '✔ PROCESADO'
        btnProcess.className   = 'nes-btn nes-btn-success'
        showAlert('l5-alert', true, '✔ PORTAL CUÁNTICO ACTIVADO — EXPORTA Y COMPLETA LA MISIÓN')
        Audio.play('complete')
        completeLevel(5)
        worker.terminate()
      }
    }

    worker.onerror = (e) => {
      showAlert('l5-alert', false, '✖ ERROR en el Worker: ' + e.message)
      Audio.play('error')
      btnProcess.disabled = false
      btnProcess.textContent = '▶ REINTENTAR'
    }
  })

  document.getElementById('l5-btn-victory').addEventListener('click', () => {
    Audio.play('click')
    showVictory()
  })

  btnExport.addEventListener('click', () => {
    Audio.play('click')
    if (!lastResult) return
    const json = JSON.stringify(lastResult, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'resultados-portal.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  })
}

document.addEventListener('DOMContentLoaded', initLevel5)
