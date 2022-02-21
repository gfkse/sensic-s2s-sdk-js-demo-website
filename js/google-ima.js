// Define a variable to track whether there are ads loaded and initially set it to false
var adsLoaded = false;
var adContainer = document.getElementById('ad-container');
var adDisplayContainer;
var adsLoader;
var adsManager;
var adRunning = false;
var video;

function initGoogleIma(videoElement) {
  video = videoElement;
  adDisplayContainer = new google.ima.AdDisplayContainer(adContainer, video);
  adsLoader = new google.ima.AdsLoader(adDisplayContainer);
  var adsRequest = new google.ima.AdsRequest();
  adsRequest.adTagUrl = '//pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/ad_rule_samples&ciu_szs=300x250&ad_rule=1&impl=s&gdfp_req=1&env=vp&output=vmap&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ar%3Dpremidpost&cmsid=496&vid=short_onecue&correlator=';
  // Specify the linear and nonlinear slot sizes. This helps the SDK to
  // select the correct creative if multiple are returned.
  adsRequest.linearAdSlotWidth = video.clientWidth;
  adsRequest.linearAdSlotHeight = video.clientHeight;
  adsRequest.nonLinearAdSlotWidth = video.clientWidth;
  adsRequest.nonLinearAdSlotHeight = video.clientHeight / 3;
  // Pass the request to the adsLoader to request ads
  adsLoader.requestAds(adsRequest);
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

function onContentPauseRequested() {
  adRunning = true;
  if (!video.paused) {
    video.pause();
  }
}

function onStarted() {
  adContainer.style.display = 'block';
}

function onContentResumeRequested() {
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
    adDisplayContainer.initialize();
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
  adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, onContentResumeRequested);
  adsManager.addEventListener(google.ima.AdEvent.Type.LOADED, onLoaded);
  // For non-auto ad breaks, listen for ad break ready
  adsManager.addEventListener(google.ima.AdEvent.Type.AD_BREAK_READY, onAdBreakReady);
  adsManager.addEventListener(google.ima.AdEvent.Type.STARTED, onStarted);
  adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, onContentPauseRequested);
  adContainer.addEventListener('click', onAdContainerClick);
  initAdsManager();
}
