(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mainNav = document.querySelector('.main-nav');

    if (menuButton && mainNav) {
        menuButton.addEventListener('click', function () {
            mainNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var index = 0;

    function showSlide(nextIndex) {
        if (!slides.length) {
            return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === index);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === index);
        });
    }

    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
            showSlide(dotIndex);
        });
    });

    if (slides.length > 1) {
        showSlide(0);
        setInterval(function () {
            showSlide(index + 1);
        }, 5200);
    }

    var searchInput = document.querySelector('[data-search-input]');
    var searchableItems = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
    var emptyMessage = document.querySelector('[data-empty-message]');

    if (searchInput && searchableItems.length) {
        searchInput.addEventListener('input', function () {
            var keyword = searchInput.value.trim().toLowerCase();
            var visible = 0;

            searchableItems.forEach(function (item) {
                var title = (item.getAttribute('data-title') || '').toLowerCase();
                var tags = (item.getAttribute('data-tags') || '').toLowerCase();
                var year = (item.getAttribute('data-year') || '').toLowerCase();
                var region = (item.getAttribute('data-region') || '').toLowerCase();
                var matched = !keyword || title.indexOf(keyword) >= 0 || tags.indexOf(keyword) >= 0 || year.indexOf(keyword) >= 0 || region.indexOf(keyword) >= 0;
                item.style.display = matched ? '' : 'none';

                if (matched) {
                    visible += 1;
                }
            });

            if (emptyMessage) {
                emptyMessage.style.display = visible ? 'none' : 'block';
            }
        });
    }

    var video = document.getElementById('movie-player');
    var playButton = document.getElementById('play-button');
    var playLayer = document.querySelector('.play-layer');
    var hlsInstance = null;

    function beginPlayback() {
        if (!video || !playButton) {
            return;
        }

        var source = playButton.getAttribute('data-stream');

        if (!source) {
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            if (hlsInstance) {
                hlsInstance.destroy();
            }

            hlsInstance = new window.Hls({
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.play().catch(function () {});
        } else {
            video.src = source;
            video.play().catch(function () {});
        }

        if (playLayer) {
            playLayer.classList.add('is-hidden');
        }
    }

    if (playButton && video) {
        playButton.addEventListener('click', beginPlayback);
        video.addEventListener('click', function () {
            if (video.paused) {
                video.play().catch(function () {});
            } else {
                video.pause();
            }
        });
    }
})();
