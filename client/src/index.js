"use strict";

var util = require('./util');
var Assets = util.Assets;
var Network = require('./network');
var scenes = require('./scenes');

// Create game
var canvas = document.querySelector("#game-canvas");
var game   = wfl.create(canvas);

var onLoad = function () {
    $(Network).on(
        Network.event.CONNECT,
        onNetworkConnect
    );

    Network.init();
};

var onNetworkConnect = function () {
    var gameScene = new scenes.GameScene(canvas);

    // TODO: Avoid having to pass the keyboard in like this
    gameScene.keyboard = game.keyboard;

    game.addScene(gameScene);
};

var Preloader = new util.Preloader(onLoad.bind(this));