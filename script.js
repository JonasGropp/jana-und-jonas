document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('weddingVideo');
  const playOverlay = document.getElementById('playOverlay');

  playOverlay.addEventListener('click', () => {
    video.muted = false;
    video.volume = 1;
    video.currentTime = 0;

    video.play().then(() => {
      playOverlay.style.display = 'none';
    }).catch(error => {
      console.log('Video konnte nicht gestartet werden:', error);
    });
  });

  video.addEventListener('click', () => {
    video.currentTime = 0;
    video.muted = false;
    video.volume = 1;

    video.play().catch(error => {
      console.log('Video konnte nicht neu gestartet werden:', error);
    });
  });

  video.addEventListener('ended', () => {
    video.pause();
  });
});
