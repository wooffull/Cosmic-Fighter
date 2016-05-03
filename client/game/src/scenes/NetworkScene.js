"use strict";

var Network = require('../network');
var Scene = wfl.display.Scene;

var NetworkScene = function (canvas, roomId) {
    Scene.call(this, canvas);
    
    $(Network).on(
        Network.Event.ADD_CLIENT,
        this.onAddClient.bind(this)
    );
    $(Network).on(
        Network.Event.REMOVE_CLIENT,
        this.onRemoveClient.bind(this)
    );

    // Add other clients that are already connected
    var room = Network.rooms[roomId];
    var players = room.players;

    for (var i = 0; i < players.length; i++) {
        var id = players[i];
        var client = Network.clients[id];

        if (client !== Network.localClient) {
            this.addGameObject(client.gameObject, 1);
        }
    }
};
NetworkScene.prototype = Object.freeze(Object.create(Scene.prototype, {
    onAddClient : {
        value : function (e, client) {
            if (client) {
                this.addGameObject(client.gameObject, 1);
            }
        }
    },

    onRemoveClient : {
        value : function (e, client) {
            if (client) {
                this.removeGameObject(client.gameObject, 1);
            }
        }
    }
}));

module.exports = NetworkScene;