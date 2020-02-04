window.players = window.players || {};

/**
 *
 * @param {*} contentId The id of the video passed to agent.playStream
 * @param {*} contentId An ID (name) for the player
 * @param {*} containerElement HTML element where the video will be rendered
 * @param {*} videoSource Source configuration of the video file
 * @param {*} autoPlay
 * @param {*} live
 * @param {*} absoluteOffset
 * @param {*} videoOffset
 */
var videoPlayerInit = function (contentId, playerId, containerElement, videoSource, autoPlay, live, absoluteOffset, videoOffset) {
    // setting up player and agent
    var playerConfig = {
        key: "7c60f446-6054-446d-b829-816af360d7f3",
        cast: { enable: contentId === "video1" },
        playback: {
            autoplay: autoPlay,
            muted: true
        }
    };
    var playerInstance = new bitmovin.player.Player(containerElement, playerConfig);
    window.players[playerId] = playerInstance;

    var agent;
    if (live) {
        agent = gfkS2s.getAgent(function livePosition() { return new Date().getTime(); }, containerElement.id);
    } else {
        agent = gfkS2s.getAgent(function onDemandPosition() { return Math.round(playerInstance.getCurrentTime() * 1000); }, containerElement.id);
    }

    function getVolume() {
        return (playerInstance.isMuted() ? 0 : playerInstance.getVolume()).toString();
    }
    function getScreen() {
        return 'Fullscreen=' + (playerInstance.getViewMode() === bitmovin.player.ViewMode.Fullscreen).toString();
    }
    function playStreamLiveSdk() {
        agent.playStreamLive(contentId, absoluteOffset, videoOffset, videoSource.title, { screen: getScreen(), volume: getVolume() }, {playerid: playerId, cliptype: "live"});
    }
    function playStreamOnDemandSdk() {
        agent.playStreamOnDemand(contentId, videoSource.title, { screen: getScreen(), volume: getVolume() }, {playerid: playerId, cliptype: "Sendung"});
    }

    playerInstance.on(bitmovin.player.PlayerEvent.Play, function() {
        console.log("%c play %c #%s", "background: #a50; color: #fff", "", contentId);
        if (live) {
            playStreamLiveSdk(contentId);
        } else {
            playStreamOnDemandSdk(contentId);
        }
    });
    playerInstance.on(bitmovin.player.PlayerEvent.Paused, function () {
        console.log("%c paused %c #%s", "background: #a50; color: #fff", "", contentId);
        agent.stop();
    });
    playerInstance.on(bitmovin.player.PlayerEvent.PlaybackFinished, function () {
        console.log("%c playback finished %c #%s", "background: #a50; color: #fff", "", contentId);
        agent.stop();
    });

    playerInstance.on(bitmovin.player.PlayerEvent.ViewModeChanged, function (viewModeChangedEvent) {
        console.log("%c view mode changed %c #%s", "background: #a50; color: #fff", "", contentId);
        if (viewModeChangedEvent.from === bitmovin.player.ViewMode.Fullscreen || viewModeChangedEvent.to === bitmovin.player.ViewMode.Fullscreen) {
            agent.screen(getScreen());
        }
    });

    playerInstance.on(bitmovin.player.PlayerEvent.VolumeChanged, function () {
        console.log("%c volume changed %c #%s", "background: #a50; color: #fff", "", contentId);
        agent.volume(getVolume());
    });
    playerInstance.on(bitmovin.player.PlayerEvent.Muted, function () {
        console.log("%c muted %c #%s", "background: #a50; color: #fff", "", contentId);
        agent.volume(getVolume());
    });
    playerInstance.on(bitmovin.player.PlayerEvent.Unmuted, function () {
        console.log("%c unmuted %c #%s", "background: #a50; color: #fff", "", contentId);
        agent.volume(getVolume());
    });

    playerInstance.on(bitmovin.player.PlayerEvent.CastAvailable, function (castAvailableEvent) {
        console.log("%c cast available %c #%s", "background: #a50; color: #fff", "", contentId, "", castAvailableEvent);
    });
    playerInstance.on(bitmovin.player.PlayerEvent.CastStart, function (castStartEvent) {
        console.log("%c cast start %c #%s", "background: #a50; color: #fff", "", contentId, "", castStartEvent);
    });
    playerInstance.on(bitmovin.player.PlayerEvent.CastStarted, function (castStartedEvent) {
        console.log("%c cast started %c #%s", "background: #a50; color: #fff", "", contentId, "", castStartedEvent);
    });
    playerInstance.on(bitmovin.player.PlayerEvent.CastStopped, function (castStoppedEvent) {
        console.log("%c cast stopped %c #%s", "background: #a50; color: #fff", "", contentId, "", castStoppedEvent);
        agent.stop();
    });

    // Start loading and playing the video
    playerInstance.load(videoSource).then(
        function() {
            console.debug('Created Bitmovin Player instance', playerInstance);
        },
        function(error) {
            console.error('Error creating Bitmovin Player instance:', error);
        }
    );
};

