"use strict";

var Network = require('../network');
var Scene = wfl.display.Scene;

var NetworkScene = function (canvas) {
    Scene.call(this, canvas);
    
    $(Network).on(
        Network.event.ADD_CLIENT,
        this.onAddClient.bind(this)
    );
    $(Network).on(
        Network.event.REMOVE_CLIENT,
        this.onRemoveClient.bind(this)
    );

    // Add other clients that are already connected
    var keys = Object.keys(Network.clients);

    for (var i = 0; i < keys.length; i++) {
        var id = parseInt(keys[i]);
        var client = Network.clients[id];

        if (client !== Network.localClient) {
            this.addGameObject(client.gameObject);
        }
    }
};
NetworkScene.prototype = Object.freeze(Object.create(Scene.prototype, {
    onAddClient : {
        value : function (e, client) {
            if (client) {
                this.addGameObject(client.gameObject);
            }
        }
    },

    onRemoveClient : {
        value : function (e, client) {
            if (client) {
                this.removeGameObject(client.gameObject);
            }
        }
    }
}));

module.exports = NetworkScene;