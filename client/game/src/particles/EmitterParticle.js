"use strict";

var util = require('../util');
var Assets = util.Assets;
var PhysicsObject = wfl.core.entities.PhysicsObject;
var geom = wfl.geom;

var EmitterParticle = function () {
    PhysicsObject.call(this);

    this.age = 0;
    this.lifeTime = EmitterParticle.DEFAULT_LIFE_TIME;
    this.red = 0;
    this.green = 0;
    this.blue = 0;
    this.startSize = EmitterParticle.DEFAULT_START_SIZE;
    this.size = this.startSize;
    this.decayRate = EmitterParticle.DEFAULT_DECAY_RATE;
    this.expansionRate = EmitterParticle.DEFAULT_EXPANSION_RATE;
};
Object.defineProperties(EmitterParticle, {
    DEFAULT_LIFE_TIME : {
        value : 100
    },

    DEFAULT_START_SIZE : {
        value : 5.0
    },

    DEFAULT_DECAY_RATE : {
        value : 2.35
    },

    DEFAULT_EXPANSION_RATE : {
        value : 0.25
    },

    MAX_ALPHA : {
        value : 1
    }
});
EmitterParticle.prototype = Object.freeze(Object.create(PhysicsObject.prototype, {
    update : {
        value : function (dt) {
            if (this.age < this.lifeTime) {
                PhysicsObject.prototype.update.call(this, dt);

                this.age += this.decayRate;
                this.size += this.expansionRate;
            }
        }
    },

    draw : {
        value : function (ctx) {
            var alpha = EmitterParticle.MAX_ALPHA * (1 - this.age / this.lifeTime);

            ctx.save();

            ctx.translate(this.position.x, this.position.y);
            ctx.beginPath();
            ctx.globalAlpha *= alpha;
            ctx.fillStyle = "rgb(" + this.red + "," + this.green + "," + this.blue + ")";
            ctx.rect(-this.size * 0.5, -this.size * 0.5, this.size, this.size);
            ctx.fill();

            ctx.restore();
        }
    }
}));
Object.freeze(EmitterParticle);

module.exports = EmitterParticle;