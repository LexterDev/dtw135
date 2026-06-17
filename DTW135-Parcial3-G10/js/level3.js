function initLevel3() {
  const video       = document.getElementById('l3-video')
  const placeholder = document.getElementById('l3-cam-placeholder')
  const btnCam      = document.getElementById('l3-btn-cam')
  const btnCapture  = document.getElementById('l3-btn-capture')
  const btnNext     = document.getElementById('l3-btn-next')
  const strip       = document.getElementById('l3-photo-strip')
  let photoCount = 0

  btnCam.addEventListener('click', async () => {
    Audio.play('click')
    btnCam.textContent = '⏳ CONECTANDO...'
    btnCam.disabled = true
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      video.srcObject = stream
      await video.play()
      placeholder.style.display = 'none'
      video.style.display = 'block'
      showAlert('l3-alert', true, '● CÁMARA ACTIVA — VIDEO EN TIEMPO REAL')
      btnCam.textContent = '● CÁMARA ON'
      btnCam.className = 'nes-btn nes-btn-success'
      enableBtn('l3-btn-capture')
    } catch (err) {
      Audio.play('error')
      btnCam.textContent = '▶ REINTENTAR'
      btnCam.disabled = false
      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        showAlert('l3-alert', false, '✖ ERROR: Cámara no encontrada en este dispositivo.')
      } else {
        showAlert('l3-alert', false, '✖ ERROR: Permiso de cámara denegado.')
      }
    }
  })

  btnCapture.addEventListener('click', () => {
    Audio.play('click')
    const cv  = document.createElement('canvas')
    cv.width  = video.videoWidth  || 640
    cv.height = video.videoHeight || 480
    cv.getContext('2d').drawImage(video, 0, 0)
    const dataURL = cv.toDataURL('image/jpeg', 0.7)
    photoCount++
    try {
      localStorage.setItem(`escape_photo_${photoCount}`, dataURL)
    } catch (e) {
      console.warn('LocalStorage lleno, foto no guardada:', e)
    }

    const thumb = document.createElement('div')
    thumb.className = 'photo-thumb'
    thumb.innerHTML = `<img src="${dataURL}" alt="foto ${photoCount}">`
    strip.appendChild(thumb)

    showAlert('l3-alert', true, `✔ FOTO ${photoCount} CAPTURADA Y GUARDADA EN MEMORIA`)
    Audio.play('complete')

    if (photoCount === 1) {
      completeLevel(3)
      enableBtn('l3-btn-next')
    }
  })

  btnNext.addEventListener('click', () => {
    if (!gameState.levels[2].completed) { Audio.play('locked'); return; }
    Audio.play('click')
    // Detener stream antes de salir
    if (video.srcObject) {
      video.srcObject.getTracks().forEach(t => t.stop())
    }
    goToNextLevel(3)
  })
}

document.addEventListener('DOMContentLoaded', initLevel3)
