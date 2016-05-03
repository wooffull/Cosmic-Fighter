"use strict";

var Scene = wfl.display.Scene;
var overlays = require('../overlays');

var LoadingScene = function (canvas) {
    Scene.call(this, canvas);
    
    this.lobbyOverlay = new overlays.LobbyOverlay();
    $(canvas).parent().append(this.lobbyOverlay.domObject);
    
    this.lobbyOverlay.playBtn.click(this._onPlayButtonClick.bind(this));
};
LoadingScene.prototype = Object.freeze(Object.create(Scene.prototype, {
    destroy : {
        value : function () {
            this.lobbyOverlay.domObject.remove();
        }
    },
    
    _onPlayButtonClick : {
        value : function (e) {
            $(this).trigger("play-game");
        }
    }
}));

module.exports = LoadingScene;