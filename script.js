document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('weddingVideo');
  const soundButton = document.getElementById('soundButton');

  soundButton.addEventListener('click', () => {

  if (video.muted) {

    video.muted = false;
    video.volume = 1;

    soundButton.innerHTML = '🔊 Ton an';

  } else {

    video.muted = true;

    soundButton.innerHTML = '🔇 Ton einschalten';

  }

});
  
  const videoWrapper = document.getElementById('videoWrapper');

  videoWrapper.addEventListener('click', () => {
    video.currentTime = 0;
    video.play().catch(() => {});
  });
});
