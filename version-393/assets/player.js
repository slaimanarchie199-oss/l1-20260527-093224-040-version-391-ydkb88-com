
(function(){
function ready(fn){if(document.readyState!=='loading')fn();else document.addEventListener('DOMContentLoaded',fn)}
ready(function(){
var boxes=[].slice.call(document.querySelectorAll('.player-box'));
boxes.forEach(function(box){
var video=box.querySelector('video');var button=box.querySelector('.player-cover');var error=box.querySelector('.player-error');var source=box.getAttribute('data-stream');var hls=null;var loaded=false;
function fail(msg){if(error){error.textContent=msg;error.classList.add('show')}}
function start(){if(!video||!source)return;box.classList.add('started');if(loaded){video.play().catch(function(){});return}loaded=true;if(video.canPlayType('application/vnd.apple.mpegurl')){video.src=source;video.play().catch(function(){})}else if(window.Hls&&window.Hls.isSupported()){hls=new Hls({enableWorker:true,lowLatencyMode:true});hls.loadSource(source);hls.attachMedia(video);hls.on(Hls.Events.MANIFEST_PARSED,function(){video.play().catch(function(){})});hls.on(Hls.Events.ERROR,function(e,d){if(d&&d.fatal){fail('视频加载失败，请稍后再试')}})}else{video.src=source;video.play().catch(function(){fail('视频加载失败，请稍后再试')})}}
if(button)button.addEventListener('click',start);
if(video){video.addEventListener('click',function(){if(!loaded)start();else if(video.paused)video.play().catch(function(){});else video.pause()});video.addEventListener('play',function(){box.classList.add('started')})}
window.addEventListener('beforeunload',function(){if(hls)hls.destroy()})
})
})
})();