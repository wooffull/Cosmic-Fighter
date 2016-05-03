"use strict";

var Overlay = require('./Overlay');

var LobbyOverlay = function () {
    Overlay.call(this);
    
    this.roomListSpan = $("<span>");
    this.roomListSpan.addClass("lobby-overlay-room-list");
    
    this.curRoomSpan = $("<span>");
    this.curRoomSpan.addClass("lobby-overlay-cur-room");
    
    this.playBtn = $("<button>");
    this.playBtn.text("Play");
    this.curRoomSpan.append(this.playBtn);
    
    
    this.domObject.append(this.roomListSpan);
    this.domObject.append(this.curRoomSpan);
    this.domObject.addClass("lobby-overlay");
};

LobbyOverlay.prototype = Object.freeze(Object.create(Overlay.prototype, {
}));

module.exports = LobbyOverlay;