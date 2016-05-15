"use strict";

var util = require('../util');
var Assets = util.Assets;
var GameObject = wfl.core.entities.GameObject;
var PhysicsObject = wfl.core.entities.PhysicsObject;
var geom = wfl.geom;

/**
 * A full-sized, quadrilateral block
 */
var HalfBlock = function () {
    PhysicsObject.call(this);

    this.id = HalfBlock.id;

    // Create default state
    this.defaultGraphic = Assets.get(Assets.BLOCK_HALF);

    var w = this.defaultGraphic.width;
    var h = this.defaultGraphic.height;
    var verts = [
        new geom.Vec2(-w * 0.5, -h * 0.5),
        new geom.Vec2(w * 0.5, -h * 0.5),
        new geom.Vec2(-w * 0.5, h * 0.5)
    ];
    var frameObj = this.createFrame(this.defaultGraphic, 1, false);
    frameObj.vertices = verts;

    this.defaultState = this.createState();
    this.defaultState.addFrame(frameObj);
    this.addState(GameObject.STATE.DEFAULT, this.defaultState);

    this.solid = true;
    this.fixed = true;
    this.rotate(-Math.PI * 0.5);
};
Object.defineProperties(HalfBlock, {
    name : {
        value : "HalfBlock"
    },

    id : {
        value : 0
    }
});
HalfBlock.prototype = Object.freeze(Object.create(PhysicsObject.prototype, {
    drawOnMinimap : {
        value : function (ctx) {
            var w = this.getWidth();
            var h = this.getHeight();
            var offsetX = Math.round(-w * 0.5);
            var offsetY = Math.round(-h * 0.5);

            ctx.save();
            ctx.rotate(this.getRotation());
            ctx.fillStyle = app.PhysicsObject.MINIMAP_FILL_STYLE;
            ctx.strokeStyle = app.PhysicsObject.MINIMAP_STROKE_STYLE;
            ctx.beginPath();
            ctx.moveTo(offsetX, offsetY);
            ctx.lineTo(-offsetX, offsetY);
            ctx.lineTo(offsetX, -offsetY);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.restore();
        }
    }
}));
Object.freeze(HalfBlock);

module.exports = HalfBlock;