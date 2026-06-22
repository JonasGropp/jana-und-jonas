document.addEventListener('DOMContentLoaded', () => {

    const video = document.getElementById('weddingVideo');
    const videoWrapper = document.getElementById('videoWrapper');
    const soundButton = document.getElementById('sound-Button');

    // Video neu starten bei Klick auf das Video
    videoWrapper.addEventListener('click', (event) => {

        // Nicht neu starten wenn auf den Sound Button geklickt wurde
        if (event.target === soundButton) {
            return;
        }

        video.currentTime = 0;
        video.play().catch(err => console.log(err));

    });

    // Ton ein/aus
    soundButton.addEventListener('click', (event) => {

        event.stopPropagation();

        if (video.muted) {

            video.muted = false;
            video.volume = 1;

            soundButton.innerHTML = '🔊 Ton an';

            // Bei pausiertem Video erneut starten
            if (video.paused) {
                video.play().catch(err => console.log(err));
            }

        } else {

            video.muted = true;

            soundButton.innerHTML = '🔇 Ton einschalten';

        }

    });

});
