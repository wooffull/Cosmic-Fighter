"use strict";

var Network = require('./network');
var util = require('./util');
var Assets = util.Assets;
var scenes = require('./scenes');
var overlays = require('./overlays');

// Create game
var canvas = document.querySelector("#game-canvas");
var game   = wfl.create(canvas);

var loadingScene = new scenes.LoadingScene(canvas);
game.setScene(loadingScene);

// Stop the game so that canvas updates don't affect performance with
// overlays
game.stop();

var onLoad = function () {
    $(Network).on(
        Network.Event.CONNECT,
        onNetworkConnect
    );

    Network.init();
};

var onNetworkConnect = function () {
    var lobbyScene = new scenes.LobbyScene(canvas);
    game.setScene(lobbyScene);

    $(lobbyScene).on(scenes.LobbyScene.Event.PLAY_GAME, onPlayGame);
};

var onPlayGame = function (e, roomId) {
    $(game.getScene()).off();

    var gameScene = new scenes.GameScene(canvas, roomId);
    game.setScene(gameScene);
    
    // Start the game since it was stopped to help performance with overlays on
    // a canvas
    game.start();
};

var Preloader = new util.Preloader(onLoad.bind(this));