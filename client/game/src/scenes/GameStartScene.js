"use strict";

var Scene = wfl.display.Scene;
var overlays = require('../overlays');
var Network = require('../network');

var GameStartScene = function (canvas, room) {
    Scene.call(this, canvas);

    this.room = room;

    $(Network).on(Network.Event.GAME_START_DATA, this._onGetStartData.bind(this));

    if (Network.isHost()) {
        Network.socket.emit(Network.Event.GAME_START_DATA, room.id);
    }

    this.loadingOverlay = new overlays.LoadingOverlay();
    $(canvas).parent().append(this.loadingOverlay.domObject);
};
Object.defineProperties(GameStartScene, {
    Event : {
        value : {
            START_GAME : "startGame"
        }
    }
});
GameStartScene.prototype = Object.freeze(Object.create(Scene.prototype, {
    destroy : {
        value : function () {
            this.loadingOverlay.domObject.remove();
        }
    },

    _onGetStartData : {
        value : function (e, data) {
            var teamA = data.teamA;
            var teamB = data.teamB;

            for (var i = 0; i < teamA.length; i++) {
                var ref = teamA[i];
                Network.clients[ref.id].data = ref;
            }

            for (var i = 0; i < teamB.length; i++) {
                var ref = teamB[i];
                Network.clients[ref.id].data = ref;
            }

            $(this).trigger(
                GameStartScene.Event.START_GAME,
                this.room
            );
        }
    }
}));
Object.freeze(GameStartScene);

module.exports = GameStartScene;