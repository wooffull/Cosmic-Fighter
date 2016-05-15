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

// Draw initial black BG on canvas
var ctx = canvas.getContext("2d");
ctx.fillStyle = "#040B0C";
ctx.fillRect(0, 0, canvas.width, canvas.height);

var onLoad = function () {
    $(Network).on(
        Network.Event.CONNECT,
        onNetworkConnect
    );

    Network.init();
};

var goToGame = function (room) {
    // Update the game with the current time because the dt will be huge next
    // update since the game was stopped while in the lobby
    game.update(Date.now());

    $(game.getScene()).off();

    var gameScene = new scenes.GameScene(canvas, room);
    game.setScene(gameScene);

    $(Network).on(
        Network.Event.END_GAME,
        onEndGame
    );

    // If the player receives data for game over before they actually load the
    // gave over screen, skip immediately to the game over screen (because only
    // the host would send that data)
    $(Network).on(
        Network.Event.GAME_OVER_DATA,
        room,
        onGetGameOverData
    );

    // Start the game since it was stopped to help performance with overlays on
    // a canvas
    game.start();
};

var goToLobby = function () {
    // Draw black over the canvas
    ctx.fillStyle = "#040B0C";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stop the game so that canvas updates don't affect performance with
    // overlays
    game.stop();

    $(game.getScene()).off();

    // Reset all listeners on the Network
    $(Network).off();

    var lobbyScene = new scenes.LobbyScene(canvas);
    game.setScene(lobbyScene);

    $(Network).on(
        Network.Event.START_GAME,
        onStartGame
    );

    // Transition the page's BG color to black to hide the BG image which
    // becomes distracting during game play
    $("body").css({"background-color": "#071213"});
};

var goToGameOver = function (room) {
    // Stop the game so that canvas updates don't affect performance with
    // overlays
    game.stop();

    // Reset all listeners on the Network
    $(Network).off();

    var gameOverScene = new scenes.GameOverScene(canvas, room);
    game.setScene(gameOverScene);

    $(gameOverScene).on(
        scenes.GameOverScene.Event.RETURN_TO_LOBBY,
        onGameOverToLobby
    );
};

var onStartGame = function (e, room) {
    goToGame(room);
};

var onEndGame = function (e, room) {
    goToGameOver(room);
};

var onGetGameOverData = function (e, gameOverData) {
    goToGameOver(e.data);
    game.getScene()._onUpdateScore(gameOverData);
};

var onGameOverToLobby = function (e, room) {
    goToLobby();

    // Trigger an event so the lobby scene knows to join the room it was just
    // in before playing the game
    Network._onEnterRoomSuccess(room);
};

var onNetworkConnect = function () {
    goToLobby();
};

var Preloader = new util.Preloader(onLoad.bind(this));