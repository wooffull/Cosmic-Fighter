(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.cf = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"../util":21,"./Player":3}],2:[function(require,module,exports){
"use strict";

var util = require('../util');
var Assets = util.Assets;
var GameObject = wfl.core.entities.GameObject;
var PhysicsObject = wfl.core.entities.PhysicsObject;

/**
 * A full-sized, quadrilateral block
 */
var FullBlock = function () {
    PhysicsObject.call(this);

    this.id = FullBlock.id;

    // Create default state
    this.defaultGraphic = Assets.get(Assets.BLOCK_FULL);
    this.defaultState = this.createState();
    this.defaultState.addFrame(
        this.createFrame(this.defaultGraphic)
    );
    this.addState(GameObject.STATE.DEFAULT, this.defaultState);

    this.solid = true;
    this.fixed = true;
    this.rotate(-Math.PI * 0.5);
};
Object.defineProperties(FullBlock, {
    name : {
        value : "FullBlock"
    },

    id : {
        value : 0
    }
});
FullBlock.prototype = Object.freeze(Object.create(PhysicsObject.prototype, {
    drawOnMinimap : {
        value : function (ctx) {
            var w = this.getWidth();
            var h = this.getHeight();
            var offsetX = Math.round(-w * 0.5);
            var offsetY = Math.round(-h * 0.5);
            var displayWidth = Math.round(w);
            var displayHeight = Math.round(h);

            ctx.save();

            ctx.rotate(this.getRotation());

            /*ctx.fillStyle =
                app.gameobject.PhysicsObject.MINIMAP_FILL_STYLE;
            ctx.strokeStyle =
                app.gameobject.PhysicsObject.MINIMAP_STROKE_STYLE;*/

            ctx.beginPath();
            ctx.rect(offsetX, offsetY, displayWidth, displayHeight);
            ctx.fill();
            ctx.stroke();

            ctx.restore();
        }
    }
}));
Object.freeze(FullBlock);

module.exports = FullBlock;
},{"../util":21}],3:[function(require,module,exports){
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
},{"../network":8,"../util":21}],4:[function(require,module,exports){
"use strict";

var FullBlock = require('./FullBlock.js');
var Player = require('./Player.js');
var ClientPlayer = require('./ClientPlayer.js');

module.exports = {
    FullBlock : FullBlock,
    Player: Player,
    ClientPlayer : ClientPlayer
};
},{"./ClientPlayer.js":1,"./FullBlock.js":2,"./Player.js":3}],5:[function(require,module,exports){
"use strict";

var Network = require('./network');
var util = require('./util');
var Assets = util.Assets;
var scenes = require('./scenes');
var overlays = require('./overlays');

// Create game
var canvas = document.querySelector("#game-canvas");
var game   = wfl.create(canvas);

var loadingScene = new scenes.LoadingScene(canvas);
game.setScene(loadingScene);

// Stop the game so that canvas updates don't affect performance with
// overlays
game.stop();

// Draw initial black BG on canvas
var ctx = canvas.getContext("2d");
ctx.fillStyle = "#040B0C";
ctx.fillRect(0, 0, canvas.width, canvas.height);

var onLoad = function () {
    $(Network).on(
        Network.Event.CONNECT,
        onNetworkConnect
    );

    Network.init();
};

var onNetworkConnect = function () {
    var lobbyScene = new scenes.LobbyScene(canvas);
    game.setScene(lobbyScene);

    $(Network).on(
        Network.Event.START_GAME,
        onPlayGame
    );
    
    // Transition the page's BG color to black to hide the BG image which
    // becomes distracting during game play
    $("body").css({"background-color": "#071213"});
};

var onPlayGame = function (e, room) {
    $(game.getScene()).off();

    var gameScene = new scenes.GameScene(canvas, room.id);
    game.setScene(gameScene);

    // Start the game since it was stopped to help performance with overlays on
    // a canvas
    game.start();
};

var Preloader = new util.Preloader(onLoad.bind(this));
},{"./network":8,"./overlays":13,"./scenes":18,"./util":21}],6:[function(require,module,exports){
"use strict";

var entities = require('../entities');

var Client = function (id, data) {
    this.id = id;
    this.data = data;
    this.gameObject = new entities.ClientPlayer();
};
Object.freeze(Client);

module.exports = Client;
},{"../entities":4}],7:[function(require,module,exports){
"use strict";

var entities = require('../entities');

var LocalClient = function (id, data) {
    this.id = id;
    this.data = data;
    this.gameObject = new entities.Player();
};
Object.freeze(LocalClient);

module.exports = LocalClient;
},{"../entities":4}],8:[function(require,module,exports){
"use strict";

var Network = {
    socket      : undefined,
    localClient : {},
    clients     : {},
    rooms       : {},
    connected   : false,
    hostId      : -1,

    // Events for external entities to subscribe to
    Event       : {
        CONNECT            : "connect",
        UPDATE_ROOMS       : "updateRooms",
        ENTER_ROOM_SUCCESS : "enterRoomSuccess",
        ENTER_ROOM_FAIL    : "enterRoomFail",
        PLAY               : "play",
        START_GAME         : "startGame"
    },

    init : function () {
        this.socket = io.connect();

        this.socket.on('confirm', this._onConfirmClient.bind(this));
        this.socket.on('addOther', this._onAddOtherClient.bind(this));
        this.socket.on('removeOther', this._onRemoveOtherClient.bind(this));
        this.socket.on('loadPrevious', this._onLoadPreviousClients.bind(this));
        this.socket.on('updateOther', this._onUpdateClient.bind(this));
        this.socket.on('updateRooms', this._onUpdateRooms.bind(this));
        this.socket.on('enterRoomSuccess', this._onEnterRoomSuccess.bind(this));
        this.socket.on('enterRoomFail', this._onEnterRoomFail.bind(this));
        this.socket.on('ping', this._onPing.bind(this));
        this.socket.on('setHost', this._onSetHost.bind(this));
        this.socket.on('startGame', this._onStartGame.bind(this));

        this.socket.emit('init', {
            user : $("#userName").html()
        });
    },

    getRooms : function () {
        this.socket.emit('updateRooms');
    },

    createRoom : function (name) {
        var roomData = {
            name  : name,
            enter : true
        };

        this.socket.emit('createRoom', roomData);
    },

    enterRoom : function (roomId) {
        this.socket.emit('enterRoom', roomId);
    },

    leaveRoom : function (roomId) {
        this.socket.emit('leaveRoom', roomId);
    },

    switchTeam : function (roomId) {
        this.socket.emit('switchTeam', roomId);
    },

    _onConfirmClient : function (data) {
        var id = data.id;
        this.localClient = new LocalClient(id, data);
        this.clients[id] = this.localClient;

        this._onUpdateClient(data);

        this.connected = true;

        $(this).trigger(
            this.Event.CONNECT
        );
    },

    _onAddOtherClient : function (data) {
        var id = data.id;
        var newClient = new Client(id, data);

        this.clients[data.id] = newClient;

        this._onUpdateClient(data);
    },

    _onRemoveOtherClient : function (data) {
        this.clients[data.id] = undefined;
        delete this.clients[data.id];
    },

    _onLoadPreviousClients : function (data) {
        var keys = Object.keys(data);

        for (var i = 0; i < keys.length; i++) {
            var id = parseInt(keys[i]);
            var userData = data[id];

            this._onAddOtherClient(userData);
        }
    },

    _onUpdateClient : function (data) {
        var id = data.id;
        var client = this.clients[id];

        client.data = data;
        client.gameObject.position.x = data.position.x;
        client.gameObject.position.y = data.position.y;
        client.gameObject.velocity.x = data.velocity.x;
        client.gameObject.velocity.y = data.velocity.y;
        client.gameObject.acceleration.x = data.acceleration.x;
        client.gameObject.acceleration.y = data.acceleration.y;
        client.gameObject.setRotation(data.rotation);
    },

    _onUpdateRooms : function (data) {
        this.rooms = data;

        $(this).trigger(
            this.Event.UPDATE_ROOMS,
            data
        );
    },

    _onEnterRoomSuccess : function (data) {
        $(this).trigger(
            this.Event.ENTER_ROOM_SUCCESS,
            data
        );
    },

    _onEnterRoomFail : function (data) {
        $(this).trigger(
            this.Event.ENTER_ROOM_FAIL,
            data
        );
    },

    _onPing : function (pingObj) {
        if (pingObj) {
            this.socket.emit('returnPing', pingObj);
        }
    },

    _onSetHost : function (data) {
        this.hostId = data.id;
        console.log(data);
    },

    _onStartGame : function (data) {
    console.log("DSTST");
        $(this).trigger(
            this.Event.START_GAME,
            data
        );
    }
};

module.exports = Network;

var Client = require('./Client.js');
var LocalClient = require('./LocalClient.js');
},{"./Client.js":6,"./LocalClient.js":7}],9:[function(require,module,exports){
"use strict";

var Overlay = require('./Overlay');

var CreateRoomOverlay = function () {
    Overlay.call(this);
    
    this.inputField = $("<input>");
    this.inputField.attr({ "placeholder" : "Room Name" });
    this.inputField.addClass("create-room-overlay-input");
    
    this.buttonContainer = $("<div>");
    this.buttonContainer.addClass("create-room-overlay-button-container");
    
    this.cancelBtn = $("<button>");
    this.cancelBtn.text("Cancel");
    this.buttonContainer.append(this.cancelBtn);
    
    this.createBtn = $("<button>");
    this.createBtn.text("Create");
    this.buttonContainer.append(this.createBtn);

    this.domObject.append(this.inputField);
    this.domObject.append(this.buttonContainer);
    this.domObject.addClass("create-room-overlay");
};

CreateRoomOverlay.prototype = Object.freeze(Object.create(Overlay.prototype, {

}));

module.exports = CreateRoomOverlay;
},{"./Overlay":12}],10:[function(require,module,exports){
"use strict";

var Overlay = require('./Overlay');

var LoadingOverlay = function () {
    Overlay.call(this);
    
    this.domObject.addClass("loading-overlay-bg");
    
    this.loadingIcon = $("<div>");
    this.loadingIcon.addClass("loading-overlay");
    
    this.domObject.append(this.loadingIcon);
};

LoadingOverlay.prototype = Object.freeze(Object.create(Overlay.prototype, {

}));

module.exports = LoadingOverlay;
},{"./Overlay":12}],11:[function(require,module,exports){
"use strict";

var Overlay = require('./Overlay');
var Network = require('../network');

var LobbyOverlay = function () {
    Overlay.call(this);

    // Set up left side
    this.leftContainer = $("<span>");
    this.leftContainer.addClass("lobby-overlay-left");
    this.leftContainer.addClass("lobby-overlay-maximized-side");

    this.roomButtonContainer = $("<div>");
    this.roomButtonContainer.addClass("lobby-overlay-button-container");
    this.leftContainer.append(this.roomButtonContainer);

    this.selectRoomLabel = $("<div>");
    this.selectRoomLabel.html("Select or create room");
    this.roomButtonContainer.append(this.selectRoomLabel);
    this.roomButtonContainer.append($("<br>"));

    this.createRoomBtn = $("<button>");
    this.createRoomBtn.text("Create Room");
    this.roomButtonContainer.append(this.createRoomBtn);

    this.roomListContainer = $("<div>");
    this.roomListContainer.addClass("lobby-overlay-room-list");
    this.roomListContainer.html("Loading rooms...");
    this.leftContainer.append(this.roomListContainer);

    // Set up right side
    this.rightContainer = $("<span>");
    this.rightContainer.addClass("lobby-overlay-right");
    this.rightContainer.addClass("lobby-overlay-minimized-side");

    this.selectedRoomLabel = $("<div>");
    this.selectedRoomLabel.addClass("lobby-overlay-room-label-container");

    this.renderRoomLabel();
    this.rightContainer.append(this.selectedRoomLabel);

    this.switchTeamBtn = $("<button>");
    this.switchTeamBtn.text("Switch Teams");
    this.switchTeamBtn.addClass("lobby-overlay-switch-team-btn");

    this.teamAContainer = $("<div>");
    this.teamAContainer.addClass("lobby-overlay-teamA-container");

    this.teamBContainer = $("<div>");
    this.teamBContainer.addClass("lobby-overlay-teamB-container");

    this.renderPlayers();

    this.rightContainer.append(this.teamAContainer);
    this.rightContainer.append(this.switchTeamBtn);
    this.rightContainer.append(this.teamBContainer);

    this.leaveRoomBtn = $("<button>");
    this.leaveRoomBtn.text("Leave Room");
    this.leaveRoomBtn.addClass("lobby-overlay-leave-room-btn");
    this.leaveRoomBtn.hide();
    this.rightContainer.append(this.leaveRoomBtn);

    this.readyBtn = $("<button>");
    this.readyBtn.text("Ready");
    this.readyBtn.addClass("lobby-overlay-ready-btn");
    this.readyBtn.hide();
    this.rightContainer.append(this.readyBtn);

    this.domObject.append(this.leftContainer);
    this.domObject.append(this.rightContainer);
    this.domObject.addClass("lobby-overlay");
    this.domObject.addClass("fade-in");
};

Object.defineProperties(LobbyOverlay, {
    Event : {
        value : {
            ENTER_ROOM : "enterRoom"
        }
    }
});

LobbyOverlay.prototype = Object.freeze(Object.create(Overlay.prototype, {
    showRooms : {
        value : function (roomData) {
            this.roomListContainer.html("");

            $(".lobby-overlay-room").off("click");

            var keys = Object.keys(roomData);

            if (keys.length === 0) {
                this.roomListContainer.html("No rooms available");
            } else {
                for (var i = 0; i < keys.length; i++) {
                    var curRoom = roomData[keys[i]];
                    var curRoomContainer = $("<div>");
                    curRoomContainer.addClass("lobby-overlay-room");
                    curRoomContainer.html(curRoom.name);

                    $(curRoomContainer).on(
                        "click",
                        curRoom,
                        this._onClickRoom.bind(this)
                    );

                    this.roomListContainer.append(curRoomContainer);
                }
            }
        }
    },

    renderRoom : {
        value : function (data) {
            if (data === undefined) {
                this.renderRoomLabel();
                this.renderPlayers();

                this._onExitRoom();
            } else {
                this.renderRoomLabel(data.name);
                this.renderPlayers(data);

                this._onEnterRoom();
            }
        }
    },

    renderRoomLabel : {
        value : function (label) {
            if (typeof label !== "string" || label === "") {
                label = "No room selected";
            }

            label = "Current room: " + label;

            this.selectedRoomLabel.html(label);
        }
    },

    renderPlayers : {
        value : function (roomData) {
            this.teamAContainer.html("");
            this.teamBContainer.html("");
            this.switchTeamBtn.hide();

            if (roomData !== undefined) {
                var teamA = roomData.teamA;
                var teamB = roomData.teamB;

                var teamALabel = $("<div>");
                teamALabel.html("Rose Team");
                teamALabel.addClass("lobby-overlay-team-label");
                this.teamAContainer.append(teamALabel);

                var teamBLabel = $("<div>");
                teamBLabel.html("Sky Team");
                teamBLabel.addClass("lobby-overlay-team-label");
                this.teamBContainer.append(teamBLabel);

                var localId = Network.localClient.id;

                // Add team A players
                for (var i = 0; i < 4; i++) {
                    var label;
                    var playerContainer = $("<div>");
                    var ready = false;

                    if (i < teamA.length) {
                        var curId = teamA[i];
                        var curPlayer = Network.clients[curId];
                        ready = curPlayer.data.ready;
                        label = curPlayer.data.user;

                        if (curId === localId) {
                            playerContainer.addClass("lobby-overlay-local-player-container");

                            if (!ready) {
                                this.readyBtn.html("Ready");
                                this.switchTeamBtn.prop("disabled", false);
                            } else {
                                this.readyBtn.html("Cancel");
                                this.switchTeamBtn.prop("disabled", true);
                            }
                        }
                    } else {
                        label = "------";
                    }

                    playerContainer.html(label);
                    this.teamAContainer.append(playerContainer);

                    if (ready) {
                        var readyContainer = $("<span>");
                        readyContainer.html("Ready");
                        readyContainer.addClass("lobby-overlay-ready-container");
                        playerContainer.append(readyContainer);
                    }
                }

                // Add team B players
                for (var i = 0; i < 4; i++) {
                    var label;
                    var playerContainer = $("<div>");
                    var ready = false;

                    if (i < teamB.length) {
                        var curId = teamB[i];
                        var curPlayer = Network.clients[curId];
                        ready = curPlayer.data.ready;
                        label = curPlayer.data.user;

                        if (curId === localId) {
                            playerContainer.addClass("lobby-overlay-local-player-container");

                            if (!ready) {
                                this.readyBtn.html("Ready");
                                this.switchTeamBtn.prop("disabled", false);
                            } else {
                                this.readyBtn.html("Cancel");
                                this.switchTeamBtn.prop("disabled", true);
                            }
                        }
                    } else {
                        label = "------";
                    }

                    playerContainer.html(label);
                    this.teamBContainer.append(playerContainer);

                    if (ready) {
                        var readyContainer = $("<span>");
                        readyContainer.html("Ready");
                        readyContainer.addClass("lobby-overlay-ready-container");
                        playerContainer.append(readyContainer);
                    }
                }

                this.switchTeamBtn.show();
            }
        }
    },

    _onClickRoom : {
        value : function (e) {
            var data = e.data;
            var room = {
                name : data.name,
                id   : data.id
            };

            $(this).trigger(LobbyOverlay.Event.ENTER_ROOM, room);
        }
    },

    _onExitRoom : {
        value : function () {
            this.leaveRoomBtn.hide();
            this.readyBtn.hide();

            this.leftContainer.removeClass("lobby-overlay-minimized-side");
            this.rightContainer.removeClass("lobby-overlay-maximized-side");

            this.leftContainer.addClass("lobby-overlay-maximized-side");
            this.rightContainer.addClass("lobby-overlay-minimized-side");
        }
    },

    _onEnterRoom : {
        value : function () {
            this.leaveRoomBtn.show();
            this.readyBtn.show();

            this.leftContainer.removeClass("lobby-overlay-maximized-side");
            this.rightContainer.removeClass("lobby-overlay-minimized-side");

            this.leftContainer.addClass("lobby-overlay-minimized-side");
            this.rightContainer.addClass("lobby-overlay-maximized-side");
        }
    }
}));

Object.freeze(LobbyOverlay);

module.exports = LobbyOverlay;
},{"../network":8,"./Overlay":12}],12:[function(require,module,exports){
"use strict";

var Overlay = function () {
    this.domObject = $("<div>");
    this.domObject.addClass("canvas-overlay");
};

Overlay.prototype = Object.freeze(Object.create(Overlay.prototype, {

}));

module.exports = Overlay;
},{}],13:[function(require,module,exports){
"use strict";

var Overlay = require('./Overlay.js');
var LoadingOverlay = require('./LoadingOverlay.js');
var CreateRoomOverlay = require('./CreateRoomOverlay.js');
var LobbyOverlay = require('./LobbyOverlay.js');

module.exports = {
    Overlay : Overlay,
    LoadingOverlay : LoadingOverlay,
    CreateRoomOverlay : CreateRoomOverlay,
    LobbyOverlay : LobbyOverlay
};
},{"./CreateRoomOverlay.js":9,"./LoadingOverlay.js":10,"./LobbyOverlay.js":11,"./Overlay.js":12}],14:[function(require,module,exports){
"use strict";

var util = require('../util');
var Assets = util.Assets;
var Network = require('../network');
var entities = require('../entities');
var FullBock = entities.FullBlock;
var Player = entities.Player;
var NetworkScene = require('./NetworkScene');
var backgrounds = wfl.display.backgrounds;
var geom = wfl.geom;

var GameScene = function (canvas, roomId) {
    NetworkScene.call(this, canvas, roomId);

    var wallSize = 10;
    var blockSize = 128;
    var offset = -(wallSize * 0.5 - 1) * blockSize;

    // Line the top
    for (var i = 0; i < 9; i++) {
        var newBlock = new FullBock();
        newBlock.position.x = blockSize * i + offset;
        newBlock.position.y = offset;

        this.addGameObject(newBlock);
    }

    // Line the bottom
    for (var i = 0; i < 9; i++) {
        var newBlock = new FullBock();
        newBlock.position.x = blockSize * i + offset;
        newBlock.position.y = -offset;

        this.addGameObject(newBlock);
    }

    // Line the left
    for (var i = 1; i < 8; i++) {
        var newBlock = new FullBock();
        newBlock.position.x = offset;
        newBlock.position.y = blockSize * i + offset;

        this.addGameObject(newBlock);
    }

    // Line the right
    for (var i = 1; i < 8; i++) {
        var newBlock = new FullBock();
        newBlock.position.x = -offset;
        newBlock.position.y = blockSize * i + offset;

        this.addGameObject(newBlock);
    }
    
    this.bg = new backgrounds.ParallaxBackground(
        Assets.get(Assets.BG_TILE)
    );
    
    this.player = Network.localClient.gameObject;
    this.addGameObject(this.player, 2);
};
Object.defineProperties(GameScene, {
    FRICTION : {
        value : 0.925
    },

    MINIMAP : {
        value : Object.freeze({
            WIDTH      : 150,
            HEIGHT     : 100,
            SCALE      : 0.1,
            FILL_STYLE : "#192427"
        })
    }
});
GameScene.prototype = Object.freeze(Object.create(NetworkScene.prototype, {
    update : {
        value : function (dt) {
            var gameObjects = this.getGameObjects();
        
            for (var i = 0; i < gameObjects.length; i++) {
                var obj = gameObjects[i];
                obj.acceleration.multiply(GameScene.FRICTION);
                obj.velocity.multiply(GameScene.FRICTION);
            }
            
            NetworkScene.prototype.update.call(this, dt);
            
            this.handleInput();
        }
    },
    
    handleInput : {
        value : function () {
            var player       = this.player;
            var keyboard     = this.keyboard;
            var leftPressed  = keyboard.isPressed(keyboard.LEFT);
            var rightPressed = keyboard.isPressed(keyboard.RIGHT);
            var upPressed    = keyboard.isPressed(keyboard.UP);
            var downPressed  = keyboard.isPressed(keyboard.DOWN);

            // Left/ Right Key -- Player turns
            if (leftPressed || rightPressed) {
                var rotation = 0;

                if (leftPressed) {
                    rotation -= Player.TURN_SPEED;
                }

                if (rightPressed) {
                    rotation += Player.TURN_SPEED;
                }

                player.rotate(rotation);
            }

            // Up Key -- Player goes forward
            if (upPressed) {
                var movementForce = geom.Vec2.fromAngle(player.getRotation());
                movementForce.multiply(
                    Player.BOOST_ACCELERATION * player.mass
                );

                player.addForce(movementForce);
            }

            // Down Key -- Apply brakes to player
            if (downPressed) {
                player.velocity.multiply(Player.BRAKE_RATE);
            }
        }
    }
}));

module.exports = GameScene;
},{"../entities":4,"../network":8,"../util":21,"./NetworkScene":17}],15:[function(require,module,exports){
"use strict";

var Scene = wfl.display.Scene;
var overlays = require('../overlays');

var LoadingScene = function (canvas) {
    Scene.call(this, canvas);
    
    this.loadingOverlay = new overlays.LoadingOverlay();
    $(canvas).parent().append(this.loadingOverlay.domObject);
};
LoadingScene.prototype = Object.freeze(Object.create(Scene.prototype, {
    destroy : {
        value : function () {
            this.loadingOverlay.domObject.remove();
        }
    }
}));

module.exports = LoadingScene;
},{"../overlays":13}],16:[function(require,module,exports){
"use strict";

var Scene = wfl.display.Scene;
var overlays = require('../overlays');
var Network = require('../network');

var LobbyScene = function (canvas) {
    Scene.call(this, canvas);

    this.curRoomId = undefined;

    this.lobbyOverlay = new overlays.LobbyOverlay();
    this.createRoomOverlay = new overlays.CreateRoomOverlay();
    $(canvas).parent().append(this.lobbyOverlay.domObject);
    $(canvas).parent().append(this.createRoomOverlay.domObject);

    this.createRoomOverlay.domObject.hide();

    this.lobbyOverlay.leaveRoomBtn.click(this._onLeaveRoomButtonClick.bind(this));
    this.lobbyOverlay.readyBtn.click(this._onReadyButtonClick.bind(this));
    this.lobbyOverlay.switchTeamBtn.click(this._onSwitchTeamButtonClick.bind(this));
    this.lobbyOverlay.createRoomBtn.click(this._onCreateRoomButtonClick.bind(this));

    this.createRoomOverlay.cancelBtn.click(this._onCreateRoomCancel.bind(this));
    this.createRoomOverlay.createBtn.click(this._onCreateRoom.bind(this));

    $(this.lobbyOverlay).on(overlays.LobbyOverlay.Event.ENTER_ROOM, this._onEnterRoomAttempt.bind(this));

    $(Network).on(Network.Event.UPDATE_ROOMS, this._onUpdateRoomList.bind(this));
    $(Network).on(Network.Event.ENTER_ROOM_SUCCESS, this._onEnterRoomSuccess.bind(this));
    $(Network).on(Network.Event.ENTER_ROOM_FAIL, this._onEnterRoomFail.bind(this));

    this.roomUpdateInterval =
        setInterval(this.updateRoomList.bind(this), LobbyScene.ROOM_UPDATE_FREQUENCY);

    this.updateRoomList();
};

Object.defineProperties(LobbyScene, {
    ROOM_UPDATE_FREQUENCY : {
        value : 5000
    },

    Event : {
        value : {
            TOGGLE_READY : "toggleReady"
        }
    }
});

LobbyScene.prototype = Object.freeze(Object.create(Scene.prototype, {
    destroy : {
        value : function () {
            this.lobbyOverlay.domObject.remove();
            this.createRoomOverlay.domObject.remove();
            this.createRoomOverlay.inputField.off("keypress");
            clearInterval(this.roomUpdateInterval);
            $(Network).off(Network.Event.UPDATE_ROOMS);
        }
    },

    updateRoomList : {
        value : function () {
            Network.getRooms();
        }
    },

    _onLeaveRoomButtonClick : {
        value : function (e) {
            Network.leaveRoom(this.curRoomId);
            this.curRoomId = undefined;
        }
    },

    _onReadyButtonClick : {
        value : function (e) {
            var clientWillBeReady = !Network.localClient.data.ready;
        
            this.lobbyOverlay.switchTeamBtn.prop("disabled", clientWillBeReady);
        
            Network.socket.emit('updateReady', {
                ready : clientWillBeReady
            });
        }
    },

    _onCreateRoomButtonClick : {
        value : function (e) {
            this.createRoomOverlay.inputField.off("keypress");

            this.createRoomOverlay.inputField.val("");
            this.createRoomOverlay.domObject.removeClass("fade-in");
            this.createRoomOverlay.domObject.show();
            this.createRoomOverlay.domObject.addClass("fade-in");
            this.createRoomOverlay.inputField.focus();

            this.createRoomOverlay.inputField.on("keypress", this._onCreateRoomKeyPress.bind(this));
        }
    },

    _onCreateRoomKeyPress : {
        value : function (e) {
            if (e.keyCode === 13) {
                this._onCreateRoom();
            }
        }
    },

    _onCreateRoomCancel : {
        value : function (e) {
            this.createRoomOverlay.domObject.hide();
        }
    },

    _onCreateRoom : {
        value : function (e) {
            var name = this.createRoomOverlay.inputField.val();

            if (name !== "") {
                this.createRoomOverlay.domObject.hide();
                Network.createRoom(name);
            }
        }
    },
    
    _onSwitchTeamButtonClick : {
        value : function (e) {
            Network.switchTeam(this.curRoomId);
        }
    },

    _onUpdateRoomList : {
        value : function (e, data) {
            this.lobbyOverlay.showRooms(data);

            if (this.curRoomId !== undefined) {
                this.lobbyOverlay.renderRoom(data[this.curRoomId]);
            } else {
                this.lobbyOverlay.renderRoom();
            }
        }
    },

    _onEnterRoomAttempt : {
        value : function (e, data) {
            Network.enterRoom(data.id);
        }
    },

    _onEnterRoomSuccess : {
        value : function (e, data) {
            this.curRoomId = data.id;
            this.lobbyOverlay.renderRoom(data);
        }
    },

    _onEnterRoomFail : {
        value : function (e, data) {
            alert(data.msg);
            this.curRoomId = undefined;
            this.lobbyOverlay.renderRoom(undefined);
        }
    }
}));

Object.freeze(LobbyScene);

module.exports = LobbyScene;
},{"../network":8,"../overlays":13}],17:[function(require,module,exports){
"use strict";

var Network = require('../network');
var Scene = wfl.display.Scene;

var NetworkScene = function (canvas, roomId) {
    Scene.call(this, canvas);

    // Add other clients that are already connected
    var room = Network.rooms[roomId];
    var players = room.players;

    for (var i = 0; i < players.length; i++) {
        var id = players[i];
        var client = Network.clients[id];

        if (client !== Network.localClient) {
            this.addGameObject(client.gameObject, 1);
        }
    }
};
NetworkScene.prototype = Object.freeze(Object.create(Scene.prototype, {
    onAddClient : {
        value : function (e, client) {
            if (client) {
                this.addGameObject(client.gameObject, 1);
            }
        }
    },

    onRemoveClient : {
        value : function (e, client) {
            if (client) {
                this.removeGameObject(client.gameObject, 1);
            }
        }
    }
}));

module.exports = NetworkScene;
},{"../network":8}],18:[function(require,module,exports){
"use strict";

var LoadingScene = require('./LoadingScene.js');
var LobbyScene = require('./LobbyScene.js');
var NetworkScene = require('./NetworkScene.js');
var GameScene = require('./GameScene.js');

module.exports = {
    LoadingScene : LoadingScene,
    LobbyScene   : LobbyScene,
    NetworkScene : NetworkScene,
    GameScene    : GameScene
};
},{"./GameScene.js":14,"./LoadingScene.js":15,"./LobbyScene.js":16,"./NetworkScene.js":17}],19:[function(require,module,exports){
"use strict";

module.exports = {
    BG_TILE    : "./assets/img/BG-tile1.png",
    BLOCK_FULL : "./assets/img/BlockFull.png",
    PLAYER     : "./assets/img/Ship.png",
    CLIENT     : "./assets/img/OtherShip.png",
    
    // Preloader replaces getter with appropriate definition
    get        : function (path) { }
};
},{}],20:[function(require,module,exports){
"use strict";

var Assets = require('./Assets.js');

var Preloader = function (onComplete) {
    // Set up preloader
	this.queue = new createjs.LoadQueue(false);

    // Replace definition of Asset getter to use the data from the queue
    Assets.get = this.queue.getResult.bind(this.queue);

    // Once everything has been preloaded, start the application
    if (onComplete) {
        this.queue.on("complete", onComplete);
    }

    var needToLoad = [];

    // Prepare to load images
    for (var img in Assets) {
        var imgObj = {
            id : img,
            src : Assets[img]
        }

        needToLoad.push(imgObj);
    }

	this.queue.loadManifest(needToLoad);
};

module.exports = Preloader;
},{"./Assets.js":19}],21:[function(require,module,exports){
"use strict";

var Assets = require('./Assets.js');
var Preloader = require('./Preloader.js');

module.exports = {
    Assets : Assets,
    Preloader : Preloader
};
},{"./Assets.js":19,"./Preloader.js":20}]},{},[5])(5)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvZ2FtZS9zcmMvZW50aXRpZXMvQ2xpZW50UGxheWVyLmpzIiwiY2xpZW50L2dhbWUvc3JjL2VudGl0aWVzL0Z1bGxCbG9jay5qcyIsImNsaWVudC9nYW1lL3NyYy9lbnRpdGllcy9QbGF5ZXIuanMiLCJjbGllbnQvZ2FtZS9zcmMvZW50aXRpZXMvaW5kZXguanMiLCJjbGllbnQvZ2FtZS9zcmMvaW5kZXguanMiLCJjbGllbnQvZ2FtZS9zcmMvbmV0d29yay9DbGllbnQuanMiLCJjbGllbnQvZ2FtZS9zcmMvbmV0d29yay9Mb2NhbENsaWVudC5qcyIsImNsaWVudC9nYW1lL3NyYy9uZXR3b3JrL2luZGV4LmpzIiwiY2xpZW50L2dhbWUvc3JjL292ZXJsYXlzL0NyZWF0ZVJvb21PdmVybGF5LmpzIiwiY2xpZW50L2dhbWUvc3JjL292ZXJsYXlzL0xvYWRpbmdPdmVybGF5LmpzIiwiY2xpZW50L2dhbWUvc3JjL292ZXJsYXlzL0xvYmJ5T3ZlcmxheS5qcyIsImNsaWVudC9nYW1lL3NyYy9vdmVybGF5cy9PdmVybGF5LmpzIiwiY2xpZW50L2dhbWUvc3JjL292ZXJsYXlzL2luZGV4LmpzIiwiY2xpZW50L2dhbWUvc3JjL3NjZW5lcy9HYW1lU2NlbmUuanMiLCJjbGllbnQvZ2FtZS9zcmMvc2NlbmVzL0xvYWRpbmdTY2VuZS5qcyIsImNsaWVudC9nYW1lL3NyYy9zY2VuZXMvTG9iYnlTY2VuZS5qcyIsImNsaWVudC9nYW1lL3NyYy9zY2VuZXMvTmV0d29ya1NjZW5lLmpzIiwiY2xpZW50L2dhbWUvc3JjL3NjZW5lcy9pbmRleC5qcyIsImNsaWVudC9nYW1lL3NyYy91dGlsL0Fzc2V0cy5qcyIsImNsaWVudC9nYW1lL3NyYy91dGlsL1ByZWxvYWRlci5qcyIsImNsaWVudC9nYW1lL3NyYy91dGlsL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xyXG52YXIgQXNzZXRzID0gdXRpbC5Bc3NldHM7XHJcbnZhciBQbGF5ZXIgPSByZXF1aXJlKCcuL1BsYXllcicpO1xyXG52YXIgR2FtZU9iamVjdCA9IHdmbC5jb3JlLmVudGl0aWVzLkdhbWVPYmplY3Q7XHJcbnZhciBMaXZpbmdPYmplY3QgPSB3ZmwuY29yZS5lbnRpdGllcy5MaXZpbmdPYmplY3Q7XHJcbnZhciBnZW9tID0gd2ZsLmdlb207XHJcblxyXG52YXIgQ2xpZW50UGxheWVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgTGl2aW5nT2JqZWN0LmNhbGwodGhpcyk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGRlZmF1bHQgc3RhdGVcclxuICAgIHRoaXMuZGVmYXVsdEdyYXBoaWMgPSBBc3NldHMuZ2V0KEFzc2V0cy5DTElFTlQpO1xyXG5cclxuICAgIHZhciB3ID0gdGhpcy5kZWZhdWx0R3JhcGhpYy53aWR0aDtcclxuICAgIHZhciBoID0gdGhpcy5kZWZhdWx0R3JhcGhpYy5oZWlnaHQ7XHJcbiAgICB2YXIgdmVydHMgPSBbXHJcbiAgICAgICAgbmV3IGdlb20uVmVjMigtdyAqIDAuNSwgLWggKiAwLjUpLFxyXG4gICAgICAgIG5ldyBnZW9tLlZlYzIodyAqIDAuNSwgMCksXHJcbiAgICAgICAgbmV3IGdlb20uVmVjMigtdyAqIDAuNSwgaCAqIDAuNSlcclxuICAgIF07XHJcbiAgICB2YXIgZnJhbWVPYmogPSB0aGlzLmNyZWF0ZUZyYW1lKHRoaXMuZGVmYXVsdEdyYXBoaWMsIDEsIGZhbHNlKTtcclxuICAgIGZyYW1lT2JqLnZlcnRpY2VzID0gdmVydHM7XHJcblxyXG4gICAgdGhpcy5kZWZhdWx0U3RhdGUgPSB0aGlzLmNyZWF0ZVN0YXRlKCk7XHJcbiAgICB0aGlzLmRlZmF1bHRTdGF0ZS5hZGRGcmFtZShmcmFtZU9iaik7XHJcbiAgICB0aGlzLmFkZFN0YXRlKEdhbWVPYmplY3QuU1RBVEUuREVGQVVMVCwgdGhpcy5kZWZhdWx0U3RhdGUpO1xyXG5cclxuICAgIHRoaXMucm90YXRlKC1NYXRoLlBJICogMC41KTtcclxufTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoQ2xpZW50UGxheWVyLCB7XHJcbiAgICBBUlJJVkFMX1NMT1dJTkdfUkFESVVTIDoge1xyXG4gICAgICAgIHZhbHVlIDogMjAwXHJcbiAgICB9LFxyXG5cclxuICAgIE1JTl9BUlJJVkFMX1JBRElVUyA6IHtcclxuICAgICAgICB2YWx1ZSA6IDhcclxuICAgIH0sXHJcblxyXG4gICAgTUlOSU1BUF9GSUxMX1NUWUxFIDoge1xyXG4gICAgICAgIHZhbHVlIDogXCIjMDZjODMzXCJcclxuICAgIH1cclxufSk7XHJcbkNsaWVudFBsYXllci5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoTGl2aW5nT2JqZWN0LnByb3RvdHlwZSwge1xyXG4gICAgZHJhd09uTWluaW1hcCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChjdHgpIHtcclxuICAgICAgICAgICAgdmFyIHcgPSB0aGlzLmdldFdpZHRoKCk7XHJcbiAgICAgICAgICAgIHZhciBoID0gdGhpcy5nZXRIZWlnaHQoKTtcclxuICAgICAgICAgICAgdmFyIG9mZnNldFggPSBNYXRoLnJvdW5kKC13ICogMC41KTtcclxuICAgICAgICAgICAgdmFyIG9mZnNldFkgPSBNYXRoLnJvdW5kKC1oICogMC41KTtcclxuICAgICAgICAgICAgdmFyIGRpc3BsYXlXaWR0aCA9IE1hdGgucm91bmQodyk7XHJcbiAgICAgICAgICAgIHZhciBkaXNwbGF5SGVpZ2h0ID0gTWF0aC5yb3VuZChoKTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5zYXZlKCk7XHJcblxyXG4gICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gQ2xpZW50UGxheWVyLk1JTklNQVBfRklMTF9TVFlMRTtcclxuICAgICAgICAgICAgY3R4LmZpbGxSZWN0KG9mZnNldFgsIG9mZnNldFksIGRpc3BsYXlXaWR0aCwgZGlzcGxheUhlaWdodCk7XHJcblxyXG4gICAgICAgICAgICBjdHgucmVzdG9yZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkpO1xyXG5PYmplY3QuZnJlZXplKENsaWVudFBsYXllcik7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENsaWVudFBsYXllcjsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xyXG52YXIgQXNzZXRzID0gdXRpbC5Bc3NldHM7XHJcbnZhciBHYW1lT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuR2FtZU9iamVjdDtcclxudmFyIFBoeXNpY3NPYmplY3QgPSB3ZmwuY29yZS5lbnRpdGllcy5QaHlzaWNzT2JqZWN0O1xyXG5cclxuLyoqXHJcbiAqIEEgZnVsbC1zaXplZCwgcXVhZHJpbGF0ZXJhbCBibG9ja1xyXG4gKi9cclxudmFyIEZ1bGxCbG9jayA9IGZ1bmN0aW9uICgpIHtcclxuICAgIFBoeXNpY3NPYmplY3QuY2FsbCh0aGlzKTtcclxuXHJcbiAgICB0aGlzLmlkID0gRnVsbEJsb2NrLmlkO1xyXG5cclxuICAgIC8vIENyZWF0ZSBkZWZhdWx0IHN0YXRlXHJcbiAgICB0aGlzLmRlZmF1bHRHcmFwaGljID0gQXNzZXRzLmdldChBc3NldHMuQkxPQ0tfRlVMTCk7XHJcbiAgICB0aGlzLmRlZmF1bHRTdGF0ZSA9IHRoaXMuY3JlYXRlU3RhdGUoKTtcclxuICAgIHRoaXMuZGVmYXVsdFN0YXRlLmFkZEZyYW1lKFxyXG4gICAgICAgIHRoaXMuY3JlYXRlRnJhbWUodGhpcy5kZWZhdWx0R3JhcGhpYylcclxuICAgICk7XHJcbiAgICB0aGlzLmFkZFN0YXRlKEdhbWVPYmplY3QuU1RBVEUuREVGQVVMVCwgdGhpcy5kZWZhdWx0U3RhdGUpO1xyXG5cclxuICAgIHRoaXMuc29saWQgPSB0cnVlO1xyXG4gICAgdGhpcy5maXhlZCA9IHRydWU7XHJcbiAgICB0aGlzLnJvdGF0ZSgtTWF0aC5QSSAqIDAuNSk7XHJcbn07XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKEZ1bGxCbG9jaywge1xyXG4gICAgbmFtZSA6IHtcclxuICAgICAgICB2YWx1ZSA6IFwiRnVsbEJsb2NrXCJcclxuICAgIH0sXHJcblxyXG4gICAgaWQgOiB7XHJcbiAgICAgICAgdmFsdWUgOiAwXHJcbiAgICB9XHJcbn0pO1xyXG5GdWxsQmxvY2sucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKFBoeXNpY3NPYmplY3QucHJvdG90eXBlLCB7XHJcbiAgICBkcmF3T25NaW5pbWFwIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGN0eCkge1xyXG4gICAgICAgICAgICB2YXIgdyA9IHRoaXMuZ2V0V2lkdGgoKTtcclxuICAgICAgICAgICAgdmFyIGggPSB0aGlzLmdldEhlaWdodCgpO1xyXG4gICAgICAgICAgICB2YXIgb2Zmc2V0WCA9IE1hdGgucm91bmQoLXcgKiAwLjUpO1xyXG4gICAgICAgICAgICB2YXIgb2Zmc2V0WSA9IE1hdGgucm91bmQoLWggKiAwLjUpO1xyXG4gICAgICAgICAgICB2YXIgZGlzcGxheVdpZHRoID0gTWF0aC5yb3VuZCh3KTtcclxuICAgICAgICAgICAgdmFyIGRpc3BsYXlIZWlnaHQgPSBNYXRoLnJvdW5kKGgpO1xyXG5cclxuICAgICAgICAgICAgY3R4LnNhdmUoKTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5yb3RhdGUodGhpcy5nZXRSb3RhdGlvbigpKTtcclxuXHJcbiAgICAgICAgICAgIC8qY3R4LmZpbGxTdHlsZSA9XHJcbiAgICAgICAgICAgICAgICBhcHAuZ2FtZW9iamVjdC5QaHlzaWNzT2JqZWN0Lk1JTklNQVBfRklMTF9TVFlMRTtcclxuICAgICAgICAgICAgY3R4LnN0cm9rZVN0eWxlID1cclxuICAgICAgICAgICAgICAgIGFwcC5nYW1lb2JqZWN0LlBoeXNpY3NPYmplY3QuTUlOSU1BUF9TVFJPS0VfU1RZTEU7Ki9cclxuXHJcbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgY3R4LnJlY3Qob2Zmc2V0WCwgb2Zmc2V0WSwgZGlzcGxheVdpZHRoLCBkaXNwbGF5SGVpZ2h0KTtcclxuICAgICAgICAgICAgY3R4LmZpbGwoKTtcclxuICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xyXG5cclxuICAgICAgICAgICAgY3R4LnJlc3RvcmUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKTtcclxuT2JqZWN0LmZyZWV6ZShGdWxsQmxvY2spO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBGdWxsQmxvY2s7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcclxudmFyIEFzc2V0cyA9IHV0aWwuQXNzZXRzO1xyXG52YXIgTmV0d29yayA9IHJlcXVpcmUoJy4uL25ldHdvcmsnKTtcclxudmFyIEdhbWVPYmplY3QgPSB3ZmwuY29yZS5lbnRpdGllcy5HYW1lT2JqZWN0O1xyXG52YXIgTGl2aW5nT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuTGl2aW5nT2JqZWN0O1xyXG52YXIgZ2VvbSA9IHdmbC5nZW9tO1xyXG5cclxudmFyIFBsYXllciA9IGZ1bmN0aW9uICgpIHtcclxuICAgIExpdmluZ09iamVjdC5jYWxsKHRoaXMpO1xyXG5cclxuICAgIHRoaXMuc29saWQgPSB0cnVlO1xyXG5cclxuICAgIC8vIENyZWF0ZSBkZWZhdWx0IHN0YXRlXHJcbiAgICB0aGlzLmRlZmF1bHRHcmFwaGljID0gQXNzZXRzLmdldChBc3NldHMuUExBWUVSKTtcclxuXHJcbiAgICB2YXIgdyA9IHRoaXMuZGVmYXVsdEdyYXBoaWMud2lkdGg7XHJcbiAgICB2YXIgaCA9IHRoaXMuZGVmYXVsdEdyYXBoaWMuaGVpZ2h0O1xyXG4gICAgdmFyIHZlcnRzID0gW1xyXG4gICAgICAgIG5ldyBnZW9tLlZlYzIoLXcgKiAwLjUsIC1oICogMC41KSxcclxuICAgICAgICBuZXcgZ2VvbS5WZWMyKHcgKiAwLjUsIDApLFxyXG4gICAgICAgIG5ldyBnZW9tLlZlYzIoLXcgKiAwLjUsIGggKiAwLjUpXHJcbiAgICBdO1xyXG4gICAgdmFyIGZyYW1lT2JqID0gdGhpcy5jcmVhdGVGcmFtZSh0aGlzLmRlZmF1bHRHcmFwaGljLCAxLCBmYWxzZSk7XHJcbiAgICBmcmFtZU9iai52ZXJ0aWNlcyA9IHZlcnRzO1xyXG5cclxuICAgIHRoaXMuZGVmYXVsdFN0YXRlID0gdGhpcy5jcmVhdGVTdGF0ZSgpO1xyXG4gICAgdGhpcy5kZWZhdWx0U3RhdGUuYWRkRnJhbWUoZnJhbWVPYmopO1xyXG4gICAgdGhpcy5hZGRTdGF0ZShHYW1lT2JqZWN0LlNUQVRFLkRFRkFVTFQsIHRoaXMuZGVmYXVsdFN0YXRlKTtcclxuXHJcbiAgICB0aGlzLmxhc3RTZW50UG9zaXRpb24gPSBuZXcgZ2VvbS5WZWMyKC1JbmZpbml0eSwgLUluZmluaXR5KTtcclxuXHJcbiAgICB0aGlzLnJvdGF0ZSgtTWF0aC5QSSAqIDAuNSk7XHJcbn07XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKFBsYXllciwge1xyXG4gICAgVFVSTl9TUEVFRCA6IHtcclxuICAgICAgICB2YWx1ZSA6IDAuMDVcclxuICAgIH0sXHJcblxyXG4gICAgQlJBS0VfUkFURSA6IHtcclxuICAgICAgICB2YWx1ZSA6IDAuOTVcclxuICAgIH0sXHJcblxyXG4gICAgQk9PU1RfQUNDRUxFUkFUSU9OIDoge1xyXG4gICAgICAgIHZhbHVlIDogMC4wMDAyXHJcbiAgICB9LFxyXG5cclxuICAgIFBPU0lUSU9OX1VQREFURV9ESVNUQU5DRSA6IHtcclxuICAgICAgICB2YWx1ZSA6IDAuNVxyXG4gICAgfSxcclxuXHJcbiAgICBNSU5JTUFQX0ZJTExfU1RZTEUgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBcIiM4NmM4ZDNcIlxyXG4gICAgfVxyXG59KTtcclxuUGxheWVyLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShMaXZpbmdPYmplY3QucHJvdG90eXBlLCB7XHJcbiAgICB1cGRhdGUgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZHQpIHtcclxuICAgICAgICAgICAgTGl2aW5nT2JqZWN0LnByb3RvdHlwZS51cGRhdGUuY2FsbCh0aGlzLCBkdCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBJZiB0aGUgcGxheWVyIGlzIGNvbm5lY3RlZCB0byB0aGUgbmV0d29yaywgc2VuZCBvdXQgdXBkYXRlcyB0b1xyXG4gICAgICAgICAgICAvLyBvdGhlciBwbGF5ZXJzIHdoZW4gbmVjZXNzYXJ5XHJcbiAgICAgICAgICAgIGlmIChOZXR3b3JrLmNvbm5lY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgTmV0d29yay5zb2NrZXQuZW1pdCgndXBkYXRlT3RoZXInLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb24gICAgIDogdGhpcy5wb3NpdGlvbixcclxuICAgICAgICAgICAgICAgICAgICB2ZWxvY2l0eSAgICAgOiB0aGlzLnZlbG9jaXR5LFxyXG4gICAgICAgICAgICAgICAgICAgIGFjY2VsZXJhdGlvbiA6IHRoaXMuYWNjZWxlcmF0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIHJvdGF0aW9uICAgICA6IHRoaXMuZ2V0Um90YXRpb24oKVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGRyYXdPbk1pbmltYXAgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoY3R4KSB7XHJcbiAgICAgICAgICAgIHZhciB3ID0gdGhpcy5nZXRXaWR0aCgpO1xyXG4gICAgICAgICAgICB2YXIgaCA9IHRoaXMuZ2V0SGVpZ2h0KCk7XHJcbiAgICAgICAgICAgIHZhciBvZmZzZXRYID0gTWF0aC5yb3VuZCgtdyAqIDAuNSk7XHJcbiAgICAgICAgICAgIHZhciBvZmZzZXRZID0gTWF0aC5yb3VuZCgtaCAqIDAuNSk7XHJcbiAgICAgICAgICAgIHZhciBkaXNwbGF5V2lkdGggPSBNYXRoLnJvdW5kKHcpO1xyXG4gICAgICAgICAgICB2YXIgZGlzcGxheUhlaWdodCA9IE1hdGgucm91bmQoaCk7XHJcblxyXG4gICAgICAgICAgICBjdHguc2F2ZSgpO1xyXG5cclxuICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFBsYXllci5NSU5JTUFQX0ZJTExfU1RZTEU7XHJcbiAgICAgICAgICAgIGN0eC5maWxsUmVjdChvZmZzZXRYLCBvZmZzZXRZLCBkaXNwbGF5V2lkdGgsIGRpc3BsYXlIZWlnaHQpO1xyXG5cclxuICAgICAgICAgICAgY3R4LnJlc3RvcmUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKTtcclxuT2JqZWN0LmZyZWV6ZShQbGF5ZXIpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXI7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgRnVsbEJsb2NrID0gcmVxdWlyZSgnLi9GdWxsQmxvY2suanMnKTtcclxudmFyIFBsYXllciA9IHJlcXVpcmUoJy4vUGxheWVyLmpzJyk7XHJcbnZhciBDbGllbnRQbGF5ZXIgPSByZXF1aXJlKCcuL0NsaWVudFBsYXllci5qcycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBGdWxsQmxvY2sgOiBGdWxsQmxvY2ssXHJcbiAgICBQbGF5ZXI6IFBsYXllcixcclxuICAgIENsaWVudFBsYXllciA6IENsaWVudFBsYXllclxyXG59OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIE5ldHdvcmsgPSByZXF1aXJlKCcuL25ldHdvcmsnKTtcclxudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcclxudmFyIEFzc2V0cyA9IHV0aWwuQXNzZXRzO1xyXG52YXIgc2NlbmVzID0gcmVxdWlyZSgnLi9zY2VuZXMnKTtcclxudmFyIG92ZXJsYXlzID0gcmVxdWlyZSgnLi9vdmVybGF5cycpO1xyXG5cclxuLy8gQ3JlYXRlIGdhbWVcclxudmFyIGNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZ2FtZS1jYW52YXNcIik7XHJcbnZhciBnYW1lICAgPSB3ZmwuY3JlYXRlKGNhbnZhcyk7XHJcblxyXG52YXIgbG9hZGluZ1NjZW5lID0gbmV3IHNjZW5lcy5Mb2FkaW5nU2NlbmUoY2FudmFzKTtcclxuZ2FtZS5zZXRTY2VuZShsb2FkaW5nU2NlbmUpO1xyXG5cclxuLy8gU3RvcCB0aGUgZ2FtZSBzbyB0aGF0IGNhbnZhcyB1cGRhdGVzIGRvbid0IGFmZmVjdCBwZXJmb3JtYW5jZSB3aXRoXHJcbi8vIG92ZXJsYXlzXHJcbmdhbWUuc3RvcCgpO1xyXG5cclxuLy8gRHJhdyBpbml0aWFsIGJsYWNrIEJHIG9uIGNhbnZhc1xyXG52YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcclxuY3R4LmZpbGxTdHlsZSA9IFwiIzA0MEIwQ1wiO1xyXG5jdHguZmlsbFJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcclxuXHJcbnZhciBvbkxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAkKE5ldHdvcmspLm9uKFxyXG4gICAgICAgIE5ldHdvcmsuRXZlbnQuQ09OTkVDVCxcclxuICAgICAgICBvbk5ldHdvcmtDb25uZWN0XHJcbiAgICApO1xyXG5cclxuICAgIE5ldHdvcmsuaW5pdCgpO1xyXG59O1xyXG5cclxudmFyIG9uTmV0d29ya0Nvbm5lY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgbG9iYnlTY2VuZSA9IG5ldyBzY2VuZXMuTG9iYnlTY2VuZShjYW52YXMpO1xyXG4gICAgZ2FtZS5zZXRTY2VuZShsb2JieVNjZW5lKTtcclxuXHJcbiAgICAkKE5ldHdvcmspLm9uKFxyXG4gICAgICAgIE5ldHdvcmsuRXZlbnQuU1RBUlRfR0FNRSxcclxuICAgICAgICBvblBsYXlHYW1lXHJcbiAgICApO1xyXG4gICAgXHJcbiAgICAvLyBUcmFuc2l0aW9uIHRoZSBwYWdlJ3MgQkcgY29sb3IgdG8gYmxhY2sgdG8gaGlkZSB0aGUgQkcgaW1hZ2Ugd2hpY2hcclxuICAgIC8vIGJlY29tZXMgZGlzdHJhY3RpbmcgZHVyaW5nIGdhbWUgcGxheVxyXG4gICAgJChcImJvZHlcIikuY3NzKHtcImJhY2tncm91bmQtY29sb3JcIjogXCIjMDcxMjEzXCJ9KTtcclxufTtcclxuXHJcbnZhciBvblBsYXlHYW1lID0gZnVuY3Rpb24gKGUsIHJvb20pIHtcclxuICAgICQoZ2FtZS5nZXRTY2VuZSgpKS5vZmYoKTtcclxuXHJcbiAgICB2YXIgZ2FtZVNjZW5lID0gbmV3IHNjZW5lcy5HYW1lU2NlbmUoY2FudmFzLCByb29tLmlkKTtcclxuICAgIGdhbWUuc2V0U2NlbmUoZ2FtZVNjZW5lKTtcclxuXHJcbiAgICAvLyBTdGFydCB0aGUgZ2FtZSBzaW5jZSBpdCB3YXMgc3RvcHBlZCB0byBoZWxwIHBlcmZvcm1hbmNlIHdpdGggb3ZlcmxheXMgb25cclxuICAgIC8vIGEgY2FudmFzXHJcbiAgICBnYW1lLnN0YXJ0KCk7XHJcbn07XHJcblxyXG52YXIgUHJlbG9hZGVyID0gbmV3IHV0aWwuUHJlbG9hZGVyKG9uTG9hZC5iaW5kKHRoaXMpKTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBlbnRpdGllcyA9IHJlcXVpcmUoJy4uL2VudGl0aWVzJyk7XHJcblxyXG52YXIgQ2xpZW50ID0gZnVuY3Rpb24gKGlkLCBkYXRhKSB7XHJcbiAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICB0aGlzLmRhdGEgPSBkYXRhO1xyXG4gICAgdGhpcy5nYW1lT2JqZWN0ID0gbmV3IGVudGl0aWVzLkNsaWVudFBsYXllcigpO1xyXG59O1xyXG5PYmplY3QuZnJlZXplKENsaWVudCk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENsaWVudDsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBlbnRpdGllcyA9IHJlcXVpcmUoJy4uL2VudGl0aWVzJyk7XHJcblxyXG52YXIgTG9jYWxDbGllbnQgPSBmdW5jdGlvbiAoaWQsIGRhdGEpIHtcclxuICAgIHRoaXMuaWQgPSBpZDtcclxuICAgIHRoaXMuZGF0YSA9IGRhdGE7XHJcbiAgICB0aGlzLmdhbWVPYmplY3QgPSBuZXcgZW50aXRpZXMuUGxheWVyKCk7XHJcbn07XHJcbk9iamVjdC5mcmVlemUoTG9jYWxDbGllbnQpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBMb2NhbENsaWVudDsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBOZXR3b3JrID0ge1xyXG4gICAgc29ja2V0ICAgICAgOiB1bmRlZmluZWQsXHJcbiAgICBsb2NhbENsaWVudCA6IHt9LFxyXG4gICAgY2xpZW50cyAgICAgOiB7fSxcclxuICAgIHJvb21zICAgICAgIDoge30sXHJcbiAgICBjb25uZWN0ZWQgICA6IGZhbHNlLFxyXG4gICAgaG9zdElkICAgICAgOiAtMSxcclxuXHJcbiAgICAvLyBFdmVudHMgZm9yIGV4dGVybmFsIGVudGl0aWVzIHRvIHN1YnNjcmliZSB0b1xyXG4gICAgRXZlbnQgICAgICAgOiB7XHJcbiAgICAgICAgQ09OTkVDVCAgICAgICAgICAgIDogXCJjb25uZWN0XCIsXHJcbiAgICAgICAgVVBEQVRFX1JPT01TICAgICAgIDogXCJ1cGRhdGVSb29tc1wiLFxyXG4gICAgICAgIEVOVEVSX1JPT01fU1VDQ0VTUyA6IFwiZW50ZXJSb29tU3VjY2Vzc1wiLFxyXG4gICAgICAgIEVOVEVSX1JPT01fRkFJTCAgICA6IFwiZW50ZXJSb29tRmFpbFwiLFxyXG4gICAgICAgIFBMQVkgICAgICAgICAgICAgICA6IFwicGxheVwiLFxyXG4gICAgICAgIFNUQVJUX0dBTUUgICAgICAgICA6IFwic3RhcnRHYW1lXCJcclxuICAgIH0sXHJcblxyXG4gICAgaW5pdCA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLnNvY2tldCA9IGlvLmNvbm5lY3QoKTtcclxuXHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ2NvbmZpcm0nLCB0aGlzLl9vbkNvbmZpcm1DbGllbnQuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ2FkZE90aGVyJywgdGhpcy5fb25BZGRPdGhlckNsaWVudC5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbigncmVtb3ZlT3RoZXInLCB0aGlzLl9vblJlbW92ZU90aGVyQ2xpZW50LmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdsb2FkUHJldmlvdXMnLCB0aGlzLl9vbkxvYWRQcmV2aW91c0NsaWVudHMuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ3VwZGF0ZU90aGVyJywgdGhpcy5fb25VcGRhdGVDbGllbnQuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ3VwZGF0ZVJvb21zJywgdGhpcy5fb25VcGRhdGVSb29tcy5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbignZW50ZXJSb29tU3VjY2VzcycsIHRoaXMuX29uRW50ZXJSb29tU3VjY2Vzcy5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbignZW50ZXJSb29tRmFpbCcsIHRoaXMuX29uRW50ZXJSb29tRmFpbC5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbigncGluZycsIHRoaXMuX29uUGluZy5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbignc2V0SG9zdCcsIHRoaXMuX29uU2V0SG9zdC5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbignc3RhcnRHYW1lJywgdGhpcy5fb25TdGFydEdhbWUuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ2luaXQnLCB7XHJcbiAgICAgICAgICAgIHVzZXIgOiAkKFwiI3VzZXJOYW1lXCIpLmh0bWwoKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRSb29tcyA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCd1cGRhdGVSb29tcycpO1xyXG4gICAgfSxcclxuXHJcbiAgICBjcmVhdGVSb29tIDogZnVuY3Rpb24gKG5hbWUpIHtcclxuICAgICAgICB2YXIgcm9vbURhdGEgPSB7XHJcbiAgICAgICAgICAgIG5hbWUgIDogbmFtZSxcclxuICAgICAgICAgICAgZW50ZXIgOiB0cnVlXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnY3JlYXRlUm9vbScsIHJvb21EYXRhKTtcclxuICAgIH0sXHJcblxyXG4gICAgZW50ZXJSb29tIDogZnVuY3Rpb24gKHJvb21JZCkge1xyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ2VudGVyUm9vbScsIHJvb21JZCk7XHJcbiAgICB9LFxyXG5cclxuICAgIGxlYXZlUm9vbSA6IGZ1bmN0aW9uIChyb29tSWQpIHtcclxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdsZWF2ZVJvb20nLCByb29tSWQpO1xyXG4gICAgfSxcclxuXHJcbiAgICBzd2l0Y2hUZWFtIDogZnVuY3Rpb24gKHJvb21JZCkge1xyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ3N3aXRjaFRlYW0nLCByb29tSWQpO1xyXG4gICAgfSxcclxuXHJcbiAgICBfb25Db25maXJtQ2xpZW50IDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICB2YXIgaWQgPSBkYXRhLmlkO1xyXG4gICAgICAgIHRoaXMubG9jYWxDbGllbnQgPSBuZXcgTG9jYWxDbGllbnQoaWQsIGRhdGEpO1xyXG4gICAgICAgIHRoaXMuY2xpZW50c1tpZF0gPSB0aGlzLmxvY2FsQ2xpZW50O1xyXG5cclxuICAgICAgICB0aGlzLl9vblVwZGF0ZUNsaWVudChkYXRhKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25uZWN0ZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICAkKHRoaXMpLnRyaWdnZXIoXHJcbiAgICAgICAgICAgIHRoaXMuRXZlbnQuQ09OTkVDVFxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkFkZE90aGVyQ2xpZW50IDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICB2YXIgaWQgPSBkYXRhLmlkO1xyXG4gICAgICAgIHZhciBuZXdDbGllbnQgPSBuZXcgQ2xpZW50KGlkLCBkYXRhKTtcclxuXHJcbiAgICAgICAgdGhpcy5jbGllbnRzW2RhdGEuaWRdID0gbmV3Q2xpZW50O1xyXG5cclxuICAgICAgICB0aGlzLl9vblVwZGF0ZUNsaWVudChkYXRhKTtcclxuICAgIH0sXHJcblxyXG4gICAgX29uUmVtb3ZlT3RoZXJDbGllbnQgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgIHRoaXMuY2xpZW50c1tkYXRhLmlkXSA9IHVuZGVmaW5lZDtcclxuICAgICAgICBkZWxldGUgdGhpcy5jbGllbnRzW2RhdGEuaWRdO1xyXG4gICAgfSxcclxuXHJcbiAgICBfb25Mb2FkUHJldmlvdXNDbGllbnRzIDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGRhdGEpO1xyXG5cclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIGlkID0gcGFyc2VJbnQoa2V5c1tpXSk7XHJcbiAgICAgICAgICAgIHZhciB1c2VyRGF0YSA9IGRhdGFbaWRdO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fb25BZGRPdGhlckNsaWVudCh1c2VyRGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25VcGRhdGVDbGllbnQgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgIHZhciBpZCA9IGRhdGEuaWQ7XHJcbiAgICAgICAgdmFyIGNsaWVudCA9IHRoaXMuY2xpZW50c1tpZF07XHJcblxyXG4gICAgICAgIGNsaWVudC5kYXRhID0gZGF0YTtcclxuICAgICAgICBjbGllbnQuZ2FtZU9iamVjdC5wb3NpdGlvbi54ID0gZGF0YS5wb3NpdGlvbi54O1xyXG4gICAgICAgIGNsaWVudC5nYW1lT2JqZWN0LnBvc2l0aW9uLnkgPSBkYXRhLnBvc2l0aW9uLnk7XHJcbiAgICAgICAgY2xpZW50LmdhbWVPYmplY3QudmVsb2NpdHkueCA9IGRhdGEudmVsb2NpdHkueDtcclxuICAgICAgICBjbGllbnQuZ2FtZU9iamVjdC52ZWxvY2l0eS55ID0gZGF0YS52ZWxvY2l0eS55O1xyXG4gICAgICAgIGNsaWVudC5nYW1lT2JqZWN0LmFjY2VsZXJhdGlvbi54ID0gZGF0YS5hY2NlbGVyYXRpb24ueDtcclxuICAgICAgICBjbGllbnQuZ2FtZU9iamVjdC5hY2NlbGVyYXRpb24ueSA9IGRhdGEuYWNjZWxlcmF0aW9uLnk7XHJcbiAgICAgICAgY2xpZW50LmdhbWVPYmplY3Quc2V0Um90YXRpb24oZGF0YS5yb3RhdGlvbik7XHJcbiAgICB9LFxyXG5cclxuICAgIF9vblVwZGF0ZVJvb21zIDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICB0aGlzLnJvb21zID0gZGF0YTtcclxuXHJcbiAgICAgICAgJCh0aGlzKS50cmlnZ2VyKFxyXG4gICAgICAgICAgICB0aGlzLkV2ZW50LlVQREFURV9ST09NUyxcclxuICAgICAgICAgICAgZGF0YVxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkVudGVyUm9vbVN1Y2Nlc3MgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICQodGhpcykudHJpZ2dlcihcclxuICAgICAgICAgICAgdGhpcy5FdmVudC5FTlRFUl9ST09NX1NVQ0NFU1MsXHJcbiAgICAgICAgICAgIGRhdGFcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBfb25FbnRlclJvb21GYWlsIDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAkKHRoaXMpLnRyaWdnZXIoXHJcbiAgICAgICAgICAgIHRoaXMuRXZlbnQuRU5URVJfUk9PTV9GQUlMLFxyXG4gICAgICAgICAgICBkYXRhXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgX29uUGluZyA6IGZ1bmN0aW9uIChwaW5nT2JqKSB7XHJcbiAgICAgICAgaWYgKHBpbmdPYmopIHtcclxuICAgICAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgncmV0dXJuUGluZycsIHBpbmdPYmopO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uU2V0SG9zdCA6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgdGhpcy5ob3N0SWQgPSBkYXRhLmlkO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xyXG4gICAgfSxcclxuXHJcbiAgICBfb25TdGFydEdhbWUgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgY29uc29sZS5sb2coXCJEU1RTVFwiKTtcclxuICAgICAgICAkKHRoaXMpLnRyaWdnZXIoXHJcbiAgICAgICAgICAgIHRoaXMuRXZlbnQuU1RBUlRfR0FNRSxcclxuICAgICAgICAgICAgZGF0YVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE5ldHdvcms7XHJcblxyXG52YXIgQ2xpZW50ID0gcmVxdWlyZSgnLi9DbGllbnQuanMnKTtcclxudmFyIExvY2FsQ2xpZW50ID0gcmVxdWlyZSgnLi9Mb2NhbENsaWVudC5qcycpOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIE92ZXJsYXkgPSByZXF1aXJlKCcuL092ZXJsYXknKTtcclxuXHJcbnZhciBDcmVhdGVSb29tT3ZlcmxheSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIE92ZXJsYXkuY2FsbCh0aGlzKTtcclxuICAgIFxyXG4gICAgdGhpcy5pbnB1dEZpZWxkID0gJChcIjxpbnB1dD5cIik7XHJcbiAgICB0aGlzLmlucHV0RmllbGQuYXR0cih7IFwicGxhY2Vob2xkZXJcIiA6IFwiUm9vbSBOYW1lXCIgfSk7XHJcbiAgICB0aGlzLmlucHV0RmllbGQuYWRkQ2xhc3MoXCJjcmVhdGUtcm9vbS1vdmVybGF5LWlucHV0XCIpO1xyXG4gICAgXHJcbiAgICB0aGlzLmJ1dHRvbkNvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcclxuICAgIHRoaXMuYnV0dG9uQ29udGFpbmVyLmFkZENsYXNzKFwiY3JlYXRlLXJvb20tb3ZlcmxheS1idXR0b24tY29udGFpbmVyXCIpO1xyXG4gICAgXHJcbiAgICB0aGlzLmNhbmNlbEJ0biA9ICQoXCI8YnV0dG9uPlwiKTtcclxuICAgIHRoaXMuY2FuY2VsQnRuLnRleHQoXCJDYW5jZWxcIik7XHJcbiAgICB0aGlzLmJ1dHRvbkNvbnRhaW5lci5hcHBlbmQodGhpcy5jYW5jZWxCdG4pO1xyXG4gICAgXHJcbiAgICB0aGlzLmNyZWF0ZUJ0biA9ICQoXCI8YnV0dG9uPlwiKTtcclxuICAgIHRoaXMuY3JlYXRlQnRuLnRleHQoXCJDcmVhdGVcIik7XHJcbiAgICB0aGlzLmJ1dHRvbkNvbnRhaW5lci5hcHBlbmQodGhpcy5jcmVhdGVCdG4pO1xyXG5cclxuICAgIHRoaXMuZG9tT2JqZWN0LmFwcGVuZCh0aGlzLmlucHV0RmllbGQpO1xyXG4gICAgdGhpcy5kb21PYmplY3QuYXBwZW5kKHRoaXMuYnV0dG9uQ29udGFpbmVyKTtcclxuICAgIHRoaXMuZG9tT2JqZWN0LmFkZENsYXNzKFwiY3JlYXRlLXJvb20tb3ZlcmxheVwiKTtcclxufTtcclxuXHJcbkNyZWF0ZVJvb21PdmVybGF5LnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShPdmVybGF5LnByb3RvdHlwZSwge1xyXG5cclxufSkpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDcmVhdGVSb29tT3ZlcmxheTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBPdmVybGF5ID0gcmVxdWlyZSgnLi9PdmVybGF5Jyk7XHJcblxyXG52YXIgTG9hZGluZ092ZXJsYXkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBPdmVybGF5LmNhbGwodGhpcyk7XHJcbiAgICBcclxuICAgIHRoaXMuZG9tT2JqZWN0LmFkZENsYXNzKFwibG9hZGluZy1vdmVybGF5LWJnXCIpO1xyXG4gICAgXHJcbiAgICB0aGlzLmxvYWRpbmdJY29uID0gJChcIjxkaXY+XCIpO1xyXG4gICAgdGhpcy5sb2FkaW5nSWNvbi5hZGRDbGFzcyhcImxvYWRpbmctb3ZlcmxheVwiKTtcclxuICAgIFxyXG4gICAgdGhpcy5kb21PYmplY3QuYXBwZW5kKHRoaXMubG9hZGluZ0ljb24pO1xyXG59O1xyXG5cclxuTG9hZGluZ092ZXJsYXkucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKE92ZXJsYXkucHJvdG90eXBlLCB7XHJcblxyXG59KSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IExvYWRpbmdPdmVybGF5OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIE92ZXJsYXkgPSByZXF1aXJlKCcuL092ZXJsYXknKTtcclxudmFyIE5ldHdvcmsgPSByZXF1aXJlKCcuLi9uZXR3b3JrJyk7XHJcblxyXG52YXIgTG9iYnlPdmVybGF5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgT3ZlcmxheS5jYWxsKHRoaXMpO1xyXG5cclxuICAgIC8vIFNldCB1cCBsZWZ0IHNpZGVcclxuICAgIHRoaXMubGVmdENvbnRhaW5lciA9ICQoXCI8c3Bhbj5cIik7XHJcbiAgICB0aGlzLmxlZnRDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LWxlZnRcIik7XHJcbiAgICB0aGlzLmxlZnRDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LW1heGltaXplZC1zaWRlXCIpO1xyXG5cclxuICAgIHRoaXMucm9vbUJ1dHRvbkNvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcclxuICAgIHRoaXMucm9vbUJ1dHRvbkNvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktYnV0dG9uLWNvbnRhaW5lclwiKTtcclxuICAgIHRoaXMubGVmdENvbnRhaW5lci5hcHBlbmQodGhpcy5yb29tQnV0dG9uQ29udGFpbmVyKTtcclxuXHJcbiAgICB0aGlzLnNlbGVjdFJvb21MYWJlbCA9ICQoXCI8ZGl2PlwiKTtcclxuICAgIHRoaXMuc2VsZWN0Um9vbUxhYmVsLmh0bWwoXCJTZWxlY3Qgb3IgY3JlYXRlIHJvb21cIik7XHJcbiAgICB0aGlzLnJvb21CdXR0b25Db250YWluZXIuYXBwZW5kKHRoaXMuc2VsZWN0Um9vbUxhYmVsKTtcclxuICAgIHRoaXMucm9vbUJ1dHRvbkNvbnRhaW5lci5hcHBlbmQoJChcIjxicj5cIikpO1xyXG5cclxuICAgIHRoaXMuY3JlYXRlUm9vbUJ0biA9ICQoXCI8YnV0dG9uPlwiKTtcclxuICAgIHRoaXMuY3JlYXRlUm9vbUJ0bi50ZXh0KFwiQ3JlYXRlIFJvb21cIik7XHJcbiAgICB0aGlzLnJvb21CdXR0b25Db250YWluZXIuYXBwZW5kKHRoaXMuY3JlYXRlUm9vbUJ0bik7XHJcblxyXG4gICAgdGhpcy5yb29tTGlzdENvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcclxuICAgIHRoaXMucm9vbUxpc3RDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LXJvb20tbGlzdFwiKTtcclxuICAgIHRoaXMucm9vbUxpc3RDb250YWluZXIuaHRtbChcIkxvYWRpbmcgcm9vbXMuLi5cIik7XHJcbiAgICB0aGlzLmxlZnRDb250YWluZXIuYXBwZW5kKHRoaXMucm9vbUxpc3RDb250YWluZXIpO1xyXG5cclxuICAgIC8vIFNldCB1cCByaWdodCBzaWRlXHJcbiAgICB0aGlzLnJpZ2h0Q29udGFpbmVyID0gJChcIjxzcGFuPlwiKTtcclxuICAgIHRoaXMucmlnaHRDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LXJpZ2h0XCIpO1xyXG4gICAgdGhpcy5yaWdodENvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktbWluaW1pemVkLXNpZGVcIik7XHJcblxyXG4gICAgdGhpcy5zZWxlY3RlZFJvb21MYWJlbCA9ICQoXCI8ZGl2PlwiKTtcclxuICAgIHRoaXMuc2VsZWN0ZWRSb29tTGFiZWwuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LXJvb20tbGFiZWwtY29udGFpbmVyXCIpO1xyXG5cclxuICAgIHRoaXMucmVuZGVyUm9vbUxhYmVsKCk7XHJcbiAgICB0aGlzLnJpZ2h0Q29udGFpbmVyLmFwcGVuZCh0aGlzLnNlbGVjdGVkUm9vbUxhYmVsKTtcclxuXHJcbiAgICB0aGlzLnN3aXRjaFRlYW1CdG4gPSAkKFwiPGJ1dHRvbj5cIik7XHJcbiAgICB0aGlzLnN3aXRjaFRlYW1CdG4udGV4dChcIlN3aXRjaCBUZWFtc1wiKTtcclxuICAgIHRoaXMuc3dpdGNoVGVhbUJ0bi5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktc3dpdGNoLXRlYW0tYnRuXCIpO1xyXG5cclxuICAgIHRoaXMudGVhbUFDb250YWluZXIgPSAkKFwiPGRpdj5cIik7XHJcbiAgICB0aGlzLnRlYW1BQ29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS10ZWFtQS1jb250YWluZXJcIik7XHJcblxyXG4gICAgdGhpcy50ZWFtQkNvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcclxuICAgIHRoaXMudGVhbUJDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LXRlYW1CLWNvbnRhaW5lclwiKTtcclxuXHJcbiAgICB0aGlzLnJlbmRlclBsYXllcnMoKTtcclxuXHJcbiAgICB0aGlzLnJpZ2h0Q29udGFpbmVyLmFwcGVuZCh0aGlzLnRlYW1BQ29udGFpbmVyKTtcclxuICAgIHRoaXMucmlnaHRDb250YWluZXIuYXBwZW5kKHRoaXMuc3dpdGNoVGVhbUJ0bik7XHJcbiAgICB0aGlzLnJpZ2h0Q29udGFpbmVyLmFwcGVuZCh0aGlzLnRlYW1CQ29udGFpbmVyKTtcclxuXHJcbiAgICB0aGlzLmxlYXZlUm9vbUJ0biA9ICQoXCI8YnV0dG9uPlwiKTtcclxuICAgIHRoaXMubGVhdmVSb29tQnRuLnRleHQoXCJMZWF2ZSBSb29tXCIpO1xyXG4gICAgdGhpcy5sZWF2ZVJvb21CdG4uYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LWxlYXZlLXJvb20tYnRuXCIpO1xyXG4gICAgdGhpcy5sZWF2ZVJvb21CdG4uaGlkZSgpO1xyXG4gICAgdGhpcy5yaWdodENvbnRhaW5lci5hcHBlbmQodGhpcy5sZWF2ZVJvb21CdG4pO1xyXG5cclxuICAgIHRoaXMucmVhZHlCdG4gPSAkKFwiPGJ1dHRvbj5cIik7XHJcbiAgICB0aGlzLnJlYWR5QnRuLnRleHQoXCJSZWFkeVwiKTtcclxuICAgIHRoaXMucmVhZHlCdG4uYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LXJlYWR5LWJ0blwiKTtcclxuICAgIHRoaXMucmVhZHlCdG4uaGlkZSgpO1xyXG4gICAgdGhpcy5yaWdodENvbnRhaW5lci5hcHBlbmQodGhpcy5yZWFkeUJ0bik7XHJcblxyXG4gICAgdGhpcy5kb21PYmplY3QuYXBwZW5kKHRoaXMubGVmdENvbnRhaW5lcik7XHJcbiAgICB0aGlzLmRvbU9iamVjdC5hcHBlbmQodGhpcy5yaWdodENvbnRhaW5lcik7XHJcbiAgICB0aGlzLmRvbU9iamVjdC5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXlcIik7XHJcbiAgICB0aGlzLmRvbU9iamVjdC5hZGRDbGFzcyhcImZhZGUtaW5cIik7XHJcbn07XHJcblxyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhMb2JieU92ZXJsYXksIHtcclxuICAgIEV2ZW50IDoge1xyXG4gICAgICAgIHZhbHVlIDoge1xyXG4gICAgICAgICAgICBFTlRFUl9ST09NIDogXCJlbnRlclJvb21cIlxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcblxyXG5Mb2JieU92ZXJsYXkucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKE92ZXJsYXkucHJvdG90eXBlLCB7XHJcbiAgICBzaG93Um9vbXMgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAocm9vbURhdGEpIHtcclxuICAgICAgICAgICAgdGhpcy5yb29tTGlzdENvbnRhaW5lci5odG1sKFwiXCIpO1xyXG5cclxuICAgICAgICAgICAgJChcIi5sb2JieS1vdmVybGF5LXJvb21cIikub2ZmKFwiY2xpY2tcIik7XHJcblxyXG4gICAgICAgICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHJvb21EYXRhKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChrZXlzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yb29tTGlzdENvbnRhaW5lci5odG1sKFwiTm8gcm9vbXMgYXZhaWxhYmxlXCIpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1clJvb20gPSByb29tRGF0YVtrZXlzW2ldXTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY3VyUm9vbUNvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcclxuICAgICAgICAgICAgICAgICAgICBjdXJSb29tQ29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1yb29tXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGN1clJvb21Db250YWluZXIuaHRtbChjdXJSb29tLm5hbWUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKGN1clJvb21Db250YWluZXIpLm9uKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImNsaWNrXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1clJvb20sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX29uQ2xpY2tSb29tLmJpbmQodGhpcylcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJvb21MaXN0Q29udGFpbmVyLmFwcGVuZChjdXJSb29tQ29udGFpbmVyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgcmVuZGVyUm9vbSA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgIGlmIChkYXRhID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyUm9vbUxhYmVsKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlclBsYXllcnMoKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9vbkV4aXRSb29tKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlclJvb21MYWJlbChkYXRhLm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJQbGF5ZXJzKGRhdGEpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuX29uRW50ZXJSb29tKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHJlbmRlclJvb21MYWJlbCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChsYWJlbCkge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGxhYmVsICE9PSBcInN0cmluZ1wiIHx8IGxhYmVsID09PSBcIlwiKSB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbCA9IFwiTm8gcm9vbSBzZWxlY3RlZFwiO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsYWJlbCA9IFwiQ3VycmVudCByb29tOiBcIiArIGxhYmVsO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZFJvb21MYWJlbC5odG1sKGxhYmVsKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHJlbmRlclBsYXllcnMgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAocm9vbURhdGEpIHtcclxuICAgICAgICAgICAgdGhpcy50ZWFtQUNvbnRhaW5lci5odG1sKFwiXCIpO1xyXG4gICAgICAgICAgICB0aGlzLnRlYW1CQ29udGFpbmVyLmh0bWwoXCJcIik7XHJcbiAgICAgICAgICAgIHRoaXMuc3dpdGNoVGVhbUJ0bi5oaWRlKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAocm9vbURhdGEgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHRlYW1BID0gcm9vbURhdGEudGVhbUE7XHJcbiAgICAgICAgICAgICAgICB2YXIgdGVhbUIgPSByb29tRGF0YS50ZWFtQjtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgdGVhbUFMYWJlbCA9ICQoXCI8ZGl2PlwiKTtcclxuICAgICAgICAgICAgICAgIHRlYW1BTGFiZWwuaHRtbChcIlJvc2UgVGVhbVwiKTtcclxuICAgICAgICAgICAgICAgIHRlYW1BTGFiZWwuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LXRlYW0tbGFiZWxcIik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRlYW1BQ29udGFpbmVyLmFwcGVuZCh0ZWFtQUxhYmVsKTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgdGVhbUJMYWJlbCA9ICQoXCI8ZGl2PlwiKTtcclxuICAgICAgICAgICAgICAgIHRlYW1CTGFiZWwuaHRtbChcIlNreSBUZWFtXCIpO1xyXG4gICAgICAgICAgICAgICAgdGVhbUJMYWJlbC5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktdGVhbS1sYWJlbFwiKTtcclxuICAgICAgICAgICAgICAgIHRoaXMudGVhbUJDb250YWluZXIuYXBwZW5kKHRlYW1CTGFiZWwpO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBsb2NhbElkID0gTmV0d29yay5sb2NhbENsaWVudC5pZDtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBBZGQgdGVhbSBBIHBsYXllcnNcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxhYmVsO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwbGF5ZXJDb250YWluZXIgPSAkKFwiPGRpdj5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlYWR5ID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpIDwgdGVhbUEubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjdXJJZCA9IHRlYW1BW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY3VyUGxheWVyID0gTmV0d29yay5jbGllbnRzW2N1cklkXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVhZHkgPSBjdXJQbGF5ZXIuZGF0YS5yZWFkeTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWwgPSBjdXJQbGF5ZXIuZGF0YS51c2VyO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cklkID09PSBsb2NhbElkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXJDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LWxvY2FsLXBsYXllci1jb250YWluZXJcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZWFkeSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVhZHlCdG4uaHRtbChcIlJlYWR5XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3dpdGNoVGVhbUJ0bi5wcm9wKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlYWR5QnRuLmh0bWwoXCJDYW5jZWxcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zd2l0Y2hUZWFtQnRuLnByb3AoXCJkaXNhYmxlZFwiLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsID0gXCItLS0tLS1cIjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllckNvbnRhaW5lci5odG1sKGxhYmVsKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRlYW1BQ29udGFpbmVyLmFwcGVuZChwbGF5ZXJDb250YWluZXIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVhZHkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlYWR5Q29udGFpbmVyID0gJChcIjxzcGFuPlwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVhZHlDb250YWluZXIuaHRtbChcIlJlYWR5XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWFkeUNvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktcmVhZHktY29udGFpbmVyXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXJDb250YWluZXIuYXBwZW5kKHJlYWR5Q29udGFpbmVyKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQWRkIHRlYW0gQiBwbGF5ZXJzXHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDQ7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBsYWJlbDtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcGxheWVyQ29udGFpbmVyID0gJChcIjxkaXY+XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByZWFkeSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaSA8IHRlYW1CLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY3VySWQgPSB0ZWFtQltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGN1clBsYXllciA9IE5ldHdvcmsuY2xpZW50c1tjdXJJZF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYWR5ID0gY3VyUGxheWVyLmRhdGEucmVhZHk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsID0gY3VyUGxheWVyLmRhdGEudXNlcjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJJZCA9PT0gbG9jYWxJZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxheWVyQ29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1sb2NhbC1wbGF5ZXItY29udGFpbmVyXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcmVhZHkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlYWR5QnRuLmh0bWwoXCJSZWFkeVwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN3aXRjaFRlYW1CdG4ucHJvcChcImRpc2FibGVkXCIsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWFkeUJ0bi5odG1sKFwiQ2FuY2VsXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3dpdGNoVGVhbUJ0bi5wcm9wKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbCA9IFwiLS0tLS0tXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXJDb250YWluZXIuaHRtbChsYWJlbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50ZWFtQkNvbnRhaW5lci5hcHBlbmQocGxheWVyQ29udGFpbmVyKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlYWR5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZWFkeUNvbnRhaW5lciA9ICQoXCI8c3Bhbj5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYWR5Q29udGFpbmVyLmh0bWwoXCJSZWFkeVwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVhZHlDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LXJlYWR5LWNvbnRhaW5lclwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGxheWVyQ29udGFpbmVyLmFwcGVuZChyZWFkeUNvbnRhaW5lcik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuc3dpdGNoVGVhbUJ0bi5zaG93KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkNsaWNrUm9vbSA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gZS5kYXRhO1xyXG4gICAgICAgICAgICB2YXIgcm9vbSA9IHtcclxuICAgICAgICAgICAgICAgIG5hbWUgOiBkYXRhLm5hbWUsXHJcbiAgICAgICAgICAgICAgICBpZCAgIDogZGF0YS5pZFxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgJCh0aGlzKS50cmlnZ2VyKExvYmJ5T3ZlcmxheS5FdmVudC5FTlRFUl9ST09NLCByb29tKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkV4aXRSb29tIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLmxlYXZlUm9vbUJ0bi5oaWRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMucmVhZHlCdG4uaGlkZSgpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5sZWZ0Q29udGFpbmVyLnJlbW92ZUNsYXNzKFwibG9iYnktb3ZlcmxheS1taW5pbWl6ZWQtc2lkZVwiKTtcclxuICAgICAgICAgICAgdGhpcy5yaWdodENvbnRhaW5lci5yZW1vdmVDbGFzcyhcImxvYmJ5LW92ZXJsYXktbWF4aW1pemVkLXNpZGVcIik7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmxlZnRDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LW1heGltaXplZC1zaWRlXCIpO1xyXG4gICAgICAgICAgICB0aGlzLnJpZ2h0Q29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1taW5pbWl6ZWQtc2lkZVwiKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkVudGVyUm9vbSA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5sZWF2ZVJvb21CdG4uc2hvdygpO1xyXG4gICAgICAgICAgICB0aGlzLnJlYWR5QnRuLnNob3coKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubGVmdENvbnRhaW5lci5yZW1vdmVDbGFzcyhcImxvYmJ5LW92ZXJsYXktbWF4aW1pemVkLXNpZGVcIik7XHJcbiAgICAgICAgICAgIHRoaXMucmlnaHRDb250YWluZXIucmVtb3ZlQ2xhc3MoXCJsb2JieS1vdmVybGF5LW1pbmltaXplZC1zaWRlXCIpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5sZWZ0Q29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1taW5pbWl6ZWQtc2lkZVwiKTtcclxuICAgICAgICAgICAgdGhpcy5yaWdodENvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktbWF4aW1pemVkLXNpZGVcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSk7XHJcblxyXG5PYmplY3QuZnJlZXplKExvYmJ5T3ZlcmxheSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IExvYmJ5T3ZlcmxheTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBPdmVybGF5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5kb21PYmplY3QgPSAkKFwiPGRpdj5cIik7XHJcbiAgICB0aGlzLmRvbU9iamVjdC5hZGRDbGFzcyhcImNhbnZhcy1vdmVybGF5XCIpO1xyXG59O1xyXG5cclxuT3ZlcmxheS5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoT3ZlcmxheS5wcm90b3R5cGUsIHtcclxuXHJcbn0pKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gT3ZlcmxheTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBPdmVybGF5ID0gcmVxdWlyZSgnLi9PdmVybGF5LmpzJyk7XHJcbnZhciBMb2FkaW5nT3ZlcmxheSA9IHJlcXVpcmUoJy4vTG9hZGluZ092ZXJsYXkuanMnKTtcclxudmFyIENyZWF0ZVJvb21PdmVybGF5ID0gcmVxdWlyZSgnLi9DcmVhdGVSb29tT3ZlcmxheS5qcycpO1xyXG52YXIgTG9iYnlPdmVybGF5ID0gcmVxdWlyZSgnLi9Mb2JieU92ZXJsYXkuanMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgT3ZlcmxheSA6IE92ZXJsYXksXHJcbiAgICBMb2FkaW5nT3ZlcmxheSA6IExvYWRpbmdPdmVybGF5LFxyXG4gICAgQ3JlYXRlUm9vbU92ZXJsYXkgOiBDcmVhdGVSb29tT3ZlcmxheSxcclxuICAgIExvYmJ5T3ZlcmxheSA6IExvYmJ5T3ZlcmxheVxyXG59OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyk7XHJcbnZhciBBc3NldHMgPSB1dGlsLkFzc2V0cztcclxudmFyIE5ldHdvcmsgPSByZXF1aXJlKCcuLi9uZXR3b3JrJyk7XHJcbnZhciBlbnRpdGllcyA9IHJlcXVpcmUoJy4uL2VudGl0aWVzJyk7XHJcbnZhciBGdWxsQm9jayA9IGVudGl0aWVzLkZ1bGxCbG9jaztcclxudmFyIFBsYXllciA9IGVudGl0aWVzLlBsYXllcjtcclxudmFyIE5ldHdvcmtTY2VuZSA9IHJlcXVpcmUoJy4vTmV0d29ya1NjZW5lJyk7XHJcbnZhciBiYWNrZ3JvdW5kcyA9IHdmbC5kaXNwbGF5LmJhY2tncm91bmRzO1xyXG52YXIgZ2VvbSA9IHdmbC5nZW9tO1xyXG5cclxudmFyIEdhbWVTY2VuZSA9IGZ1bmN0aW9uIChjYW52YXMsIHJvb21JZCkge1xyXG4gICAgTmV0d29ya1NjZW5lLmNhbGwodGhpcywgY2FudmFzLCByb29tSWQpO1xyXG5cclxuICAgIHZhciB3YWxsU2l6ZSA9IDEwO1xyXG4gICAgdmFyIGJsb2NrU2l6ZSA9IDEyODtcclxuICAgIHZhciBvZmZzZXQgPSAtKHdhbGxTaXplICogMC41IC0gMSkgKiBibG9ja1NpemU7XHJcblxyXG4gICAgLy8gTGluZSB0aGUgdG9wXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDk7IGkrKykge1xyXG4gICAgICAgIHZhciBuZXdCbG9jayA9IG5ldyBGdWxsQm9jaygpO1xyXG4gICAgICAgIG5ld0Jsb2NrLnBvc2l0aW9uLnggPSBibG9ja1NpemUgKiBpICsgb2Zmc2V0O1xyXG4gICAgICAgIG5ld0Jsb2NrLnBvc2l0aW9uLnkgPSBvZmZzZXQ7XHJcblxyXG4gICAgICAgIHRoaXMuYWRkR2FtZU9iamVjdChuZXdCbG9jayk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTGluZSB0aGUgYm90dG9tXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDk7IGkrKykge1xyXG4gICAgICAgIHZhciBuZXdCbG9jayA9IG5ldyBGdWxsQm9jaygpO1xyXG4gICAgICAgIG5ld0Jsb2NrLnBvc2l0aW9uLnggPSBibG9ja1NpemUgKiBpICsgb2Zmc2V0O1xyXG4gICAgICAgIG5ld0Jsb2NrLnBvc2l0aW9uLnkgPSAtb2Zmc2V0O1xyXG5cclxuICAgICAgICB0aGlzLmFkZEdhbWVPYmplY3QobmV3QmxvY2spO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIExpbmUgdGhlIGxlZnRcclxuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgODsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG5ld0Jsb2NrID0gbmV3IEZ1bGxCb2NrKCk7XHJcbiAgICAgICAgbmV3QmxvY2sucG9zaXRpb24ueCA9IG9mZnNldDtcclxuICAgICAgICBuZXdCbG9jay5wb3NpdGlvbi55ID0gYmxvY2tTaXplICogaSArIG9mZnNldDtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRHYW1lT2JqZWN0KG5ld0Jsb2NrKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBMaW5lIHRoZSByaWdodFxyXG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCA4OyBpKyspIHtcclxuICAgICAgICB2YXIgbmV3QmxvY2sgPSBuZXcgRnVsbEJvY2soKTtcclxuICAgICAgICBuZXdCbG9jay5wb3NpdGlvbi54ID0gLW9mZnNldDtcclxuICAgICAgICBuZXdCbG9jay5wb3NpdGlvbi55ID0gYmxvY2tTaXplICogaSArIG9mZnNldDtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRHYW1lT2JqZWN0KG5ld0Jsb2NrKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgdGhpcy5iZyA9IG5ldyBiYWNrZ3JvdW5kcy5QYXJhbGxheEJhY2tncm91bmQoXHJcbiAgICAgICAgQXNzZXRzLmdldChBc3NldHMuQkdfVElMRSlcclxuICAgICk7XHJcbiAgICBcclxuICAgIHRoaXMucGxheWVyID0gTmV0d29yay5sb2NhbENsaWVudC5nYW1lT2JqZWN0O1xyXG4gICAgdGhpcy5hZGRHYW1lT2JqZWN0KHRoaXMucGxheWVyLCAyKTtcclxufTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoR2FtZVNjZW5lLCB7XHJcbiAgICBGUklDVElPTiA6IHtcclxuICAgICAgICB2YWx1ZSA6IDAuOTI1XHJcbiAgICB9LFxyXG5cclxuICAgIE1JTklNQVAgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBPYmplY3QuZnJlZXplKHtcclxuICAgICAgICAgICAgV0lEVEggICAgICA6IDE1MCxcclxuICAgICAgICAgICAgSEVJR0hUICAgICA6IDEwMCxcclxuICAgICAgICAgICAgU0NBTEUgICAgICA6IDAuMSxcclxuICAgICAgICAgICAgRklMTF9TVFlMRSA6IFwiIzE5MjQyN1wiXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxufSk7XHJcbkdhbWVTY2VuZS5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoTmV0d29ya1NjZW5lLnByb3RvdHlwZSwge1xyXG4gICAgdXBkYXRlIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGR0KSB7XHJcbiAgICAgICAgICAgIHZhciBnYW1lT2JqZWN0cyA9IHRoaXMuZ2V0R2FtZU9iamVjdHMoKTtcclxuICAgICAgICBcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBnYW1lT2JqZWN0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIG9iaiA9IGdhbWVPYmplY3RzW2ldO1xyXG4gICAgICAgICAgICAgICAgb2JqLmFjY2VsZXJhdGlvbi5tdWx0aXBseShHYW1lU2NlbmUuRlJJQ1RJT04pO1xyXG4gICAgICAgICAgICAgICAgb2JqLnZlbG9jaXR5Lm11bHRpcGx5KEdhbWVTY2VuZS5GUklDVElPTik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIE5ldHdvcmtTY2VuZS5wcm90b3R5cGUudXBkYXRlLmNhbGwodGhpcywgZHQpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVJbnB1dCgpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcclxuICAgIGhhbmRsZUlucHV0IDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgcGxheWVyICAgICAgID0gdGhpcy5wbGF5ZXI7XHJcbiAgICAgICAgICAgIHZhciBrZXlib2FyZCAgICAgPSB0aGlzLmtleWJvYXJkO1xyXG4gICAgICAgICAgICB2YXIgbGVmdFByZXNzZWQgID0ga2V5Ym9hcmQuaXNQcmVzc2VkKGtleWJvYXJkLkxFRlQpO1xyXG4gICAgICAgICAgICB2YXIgcmlnaHRQcmVzc2VkID0ga2V5Ym9hcmQuaXNQcmVzc2VkKGtleWJvYXJkLlJJR0hUKTtcclxuICAgICAgICAgICAgdmFyIHVwUHJlc3NlZCAgICA9IGtleWJvYXJkLmlzUHJlc3NlZChrZXlib2FyZC5VUCk7XHJcbiAgICAgICAgICAgIHZhciBkb3duUHJlc3NlZCAgPSBrZXlib2FyZC5pc1ByZXNzZWQoa2V5Ym9hcmQuRE9XTik7XHJcblxyXG4gICAgICAgICAgICAvLyBMZWZ0LyBSaWdodCBLZXkgLS0gUGxheWVyIHR1cm5zXHJcbiAgICAgICAgICAgIGlmIChsZWZ0UHJlc3NlZCB8fCByaWdodFByZXNzZWQpIHtcclxuICAgICAgICAgICAgICAgIHZhciByb3RhdGlvbiA9IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGxlZnRQcmVzc2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcm90YXRpb24gLT0gUGxheWVyLlRVUk5fU1BFRUQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHJpZ2h0UHJlc3NlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJvdGF0aW9uICs9IFBsYXllci5UVVJOX1NQRUVEO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHBsYXllci5yb3RhdGUocm90YXRpb24pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBVcCBLZXkgLS0gUGxheWVyIGdvZXMgZm9yd2FyZFxyXG4gICAgICAgICAgICBpZiAodXBQcmVzc2VkKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbW92ZW1lbnRGb3JjZSA9IGdlb20uVmVjMi5mcm9tQW5nbGUocGxheWVyLmdldFJvdGF0aW9uKCkpO1xyXG4gICAgICAgICAgICAgICAgbW92ZW1lbnRGb3JjZS5tdWx0aXBseShcclxuICAgICAgICAgICAgICAgICAgICBQbGF5ZXIuQk9PU1RfQUNDRUxFUkFUSU9OICogcGxheWVyLm1hc3NcclxuICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgcGxheWVyLmFkZEZvcmNlKG1vdmVtZW50Rm9yY2UpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBEb3duIEtleSAtLSBBcHBseSBicmFrZXMgdG8gcGxheWVyXHJcbiAgICAgICAgICAgIGlmIChkb3duUHJlc3NlZCkge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLnZlbG9jaXR5Lm11bHRpcGx5KFBsYXllci5CUkFLRV9SQVRFKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBHYW1lU2NlbmU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgU2NlbmUgPSB3ZmwuZGlzcGxheS5TY2VuZTtcclxudmFyIG92ZXJsYXlzID0gcmVxdWlyZSgnLi4vb3ZlcmxheXMnKTtcclxuXHJcbnZhciBMb2FkaW5nU2NlbmUgPSBmdW5jdGlvbiAoY2FudmFzKSB7XHJcbiAgICBTY2VuZS5jYWxsKHRoaXMsIGNhbnZhcyk7XHJcbiAgICBcclxuICAgIHRoaXMubG9hZGluZ092ZXJsYXkgPSBuZXcgb3ZlcmxheXMuTG9hZGluZ092ZXJsYXkoKTtcclxuICAgICQoY2FudmFzKS5wYXJlbnQoKS5hcHBlbmQodGhpcy5sb2FkaW5nT3ZlcmxheS5kb21PYmplY3QpO1xyXG59O1xyXG5Mb2FkaW5nU2NlbmUucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKFNjZW5lLnByb3RvdHlwZSwge1xyXG4gICAgZGVzdHJveSA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5sb2FkaW5nT3ZlcmxheS5kb21PYmplY3QucmVtb3ZlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IExvYWRpbmdTY2VuZTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBTY2VuZSA9IHdmbC5kaXNwbGF5LlNjZW5lO1xyXG52YXIgb3ZlcmxheXMgPSByZXF1aXJlKCcuLi9vdmVybGF5cycpO1xyXG52YXIgTmV0d29yayA9IHJlcXVpcmUoJy4uL25ldHdvcmsnKTtcclxuXHJcbnZhciBMb2JieVNjZW5lID0gZnVuY3Rpb24gKGNhbnZhcykge1xyXG4gICAgU2NlbmUuY2FsbCh0aGlzLCBjYW52YXMpO1xyXG5cclxuICAgIHRoaXMuY3VyUm9vbUlkID0gdW5kZWZpbmVkO1xyXG5cclxuICAgIHRoaXMubG9iYnlPdmVybGF5ID0gbmV3IG92ZXJsYXlzLkxvYmJ5T3ZlcmxheSgpO1xyXG4gICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheSA9IG5ldyBvdmVybGF5cy5DcmVhdGVSb29tT3ZlcmxheSgpO1xyXG4gICAgJChjYW52YXMpLnBhcmVudCgpLmFwcGVuZCh0aGlzLmxvYmJ5T3ZlcmxheS5kb21PYmplY3QpO1xyXG4gICAgJChjYW52YXMpLnBhcmVudCgpLmFwcGVuZCh0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmRvbU9iamVjdCk7XHJcblxyXG4gICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5kb21PYmplY3QuaGlkZSgpO1xyXG5cclxuICAgIHRoaXMubG9iYnlPdmVybGF5LmxlYXZlUm9vbUJ0bi5jbGljayh0aGlzLl9vbkxlYXZlUm9vbUJ1dHRvbkNsaWNrLmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5sb2JieU92ZXJsYXkucmVhZHlCdG4uY2xpY2sodGhpcy5fb25SZWFkeUJ1dHRvbkNsaWNrLmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5sb2JieU92ZXJsYXkuc3dpdGNoVGVhbUJ0bi5jbGljayh0aGlzLl9vblN3aXRjaFRlYW1CdXR0b25DbGljay5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMubG9iYnlPdmVybGF5LmNyZWF0ZVJvb21CdG4uY2xpY2sodGhpcy5fb25DcmVhdGVSb29tQnV0dG9uQ2xpY2suYmluZCh0aGlzKSk7XHJcblxyXG4gICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5jYW5jZWxCdG4uY2xpY2sodGhpcy5fb25DcmVhdGVSb29tQ2FuY2VsLmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5jcmVhdGVCdG4uY2xpY2sodGhpcy5fb25DcmVhdGVSb29tLmJpbmQodGhpcykpO1xyXG5cclxuICAgICQodGhpcy5sb2JieU92ZXJsYXkpLm9uKG92ZXJsYXlzLkxvYmJ5T3ZlcmxheS5FdmVudC5FTlRFUl9ST09NLCB0aGlzLl9vbkVudGVyUm9vbUF0dGVtcHQuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgJChOZXR3b3JrKS5vbihOZXR3b3JrLkV2ZW50LlVQREFURV9ST09NUywgdGhpcy5fb25VcGRhdGVSb29tTGlzdC5iaW5kKHRoaXMpKTtcclxuICAgICQoTmV0d29yaykub24oTmV0d29yay5FdmVudC5FTlRFUl9ST09NX1NVQ0NFU1MsIHRoaXMuX29uRW50ZXJSb29tU3VjY2Vzcy5iaW5kKHRoaXMpKTtcclxuICAgICQoTmV0d29yaykub24oTmV0d29yay5FdmVudC5FTlRFUl9ST09NX0ZBSUwsIHRoaXMuX29uRW50ZXJSb29tRmFpbC5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICB0aGlzLnJvb21VcGRhdGVJbnRlcnZhbCA9XHJcbiAgICAgICAgc2V0SW50ZXJ2YWwodGhpcy51cGRhdGVSb29tTGlzdC5iaW5kKHRoaXMpLCBMb2JieVNjZW5lLlJPT01fVVBEQVRFX0ZSRVFVRU5DWSk7XHJcblxyXG4gICAgdGhpcy51cGRhdGVSb29tTGlzdCgpO1xyXG59O1xyXG5cclxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoTG9iYnlTY2VuZSwge1xyXG4gICAgUk9PTV9VUERBVEVfRlJFUVVFTkNZIDoge1xyXG4gICAgICAgIHZhbHVlIDogNTAwMFxyXG4gICAgfSxcclxuXHJcbiAgICBFdmVudCA6IHtcclxuICAgICAgICB2YWx1ZSA6IHtcclxuICAgICAgICAgICAgVE9HR0xFX1JFQURZIDogXCJ0b2dnbGVSZWFkeVwiXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KTtcclxuXHJcbkxvYmJ5U2NlbmUucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKFNjZW5lLnByb3RvdHlwZSwge1xyXG4gICAgZGVzdHJveSA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5sb2JieU92ZXJsYXkuZG9tT2JqZWN0LnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmRvbU9iamVjdC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5pbnB1dEZpZWxkLm9mZihcImtleXByZXNzXCIpO1xyXG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoaXMucm9vbVVwZGF0ZUludGVydmFsKTtcclxuICAgICAgICAgICAgJChOZXR3b3JrKS5vZmYoTmV0d29yay5FdmVudC5VUERBVEVfUk9PTVMpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgdXBkYXRlUm9vbUxpc3QgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIE5ldHdvcmsuZ2V0Um9vbXMoKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkxlYXZlUm9vbUJ1dHRvbkNsaWNrIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgTmV0d29yay5sZWF2ZVJvb20odGhpcy5jdXJSb29tSWQpO1xyXG4gICAgICAgICAgICB0aGlzLmN1clJvb21JZCA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vblJlYWR5QnV0dG9uQ2xpY2sgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICB2YXIgY2xpZW50V2lsbEJlUmVhZHkgPSAhTmV0d29yay5sb2NhbENsaWVudC5kYXRhLnJlYWR5O1xyXG4gICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLmxvYmJ5T3ZlcmxheS5zd2l0Y2hUZWFtQnRuLnByb3AoXCJkaXNhYmxlZFwiLCBjbGllbnRXaWxsQmVSZWFkeSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgIE5ldHdvcmsuc29ja2V0LmVtaXQoJ3VwZGF0ZVJlYWR5Jywge1xyXG4gICAgICAgICAgICAgICAgcmVhZHkgOiBjbGllbnRXaWxsQmVSZWFkeVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkNyZWF0ZVJvb21CdXR0b25DbGljayA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuaW5wdXRGaWVsZC5vZmYoXCJrZXlwcmVzc1wiKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuaW5wdXRGaWVsZC52YWwoXCJcIik7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuZG9tT2JqZWN0LnJlbW92ZUNsYXNzKFwiZmFkZS1pblwiKTtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5kb21PYmplY3Quc2hvdygpO1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmRvbU9iamVjdC5hZGRDbGFzcyhcImZhZGUtaW5cIik7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuaW5wdXRGaWVsZC5mb2N1cygpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5pbnB1dEZpZWxkLm9uKFwia2V5cHJlc3NcIiwgdGhpcy5fb25DcmVhdGVSb29tS2V5UHJlc3MuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25DcmVhdGVSb29tS2V5UHJlc3MgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBpZiAoZS5rZXlDb2RlID09PSAxMykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fb25DcmVhdGVSb29tKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkNyZWF0ZVJvb21DYW5jZWwgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmRvbU9iamVjdC5oaWRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25DcmVhdGVSb29tIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgdmFyIG5hbWUgPSB0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmlucHV0RmllbGQudmFsKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAobmFtZSAhPT0gXCJcIikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5kb21PYmplY3QuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgTmV0d29yay5jcmVhdGVSb29tKG5hbWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIFxyXG4gICAgX29uU3dpdGNoVGVhbUJ1dHRvbkNsaWNrIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgTmV0d29yay5zd2l0Y2hUZWFtKHRoaXMuY3VyUm9vbUlkKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vblVwZGF0ZVJvb21MaXN0IDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUsIGRhdGEpIHtcclxuICAgICAgICAgICAgdGhpcy5sb2JieU92ZXJsYXkuc2hvd1Jvb21zKGRhdGEpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuY3VyUm9vbUlkICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9iYnlPdmVybGF5LnJlbmRlclJvb20oZGF0YVt0aGlzLmN1clJvb21JZF0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2JieU92ZXJsYXkucmVuZGVyUm9vbSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25FbnRlclJvb21BdHRlbXB0IDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUsIGRhdGEpIHtcclxuICAgICAgICAgICAgTmV0d29yay5lbnRlclJvb20oZGF0YS5pZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25FbnRlclJvb21TdWNjZXNzIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUsIGRhdGEpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJSb29tSWQgPSBkYXRhLmlkO1xyXG4gICAgICAgICAgICB0aGlzLmxvYmJ5T3ZlcmxheS5yZW5kZXJSb29tKGRhdGEpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uRW50ZXJSb29tRmFpbCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlLCBkYXRhKSB7XHJcbiAgICAgICAgICAgIGFsZXJ0KGRhdGEubXNnKTtcclxuICAgICAgICAgICAgdGhpcy5jdXJSb29tSWQgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIHRoaXMubG9iYnlPdmVybGF5LnJlbmRlclJvb20odW5kZWZpbmVkKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKTtcclxuXHJcbk9iamVjdC5mcmVlemUoTG9iYnlTY2VuZSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IExvYmJ5U2NlbmU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgTmV0d29yayA9IHJlcXVpcmUoJy4uL25ldHdvcmsnKTtcclxudmFyIFNjZW5lID0gd2ZsLmRpc3BsYXkuU2NlbmU7XHJcblxyXG52YXIgTmV0d29ya1NjZW5lID0gZnVuY3Rpb24gKGNhbnZhcywgcm9vbUlkKSB7XHJcbiAgICBTY2VuZS5jYWxsKHRoaXMsIGNhbnZhcyk7XHJcblxyXG4gICAgLy8gQWRkIG90aGVyIGNsaWVudHMgdGhhdCBhcmUgYWxyZWFkeSBjb25uZWN0ZWRcclxuICAgIHZhciByb29tID0gTmV0d29yay5yb29tc1tyb29tSWRdO1xyXG4gICAgdmFyIHBsYXllcnMgPSByb29tLnBsYXllcnM7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwbGF5ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGlkID0gcGxheWVyc1tpXTtcclxuICAgICAgICB2YXIgY2xpZW50ID0gTmV0d29yay5jbGllbnRzW2lkXTtcclxuXHJcbiAgICAgICAgaWYgKGNsaWVudCAhPT0gTmV0d29yay5sb2NhbENsaWVudCkge1xyXG4gICAgICAgICAgICB0aGlzLmFkZEdhbWVPYmplY3QoY2xpZW50LmdhbWVPYmplY3QsIDEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuTmV0d29ya1NjZW5lLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShTY2VuZS5wcm90b3R5cGUsIHtcclxuICAgIG9uQWRkQ2xpZW50IDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUsIGNsaWVudCkge1xyXG4gICAgICAgICAgICBpZiAoY2xpZW50KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFkZEdhbWVPYmplY3QoY2xpZW50LmdhbWVPYmplY3QsIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBvblJlbW92ZUNsaWVudCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlLCBjbGllbnQpIHtcclxuICAgICAgICAgICAgaWYgKGNsaWVudCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVHYW1lT2JqZWN0KGNsaWVudC5nYW1lT2JqZWN0LCAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBOZXR3b3JrU2NlbmU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgTG9hZGluZ1NjZW5lID0gcmVxdWlyZSgnLi9Mb2FkaW5nU2NlbmUuanMnKTtcclxudmFyIExvYmJ5U2NlbmUgPSByZXF1aXJlKCcuL0xvYmJ5U2NlbmUuanMnKTtcclxudmFyIE5ldHdvcmtTY2VuZSA9IHJlcXVpcmUoJy4vTmV0d29ya1NjZW5lLmpzJyk7XHJcbnZhciBHYW1lU2NlbmUgPSByZXF1aXJlKCcuL0dhbWVTY2VuZS5qcycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBMb2FkaW5nU2NlbmUgOiBMb2FkaW5nU2NlbmUsXHJcbiAgICBMb2JieVNjZW5lICAgOiBMb2JieVNjZW5lLFxyXG4gICAgTmV0d29ya1NjZW5lIDogTmV0d29ya1NjZW5lLFxyXG4gICAgR2FtZVNjZW5lICAgIDogR2FtZVNjZW5lXHJcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIEJHX1RJTEUgICAgOiBcIi4vYXNzZXRzL2ltZy9CRy10aWxlMS5wbmdcIixcclxuICAgIEJMT0NLX0ZVTEwgOiBcIi4vYXNzZXRzL2ltZy9CbG9ja0Z1bGwucG5nXCIsXHJcbiAgICBQTEFZRVIgICAgIDogXCIuL2Fzc2V0cy9pbWcvU2hpcC5wbmdcIixcclxuICAgIENMSUVOVCAgICAgOiBcIi4vYXNzZXRzL2ltZy9PdGhlclNoaXAucG5nXCIsXHJcbiAgICBcclxuICAgIC8vIFByZWxvYWRlciByZXBsYWNlcyBnZXR0ZXIgd2l0aCBhcHByb3ByaWF0ZSBkZWZpbml0aW9uXHJcbiAgICBnZXQgICAgICAgIDogZnVuY3Rpb24gKHBhdGgpIHsgfVxyXG59OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIEFzc2V0cyA9IHJlcXVpcmUoJy4vQXNzZXRzLmpzJyk7XHJcblxyXG52YXIgUHJlbG9hZGVyID0gZnVuY3Rpb24gKG9uQ29tcGxldGUpIHtcclxuICAgIC8vIFNldCB1cCBwcmVsb2FkZXJcclxuXHR0aGlzLnF1ZXVlID0gbmV3IGNyZWF0ZWpzLkxvYWRRdWV1ZShmYWxzZSk7XHJcblxyXG4gICAgLy8gUmVwbGFjZSBkZWZpbml0aW9uIG9mIEFzc2V0IGdldHRlciB0byB1c2UgdGhlIGRhdGEgZnJvbSB0aGUgcXVldWVcclxuICAgIEFzc2V0cy5nZXQgPSB0aGlzLnF1ZXVlLmdldFJlc3VsdC5iaW5kKHRoaXMucXVldWUpO1xyXG5cclxuICAgIC8vIE9uY2UgZXZlcnl0aGluZyBoYXMgYmVlbiBwcmVsb2FkZWQsIHN0YXJ0IHRoZSBhcHBsaWNhdGlvblxyXG4gICAgaWYgKG9uQ29tcGxldGUpIHtcclxuICAgICAgICB0aGlzLnF1ZXVlLm9uKFwiY29tcGxldGVcIiwgb25Db21wbGV0ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIG5lZWRUb0xvYWQgPSBbXTtcclxuXHJcbiAgICAvLyBQcmVwYXJlIHRvIGxvYWQgaW1hZ2VzXHJcbiAgICBmb3IgKHZhciBpbWcgaW4gQXNzZXRzKSB7XHJcbiAgICAgICAgdmFyIGltZ09iaiA9IHtcclxuICAgICAgICAgICAgaWQgOiBpbWcsXHJcbiAgICAgICAgICAgIHNyYyA6IEFzc2V0c1tpbWddXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBuZWVkVG9Mb2FkLnB1c2goaW1nT2JqKTtcclxuICAgIH1cclxuXHJcblx0dGhpcy5xdWV1ZS5sb2FkTWFuaWZlc3QobmVlZFRvTG9hZCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFByZWxvYWRlcjsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBBc3NldHMgPSByZXF1aXJlKCcuL0Fzc2V0cy5qcycpO1xyXG52YXIgUHJlbG9hZGVyID0gcmVxdWlyZSgnLi9QcmVsb2FkZXIuanMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgQXNzZXRzIDogQXNzZXRzLFxyXG4gICAgUHJlbG9hZGVyIDogUHJlbG9hZGVyXHJcbn07Il19
