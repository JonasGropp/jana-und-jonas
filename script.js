document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('weddingVideo');
  const playOverlay = document.getElementById('playOverlay');

  const photo1 = document.querySelector('.polaroid-1');
  const photo2 = document.querySelector('.polaroid-2');
  const photo3 = document.querySelector('.polaroid-3');

  playOverlay.addEventListener('click', () => {
    video.muted = false;
    video.volume = 1;
    video.currentTime = 0;

    video.play().then(() => {
      playOverlay.style.display = 'none';
    }).catch(console.log);
  });

  video.addEventListener('click', () => {
    video.currentTime = 0;
    video.muted = false;
    video.volume = 1;
    video.play().catch(console.log);
  });

  video.addEventListener('ended', () => {
    video.pause();
  });

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function movePhoto(el, progress, start, end, rotation, fullscreen = false) {
    const p = clamp((progress - start) / (end - start), 0, 1);

    let y;
    let opacity;

    if (p < 0.25) {
      y = 82 - (82 - 7) * (p / 0.25);
      opacity = 0.75 + 0.25 * (p / 0.25);
    } else if (p < 0.7) {
      y = 7 - 13 * ((p - 0.25) / 0.45);
      opacity = 1;
    } else {
      y = -6 - 114 * ((p - 0.7) / 0.3);
      opacity = 1 - ((p - 0.7) / 0.3);
    }

    if (fullscreen) {
      y = 120 - 120 * p;
      opacity = p < 0.2 ? p / 0.2 : 1;
      el.style.transform = `translate(-50%, ${y}svh) scale(${0.88 + 0.12 * p}) rotate(0deg)`;
    } else {
      el.style.transform = `translate(-50%, ${y}svh) rotate(${rotation}deg)`;
    }

    el.style.opacity = opacity;
  }

  function updateScroll() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;

    movePhoto(photo1, progress, 0.00, 0.42, -10);
    movePhoto(photo2, progress, 0.28, 0.66, 10);
    movePhoto(photo3, progress, 0.58, 1.00, 0, true);
  }

  window.addEventListener('scroll', updateScroll, { passive: true });
  window.addEventListener('resize', updateScroll);

  updateScroll();
});
