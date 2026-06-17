function initLevel1() {
  const btnGet  = document.getElementById('l1-btn-get')
  const btnNext = document.getElementById('l1-btn-next')
  const latEl   = document.getElementById('l1-lat')
  const lngEl   = document.getElementById('l1-lng')

  btnGet.addEventListener('click', () => {
    Audio.play('click')
    btnGet.textContent = '⏳ OBTENIENDO...'
    btnGet.disabled = true

    if (!navigator.geolocation) {
      showAlert('l1-alert', false, '✖ ERROR: Geolocalización no soportada en este navegador.')
      Audio.play('error')
      btnGet.textContent = '▶ OBTENER UBICACIÓN'
      btnGet.disabled = false
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        gameState.geo.lat = pos.coords.latitude
        gameState.geo.lng = pos.coords.longitude
        latEl.textContent = pos.coords.latitude.toFixed(6) + '°'
        latEl.className = 'data-val'
        lngEl.textContent = pos.coords.longitude.toFixed(6) + '°'
        lngEl.className = 'data-val'
        btnGet.textContent = '✔ UBICACIÓN GUARDADA'
        btnGet.className = 'nes-btn nes-btn-success'
        showAlert('l1-alert', true, '✔ UBICACIÓN OBTENIDA CORRECTAMENTE')
        completeLevel(1)
        enableBtn('l1-btn-next')
      },
      (err) => {
        btnGet.textContent = '▶ REINTENTAR'
        btnGet.disabled = false
        Audio.play('error')
        if (err.code === err.PERMISSION_DENIED) {
          showAlert('l1-alert', false, '✖ ERROR: Permiso denegado. Activa la ubicación e intenta de nuevo.')
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          showAlert('l1-alert', false, '✖ ERROR: Ubicación no disponible. Intenta de nuevo.')
        } else {
          showAlert('l1-alert', false, '✖ ERROR: Tiempo de espera agotado. Intenta de nuevo.')
        }
      },
      { timeout: 10000, maximumAge: 0 }
    )
  })

  btnNext.addEventListener('click', () => {
    if (!gameState.levels[0].completed) { Audio.play('locked'); return; }
    Audio.play('click')
    goToNextLevel(1)
  })
}

document.addEventListener('DOMContentLoaded', initLevel1)
