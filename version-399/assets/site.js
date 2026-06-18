function ready(callback) {
  if (document.readyState !== "loading") {
    callback();
    return;
  }
  document.addEventListener("DOMContentLoaded", callback);
}

function initializeNavigation() {
  var button = document.querySelector("[data-mobile-toggle]");
  var panel = document.querySelector("[data-mobile-panel]");
  if (!button || !panel) {
    return;
  }
  button.addEventListener("click", function () {
    panel.classList.toggle("is-open");
  });
}

function initializeHeaderSearch() {
  document.querySelectorAll("[data-header-search]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input");
      var query = input ? input.value.trim() : "";
      var url = "movies.html";
      if (query) {
        url += "?q=" + encodeURIComponent(query);
      }
      window.location.href = url;
    });
  });
}

function initializeHeroSlider() {
  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  if (slides.length <= 1) {
    return;
  }
  var current = 0;
  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }
  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      show(index);
    });
  });
  window.setInterval(function () {
    show(current + 1);
  }, 5200);
}

function normalizeText(value) {
  return (value || "").toString().toLowerCase();
}

function initializeCardFilters() {
  var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
  panels.forEach(function (panel) {
    var scopeName = panel.getAttribute("data-filter-panel");
    var grid = document.querySelector('[data-filter-grid="' + scopeName + '"]');
    if (!grid) {
      return;
    }
    var input = panel.querySelector("[data-card-search]");
    var buttons = Array.prototype.slice.call(panel.querySelectorAll("[data-card-filter]"));
    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
    var empty = document.querySelector('[data-filter-empty="' + scopeName + '"]');
    var active = "all";
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q");
    if (initial && input) {
      input.value = initial;
    }
    function run() {
      var query = normalizeText(input ? input.value.trim() : "");
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalizeText(card.getAttribute("data-search"));
        var group = card.getAttribute("data-group") || "";
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesGroup = active === "all" || group.indexOf(active) !== -1;
        var isVisible = matchesQuery && matchesGroup;
        card.style.display = isVisible ? "" : "none";
        if (isVisible) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }
    if (input) {
      input.addEventListener("input", run);
    }
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        active = button.getAttribute("data-card-filter") || "all";
        buttons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        run();
      });
    });
    run();
  });
}

function initializeMoviePlayer(streamUrl) {
  var video = document.querySelector("#movie-player");
  var cover = document.querySelector("[data-player-cover]");
  var button = document.querySelector("[data-player-button]");
  if (!video || !streamUrl) {
    return;
  }
  var attached = false;
  function attach() {
    if (attached) {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
    attached = true;
  }
  function play() {
    attach();
    video.controls = true;
    if (cover) {
      cover.classList.add("is-hidden");
    }
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }
  if (button) {
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      play();
    });
  }
  if (cover) {
    cover.addEventListener("click", play);
  }
  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    }
  });
}

ready(function () {
  initializeNavigation();
  initializeHeaderSearch();
  initializeHeroSlider();
  initializeCardFilters();
});
