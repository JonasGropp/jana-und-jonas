document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('weddingVideo');
  const videoWrapper = document.getElementById('videoWrapper');

  videoWrapper.addEventListener('click', () => {
    video.currentTime = 0;
    video.play().catch(() => {});
  });
});