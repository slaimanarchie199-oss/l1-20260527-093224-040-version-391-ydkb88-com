(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function initNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var thumbs = Array.prototype.slice.call(document.querySelectorAll('[data-hero-thumb]'));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle('active', i === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        window.clearInterval(timer);
        show(Number(thumb.getAttribute('data-hero-thumb')) || 0);
        start();
      });
    });

    start();
  }

  function initGlobalSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-global-search]'));
    if (!forms.length) {
      return;
    }
    var data = window.MOVIE_SEARCH_DATA || [];
    forms.forEach(function (form) {
      var input = form.querySelector('input[name="q"]');
      var resultBox = form.parentElement.querySelector('[data-search-results]');
      if (!input || !resultBox) {
        return;
      }

      function render() {
        var query = input.value.trim().toLowerCase();
        if (!query) {
          resultBox.classList.remove('active');
          resultBox.innerHTML = '';
          return;
        }
        var matches = data.filter(function (item) {
          return [item.title, item.year, item.region, item.type, item.genre, item.category]
            .join(' ')
            .toLowerCase()
            .indexOf(query) !== -1;
        }).slice(0, 10);
        resultBox.classList.add('active');
        resultBox.innerHTML = matches.length
          ? matches.map(function (item) {
              return '<a href="' + item.url + '"><strong>' + escapeHtml(item.title) + '</strong><em>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.genre) + '</em></a>';
            }).join('')
          : '<a href="categories.html"><strong>未找到直接匹配</strong><em>进入分类总览继续浏览</em></a>';
      }

      input.addEventListener('input', render);
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        render();
      });
    });
  }

  function initPageFilter() {
    var form = document.querySelector('[data-page-filter]');
    var grid = document.querySelector('[data-filter-grid]');
    if (!form || !grid) {
      return;
    }
    var input = form.querySelector('input');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    function filter() {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        card.classList.toggle('is-hidden', query && text.indexOf(query) === -1);
      });
    }

    input.addEventListener('input', filter);
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      filter();
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player-source]'));
    players.forEach(function (box) {
      var source = box.getAttribute('data-player-source');
      var video = box.querySelector('video');
      var button = box.querySelector('[data-play-button]');
      var message = box.querySelector('[data-player-message]');
      var hlsInstance = null;
      var initialized = false;

      function setMessage(text) {
        if (message) {
          message.textContent = text || '';
        }
      }

      function attachSource() {
        if (initialized) {
          return Promise.resolve();
        }
        initialized = true;
        setMessage('正在初始化播放源...');

        if (!source) {
          setMessage('当前影片缺少播放源。');
          return Promise.reject(new Error('missing source'));
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setMessage('');
            video.play().catch(function () {
              setMessage('浏览器阻止了自动播放，请再次点击播放按钮。');
            });
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setMessage('播放源暂时无法载入，可刷新页面后重试。');
              if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
              }
            }
          });
          return Promise.resolve();
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          setMessage('');
          return video.play();
        }

        setMessage('当前浏览器不支持 HLS 播放。');
        return Promise.reject(new Error('hls unsupported'));
      }

      function startPlayback() {
        attachSource().then(function () {
          if (button) {
            button.classList.add('hidden');
          }
          video.play().catch(function () {
            setMessage('请点击视频区域继续播放。');
          });
        }).catch(function () {});
      }

      if (button) {
        button.addEventListener('click', startPlayback);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('hidden');
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  ready(function () {
    initNavigation();
    initHero();
    initGlobalSearch();
    initPageFilter();
    initPlayers();
  });
})();
