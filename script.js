document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('weddingVideo');
  const playOverlay = document.getElementById('playOverlay');

  const photo1 = document.querySelector('.polaroid-1');
  const photo2 = document.querySelector('.polaroid-2');
  const photo3 = document.querySelector('.polaroid-3');
  const photo3Image = photo3.querySelector('img');

  let scrollEnabled = false;
  let autoScrollFrameId = null;
  let isAutoScrolling = false;

  const scrollKeys = new Set([
    'ArrowDown',
    'ArrowUp',
    'PageDown',
    'PageUp',
    'Home',
    'End',
    'Space'
  ]);

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function lerp(start, end, progress) {
    return start + (end - start) * progress;
  }

  function smoothStep(value) {
    const t = clamp(value, 0, 1);
    return t * t * (3 - 2 * t);
  }

  function stopAutoScroll() {
    if (autoScrollFrameId !== null) {
      window.cancelAnimationFrame(autoScrollFrameId);
      autoScrollFrameId = null;
    }

    isAutoScrolling = false;
  }

  function lockScroll() {
    stopAutoScroll();
    scrollEnabled = false;
    window.scrollTo(0, 0);
    document.documentElement.classList.add('scroll-locked');
    document.body.classList.add('scroll-locked');
  }

  function unlockScroll() {
    scrollEnabled = true;
    document.documentElement.classList.remove('scroll-locked');
    document.body.classList.remove('scroll-locked');
  }

  function handleScrollIntent(event) {
    if (!scrollEnabled) {
      event.preventDefault();
      window.scrollTo(0, 0);
      return;
    }

    if (isAutoScrolling) {
      stopAutoScroll();
    }
  }

  function handleKeyboardScrollIntent(event) {
    if (!scrollKeys.has(event.code)) {
      return;
    }

    if (!scrollEnabled) {
      event.preventDefault();
      window.scrollTo(0, 0);
      return;
    }

    if (isAutoScrolling) {
      stopAutoScroll();
    }
  }

  document.addEventListener('wheel', handleScrollIntent, { passive: false });
  document.addEventListener('touchmove', handleScrollIntent, { passive: false });
  document.addEventListener('keydown', handleKeyboardScrollIntent, { passive: false });
  document.addEventListener('touchstart', stopAutoScroll, { passive: true });
  document.addEventListener('pointerdown', stopAutoScroll, { passive: true });

  lockScroll();

  function startVideo() {
    stopAutoScroll();
    unlockScroll();

    video.currentTime = 0;
    video.muted = false;
    video.volume = 1;

    video.play().then(() => {
      playOverlay.style.display = 'none';
    }).catch(console.log);
  }

  playOverlay.addEventListener('click', startVideo);

  video.addEventListener('click', () => {
    if (window.scrollY <= 5) {
      startVideo();
    }
  });

  video.addEventListener('ended', () => {
    video.pause();
    unlockScroll();
    updateScroll();
    startAutoScrollToEnd();
  });

  function startAutoScrollToEnd() {
    stopAutoScroll();

    const startY = window.scrollY;
    const targetY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    if (targetY - startY <= 8) {
      return;
    }

    const duration = 9000;
    const startTime = window.performance.now();
    isAutoScrolling = true;

    function animate(now) {
      if (!isAutoScrolling) {
        return;
      }

      const progress = clamp((now - startTime) / duration, 0, 1);
      const easedProgress = smoothStep(progress);

      window.scrollTo(0, lerp(startY, targetY, easedProgress));
      updateScroll();

      if (progress < 1) {
        autoScrollFrameId = window.requestAnimationFrame(animate);
      } else {
        stopAutoScroll();
      }
    }

    autoScrollFrameId = window.requestAnimationFrame(animate);
  }

  function getTranslateYForTop(topPx) {
    return topPx - window.innerHeight / 2;
  }

  function movePhoto(el, progress, start, end, rotation) {
    const p = clamp((progress - start) / (end - start), 0, 1);
    const viewportHeight = window.innerHeight;
    const elementHeight = el.getBoundingClientRect().height;

    const topStart = viewportHeight * 1.12;
    const topFullyVisible = Math.max(20, (viewportHeight - elementHeight) / 2);
    const topHoldEnd = Math.max(12, topFullyVisible - Math.min(42, viewportHeight * 0.045));
    const topExit = -elementHeight - viewportHeight * 0.08;

    let top;
    let opacity;

    if (p <= 0) {
      top = topStart;
      opacity = 0;
    } else if (p < 0.34) {
      const t = smoothStep(p / 0.34);
      top = lerp(topStart, topFullyVisible, t);
      opacity = lerp(0, 1, t);
    } else if (p < 0.78) {
      const t = smoothStep((p - 0.34) / 0.44);
      top = lerp(topFullyVisible, topHoldEnd, t);
      opacity = 1;
    } else {
      const t = smoothStep((p - 0.78) / 0.22);
      top = lerp(topHoldEnd, topExit, t);
      opacity = lerp(1, 0, t);
    }

    el.style.transform = `translate(-50%, ${getTranslateYForTop(top)}px) rotate(${rotation}deg)`;
    el.style.opacity = opacity;
  }

  function moveLastPhoto(progress, start, end) {
    const p = clamp((progress - start) / (end - start), 0, 1);
    const viewportHeight = window.innerHeight;
    const elementHeight = photo3.getBoundingClientRect().height;

    const topStart = viewportHeight * 1.12;
    const topFinal = Math.max(20, (viewportHeight - elementHeight) / 2);

    let top;
    let opacity;

    if (p <= 0) {
      top = topStart;
      opacity = 0;
    } else if (p < 0.34) {
      const t = smoothStep(p / 0.34);
      top = lerp(topStart, topFinal, t);
      opacity = lerp(0, 1, t);
    } else {
      top = topFinal;
      opacity = 1;
    }

    photo3.style.transform = `translate(-50%, ${getTranslateYForTop(top)}px) rotate(0deg)`;
    photo3.style.opacity = opacity;
  }

  function updateScroll() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;

    movePhoto(photo1, progress, 0.00, 0.38, -10);
    movePhoto(photo2, progress, 0.27, 0.64, 10);
    moveLastPhoto(progress, 0.58, 1.00);
  }

  window.addEventListener('scroll', updateScroll, { passive: true });
  window.addEventListener('resize', updateScroll);
  photo3Image.addEventListener('load', updateScroll);

  updateScroll();
});
