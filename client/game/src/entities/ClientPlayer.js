"use strict";

var util = require('../util');
var Assets = util.Assets;
var Player = require('./Player.js');
var LivingObject = wfl.core.entities.LivingObject;
var geom = wfl.geom;

var ClientPlayer = function (team) {
    Player.call(this, team);
    
    this.exhaustSound.volume = 0.05;
    this.crashSound.volume = 0.25;
};
Object.defineProperties(ClientPlayer, {
    MINIMAP_FILL_STYLE : {
        value : "#06c833"
    }
});
ClientPlayer.prototype = Object.freeze(Object.create(Player.prototype, {
    sendUpdateToServer : {
        value : function () { }
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
    },

    shoot : {
        value : function () { }
    },

    justShot : {
        value : function () { }
    }
}));
Object.freeze(ClientPlayer);

module.exports = ClientPlayer;