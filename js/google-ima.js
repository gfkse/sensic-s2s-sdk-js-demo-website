// Define a variable to track whether there are ads loaded and initially set it to false
var adsLoaded = false;
var adContainer = document.getElementById('ad-container');
var adDisplayContainer;
var adsLoader;
var adsManager;
var adRunning = false;
var video;
adContainer.style.display = 'none';
var playAdButton = document.getElementById('play_ad');

function initGoogleIma(videoElement, tagUrl) {
  video = videoElement;
  google.ima.settings.setDisableCustomPlaybackForIOS10Plus(true);
  adDisplayContainer = new google.ima.AdDisplayContainer(adContainer, video);
  adsLoader = new google.ima.AdsLoader(adDisplayContainer);
  var adsRequest = new google.ima.AdsRequest();
  // real live ad
  // adsRequest.adTagUrl = '//ad13.adfarm1.adition.com/banner?wpt=X&ts=1647952877&sid=4420431&p[stype:vod,scat:doku-reportage,scatid:1173,spro:der-talentierte-herr-hessenthaler,sproid:13893759,episodeid:14128205,duration:2721000,advertisingtags:null,oon-ds-ads:undefined,platform:web,test:false,viewport:tablet,orientation:landscape,user-agent:orf-tvthek-mozilla-50-windows-nt-100-win64-x64-applewebkit-53736-khtml-like-gecko-chrome-990484451-safari-53736,ctype:12]';
  adsRequest.adTagUrl = '//pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpremidpost&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&impl=s&cmsid=496&vid=short_onecue&correlator=';
  if (tagUrl) {
    adsRequest.adTagUrl = tagUrl;
  }

  // Specify the linear and nonlinear slot sizes. This helps the SDK to
  // select the correct creative if multiple are returned.
  adsRequest.linearAdSlotWidth = video.clientWidth;
  adsRequest.linearAdSlotHeight = video.clientHeight;
  adsRequest.nonLinearAdSlotWidth = video.clientWidth;
  adsRequest.nonLinearAdSlotHeight = video.clientHeight / 3;
  if (playAdButton) {
    playAdButton.addEventListener('click', function() {
      adDisplayContainer.initialize();
      adsLoader.requestAds(adsRequest);
    });

  } else {
    video.addEventListener('click', function() {
      adDisplayContainer.initialize();
    });
    video.addEventListener('playing', function() {
      setTimeout(() => {
        adsLoader.requestAds(adsRequest);
      }, 3000);
    });
  }
  addEvents();
}

function onAdError(adErrorEvent) {
  // Handle the error logging.
  console.log(adErrorEvent.getError());
  if (adsManager) {
    adsManager.destroy();
  }
}

function onLoaded(adEvent) {
  var ad = adEvent.getAd();
  if (!ad.isLinear()) {
    video.play();
  }
}

function stopVideo() {
  adRunning = true;
  if (!video.paused) {
    video.pause();
  }
}

function onStarted() {
  adContainer.style.display = 'block';
}

function hideAdAndPlayVideo() {
  adContainer.style.display = 'none';
  if (video.paused && !video.ended) {
    adRunning = false;
    video.play();
  }
}

function onAdBreakReady() {
  adsManager.start();
}

function onAdContainerClick() {
  if (!adRunning) {
    adRunning = true;
    adsManager.resume();
  } else {
    adRunning = false;
    adsManager.pause();
  }
}

function initAdsManager() {
  if (adsManager) {
    // prevent this function from running on every play event
    if (adsLoaded) {
      return;
    }
    adsLoaded = true;
    var width = video.clientWidth;
    var height = video.clientHeight;
    try {
      adsManager.init(width, height, google.ima.ViewMode.NORMAL);
    } catch (adError) {
      // Play the video without ads, if an error occurs
      video.play();
    }
  }
}

function addEvents() {
  adsLoader.addEventListener(google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, onAdsManagerLoaded, false);
  // Let the AdsLoader know when the video has ended
  video.addEventListener('ended', function() {
    adsLoader.contentComplete();
  });

  video.addEventListener('resize', function() {
    if (adsManager) {
      var width = video.clientWidth;
      var height = video.clientHeight;
      adsManager.resize(width, height, google.ima.ViewMode.NORMAL);
    }
  });
  adsLoader.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError, false);
}

function onAdsManagerLoaded(adsManagerLoadedEvent) {
  adsManager = adsManagerLoadedEvent.getAdsManager(video);
  adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError);
  adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, hideAdAndPlayVideo);
  adsManager.addEventListener(google.ima.AdEvent.Type.LOADED, onLoaded);
  // For non-auto ad breaks, listen for ad break ready
  adsManager.addEventListener(google.ima.AdEvent.Type.AD_BREAK_READY, onAdBreakReady);
  adsManager.addEventListener(google.ima.AdEvent.Type.STARTED, onStarted);
  adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, stopVideo);
  adContainer.addEventListener('click', onAdContainerClick);
  initAdsManager();
}
