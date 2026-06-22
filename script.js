document.addEventListener('DOMContentLoaded', () => {

    const video = document.getElementById('weddingVideo');
    const playOverlay = document.getElementById('playOverlay');

    playOverlay.addEventListener('click', () => {

        video.muted = false;
        video.volume = 1;

        video.play();

        playOverlay.style.display = 'none';

    });

    video.addEventListener('ended', () => {

        video.pause();

    });

    video.addEventListener('click', () => {

        if (video.ended) {

            video.currentTime = 0;
            video.play();

        }

    });

});
