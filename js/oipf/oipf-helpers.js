var app;
var skipBtn;

function initRemoteController(videoObject) {
  var appmgr = document.getElementById('appmgr');
  if (appmgr.getOwnerApplication) {
    app = appmgr.getOwnerApplication(document);
    var mask = 0x1 + 0x2 + 0x4 + 0x8 + 0x10 + 0x20 + 0x40 + 0x80;
    app.privateData.keyset.setValue(mask);
    document.addEventListener('keydown', function(e) {
      if (e.keyCode === 13) {
        if (videoObject.playState === 2) {
          videoObject.play(1);
        } else {
          videoObject.play(0);
        }
        e.preventDefault();
      } else if (e.keyCode === 39) {
        videoObject.seek(videoObject.playPosition + 30000);
        e.preventDefault();
      } else if (e.keyCode === 37) {
        videoObject.seek(videoObject.playPosition - 30000);
        e.preventDefault();
      }
    }, false);
  } else {
    videoObject.parentElement.remove();
    const extensionLink = document.createElement('a');
    extensionLink.setAttribute('id', 'extension_link');
    extensionLink.setAttribute('href', 'https://chrome.google.com/webstore/detail/hybridtv-dev-environment/ljmkgjilkcmdokbgofbmjnkobejhhapc');
    extensionLink.setAttribute('target', '_blank');
    extensionLink.text = 'Please download this extension';
    document.getElementsByTagName('body')[0].appendChild(extensionLink);
  }
}

function createAdPlayer(videoObject) {
  var playerId = 'my_ad_id';
  const adVideo = document.createElement('video');
  adVideo.setAttribute('id', playerId);
  adVideo.setAttribute('type', 'video/mp4');
  adVideo.setAttribute('controls', '');
  adVideo.setAttribute('src', 'https://refapp.hbbtv.org/videos/test/test1_15s.mp4');
  adVideo.setAttribute('playsinline', '');
  adVideo.setAttribute('style', 'z-index: 100;position: absolute;width: 100%;');
  document.getElementById('videodiv').appendChild(adVideo);
  videoObject.play(0);
  adVideo.play();
  adVideo.addEventListener('ended', function() {
    adVideo.remove();
    skipBtn.remove();
    videoObject.play(1);
  });

  setTimeout(() => {
    skipBtn = document.createElement('a');
    skipBtn.setAttribute('id', 'skip_ad');
    skipBtn.text = 'Skip Ad⏭️';
    skipBtn.setAttribute('style', 'z-index: 101;position: absolute;top:10px;right: 10px');
    document.addEventListener('keydown', function(e) {
      if (e.keyCode === 13) {
        adVideo.remove();
        skipBtn.remove();
      }
    });
    document.getElementById('videodiv').appendChild(skipBtn);
  }, 5000);
  return adVideo;
}
