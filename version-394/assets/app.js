document.addEventListener("DOMContentLoaded", function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            var opened = mobileNav.classList.toggle("open");
            menuButton.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === current);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(current + 1);
        }, 5600);
    }

    var searchInput = document.querySelector("#siteSearch");
    var typeSelect = document.querySelector("#typeFilter");
    var yearSelect = document.querySelector("#yearFilter");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function applyFilters() {
        var keyword = normalize(searchInput ? searchInput.value : "");
        var typeValue = normalize(typeSelect ? typeSelect.value : "");
        var yearValue = normalize(yearSelect ? yearSelect.value : "");

        cards.forEach(function (card) {
            var title = normalize(card.getAttribute("data-title"));
            var region = normalize(card.getAttribute("data-region"));
            var genre = normalize(card.getAttribute("data-genre"));
            var year = normalize(card.getAttribute("data-year"));
            var type = normalize(card.getAttribute("data-type"));
            var textMatch = !keyword || title.indexOf(keyword) > -1 || region.indexOf(keyword) > -1 || genre.indexOf(keyword) > -1;
            var typeMatch = !typeValue || type.indexOf(typeValue) > -1;
            var yearMatch = !yearValue || year === yearValue;
            card.classList.toggle("is-filtered-out", !(textMatch && typeMatch && yearMatch));
        });
    }

    [searchInput, typeSelect, yearSelect].forEach(function (item) {
        if (item) {
            item.addEventListener("input", applyFilters);
            item.addEventListener("change", applyFilters);
        }
    });

    var filterButtons = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));
    filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            var group = button.parentElement;
            Array.prototype.slice.call(group.querySelectorAll(".filter-chip")).forEach(function (item) {
                item.classList.remove("active");
            });
            button.classList.add("active");
            if (typeSelect) {
                typeSelect.value = button.getAttribute("data-type") || "";
                applyFilters();
            }
        });
    });
});

function startVideo(videoId, buttonId, overlayId, source) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var overlay = document.getElementById(overlayId);

    if (!video || !source) {
        return;
    }

    var loaded = false;

    function loadAndPlay() {
        if (!loaded) {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new Hls({ enableWorker: true, lowLatencyMode: false });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
            loaded = true;
        }

        if (overlay) {
            overlay.classList.add("is-hidden");
        }

        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
        }
    }

    if (button) {
        button.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            loadAndPlay();
        });
    }

    if (overlay) {
        overlay.addEventListener("click", loadAndPlay);
    }
}
