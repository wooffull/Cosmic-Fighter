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

var onLoad = function () {
    $(Network).on(
        Network.event.CONNECT,
        onNetworkConnect
    );

    Network.init();
};

var onNetworkConnect = function () {
    var lobbyScene = new scenes.LobbyScene(canvas);
    game.setScene(lobbyScene);
    
    $(lobbyScene).on("play-game", onPlayGame);
};

var onPlayGame = function () {
    $(game.getScene()).off();
    
    var gameScene = new scenes.GameScene(canvas);
    game.setScene(gameScene);
};

var Preloader = new util.Preloader(onLoad.bind(this));