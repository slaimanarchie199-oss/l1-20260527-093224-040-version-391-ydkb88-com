(function () {
  var navButton = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (navButton && mobileNav) {
    navButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;
  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }
  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
    });
  });
  if (slides.length > 1) {
    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var search = document.querySelector('.movie-search');
  var filter = document.querySelector('.movie-filter');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  function applyFilter() {
    var q = search ? search.value.trim().toLowerCase() : '';
    var cat = filter ? filter.value.trim() : '';
    cards.forEach(function (card) {
      var text = [
        card.dataset.title || '',
        card.dataset.year || '',
        card.dataset.genre || '',
        card.dataset.region || '',
        card.textContent || ''
      ].join(' ').toLowerCase();
      var matchedText = !q || text.indexOf(q) !== -1;
      var matchedCat = !cat || text.indexOf(cat.toLowerCase()) !== -1;
      card.classList.toggle('hidden-by-filter', !(matchedText && matchedCat));
    });
  }
  if (search) {
    search.addEventListener('input', applyFilter);
  }
  if (filter) {
    filter.addEventListener('change', applyFilter);
  }

  var video = document.querySelector('#movie-video');
  var layer = document.querySelector('.play-layer');
  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
    script.onload = callback;
    document.head.appendChild(script);
  }
  function startVideo() {
    if (!video) {
      return;
    }
    var stream = video.getAttribute('data-stream');
    if (!stream) {
      return;
    }
    function playNow() {
      if (layer) {
        layer.classList.add('is-hidden');
      }
      var p = video.play();
      if (p && p.catch) {
        p.catch(function () {});
      }
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.src) {
        video.src = stream;
      }
      playNow();
    } else {
      loadHls(function () {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls();
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, playNow);
        } else {
          video.src = stream;
          playNow();
        }
      });
    }
  }
  if (layer) {
    layer.addEventListener('click', startVideo);
  }
  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        startVideo();
      }
    });
  }
})();
