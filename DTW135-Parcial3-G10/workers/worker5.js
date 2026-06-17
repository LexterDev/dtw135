self.onmessage = function(e) {
  const data  = e.data
  const total = data.length
  const valid = []

  // Fase 1: filtrar negativos (0–50% del progreso)
  for (let i = 0; i < total; i++) {
    const r = data[i]
    if (r.temp >= 0 && r.humidity >= 0 && r.pressure >= 0) {
      valid.push(r)
    }
    if (i % 10000 === 0) {
      self.postMessage({ type: 'progress', value: Math.round((i / total) * 50) })
    }
  }

  // Fase 2: calcular sumas (50–80% del progreso)
  const n = valid.length
  let sumTemp = 0, sumHum = 0, sumPres = 0
  for (let i = 0; i < n; i++) {
    sumTemp += valid[i].temp
    sumHum  += valid[i].humidity
    sumPres += valid[i].pressure
    if (i % 10000 === 0) {
      self.postMessage({ type: 'progress', value: 50 + Math.round((i / n) * 30) })
    }
  }

  // Fase 3: top 10 (80–100%)
  self.postMessage({ type: 'progress', value: 82 })
  const top10Temp = valid.slice().sort((a,b) => b.temp - a.temp)
    .slice(0, 10).map(r => r.temp.toFixed(2))

  self.postMessage({ type: 'progress', value: 92 })
  const top10Pres = valid.slice().sort((a,b) => b.pressure - a.pressure)
    .slice(0, 10).map(r => r.pressure.toFixed(2))

  self.postMessage({ type: 'progress', value: 100 })
  self.postMessage({
    type: 'result',
    stats: {
      avgTemp:       (sumTemp / n).toFixed(2),
      avgHum:        (sumHum  / n).toFixed(2),
      avgPres:       (sumPres / n).toFixed(2),
      top10Temp,
      top10Pres,
      validCount:    n,
      filteredCount: total - n
    }
  })
}
