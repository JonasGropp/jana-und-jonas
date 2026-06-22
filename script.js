document.addEventListener('DOMContentLoaded', () => {

    const video = document.getElementById('weddingVideo');
    const playOverlay = document.getElementById('playOverlay');

    playOverlay.addEventListener('click', async () => {

        try {

            video.muted = false;
            video.volume = 1;

            await video.play();

            playOverlay.style.display = 'none';

        } catch (error) {

            console.error(error);

        }

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
