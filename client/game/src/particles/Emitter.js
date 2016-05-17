"use strict";

var util = require('../util');
var Assets = util.Assets;
var GameObject = wfl.core.entities.GameObject;
var EmitterParticle = require('./EmitterParticle.js');
var geom = wfl.geom;

var Emitter = function () {
    GameObject.call(this);

    this.particles = [];
    this.angleRange = Emitter.DEFAULT_ANGLE_OFFSET_RANGE;
    this.maxParticles = Emitter.DEFAULT_MAX_PARTICLES;
    this.velocityPercentage = Emitter.DEFAULT_VELOCITY_PERCENTAGE;
};
Object.defineProperties(Emitter, {
    DEFAULT_ANGLE_OFFSET_RANGE : {
        value : Math.PI
    },

    DEFAULT_MAX_PARTICLES : {
        value : 150
    },
    
    DEFAULT_VELOCITY_PERCENTAGE : {
        value : 1.0
    }
});
Emitter.prototype = Object.freeze(Object.create(GameObject.prototype, {
    addParticle : {
        value : function (position, velocity) {
            // Too many particles, remove the first one
            if (this.particles.length > this.maxParticles) {
                this.particles.splice(0, 1);
            }

            var angleOffset = Math.random() * this.angleRange - this.angleRange * 0.5;
            var particle = new EmitterParticle();
            particle.position = position.clone();
            particle.velocity = velocity.clone().multiply(-1);
            particle.velocity.multiply(this.velocityPercentage);
            particle.velocity.rotate(angleOffset);

            // Choose from 2 colors
            var colorIdSelected = Math.floor(Math.random() * 2);
            var r = 0;
            var g = 0;
            var b = 0;

            switch (colorIdSelected) {
            case 0:
                r = 223;
                g = 44;
                b = 56;
                break;

            case 1:
                r = 246;
                g = 110;
                b = 73;
                break;
            }

            particle.red = r;
            particle.green = g;
            particle.blue = b;

            this.particles.push(particle);
        }
    },

    update : {
        value : function (dt) {
            for (var i = this.particles.length - 1; i >= 0; i--) {
                var cur = this.particles[i];

                cur.update(dt);

                // Remove the particle when its time is up
                if (cur.age >= cur.lifeTime) {
                    this.particles.splice(i, 1);
                }
            }
        }
    },

    draw : {
        value : function (ctx) {
            for (var i = this.particles.length - 1; i >= 0; i--) {
                this.particles[i].draw(ctx);
            }
        }
    }
}));
Object.freeze(Emitter);

module.exports = Emitter;