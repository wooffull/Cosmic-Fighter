"use strict";

var util = require('../util');
var Assets = util.Assets;
var Network = require('../network');
var GameObject = wfl.core.entities.GameObject;
var LivingObject = wfl.core.entities.LivingObject;
var particles = require('../particles');
var Emitter = particles.Emitter;
var geom = wfl.geom;

var Player = function (team) {
    LivingObject.call(this);

    this.customData.team = team;

    var shipType;
    if (team === 0) {
        shipType = Assets.SHIP_1;
    } else {
        shipType = Assets.SHIP_2;
    }

    // Create default state
    this.defaultGraphic = Assets.get(shipType);

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

    // Create explosion state

    if (team === 0) {
        this.explosionGraphic1 = Assets.get(Assets.EXPLOSION_A_1);
        this.explosionGraphic2 = Assets.get(Assets.EXPLOSION_A_2);
        this.explosionGraphic3 = Assets.get(Assets.EXPLOSION_A_3);
        this.explosionGraphic4 = Assets.get(Assets.EXPLOSION_END);
    } else {
        this.explosionGraphic1 = Assets.get(Assets.EXPLOSION_B_1);
        this.explosionGraphic2 = Assets.get(Assets.EXPLOSION_B_2);
        this.explosionGraphic3 = Assets.get(Assets.EXPLOSION_B_3);
        this.explosionGraphic4 = Assets.get(Assets.EXPLOSION_END);
    }

    this.explosionState = this.createState();

    this.explosionState.addFrame(this.createFrame(this.explosionGraphic1, 2));
    this.explosionState.addFrame(this.createFrame(this.explosionGraphic2, 2));
    this.explosionState.addFrame(this.createFrame(this.explosionGraphic3, 2));
    this.explosionState.addFrame(this.createFrame(this.explosionGraphic4, Infinity));
    this.addState(Player.STATE.EXPLOSION, this.explosionState);

    this.shootTimer = 0;
    this.maxShootTimer = Player.DEFAULT_MAX_SHOOT_TIMER;

    this.exhaust = new Emitter();
    this.exhaustTimer = 0;
    this.maxExhaustTimer = Player.DEFAULT_MAX_EXHAUST_TIMER;

    this.health = Network.localClient.data.health;
    this.maxHealth = Network.localClient.data.health;

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
    },

    DEFAULT_MAX_SHOOT_TIMER : {
        value : 20
    },

    MIN_EXHAUST_ACCELERATION : {
        value : 0.0004
    },

    DEFAULT_MAX_EXHAUST_TIMER : {
        value : 10
    },

    STATE : {
        value : {
            EXPLOSION : "explosion"
        }
    }
});
Player.prototype = Object.freeze(Object.create(LivingObject.prototype, {
    update : {
        value : function (dt) {
            LivingObject.prototype.update.call(this, dt);

            // Update shoot timer when just shot
            if (this.justShot()) {
                this.shootTimer++;

                if (this.shootTimer >= this.maxShootTimer) {
                    this.shootTimer = 0;
                }
            }

            if (this.health > 0) {
                if (this.acceleration.getMagnitudeSquared() > Player.MIN_EXHAUST_ACCELERATION * Player.MIN_EXHAUST_ACCELERATION) {
                    // Add the next particle for the exhaust if we're able to
                    if (this.exhaustTimer === 0) {
                        var particlePosition = this.forward.clone().multiply(-this.defaultGraphic.height * 0.5);
                        this.exhaust.addParticle(particlePosition, this.velocity);
                    }
                }

                // Update exhaust timer for when to add the next particle
                this.exhaustTimer += dt;
                if (this.exhaustTimer >= this.maxExhaustTimer) {
                    this.exhaustTimer = 0;
                }
            }

            // Update exhaust particle system
            this.exhaust.update(dt);

            this.sendUpdateToServer();
        }
    },

    sendUpdateToServer : {
        value : function () {
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
        }
    },

    draw : {
        value : function (ctx) {
            LivingObject.prototype.draw.call(this, ctx);

            this.exhaust.draw(ctx);
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
    },

    shoot : {
        value : function () {
            if (!this.justShot()) {
                this.shootTimer = 1;

                if (Network.connected) {
                    Network.socket.emit('bullet', {
                        position     : this.position,
                        velocity     : this.velocity,
                        acceleration : this.acceleration,
                        rotation     : this.getRotation()
                    });
                }
            }
        }
    },

    justShot : {
        value : function () {
            return (this.shootTimer > 0);
        }
    },

    resolveCollision : {
        value : function (physObj, collisionData) {
            var team = this.customData.team;
            var otherTeam = physObj.customData.team;

            // If hitting something that's not on this team
            if (otherTeam === undefined || otherTeam !== team || physObj.takeDamage) {
                LivingObject.prototype.resolveCollision.call(this, physObj, collisionData);
            }
        }
    }
}));
Object.freeze(Player);

module.exports = Player;