var videoPlayerInit = function (playerId, contentId, videoFile, autoPlay, live, absoluteOffset, videoOffset) {
    // setting up player and agent
    var playerInstance = jwplayer(playerId);

    function getVideoPositionLiveVideo() {
        return new Date().getTime();
    }

    function getVideoPositionVOD() {
        return Math.round(playerInstance.getPosition() * 1000);
    }

    var agent;
    if (live) {
        agent = gfkS2s.getAgent(getVideoPositionLiveVideo, playerId);
    } else {
        agent = gfkS2s.getAgent(getVideoPositionVOD, playerId);
    }

    playerInstance.setup({
        file: videoFile,
        autostart: autoPlay,
        mute: true,
        cast: {}
    });

    function playStreamLiveSdk(contentId) {
        var item = playerInstance.getPlaylistItem();
        var volume = playerInstance.getMute() === true ? 0 : playerInstance.getVolume();
        var options = {screen: 'Fullscreen=' + playerInstance.getFullscreen().toString(), volume: volume.toString()};
        agent.playStreamLive(contentId, absoluteOffset, videoOffset, item.file, options, {playerid: playerId, cliptype: "live"});
    }

    function playStreamOnDemandSdk(contentId) {
        var item = playerInstance.getPlaylistItem();
        var volume = playerInstance.getMute() === true ? 0 : playerInstance.getVolume();
        var options = {screen: 'Fullscreen=' + playerInstance.getFullscreen().toString(), volume: volume.toString()};
        agent.playStreamOnDemand(contentId, item.file, options, {playerid: playerId, cliptype: "Sendung"});
    }

    playerInstance.on('play', function () {
        console.log("%c play ", "background: #a50; color: #fff");
        if (live) {
            playStreamLiveSdk(contentId);
        } else {
            playStreamOnDemandSdk(contentId);
        }
    });

    playerInstance.on('cast', function (yo) {
        console.log("%c cast ", "background: #a50; color: #fff", "", yo);
    });

    playerInstance.on('pause', function () {
        console.log("%c pause ", "background: #a50; color: #fff");
        agent.stop();
    });

    playerInstance.on('idle', function () {
        console.log("%c idle ", "background: #a50; color: #fff");
        agent.stop();
    });

    playerInstance.on('complete', function () {
        console.log("%c complete ", "background: #a50; color: #fff");
        agent.stop();
    });

    playerInstance.on('seek', function () {
        console.log("%c seek ", "background: #a50; color: #fff");
        if (playerInstance.getState() === "playing") {
            agent.stop();
        }
    });

    playerInstance.on('volume', function () {
        console.log("%c volume ", "background: #a50; color: #fff");
        var volume = playerInstance.getMute() === true ? 0 : playerInstance.getVolume();
        agent.volume(volume.toString());
    });

    playerInstance.on('fullscreen', function () {
        console.log("%c fullscreen ", "background: #a50; color: #fff");
        agent.screen("fullscreen=" + playerInstance.getFullscreen());
    });

    playerInstance.on('mute', function () {
        console.log("%c mute ", "background: #a50; color: #fff");
        var volume = playerInstance.getMute() === true ? 0 : playerInstance.getVolume();
        agent.volume(volume.toString());
    });
};

var videoPlayerCustom = function (videoFile) {
    var videoType = document.getElementById("videoType");
    var live = videoType.options[videoType.selectedIndex].value === "live" ? true : false
    var videoOffset = parseInt(document.getElementById("videoOffset").value);
    var contentStart = document.getElementById("contentStart").value;
    var contentId = "videoCustom";
    var playerId = "playerCustom";

    videoPlayerInit(playerId, contentId, videoFile, false, live, contentStart, videoOffset);
};

$(document).ready(function () {
    $(window).load(function () {
        var autoplayParam = new URL(location.href).searchParams.get('autoplay');
        var autoplay = autoplayParam ? parseInt(autoplayParam) : 0;
        if (autoplay) {
            console.log("Autoplay: " + autoplay);
        }
        videoPlayerInit("player", "video1", "videos/testvideo.mp4", autoplay == 1, true, "2018-10-05T14:48:00+06:00", 0);
        videoPlayerInit("player2", "video2", "videos/gfk_brand_video.mp4", autoplay == 2, true, "", 0);
        videoPlayerInit("player3", "video3", "videos/understanding_mobile_consumer.mp4", autoplay == 3, false, "", 0);
    });
});