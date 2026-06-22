document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('weddingVideo');
  const videoWrapper = document.getElementById('videoWrapper');
  const soundButton = document.getElementById('soundButton');

  if (!video || !videoWrapper || !soundButton) {
    console.error('Ein Element wurde nicht gefunden:', {
      video,
      videoWrapper,
      soundButton
    });
    return;
  }

  soundButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();

    video.muted = !video.muted;
    video.volume = 1;

    if (video.muted) {
      soundButton.textContent = '🔇 Ton einschalten';
    } else {
      soundButton.textContent = '🔊 Ton an';
      video.play().catch(error => console.log('Video konnte nicht gestartet werden:', error));
    }
  });

  videoWrapper.addEventListener('click', (event) => {
    if (event.target.closest('#soundButton')) {
      return;
    }

    video.currentTime = 0;
    video.play().catch(error => console.log('Video konnte nicht gestartet werden:', error));
  });
});
