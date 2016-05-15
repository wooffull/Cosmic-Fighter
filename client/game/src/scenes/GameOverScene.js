"use strict";

var Scene = wfl.display.Scene;
var overlays = require('../overlays');
var Network = require('../network');

var GameOverScene = function (canvas, room) {
    Scene.call(this, canvas);

    this.room = room;

    $(Network).on(Network.Event.GAME_OVER_DATA, this._onUpdateScore.bind(this));

    if (Network.isHost()) {
        Network.socket.emit(Network.Event.GAME_OVER_DATA, room.id);
    }

    this.gameOverOverlay = new overlays.GameOverOverlay();
    $(canvas).parent().append(this.gameOverOverlay.domObject);

    this.loadingOverlay = new overlays.LoadingOverlay();
    $(canvas).parent().append(this.loadingOverlay.domObject);

    this.gameOverOverlay.returnToLobbyBtn.click(this._onReturnToLobby.bind(this));
};
Object.defineProperties(GameOverScene, {
    Event : {
        value : {
            RETURN_TO_LOBBY : "returnToLobby"
        }
    }
});
GameOverScene.prototype = Object.freeze(Object.create(Scene.prototype, {
    destroy : {
        value : function () {
            this.gameOverOverlay.domObject.remove();
            this.loadingOverlay.domObject.remove();
        }
    },

    _onUpdateScore : {
        value : function (e, data) {
            this.loadingOverlay.domObject.remove();
            this.gameOverOverlay.renderScore(data);

            var localPlayerData;
            var teamA = data.teamA;
            var teamB = data.teamB;

            for (var i = 0; i < teamA.length; i++) {
                if (teamA[i].id === Network.localClient.id) {
                    localPlayerData = teamA[i];
                    break;
                }
            }

            for (var i = 0; i < teamB.length; i++) {
                if (teamB[i].id === Network.localClient.id) {
                    localPlayerData = teamB[i];
                    break;
                }
            }

            this._sendScoreToServer(localPlayerData);
        }
    },

    _onReturnToLobby : {
        value : function (e) {
            $(this).trigger(
                GameOverScene.Event.RETURN_TO_LOBBY,
                this.room
            );
        }
    },

    _sendScoreToServer : {
        value : function (playerData) {
            var kills = playerData.kills;
            var deaths = playerData.deaths;
            var form = $("#scoreForm");
            var formData = form.serialize();
            
            formData += "&kills=" + kills;
            formData += "&deaths=" + deaths;
            formData += "&username=" + playerData.user;

            $.ajax({
                cache: false,
                type: "POST",
                url: "/score",
                data: formData,
                dataType: "json"
            });
        }
    }
}));
Object.freeze(GameOverScene);

module.exports = GameOverScene;