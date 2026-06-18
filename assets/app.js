(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-year]').forEach(function (node) {
        node.textContent = String(new Date().getFullYear());
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function startTimer() {
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5000);
        }

        function resetTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            startTimer();
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                resetTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                resetTimer();
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                showSlide(i);
                resetTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    var searchInput = document.querySelector('[data-search-input]');
    var filters = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var emptyState = document.querySelector('[data-empty-state]');

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }
        var query = normalize(searchInput ? searchInput.value : '');
        var values = {};
        filters.forEach(function (filter) {
            values[filter.getAttribute('data-filter')] = normalize(filter.value);
        });
        var visible = 0;
        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-category'),
                card.getAttribute('data-tags')
            ].join(' '));
            var ok = !query || haystack.indexOf(query) !== -1;
            Object.keys(values).forEach(function (key) {
                var value = values[key];
                if (value && normalize(card.getAttribute('data-' + key)).indexOf(value) === -1) {
                    ok = false;
                }
            });
            card.classList.toggle('is-hidden', !ok);
            if (ok) {
                visible += 1;
            }
        });
        if (emptyState) {
            emptyState.classList.toggle('is-visible', visible === 0);
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }

    filters.forEach(function (filter) {
        filter.addEventListener('change', applyFilters);
    });

    var player = document.querySelector('[data-player]');
    if (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play-button]');
        var message = player.querySelector('[data-player-message]');
        var hlsInstance = null;
        var source = video ? video.getAttribute('data-src') : '';

        function setMessage(value) {
            if (message) {
                message.textContent = value;
            }
        }

        function loadScript(src) {
            return new Promise(function (resolve, reject) {
                if (window.Hls) {
                    resolve();
                    return;
                }
                var script = document.createElement('script');
                script.src = src;
                script.async = true;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        function playVideo() {
            if (!video || !source) {
                setMessage('播放源连接失败');
                return;
            }
            setMessage('正在连接播放源…');
            if (button) {
                button.classList.add('is-hidden');
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                if (video.src !== source) {
                    video.src = source;
                }
                video.play().then(function () {
                    setMessage('');
                }).catch(function () {
                    setMessage('点击视频画面继续播放');
                });
                return;
            }
            loadScript('https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js').then(function () {
                if (!window.Hls || !window.Hls.isSupported()) {
                    setMessage('当前浏览器暂不支持此播放源');
                    if (button) {
                        button.classList.remove('is-hidden');
                    }
                    return;
                }
                if (!hlsInstance) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().then(function () {
                            setMessage('');
                        }).catch(function () {
                            setMessage('点击视频画面继续播放');
                        });
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setMessage('播放连接中断，请刷新后重试');
                            if (button) {
                                button.classList.remove('is-hidden');
                            }
                        }
                    });
                } else {
                    video.play().then(function () {
                        setMessage('');
                    }).catch(function () {
                        setMessage('点击视频画面继续播放');
                    });
                }
            }).catch(function () {
                setMessage('播放器组件加载失败');
                if (button) {
                    button.classList.remove('is-hidden');
                }
            });
        }

        if (button) {
            button.addEventListener('click', playVideo);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo();
                }
            });
            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('is-hidden');
                }
            });
            video.addEventListener('pause', function () {
                if (button) {
                    button.classList.remove('is-hidden');
                }
            });
        }
    }
}());
