"use strict";

var util = require('../util');
var Assets = util.Assets;
var Network = require('../network');
var GameObject = wfl.core.entities.GameObject;
var LivingObject = wfl.core.entities.LivingObject;
var geom = wfl.geom;

var Player = function () {
    LivingObject.call(this);

    this.solid = true;

    // Create default state
    this.defaultGraphic = Assets.get(Assets.PLAYER);

    var w = this.defaultGraphic.width;
    var h = this.defaultGraphic.height;
    var verts = [
        new geom.Vec2(-w * 0.5, -h * 0.5),
        new geom.Vec2(w * 0.5, 0),
        new geom.Vec2(-w * 0.5, h * 0.5)
    ];
    var frameObj = this.createFrame(this.defaultGraphic, 1, false);
    frameObj.vertices = verts;

    this.defaultState = this.createState();
    this.defaultState.addFrame(frameObj);
    this.addState(GameObject.STATE.DEFAULT, this.defaultState);

    this.lastSentPosition = new geom.Vec2(-Infinity, -Infinity);

    this.rotate(-Math.PI * 0.5);
};
Object.defineProperties(Player, {
    TURN_SPEED : {
        value : 0.05
    },

    BRAKE_RATE : {
        value : 0.95
    },

    BOOST_ACCELERATION : {
        value : 0.0002
    },

    POSITION_UPDATE_DISTANCE : {
        value : 0.5
    },

    MINIMAP_FILL_STYLE : {
        value : "#86c8d3"
    }
});
Player.prototype = Object.freeze(Object.create(LivingObject.prototype, {
    update : {
        value : function (dt) {
            LivingObject.prototype.update.call(this, dt);
            
            // If the player is connected to the network, send out updates to
            // other players when necessary
            if (Network.connected) {
                Network.socket.emit('updateOther', {
                    position     : this.position,
                    velocity     : this.velocity,
                    acceleration : this.acceleration,
                    rotation     : this.getRotation()
                });
            }
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
/*
            // If the player is connected to the network, send out updates to
            // other players when necessary
            if (Network.connected) {
                var displacementSinceUpdate = geom.Vec2.subtract(
                    this.position,
                    this.lastSentPosition
                );
                var distanceSquaredSinceUpdate =
                    displacementSinceUpdate.getMagnitudeSquared();
                var maxUpdateDistance = Player.POSITION_UPDATE_DISTANCE;

                // If player has moved too far since last sending out an update
                // for its position, send out a new position update and update
                // the last-sent position
                if (distanceSquaredSinceUpdate >=
                    maxUpdateDistance * maxUpdateDistance) {

                    var predictedVelocity = this.velocity.clone();
                    predictedVelocity.add(
                        this.acceleration.clone().multiply(3)
                    );

                    var predictedPos = this.position.clone();
                    predictedPos.add(
                        predictedVelocity.multiply(3)
                    );

                    Network.socket.emit('updateOther', {
                        x        : predictedPos.x,
                        y        : predictedPos.y,
                        rotation : this.getRotation()
                    });

                    this.lastSentPosition = this.position.clone();
                }
            }
*/
        }
    },

    drawOnMinimap : {
        value : function (ctx) {
            var w = this.getWidth();
            var h = this.getHeight();
            var offsetX = Math.round(-w * 0.5);
            var offsetY = Math.round(-h * 0.5);
            var displayWidth = Math.round(w);
            var displayHeight = Math.round(h);

            ctx.save();

            ctx.fillStyle = Player.MINIMAP_FILL_STYLE;
            ctx.fillRect(offsetX, offsetY, displayWidth, displayHeight);

            ctx.restore();
        }
    }
}));
Object.freeze(Player);

module.exports = Player;