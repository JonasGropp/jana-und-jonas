document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('weddingVideo');
  const playOverlay = document.getElementById('playOverlay');

  const photo1 = document.querySelector('.polaroid-1');
  const photo2 = document.querySelector('.polaroid-2');
  const photo3 = document.querySelector('.polaroid-3');
  const photo3Image = photo3.querySelector('img');

  let videoCompleted = false;

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

  function lockScroll() {
    videoCompleted = false;
    window.scrollTo(0, 0);
    document.documentElement.classList.add('scroll-locked');
    document.body.classList.add('scroll-locked');
  }

  function unlockScroll() {
    videoCompleted = true;
    document.documentElement.classList.remove('scroll-locked');
    document.body.classList.remove('scroll-locked');
  }

  function preventScrollUntilVideoEnded(event) {
    if (!videoCompleted) {
      event.preventDefault();
      window.scrollTo(0, 0);
    }
  }

  function preventKeyboardScrollUntilVideoEnded(event) {
    if (!videoCompleted && scrollKeys.has(event.code)) {
      event.preventDefault();
      window.scrollTo(0, 0);
    }
  }

  document.addEventListener('wheel', preventScrollUntilVideoEnded, { passive: false });
  document.addEventListener('touchmove', preventScrollUntilVideoEnded, { passive: false });
  document.addEventListener('keydown', preventKeyboardScrollUntilVideoEnded, { passive: false });

  lockScroll();

  function startVideo() {
    lockScroll();

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
  });

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

  function getLastPhotoConfig() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const naturalWidth = photo3Image.naturalWidth || 16;
    const naturalHeight = photo3Image.naturalHeight || 9;

    const normalWidth = viewportWidth;
    const normalHeight = normalWidth * (naturalHeight / naturalWidth);
    const finalScale = Math.max(1, viewportHeight / normalHeight);

    return {
      viewportWidth,
      viewportHeight,
      normalWidth,
      normalHeight,
      finalWidth: normalWidth * finalScale,
      finalHeight: normalHeight * finalScale
    };
  }

  function moveLastPhoto(progress, start, end) {
    const p = clamp((progress - start) / (end - start), 0, 1);
    const config = getLastPhotoConfig();

    const entryEnd = 0.34;
    const holdEnd = 0.56;
    const zoomProgress = p <= holdEnd ? 0 : smoothStep((p - holdEnd) / (1 - holdEnd));

    const currentWidth = lerp(config.normalWidth, config.finalWidth, zoomProgress);
    const currentHeight = lerp(config.normalHeight, config.finalHeight, zoomProgress);
    const currentTop = (config.viewportHeight - currentHeight) / 2;

    let top;
    let opacity;

    if (p <= 0) {
      top = config.viewportHeight * 1.12;
      opacity = 0;
    } else if (p < entryEnd) {
      const t = smoothStep(p / entryEnd);
      top = lerp(config.viewportHeight * 1.12, currentTop, t);
      opacity = lerp(0, 1, t);
    } else {
      top = currentTop;
      opacity = 1;
    }

    photo3.style.width = `${currentWidth}px`;
    photo3.style.height = `${currentHeight}px`;
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
