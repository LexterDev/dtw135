const MAP_BOUNDS = { latMin: 13.0, latMax: 14.5, lngMin: -90.2, lngMax: -87.7 }

function latLngToPixel(lat, lng, W, H) {
  let px = (lng - MAP_BOUNDS.lngMin) / (MAP_BOUNDS.lngMax - MAP_BOUNDS.lngMin) * W
  let py = (1 - (lat - MAP_BOUNDS.latMin) / (MAP_BOUNDS.latMax - MAP_BOUNDS.latMin)) * H
  px = Math.max(20, Math.min(W - 20, px))
  py = Math.max(20, Math.min(H - 20, py))
  return { px, py }
}

function drawMap(canvas, lat, lng) {
  const ctx = canvas.getContext('2d')
  const W = canvas.width, H = canvas.height

  // fondo
  ctx.fillStyle = '#1a3a1a'
  ctx.fillRect(0, 0, W, H)

  // líneas (calles)
  ctx.strokeStyle = '#888'
  ctx.lineWidth = 2
  const streets = [
    [W*0.3, 0, W*0.3, H], [W*0.62, 0, W*0.62, H],
    [0, H*0.38, W, H*0.38], [0, H*0.7, W, H*0.7]
  ]
  streets.forEach(([x1,y1,x2,y2]) => {
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke()
  })

  // rectángulos (edificios)
  ctx.fillStyle = '#2d6a4f';
  [[10,8,55,28],[70,8,42,28],[10,H*0.44,42,22]].forEach(([x,y,w,h]) => ctx.fillRect(x,y,w,h))
  ctx.fillStyle = '#1b4332';
  [[W*0.34,8,68,24],[W*0.34,H*0.44,50,20],[W*0.66,8,54,34],[W*0.66,H*0.44+4,58,16]].forEach(([x,y,w,h]) => ctx.fillRect(x,y,w,h))

  // círculo (zona especial / plaza)
  ctx.strokeStyle = '#FBD000'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(W*0.82, H*0.8, 16, 0, Math.PI * 2)
  ctx.stroke()

  // marcador de posición
  const { px, py } = latLngToPixel(lat, lng, W, H)
  ctx.fillStyle = '#E52521'
  ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke()
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(px-14,py); ctx.lineTo(px+14,py); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(px,py-14); ctx.lineTo(px,py+14); ctx.stroke()
  ctx.fillStyle = '#fff'; ctx.font = 'bold 9px monospace'
  ctx.fillText('TÚ', px + 10, py - 5)
}

function initLevel2() {
  const canvas  = document.getElementById('l2-canvas')
  const btnDraw = document.getElementById('l2-btn-draw')
  const btnNext = document.getElementById('l2-btn-next')

  // Ajustar canvas al tamaño real en pantalla
  canvas.width  = canvas.offsetWidth  || 560
  canvas.height = 200

  btnDraw.addEventListener('click', () => {
    Audio.play('click')
    const lat = gameState.geo.lat ?? 13.6929
    const lng = gameState.geo.lng ?? -89.2182
    drawMap(canvas, lat, lng)
    showAlert('l2-alert', true, '✔ MAPA DIBUJADO Y POSICIÓN MARCADA')
    btnDraw.textContent = '✔ MAPA COMPLETADO'
    btnDraw.className = 'nes-btn nes-btn-success'
    btnDraw.disabled = true
    completeLevel(2)
    enableBtn('l2-btn-next')
  })

  btnNext.addEventListener('click', () => {
    if (!gameState.levels[1].completed) { Audio.play('locked'); return; }
    Audio.play('click')
    goToNextLevel(2)
  })
}

document.addEventListener('DOMContentLoaded', initLevel2)
