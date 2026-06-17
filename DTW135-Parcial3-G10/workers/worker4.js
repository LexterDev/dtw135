self.onmessage = function(e) {
  const data = e.data
  const n    = data.length
  let sumTemp = 0, maxTemp = -Infinity, minTemp = Infinity
  let sumHum  = 0, maxHum  = -Infinity, minHum  = Infinity

  for (let i = 0; i < n; i++) {
    const { temp, humidity } = data[i]
    sumTemp += temp
    if (temp > maxTemp) maxTemp = temp
    if (temp < minTemp) minTemp = temp
    sumHum += humidity
    if (humidity > maxHum) maxHum = humidity
    if (humidity < minHum) minHum = humidity

    if (i % 1000 === 0) {
      self.postMessage({ type: 'progress', value: Math.round((i / n) * 100) })
    }
  }

  self.postMessage({
    type: 'result',
    stats: {
      temp: {
        avg: (sumTemp / n).toFixed(2),
        max: maxTemp.toFixed(2),
        min: minTemp.toFixed(2)
      },
      humidity: {
        avg: (sumHum / n).toFixed(2),
        max: maxHum.toFixed(2),
        min: minHum.toFixed(2)
      },
      count: n
    }
  })
}
