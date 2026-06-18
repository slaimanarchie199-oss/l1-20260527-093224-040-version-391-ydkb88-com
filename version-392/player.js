function initPlayer(sourceUrl) {
  const video = document.querySelector(".site-video");
  const button = document.querySelector("[data-play-button]");
  if (!video || !button || !sourceUrl) return;
  let ready = false;
  function load() {
    if (ready) return;
    ready = true;
    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
    }
  }
  function play() {
    load();
    button.classList.add("is-hidden");
    video.setAttribute("controls", "controls");
    const action = video.play();
    if (action && typeof action.catch === "function") {
      action.catch(function() {
        button.classList.remove("is-hidden");
      });
    }
  }
  button.addEventListener("click", play);
  video.addEventListener("click", function() {
    if (video.paused) {
      play();
    } else {
      video.pause();
      button.classList.remove("is-hidden");
    }
  });
}
