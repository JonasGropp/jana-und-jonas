document.addEventListener('DOMContentLoaded', () => {
  const video       = document.getElementById('weddingVideo');
  const finalFrame  = document.getElementById('finalFrame');
  const replayHint  = document.getElementById('replayHint');
  const videoWrapper = document.getElementById('videoWrapper');
  const cardWrapper  = document.getElementById('cardWrapper');

  // ─── Video: show final frame when ended ───
  video.addEventListener('ended', () => {
    finalFrame.classList.add('visible');
    replayHint.classList.add('visible');
    revealCard();
  });

  // ─── Click on video area → replay ───
  videoWrapper.addEventListener('click', () => {
    finalFrame.classList.remove('visible');
    replayHint.classList.remove('visible');
    video.currentTime = 0;
    video.play().catch(() => {});
  });

  // ─── Fallback: if video can't autoplay, reveal card immediately ───
  video.play().catch(() => {
    finalFrame.classList.add('visible');
    revealCard();
  });

  // ─── Reveal the stationery card ───
  function revealCard() {
    setTimeout(() => {
      cardWrapper.classList.add('revealed');
    }, 600);
  }

  // ─── IntersectionObserver: also reveal card when scrolled into view ───
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        cardWrapper.classList.add('revealed');
      }
    });
  }, { threshold: 0.2 });

  observer.observe(cardWrapper);
});