function customPositionPlayerInit(contentId, playerId, containerElement, videoSource, customPositionInput) {
    var playerConfig = {
        key: "7c60f446-6054-446d-b829-816af360d7f3",
        cast: { enable: false },
        playback: {
            muted: true
        }
    };
    var playerInstance = new bitmovin.player.Player(containerElement, playerConfig);
    window.players[playerId] = playerInstance;
    var agent = gfkS2s.getAgent(function() { return 0; }, playerId);

    playerInstance.load(videoSource).then(
        function() {
            console.debug('Created Bitmovin Player instance', playerInstance);
        },
        function(error) {
            console.error('Error creating Bitmovin Player instance:', error);
        }
    );

    function getPositionFromInput() {
        return parseInt(document.querySelector(customPositionInput).value);
    }

    function getVolume() {
        return (playerInstance.isMuted() ? 0 : playerInstance.getVolume()).toString();
    }
    function getScreen() {
        return 'Fullscreen=' + (playerInstance.getViewMode() === bitmovin.player.ViewMode.Fullscreen).toString();
    }
    playerInstance.on(bitmovin.player.PlayerEvent.Play, function() {
        agent.playStreamOnDemand(contentId, videoSource.title, getPositionFromInput(), { screen: getScreen(), volume: getVolume() }, {playerid: playerId, cliptype: "Sendung"});
    });
    playerInstance.on(bitmovin.player.PlayerEvent.Paused, function () {
        agent.stop(getPositionFromInput());
    });
}

var videoSources = {
    video1: {
        title: "Test video",
        progressive: "https://demo-config.sensic.net/s2s/videos/testvideo.mp4",
    },
    video2: {
        title: "Gfk brand video",
        progressive: "https://demo-config.sensic.net/s2s/videos/gfk_brand_video.mp4",
    },
    video3: {
        title: "Understanding mobile consumer",
        progressive: "https://demo-config.sensic.net/s2s/videos/understanding_mobile_consumer.mp4",
    },
    video4: {
        title: "Life without market research",
        progressive: 'https://demo-config.sensic.net/s2s/videos/life_without_market_research.mp4',
    },
    video5: {
        title: "Test video",
        progressive: "https://demo-config.sensic.net/s2s/videos/testvideo.mp4",
    }
};

window.videoPlayerCustom = function () {
    var videoType = document.getElementById("videoType");
    var live = (videoType.options[videoType.selectedIndex].value === "live");
    var videoOffset = parseInt(document.getElementById("videoOffset").value);
    var contentStart = document.getElementById("contentStart").value;
    var contentId = "videoCustom";
    var playerId = "playerCustom";
    var containerElement = document.getElementById("videoCustom");
    videoPlayerInit(contentId, playerId, containerElement, videoSources.video4, false, live, contentStart, videoOffset);
};

$(document).ready(function () {
    $(window).load(function () {
        var autoplayParam = new URL(location.href).searchParams.get('autoplay');
        var autoplay = autoplayParam ? parseInt(autoplayParam) : 0;
        if (autoplay) {
            console.log("Autoplay: " + autoplay);
        }
        videoPlayerInit("video1", "player1", document.getElementById("video1"), videoSources.video1, autoplay == 1, true, "2018-10-05T14:48:00+06:00", 0);
        videoPlayerInit("video2", "player2", document.getElementById("video2"), videoSources.video2, autoplay == 2, true, "", 0);
        videoPlayerInit("video3", "player3", document.getElementById("video3"), videoSources.video3, autoplay == 3, false, "", 0);
        customPositionPlayerInit("video5", "player5", document.getElementById("video5"), videoSources.video5,  "#video5position");
    });
});
