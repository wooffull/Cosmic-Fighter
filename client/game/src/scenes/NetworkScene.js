"use strict";

var Network = require('../network');
var Scene = wfl.display.Scene;
var PhysicsObject = wfl.core.entities.PhysicsObject;
var entities = require('../entities');
var Bullet = entities.Bullet;
var ClientPlayer = entities.ClientPlayer;
var geom = wfl.geom;

var NetworkScene = function (canvas, room) {
    Scene.call(this, canvas);

    // Add other clients that are already connected
    var room = Network.rooms[room.id];
    var players = room.players;

    for (var i = 0; i < players.length; i++) {
        var id = players[i];
        var client = Network.clients[id];

        if (client !== Network.localClient) {
            var gameObject = new ClientPlayer(client.data.team);
            client.gameObject = gameObject;
            this.addGameObject(gameObject, 1);
        }
    }
    
    $(Network).on(Network.Event.BULLET, this._onBullet.bind(this));
};
NetworkScene.prototype = Object.freeze(Object.create(Scene.prototype, {
    /**
     * Clears up references used in the scene
     */
    destroy : {
        value : function () {
            $(Network).off(Network.Event.BULLET);
        }
    },
    
    _onBullet : {
        value : function (e, data) {
            var rotation = PhysicsObject.prototype.getDisplayAngle(data.rotation);
            var forward = geom.Vec2.fromAngle(rotation);
            var player = Network.clients[data.playerId].gameObject;
            var bullet = new Bullet(1, player);
            bullet.position.x = data.position.x;
            bullet.position.y = data.position.y;
            bullet.velocity.x = forward.x;
            bullet.velocity.y = forward.y;
            bullet.rotate(rotation);
            bullet.velocity.multiply(Bullet.DEFAULT_SPEED);
            bullet.velocity.x += data.velocity.x;
            bullet.velocity.y += data.velocity.y;
            
            if (bullet.velocity.getMagnitudeSquared() < Bullet.DEFAULT_SPEED * Bullet.DEFAULT_SPEED) {
                bullet.velocity.setMagnitude(Bullet.DEFAULT_SPEED);
            }
            
            this.addGameObject(bullet, 1);
        }
    }
}));

module.exports = NetworkScene;