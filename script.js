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
  let autoScrollDisabledByUser = false;

  const scrollKeys = new Set([
    'ArrowDown',
    'ArrowUp',
    'PageDown',
    'PageUp',
    'Home',
    'End',
    'Space'
  ]);

  const videoScrollTimeline = [
    { time: 11.82, progress: 0.00 },
    { time: 12.17, progress: 0.1292 },
  
    { time: 13.13, progress: 0.27 },
    { time: 13.48, progress: 0.3958 },
  
    { time: 15.06, progress: 0.58 },
    { time: 15.41, progress: 1.00 },
  ];

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

  function getMaxScroll() {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }

  function progressToScrollY(progress) {
    return getMaxScroll() * clamp(progress, 0, 1);
  }

  function stopAutoScroll() {
    if (autoScrollFrameId !== null) {
      window.cancelAnimationFrame(autoScrollFrameId);
      autoScrollFrameId = null;
    }

    isAutoScrolling = false;
  }

  function disableAutoScrollByUser() {
    if (!scrollEnabled) {
      return;
    }

    autoScrollDisabledByUser = true;
    stopAutoScroll();
  }

  function lockScroll() {
    stopAutoScroll();
    scrollEnabled = false;
    autoScrollDisabledByUser = false;
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
      disableAutoScrollByUser();
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
      disableAutoScrollByUser();
    }
  }

  document.addEventListener('wheel', handleScrollIntent, { passive: false });
  document.addEventListener('touchmove', handleScrollIntent, { passive: false });
  document.addEventListener('keydown', handleKeyboardScrollIntent, { passive: false });
  document.addEventListener('touchstart', disableAutoScrollByUser, { passive: true });
  document.addEventListener('pointerdown', disableAutoScrollByUser, { passive: true });

  lockScroll();

  function startVideo() {
    stopAutoScroll();
    autoScrollDisabledByUser = false;
    unlockScroll();

    video.currentTime = 0;
    video.muted = false;
    video.volume = 1;

    video.play().then(() => {
      playOverlay.style.display = 'none';
      startVideoTimedAutoScroll();
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

    if (!autoScrollDisabledByUser) {
      startAutoScrollToEnd();
    }
  });

  function getVideoScrollProgress(currentTime) {
    if (currentTime < videoScrollTimeline[0].time) {
      return null;
    }

    for (let i = 0; i < videoScrollTimeline.length - 1; i += 1) {
      const current = videoScrollTimeline[i];
      const next = videoScrollTimeline[i + 1];

      if (currentTime >= current.time && currentTime < next.time) {
        const segmentProgress = smoothStep((currentTime - current.time) / (next.time - current.time));
        return lerp(current.progress, next.progress, segmentProgress);
      }
    }

    return videoScrollTimeline[videoScrollTimeline.length - 1].progress;
  }

  function startVideoTimedAutoScroll() {
    stopAutoScroll();

    if (autoScrollDisabledByUser) {
      return;
    }

    isAutoScrolling = true;

    function animate() {
      if (!scrollEnabled || autoScrollDisabledByUser || video.paused || video.ended) {
        stopAutoScroll();
        return;
      }

      const targetProgress = getVideoScrollProgress(video.currentTime);

      if (targetProgress !== null) {
        window.scrollTo(0, progressToScrollY(targetProgress));
        updateScroll();
      }

      autoScrollFrameId = window.requestAnimationFrame(animate);
    }

    autoScrollFrameId = window.requestAnimationFrame(animate);
  }

  function startAutoScrollToEnd() {
    stopAutoScroll();

    if (autoScrollDisabledByUser) {
      return;
    }

    const startY = window.scrollY;
    const targetY = getMaxScroll();

    if (targetY - startY <= 8) {
      return;
    }

    const duration = 12000;
    const startTime = window.performance.now();
    isAutoScrolling = true;

    function animate(now) {
      if (!isAutoScrolling || autoScrollDisabledByUser) {
        stopAutoScroll();
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
      const t = smoothStep((p - 0.34) / 0.66);
      const topHoldEnd = Math.max(12, topFinal - Math.min(42, viewportHeight * 0.045));
    
      top = lerp(topFinal, topHoldEnd, t);
      opacity = 1;
    }

    photo3.style.transform = `translate(-50%, ${getTranslateYForTop(top)}px) rotate(0deg)`;
    photo3.style.opacity = opacity;
  }

  function updateScroll() {
    const maxScroll = getMaxScroll();
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
