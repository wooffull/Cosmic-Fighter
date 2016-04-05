"use strict";

var util = require('../util');
var Assets = util.Assets;
var Player = require('./Player');
var GameObject = wfl.core.entities.GameObject;
var LivingObject = wfl.core.entities.LivingObject;
var geom = wfl.geom;

var ClientPlayer = function () {
    LivingObject.call(this);

    // Create default state
    this.defaultGraphic = Assets.get(Assets.CLIENT);

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

    this.rotate(-Math.PI * 0.5);

    this.desiredPosition = new geom.Vec2();
};
Object.defineProperties(ClientPlayer, {
    ARRIVAL_SLOWING_RADIUS : {
        value : 200
    },

    MIN_ARRIVAL_RADIUS : {
        value : 8
    },

    MINIMAP_FILL_STYLE : {
        value : "#06c833"
    }
});
ClientPlayer.prototype = Object.freeze(Object.create(LivingObject.prototype, {
    update : {
        value : function (dt) {
            this.arrivalSteer();

            LivingObject.prototype.update.call(this, dt);

            // Only update the forward direction of the client player if
            // they're moving fast enough
            if (this.velocity.getMagnitudeSquared() > 0.00001) {
                // Rotate the client player
                var angleDifference =
                    this.velocity.getAngle() -
                    this.forward.getAngle();
                this.rotate(angleDifference);
            }
        }
    },

    arrivalSteer : {
        value : function () {
            var desiredVelocity = geom.Vec2.subtract(
                this.desiredPosition,
                this.position
            );
            var distanceSquared = desiredVelocity.getMagnitudeSquared();
            var slowingRadius = ClientPlayer.ARRIVAL_SLOWING_RADIUS;

            // Arrive to the desired position if far enough away
            if (distanceSquared > ClientPlayer.MIN_ARRIVAL_RADIUS) {
                // Set desired velocity to how quickly the player can move
                desiredVelocity.setMagnitude(
                    Player.BOOST_ACCELERATION * this.mass
                );

                if (distanceSquared < slowingRadius * slowingRadius) {
                    desiredVelocity.multiply(
                        0.925 * 0.925 *
                        distanceSquared / (slowingRadius * slowingRadius)
                    );
                }

                this.addForce(desiredVelocity);

            // Force brakes when too close
            } else {
                this.velocity.multiply(0.925);
            }
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

            ctx.fillStyle = ClientPlayer.MINIMAP_FILL_STYLE;
            ctx.fillRect(offsetX, offsetY, displayWidth, displayHeight);

            ctx.restore();
        }
    }
}));
Object.freeze(ClientPlayer);

module.exports = ClientPlayer;