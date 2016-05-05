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

    $(lobbyScene).on(scenes.LobbyScene.Event.PLAY_GAME, onPlayGame);
};

var onPlayGame = function (e, roomId) {
    $(game.getScene()).off();

    var gameScene = new scenes.GameScene(canvas, roomId);
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
    Event       : {
        CONNECT            : "connect",
        UPDATE_ROOMS       : "updateRooms",
        ENTER_ROOM_SUCCESS : "enterRoomSuccess",
        ENTER_ROOM_FAIL    : "enterRoomFail"
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
    
    this.domObject.addClass("loading-overlay");
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

    this.playBtn = $("<button>");
    this.playBtn.text("Play");
    this.playBtn.addClass("lobby-overlay-play-btn");
    this.playBtn.hide();
    this.rightContainer.append(this.playBtn);

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

                // Add team A players
                for (var i = 0; i < 4; i++) {
                    var label;
                    var playerContainer = $("<div>");
                    
                    if (i < teamA.length) {
                        var curId = teamA[i];
                        var curPlayer = Network.clients[curId];
                        label = curPlayer.data.user;
                    } else {
                        label = "------";
                    }
                    
                    playerContainer.html(label);
                    this.teamAContainer.append(playerContainer);
                }

                // Add team B players
                for (var i = 0; i < 4; i++) {
                    var label;
                    var playerContainer = $("<div>");
                    
                    if (i < teamB.length) {
                        var curId = teamB[i];
                        var curPlayer = Network.clients[curId];
                        label = curPlayer.data.user;
                    } else {
                        label = "------";
                    }
                    
                    playerContainer.html(label);
                    this.teamBContainer.append(playerContainer);
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
            this.playBtn.hide();

            this.leftContainer.removeClass("lobby-overlay-minimized-side");
            this.rightContainer.removeClass("lobby-overlay-maximized-side");

            this.leftContainer.addClass("lobby-overlay-maximized-side");
            this.rightContainer.addClass("lobby-overlay-minimized-side");
        }
    },

    _onEnterRoom : {
        value : function () {
            this.leaveRoomBtn.show();
            this.playBtn.show();

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
    this.lobbyOverlay.playBtn.click(this._onPlayButtonClick.bind(this));
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
            PLAY_GAME : "play-game"
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

    _onPlayButtonClick : {
        value : function (e) {
            $(this).trigger(LobbyScene.Event.PLAY_GAME, this.curRoomId);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvZ2FtZS9zcmMvZW50aXRpZXMvQ2xpZW50UGxheWVyLmpzIiwiY2xpZW50L2dhbWUvc3JjL2VudGl0aWVzL0Z1bGxCbG9jay5qcyIsImNsaWVudC9nYW1lL3NyYy9lbnRpdGllcy9QbGF5ZXIuanMiLCJjbGllbnQvZ2FtZS9zcmMvZW50aXRpZXMvaW5kZXguanMiLCJjbGllbnQvZ2FtZS9zcmMvaW5kZXguanMiLCJjbGllbnQvZ2FtZS9zcmMvbmV0d29yay9DbGllbnQuanMiLCJjbGllbnQvZ2FtZS9zcmMvbmV0d29yay9Mb2NhbENsaWVudC5qcyIsImNsaWVudC9nYW1lL3NyYy9uZXR3b3JrL2luZGV4LmpzIiwiY2xpZW50L2dhbWUvc3JjL292ZXJsYXlzL0NyZWF0ZVJvb21PdmVybGF5LmpzIiwiY2xpZW50L2dhbWUvc3JjL292ZXJsYXlzL0xvYWRpbmdPdmVybGF5LmpzIiwiY2xpZW50L2dhbWUvc3JjL292ZXJsYXlzL0xvYmJ5T3ZlcmxheS5qcyIsImNsaWVudC9nYW1lL3NyYy9vdmVybGF5cy9PdmVybGF5LmpzIiwiY2xpZW50L2dhbWUvc3JjL292ZXJsYXlzL2luZGV4LmpzIiwiY2xpZW50L2dhbWUvc3JjL3NjZW5lcy9HYW1lU2NlbmUuanMiLCJjbGllbnQvZ2FtZS9zcmMvc2NlbmVzL0xvYWRpbmdTY2VuZS5qcyIsImNsaWVudC9nYW1lL3NyYy9zY2VuZXMvTG9iYnlTY2VuZS5qcyIsImNsaWVudC9nYW1lL3NyYy9zY2VuZXMvTmV0d29ya1NjZW5lLmpzIiwiY2xpZW50L2dhbWUvc3JjL3NjZW5lcy9pbmRleC5qcyIsImNsaWVudC9nYW1lL3NyYy91dGlsL0Fzc2V0cy5qcyIsImNsaWVudC9nYW1lL3NyYy91dGlsL1ByZWxvYWRlci5qcyIsImNsaWVudC9nYW1lL3NyYy91dGlsL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xyXG52YXIgQXNzZXRzID0gdXRpbC5Bc3NldHM7XHJcbnZhciBQbGF5ZXIgPSByZXF1aXJlKCcuL1BsYXllcicpO1xyXG52YXIgR2FtZU9iamVjdCA9IHdmbC5jb3JlLmVudGl0aWVzLkdhbWVPYmplY3Q7XHJcbnZhciBMaXZpbmdPYmplY3QgPSB3ZmwuY29yZS5lbnRpdGllcy5MaXZpbmdPYmplY3Q7XHJcbnZhciBnZW9tID0gd2ZsLmdlb207XHJcblxyXG52YXIgQ2xpZW50UGxheWVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgTGl2aW5nT2JqZWN0LmNhbGwodGhpcyk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGRlZmF1bHQgc3RhdGVcclxuICAgIHRoaXMuZGVmYXVsdEdyYXBoaWMgPSBBc3NldHMuZ2V0KEFzc2V0cy5DTElFTlQpO1xyXG5cclxuICAgIHZhciB3ID0gdGhpcy5kZWZhdWx0R3JhcGhpYy53aWR0aDtcclxuICAgIHZhciBoID0gdGhpcy5kZWZhdWx0R3JhcGhpYy5oZWlnaHQ7XHJcbiAgICB2YXIgdmVydHMgPSBbXHJcbiAgICAgICAgbmV3IGdlb20uVmVjMigtdyAqIDAuNSwgLWggKiAwLjUpLFxyXG4gICAgICAgIG5ldyBnZW9tLlZlYzIodyAqIDAuNSwgMCksXHJcbiAgICAgICAgbmV3IGdlb20uVmVjMigtdyAqIDAuNSwgaCAqIDAuNSlcclxuICAgIF07XHJcbiAgICB2YXIgZnJhbWVPYmogPSB0aGlzLmNyZWF0ZUZyYW1lKHRoaXMuZGVmYXVsdEdyYXBoaWMsIDEsIGZhbHNlKTtcclxuICAgIGZyYW1lT2JqLnZlcnRpY2VzID0gdmVydHM7XHJcblxyXG4gICAgdGhpcy5kZWZhdWx0U3RhdGUgPSB0aGlzLmNyZWF0ZVN0YXRlKCk7XHJcbiAgICB0aGlzLmRlZmF1bHRTdGF0ZS5hZGRGcmFtZShmcmFtZU9iaik7XHJcbiAgICB0aGlzLmFkZFN0YXRlKEdhbWVPYmplY3QuU1RBVEUuREVGQVVMVCwgdGhpcy5kZWZhdWx0U3RhdGUpO1xyXG5cclxuICAgIHRoaXMucm90YXRlKC1NYXRoLlBJICogMC41KTtcclxufTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoQ2xpZW50UGxheWVyLCB7XHJcbiAgICBBUlJJVkFMX1NMT1dJTkdfUkFESVVTIDoge1xyXG4gICAgICAgIHZhbHVlIDogMjAwXHJcbiAgICB9LFxyXG5cclxuICAgIE1JTl9BUlJJVkFMX1JBRElVUyA6IHtcclxuICAgICAgICB2YWx1ZSA6IDhcclxuICAgIH0sXHJcblxyXG4gICAgTUlOSU1BUF9GSUxMX1NUWUxFIDoge1xyXG4gICAgICAgIHZhbHVlIDogXCIjMDZjODMzXCJcclxuICAgIH1cclxufSk7XHJcbkNsaWVudFBsYXllci5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoTGl2aW5nT2JqZWN0LnByb3RvdHlwZSwge1xyXG4gICAgZHJhd09uTWluaW1hcCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChjdHgpIHtcclxuICAgICAgICAgICAgdmFyIHcgPSB0aGlzLmdldFdpZHRoKCk7XHJcbiAgICAgICAgICAgIHZhciBoID0gdGhpcy5nZXRIZWlnaHQoKTtcclxuICAgICAgICAgICAgdmFyIG9mZnNldFggPSBNYXRoLnJvdW5kKC13ICogMC41KTtcclxuICAgICAgICAgICAgdmFyIG9mZnNldFkgPSBNYXRoLnJvdW5kKC1oICogMC41KTtcclxuICAgICAgICAgICAgdmFyIGRpc3BsYXlXaWR0aCA9IE1hdGgucm91bmQodyk7XHJcbiAgICAgICAgICAgIHZhciBkaXNwbGF5SGVpZ2h0ID0gTWF0aC5yb3VuZChoKTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5zYXZlKCk7XHJcblxyXG4gICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gQ2xpZW50UGxheWVyLk1JTklNQVBfRklMTF9TVFlMRTtcclxuICAgICAgICAgICAgY3R4LmZpbGxSZWN0KG9mZnNldFgsIG9mZnNldFksIGRpc3BsYXlXaWR0aCwgZGlzcGxheUhlaWdodCk7XHJcblxyXG4gICAgICAgICAgICBjdHgucmVzdG9yZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkpO1xyXG5PYmplY3QuZnJlZXplKENsaWVudFBsYXllcik7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENsaWVudFBsYXllcjsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xyXG52YXIgQXNzZXRzID0gdXRpbC5Bc3NldHM7XHJcbnZhciBHYW1lT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuR2FtZU9iamVjdDtcclxudmFyIFBoeXNpY3NPYmplY3QgPSB3ZmwuY29yZS5lbnRpdGllcy5QaHlzaWNzT2JqZWN0O1xyXG5cclxuLyoqXHJcbiAqIEEgZnVsbC1zaXplZCwgcXVhZHJpbGF0ZXJhbCBibG9ja1xyXG4gKi9cclxudmFyIEZ1bGxCbG9jayA9IGZ1bmN0aW9uICgpIHtcclxuICAgIFBoeXNpY3NPYmplY3QuY2FsbCh0aGlzKTtcclxuXHJcbiAgICB0aGlzLmlkID0gRnVsbEJsb2NrLmlkO1xyXG5cclxuICAgIC8vIENyZWF0ZSBkZWZhdWx0IHN0YXRlXHJcbiAgICB0aGlzLmRlZmF1bHRHcmFwaGljID0gQXNzZXRzLmdldChBc3NldHMuQkxPQ0tfRlVMTCk7XHJcbiAgICB0aGlzLmRlZmF1bHRTdGF0ZSA9IHRoaXMuY3JlYXRlU3RhdGUoKTtcclxuICAgIHRoaXMuZGVmYXVsdFN0YXRlLmFkZEZyYW1lKFxyXG4gICAgICAgIHRoaXMuY3JlYXRlRnJhbWUodGhpcy5kZWZhdWx0R3JhcGhpYylcclxuICAgICk7XHJcbiAgICB0aGlzLmFkZFN0YXRlKEdhbWVPYmplY3QuU1RBVEUuREVGQVVMVCwgdGhpcy5kZWZhdWx0U3RhdGUpO1xyXG5cclxuICAgIHRoaXMuc29saWQgPSB0cnVlO1xyXG4gICAgdGhpcy5maXhlZCA9IHRydWU7XHJcbiAgICB0aGlzLnJvdGF0ZSgtTWF0aC5QSSAqIDAuNSk7XHJcbn07XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKEZ1bGxCbG9jaywge1xyXG4gICAgbmFtZSA6IHtcclxuICAgICAgICB2YWx1ZSA6IFwiRnVsbEJsb2NrXCJcclxuICAgIH0sXHJcblxyXG4gICAgaWQgOiB7XHJcbiAgICAgICAgdmFsdWUgOiAwXHJcbiAgICB9XHJcbn0pO1xyXG5GdWxsQmxvY2sucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKFBoeXNpY3NPYmplY3QucHJvdG90eXBlLCB7XHJcbiAgICBkcmF3T25NaW5pbWFwIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGN0eCkge1xyXG4gICAgICAgICAgICB2YXIgdyA9IHRoaXMuZ2V0V2lkdGgoKTtcclxuICAgICAgICAgICAgdmFyIGggPSB0aGlzLmdldEhlaWdodCgpO1xyXG4gICAgICAgICAgICB2YXIgb2Zmc2V0WCA9IE1hdGgucm91bmQoLXcgKiAwLjUpO1xyXG4gICAgICAgICAgICB2YXIgb2Zmc2V0WSA9IE1hdGgucm91bmQoLWggKiAwLjUpO1xyXG4gICAgICAgICAgICB2YXIgZGlzcGxheVdpZHRoID0gTWF0aC5yb3VuZCh3KTtcclxuICAgICAgICAgICAgdmFyIGRpc3BsYXlIZWlnaHQgPSBNYXRoLnJvdW5kKGgpO1xyXG5cclxuICAgICAgICAgICAgY3R4LnNhdmUoKTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5yb3RhdGUodGhpcy5nZXRSb3RhdGlvbigpKTtcclxuXHJcbiAgICAgICAgICAgIC8qY3R4LmZpbGxTdHlsZSA9XHJcbiAgICAgICAgICAgICAgICBhcHAuZ2FtZW9iamVjdC5QaHlzaWNzT2JqZWN0Lk1JTklNQVBfRklMTF9TVFlMRTtcclxuICAgICAgICAgICAgY3R4LnN0cm9rZVN0eWxlID1cclxuICAgICAgICAgICAgICAgIGFwcC5nYW1lb2JqZWN0LlBoeXNpY3NPYmplY3QuTUlOSU1BUF9TVFJPS0VfU1RZTEU7Ki9cclxuXHJcbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgY3R4LnJlY3Qob2Zmc2V0WCwgb2Zmc2V0WSwgZGlzcGxheVdpZHRoLCBkaXNwbGF5SGVpZ2h0KTtcclxuICAgICAgICAgICAgY3R4LmZpbGwoKTtcclxuICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xyXG5cclxuICAgICAgICAgICAgY3R4LnJlc3RvcmUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKTtcclxuT2JqZWN0LmZyZWV6ZShGdWxsQmxvY2spO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBGdWxsQmxvY2s7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcclxudmFyIEFzc2V0cyA9IHV0aWwuQXNzZXRzO1xyXG52YXIgTmV0d29yayA9IHJlcXVpcmUoJy4uL25ldHdvcmsnKTtcclxudmFyIEdhbWVPYmplY3QgPSB3ZmwuY29yZS5lbnRpdGllcy5HYW1lT2JqZWN0O1xyXG52YXIgTGl2aW5nT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuTGl2aW5nT2JqZWN0O1xyXG52YXIgZ2VvbSA9IHdmbC5nZW9tO1xyXG5cclxudmFyIFBsYXllciA9IGZ1bmN0aW9uICgpIHtcclxuICAgIExpdmluZ09iamVjdC5jYWxsKHRoaXMpO1xyXG5cclxuICAgIHRoaXMuc29saWQgPSB0cnVlO1xyXG5cclxuICAgIC8vIENyZWF0ZSBkZWZhdWx0IHN0YXRlXHJcbiAgICB0aGlzLmRlZmF1bHRHcmFwaGljID0gQXNzZXRzLmdldChBc3NldHMuUExBWUVSKTtcclxuXHJcbiAgICB2YXIgdyA9IHRoaXMuZGVmYXVsdEdyYXBoaWMud2lkdGg7XHJcbiAgICB2YXIgaCA9IHRoaXMuZGVmYXVsdEdyYXBoaWMuaGVpZ2h0O1xyXG4gICAgdmFyIHZlcnRzID0gW1xyXG4gICAgICAgIG5ldyBnZW9tLlZlYzIoLXcgKiAwLjUsIC1oICogMC41KSxcclxuICAgICAgICBuZXcgZ2VvbS5WZWMyKHcgKiAwLjUsIDApLFxyXG4gICAgICAgIG5ldyBnZW9tLlZlYzIoLXcgKiAwLjUsIGggKiAwLjUpXHJcbiAgICBdO1xyXG4gICAgdmFyIGZyYW1lT2JqID0gdGhpcy5jcmVhdGVGcmFtZSh0aGlzLmRlZmF1bHRHcmFwaGljLCAxLCBmYWxzZSk7XHJcbiAgICBmcmFtZU9iai52ZXJ0aWNlcyA9IHZlcnRzO1xyXG5cclxuICAgIHRoaXMuZGVmYXVsdFN0YXRlID0gdGhpcy5jcmVhdGVTdGF0ZSgpO1xyXG4gICAgdGhpcy5kZWZhdWx0U3RhdGUuYWRkRnJhbWUoZnJhbWVPYmopO1xyXG4gICAgdGhpcy5hZGRTdGF0ZShHYW1lT2JqZWN0LlNUQVRFLkRFRkFVTFQsIHRoaXMuZGVmYXVsdFN0YXRlKTtcclxuXHJcbiAgICB0aGlzLmxhc3RTZW50UG9zaXRpb24gPSBuZXcgZ2VvbS5WZWMyKC1JbmZpbml0eSwgLUluZmluaXR5KTtcclxuXHJcbiAgICB0aGlzLnJvdGF0ZSgtTWF0aC5QSSAqIDAuNSk7XHJcbn07XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKFBsYXllciwge1xyXG4gICAgVFVSTl9TUEVFRCA6IHtcclxuICAgICAgICB2YWx1ZSA6IDAuMDVcclxuICAgIH0sXHJcblxyXG4gICAgQlJBS0VfUkFURSA6IHtcclxuICAgICAgICB2YWx1ZSA6IDAuOTVcclxuICAgIH0sXHJcblxyXG4gICAgQk9PU1RfQUNDRUxFUkFUSU9OIDoge1xyXG4gICAgICAgIHZhbHVlIDogMC4wMDAyXHJcbiAgICB9LFxyXG5cclxuICAgIFBPU0lUSU9OX1VQREFURV9ESVNUQU5DRSA6IHtcclxuICAgICAgICB2YWx1ZSA6IDAuNVxyXG4gICAgfSxcclxuXHJcbiAgICBNSU5JTUFQX0ZJTExfU1RZTEUgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBcIiM4NmM4ZDNcIlxyXG4gICAgfVxyXG59KTtcclxuUGxheWVyLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShMaXZpbmdPYmplY3QucHJvdG90eXBlLCB7XHJcbiAgICB1cGRhdGUgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZHQpIHtcclxuICAgICAgICAgICAgTGl2aW5nT2JqZWN0LnByb3RvdHlwZS51cGRhdGUuY2FsbCh0aGlzLCBkdCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBJZiB0aGUgcGxheWVyIGlzIGNvbm5lY3RlZCB0byB0aGUgbmV0d29yaywgc2VuZCBvdXQgdXBkYXRlcyB0b1xyXG4gICAgICAgICAgICAvLyBvdGhlciBwbGF5ZXJzIHdoZW4gbmVjZXNzYXJ5XHJcbiAgICAgICAgICAgIGlmIChOZXR3b3JrLmNvbm5lY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgTmV0d29yay5zb2NrZXQuZW1pdCgndXBkYXRlT3RoZXInLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb24gICAgIDogdGhpcy5wb3NpdGlvbixcclxuICAgICAgICAgICAgICAgICAgICB2ZWxvY2l0eSAgICAgOiB0aGlzLnZlbG9jaXR5LFxyXG4gICAgICAgICAgICAgICAgICAgIGFjY2VsZXJhdGlvbiA6IHRoaXMuYWNjZWxlcmF0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIHJvdGF0aW9uICAgICA6IHRoaXMuZ2V0Um90YXRpb24oKVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGRyYXdPbk1pbmltYXAgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoY3R4KSB7XHJcbiAgICAgICAgICAgIHZhciB3ID0gdGhpcy5nZXRXaWR0aCgpO1xyXG4gICAgICAgICAgICB2YXIgaCA9IHRoaXMuZ2V0SGVpZ2h0KCk7XHJcbiAgICAgICAgICAgIHZhciBvZmZzZXRYID0gTWF0aC5yb3VuZCgtdyAqIDAuNSk7XHJcbiAgICAgICAgICAgIHZhciBvZmZzZXRZID0gTWF0aC5yb3VuZCgtaCAqIDAuNSk7XHJcbiAgICAgICAgICAgIHZhciBkaXNwbGF5V2lkdGggPSBNYXRoLnJvdW5kKHcpO1xyXG4gICAgICAgICAgICB2YXIgZGlzcGxheUhlaWdodCA9IE1hdGgucm91bmQoaCk7XHJcblxyXG4gICAgICAgICAgICBjdHguc2F2ZSgpO1xyXG5cclxuICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFBsYXllci5NSU5JTUFQX0ZJTExfU1RZTEU7XHJcbiAgICAgICAgICAgIGN0eC5maWxsUmVjdChvZmZzZXRYLCBvZmZzZXRZLCBkaXNwbGF5V2lkdGgsIGRpc3BsYXlIZWlnaHQpO1xyXG5cclxuICAgICAgICAgICAgY3R4LnJlc3RvcmUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKTtcclxuT2JqZWN0LmZyZWV6ZShQbGF5ZXIpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXI7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgRnVsbEJsb2NrID0gcmVxdWlyZSgnLi9GdWxsQmxvY2suanMnKTtcclxudmFyIFBsYXllciA9IHJlcXVpcmUoJy4vUGxheWVyLmpzJyk7XHJcbnZhciBDbGllbnRQbGF5ZXIgPSByZXF1aXJlKCcuL0NsaWVudFBsYXllci5qcycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBGdWxsQmxvY2sgOiBGdWxsQmxvY2ssXHJcbiAgICBQbGF5ZXI6IFBsYXllcixcclxuICAgIENsaWVudFBsYXllciA6IENsaWVudFBsYXllclxyXG59OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIE5ldHdvcmsgPSByZXF1aXJlKCcuL25ldHdvcmsnKTtcclxudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcclxudmFyIEFzc2V0cyA9IHV0aWwuQXNzZXRzO1xyXG52YXIgc2NlbmVzID0gcmVxdWlyZSgnLi9zY2VuZXMnKTtcclxudmFyIG92ZXJsYXlzID0gcmVxdWlyZSgnLi9vdmVybGF5cycpO1xyXG5cclxuLy8gQ3JlYXRlIGdhbWVcclxudmFyIGNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZ2FtZS1jYW52YXNcIik7XHJcbnZhciBnYW1lICAgPSB3ZmwuY3JlYXRlKGNhbnZhcyk7XHJcblxyXG52YXIgbG9hZGluZ1NjZW5lID0gbmV3IHNjZW5lcy5Mb2FkaW5nU2NlbmUoY2FudmFzKTtcclxuZ2FtZS5zZXRTY2VuZShsb2FkaW5nU2NlbmUpO1xyXG5cclxuLy8gU3RvcCB0aGUgZ2FtZSBzbyB0aGF0IGNhbnZhcyB1cGRhdGVzIGRvbid0IGFmZmVjdCBwZXJmb3JtYW5jZSB3aXRoXHJcbi8vIG92ZXJsYXlzXHJcbmdhbWUuc3RvcCgpO1xyXG5cclxudmFyIG9uTG9hZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICQoTmV0d29yaykub24oXHJcbiAgICAgICAgTmV0d29yay5FdmVudC5DT05ORUNULFxyXG4gICAgICAgIG9uTmV0d29ya0Nvbm5lY3RcclxuICAgICk7XHJcblxyXG4gICAgTmV0d29yay5pbml0KCk7XHJcbn07XHJcblxyXG52YXIgb25OZXR3b3JrQ29ubmVjdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBsb2JieVNjZW5lID0gbmV3IHNjZW5lcy5Mb2JieVNjZW5lKGNhbnZhcyk7XHJcbiAgICBnYW1lLnNldFNjZW5lKGxvYmJ5U2NlbmUpO1xyXG5cclxuICAgICQobG9iYnlTY2VuZSkub24oc2NlbmVzLkxvYmJ5U2NlbmUuRXZlbnQuUExBWV9HQU1FLCBvblBsYXlHYW1lKTtcclxufTtcclxuXHJcbnZhciBvblBsYXlHYW1lID0gZnVuY3Rpb24gKGUsIHJvb21JZCkge1xyXG4gICAgJChnYW1lLmdldFNjZW5lKCkpLm9mZigpO1xyXG5cclxuICAgIHZhciBnYW1lU2NlbmUgPSBuZXcgc2NlbmVzLkdhbWVTY2VuZShjYW52YXMsIHJvb21JZCk7XHJcbiAgICBnYW1lLnNldFNjZW5lKGdhbWVTY2VuZSk7XHJcbiAgICBcclxuICAgIC8vIFN0YXJ0IHRoZSBnYW1lIHNpbmNlIGl0IHdhcyBzdG9wcGVkIHRvIGhlbHAgcGVyZm9ybWFuY2Ugd2l0aCBvdmVybGF5cyBvblxyXG4gICAgLy8gYSBjYW52YXNcclxuICAgIGdhbWUuc3RhcnQoKTtcclxufTtcclxuXHJcbnZhciBQcmVsb2FkZXIgPSBuZXcgdXRpbC5QcmVsb2FkZXIob25Mb2FkLmJpbmQodGhpcykpOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIGVudGl0aWVzID0gcmVxdWlyZSgnLi4vZW50aXRpZXMnKTtcclxuXHJcbnZhciBDbGllbnQgPSBmdW5jdGlvbiAoaWQsIGRhdGEpIHtcclxuICAgIHRoaXMuaWQgPSBpZDtcclxuICAgIHRoaXMuZGF0YSA9IGRhdGE7XHJcbiAgICB0aGlzLmdhbWVPYmplY3QgPSBuZXcgZW50aXRpZXMuQ2xpZW50UGxheWVyKCk7XHJcbn07XHJcbk9iamVjdC5mcmVlemUoQ2xpZW50KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ2xpZW50OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIGVudGl0aWVzID0gcmVxdWlyZSgnLi4vZW50aXRpZXMnKTtcclxuXHJcbnZhciBMb2NhbENsaWVudCA9IGZ1bmN0aW9uIChpZCwgZGF0YSkge1xyXG4gICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgdGhpcy5kYXRhID0gZGF0YTtcclxuICAgIHRoaXMuZ2FtZU9iamVjdCA9IG5ldyBlbnRpdGllcy5QbGF5ZXIoKTtcclxufTtcclxuT2JqZWN0LmZyZWV6ZShMb2NhbENsaWVudCk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IExvY2FsQ2xpZW50OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIE5ldHdvcmsgPSB7XHJcbiAgICBzb2NrZXQgICAgICA6IHVuZGVmaW5lZCxcclxuICAgIGxvY2FsQ2xpZW50IDoge30sXHJcbiAgICBjbGllbnRzICAgICA6IHt9LFxyXG4gICAgcm9vbXMgICAgICAgOiB7fSxcclxuICAgIGNvbm5lY3RlZCAgIDogZmFsc2UsXHJcbiAgICBFdmVudCAgICAgICA6IHtcclxuICAgICAgICBDT05ORUNUICAgICAgICAgICAgOiBcImNvbm5lY3RcIixcclxuICAgICAgICBVUERBVEVfUk9PTVMgICAgICAgOiBcInVwZGF0ZVJvb21zXCIsXHJcbiAgICAgICAgRU5URVJfUk9PTV9TVUNDRVNTIDogXCJlbnRlclJvb21TdWNjZXNzXCIsXHJcbiAgICAgICAgRU5URVJfUk9PTV9GQUlMICAgIDogXCJlbnRlclJvb21GYWlsXCJcclxuICAgIH0sXHJcblxyXG4gICAgaW5pdCA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLnNvY2tldCA9IGlvLmNvbm5lY3QoKTtcclxuXHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ2NvbmZpcm0nLCB0aGlzLl9vbkNvbmZpcm1DbGllbnQuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ2FkZE90aGVyJywgdGhpcy5fb25BZGRPdGhlckNsaWVudC5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbigncmVtb3ZlT3RoZXInLCB0aGlzLl9vblJlbW92ZU90aGVyQ2xpZW50LmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdsb2FkUHJldmlvdXMnLCB0aGlzLl9vbkxvYWRQcmV2aW91c0NsaWVudHMuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ3VwZGF0ZU90aGVyJywgdGhpcy5fb25VcGRhdGVDbGllbnQuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ3VwZGF0ZVJvb21zJywgdGhpcy5fb25VcGRhdGVSb29tcy5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbignZW50ZXJSb29tU3VjY2VzcycsIHRoaXMuX29uRW50ZXJSb29tU3VjY2Vzcy5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbignZW50ZXJSb29tRmFpbCcsIHRoaXMuX29uRW50ZXJSb29tRmFpbC5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnaW5pdCcsIHtcclxuICAgICAgICAgICAgdXNlciA6ICQoXCIjdXNlck5hbWVcIikuaHRtbCgpXHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldFJvb21zIDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ3VwZGF0ZVJvb21zJyk7XHJcbiAgICB9LFxyXG5cclxuICAgIGNyZWF0ZVJvb20gOiBmdW5jdGlvbiAobmFtZSkge1xyXG4gICAgICAgIHZhciByb29tRGF0YSA9IHtcclxuICAgICAgICAgICAgbmFtZSAgOiBuYW1lLFxyXG4gICAgICAgICAgICBlbnRlciA6IHRydWVcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdjcmVhdGVSb29tJywgcm9vbURhdGEpO1xyXG4gICAgfSxcclxuXHJcbiAgICBlbnRlclJvb20gOiBmdW5jdGlvbiAocm9vbUlkKSB7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnZW50ZXJSb29tJywgcm9vbUlkKTtcclxuICAgIH0sXHJcblxyXG4gICAgbGVhdmVSb29tIDogZnVuY3Rpb24gKHJvb21JZCkge1xyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ2xlYXZlUm9vbScsIHJvb21JZCk7XHJcbiAgICB9LFxyXG4gICAgXHJcbiAgICBzd2l0Y2hUZWFtIDogZnVuY3Rpb24gKHJvb21JZCkge1xyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ3N3aXRjaFRlYW0nLCByb29tSWQpO1xyXG4gICAgfSxcclxuXHJcbiAgICBfb25Db25maXJtQ2xpZW50IDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICB2YXIgaWQgPSBkYXRhLmlkO1xyXG4gICAgICAgIHRoaXMubG9jYWxDbGllbnQgPSBuZXcgTG9jYWxDbGllbnQoaWQsIGRhdGEpO1xyXG4gICAgICAgIHRoaXMuY2xpZW50c1tpZF0gPSB0aGlzLmxvY2FsQ2xpZW50O1xyXG5cclxuICAgICAgICB0aGlzLl9vblVwZGF0ZUNsaWVudChkYXRhKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25uZWN0ZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICAkKHRoaXMpLnRyaWdnZXIoXHJcbiAgICAgICAgICAgIHRoaXMuRXZlbnQuQ09OTkVDVFxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkFkZE90aGVyQ2xpZW50IDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICB2YXIgaWQgPSBkYXRhLmlkO1xyXG4gICAgICAgIHZhciBuZXdDbGllbnQgPSBuZXcgQ2xpZW50KGlkLCBkYXRhKTtcclxuXHJcbiAgICAgICAgdGhpcy5jbGllbnRzW2RhdGEuaWRdID0gbmV3Q2xpZW50O1xyXG5cclxuICAgICAgICB0aGlzLl9vblVwZGF0ZUNsaWVudChkYXRhKTtcclxuICAgIH0sXHJcblxyXG4gICAgX29uUmVtb3ZlT3RoZXJDbGllbnQgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgIHRoaXMuY2xpZW50c1tkYXRhLmlkXSA9IHVuZGVmaW5lZDtcclxuICAgICAgICBkZWxldGUgdGhpcy5jbGllbnRzW2RhdGEuaWRdO1xyXG4gICAgfSxcclxuXHJcbiAgICBfb25Mb2FkUHJldmlvdXNDbGllbnRzIDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGRhdGEpO1xyXG5cclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIGlkID0gcGFyc2VJbnQoa2V5c1tpXSk7XHJcbiAgICAgICAgICAgIHZhciB1c2VyRGF0YSA9IGRhdGFbaWRdO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fb25BZGRPdGhlckNsaWVudCh1c2VyRGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25VcGRhdGVDbGllbnQgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgIHZhciBpZCA9IGRhdGEuaWQ7XHJcbiAgICAgICAgdmFyIGNsaWVudCA9IHRoaXMuY2xpZW50c1tpZF07XHJcblxyXG4gICAgICAgIGNsaWVudC5kYXRhID0gZGF0YTtcclxuICAgICAgICBjbGllbnQuZ2FtZU9iamVjdC5wb3NpdGlvbi54ID0gZGF0YS5wb3NpdGlvbi54O1xyXG4gICAgICAgIGNsaWVudC5nYW1lT2JqZWN0LnBvc2l0aW9uLnkgPSBkYXRhLnBvc2l0aW9uLnk7XHJcbiAgICAgICAgY2xpZW50LmdhbWVPYmplY3QudmVsb2NpdHkueCA9IGRhdGEudmVsb2NpdHkueDtcclxuICAgICAgICBjbGllbnQuZ2FtZU9iamVjdC52ZWxvY2l0eS55ID0gZGF0YS52ZWxvY2l0eS55O1xyXG4gICAgICAgIGNsaWVudC5nYW1lT2JqZWN0LmFjY2VsZXJhdGlvbi54ID0gZGF0YS5hY2NlbGVyYXRpb24ueDtcclxuICAgICAgICBjbGllbnQuZ2FtZU9iamVjdC5hY2NlbGVyYXRpb24ueSA9IGRhdGEuYWNjZWxlcmF0aW9uLnk7XHJcbiAgICAgICAgY2xpZW50LmdhbWVPYmplY3Quc2V0Um90YXRpb24oZGF0YS5yb3RhdGlvbik7XHJcbiAgICB9LFxyXG5cclxuICAgIF9vblVwZGF0ZVJvb21zIDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICB0aGlzLnJvb21zID0gZGF0YTtcclxuXHJcbiAgICAgICAgJCh0aGlzKS50cmlnZ2VyKFxyXG4gICAgICAgICAgICB0aGlzLkV2ZW50LlVQREFURV9ST09NUyxcclxuICAgICAgICAgICAgZGF0YVxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkVudGVyUm9vbVN1Y2Nlc3MgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICQodGhpcykudHJpZ2dlcihcclxuICAgICAgICAgICAgdGhpcy5FdmVudC5FTlRFUl9ST09NX1NVQ0NFU1MsXHJcbiAgICAgICAgICAgIGRhdGFcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBfb25FbnRlclJvb21GYWlsIDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAkKHRoaXMpLnRyaWdnZXIoXHJcbiAgICAgICAgICAgIHRoaXMuRXZlbnQuRU5URVJfUk9PTV9GQUlMLFxyXG4gICAgICAgICAgICBkYXRhXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTmV0d29yaztcclxuXHJcbnZhciBDbGllbnQgPSByZXF1aXJlKCcuL0NsaWVudC5qcycpO1xyXG52YXIgTG9jYWxDbGllbnQgPSByZXF1aXJlKCcuL0xvY2FsQ2xpZW50LmpzJyk7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgT3ZlcmxheSA9IHJlcXVpcmUoJy4vT3ZlcmxheScpO1xyXG5cclxudmFyIENyZWF0ZVJvb21PdmVybGF5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgT3ZlcmxheS5jYWxsKHRoaXMpO1xyXG4gICAgXHJcbiAgICB0aGlzLmlucHV0RmllbGQgPSAkKFwiPGlucHV0PlwiKTtcclxuICAgIHRoaXMuaW5wdXRGaWVsZC5hdHRyKHsgXCJwbGFjZWhvbGRlclwiIDogXCJSb29tIE5hbWVcIiB9KTtcclxuICAgIHRoaXMuaW5wdXRGaWVsZC5hZGRDbGFzcyhcImNyZWF0ZS1yb29tLW92ZXJsYXktaW5wdXRcIik7XHJcbiAgICBcclxuICAgIHRoaXMuYnV0dG9uQ29udGFpbmVyID0gJChcIjxkaXY+XCIpO1xyXG4gICAgdGhpcy5idXR0b25Db250YWluZXIuYWRkQ2xhc3MoXCJjcmVhdGUtcm9vbS1vdmVybGF5LWJ1dHRvbi1jb250YWluZXJcIik7XHJcbiAgICBcclxuICAgIHRoaXMuY2FuY2VsQnRuID0gJChcIjxidXR0b24+XCIpO1xyXG4gICAgdGhpcy5jYW5jZWxCdG4udGV4dChcIkNhbmNlbFwiKTtcclxuICAgIHRoaXMuYnV0dG9uQ29udGFpbmVyLmFwcGVuZCh0aGlzLmNhbmNlbEJ0bik7XHJcbiAgICBcclxuICAgIHRoaXMuY3JlYXRlQnRuID0gJChcIjxidXR0b24+XCIpO1xyXG4gICAgdGhpcy5jcmVhdGVCdG4udGV4dChcIkNyZWF0ZVwiKTtcclxuICAgIHRoaXMuYnV0dG9uQ29udGFpbmVyLmFwcGVuZCh0aGlzLmNyZWF0ZUJ0bik7XHJcblxyXG4gICAgdGhpcy5kb21PYmplY3QuYXBwZW5kKHRoaXMuaW5wdXRGaWVsZCk7XHJcbiAgICB0aGlzLmRvbU9iamVjdC5hcHBlbmQodGhpcy5idXR0b25Db250YWluZXIpO1xyXG4gICAgdGhpcy5kb21PYmplY3QuYWRkQ2xhc3MoXCJjcmVhdGUtcm9vbS1vdmVybGF5XCIpO1xyXG59O1xyXG5cclxuQ3JlYXRlUm9vbU92ZXJsYXkucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKE92ZXJsYXkucHJvdG90eXBlLCB7XHJcblxyXG59KSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENyZWF0ZVJvb21PdmVybGF5OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIE92ZXJsYXkgPSByZXF1aXJlKCcuL092ZXJsYXknKTtcclxuXHJcbnZhciBMb2FkaW5nT3ZlcmxheSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIE92ZXJsYXkuY2FsbCh0aGlzKTtcclxuICAgIFxyXG4gICAgdGhpcy5kb21PYmplY3QuYWRkQ2xhc3MoXCJsb2FkaW5nLW92ZXJsYXlcIik7XHJcbn07XHJcblxyXG5Mb2FkaW5nT3ZlcmxheS5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoT3ZlcmxheS5wcm90b3R5cGUsIHtcclxuXHJcbn0pKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTG9hZGluZ092ZXJsYXk7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgT3ZlcmxheSA9IHJlcXVpcmUoJy4vT3ZlcmxheScpO1xyXG52YXIgTmV0d29yayA9IHJlcXVpcmUoJy4uL25ldHdvcmsnKTtcclxuXHJcbnZhciBMb2JieU92ZXJsYXkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBPdmVybGF5LmNhbGwodGhpcyk7XHJcblxyXG4gICAgLy8gU2V0IHVwIGxlZnQgc2lkZVxyXG4gICAgdGhpcy5sZWZ0Q29udGFpbmVyID0gJChcIjxzcGFuPlwiKTtcclxuICAgIHRoaXMubGVmdENvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktbGVmdFwiKTtcclxuICAgIHRoaXMubGVmdENvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktbWF4aW1pemVkLXNpZGVcIik7XHJcblxyXG4gICAgdGhpcy5yb29tQnV0dG9uQ29udGFpbmVyID0gJChcIjxkaXY+XCIpO1xyXG4gICAgdGhpcy5yb29tQnV0dG9uQ29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1idXR0b24tY29udGFpbmVyXCIpO1xyXG4gICAgdGhpcy5sZWZ0Q29udGFpbmVyLmFwcGVuZCh0aGlzLnJvb21CdXR0b25Db250YWluZXIpO1xyXG5cclxuICAgIHRoaXMuc2VsZWN0Um9vbUxhYmVsID0gJChcIjxkaXY+XCIpO1xyXG4gICAgdGhpcy5zZWxlY3RSb29tTGFiZWwuaHRtbChcIlNlbGVjdCBvciBjcmVhdGUgcm9vbVwiKTtcclxuICAgIHRoaXMucm9vbUJ1dHRvbkNvbnRhaW5lci5hcHBlbmQodGhpcy5zZWxlY3RSb29tTGFiZWwpO1xyXG4gICAgdGhpcy5yb29tQnV0dG9uQ29udGFpbmVyLmFwcGVuZCgkKFwiPGJyPlwiKSk7XHJcblxyXG4gICAgdGhpcy5jcmVhdGVSb29tQnRuID0gJChcIjxidXR0b24+XCIpO1xyXG4gICAgdGhpcy5jcmVhdGVSb29tQnRuLnRleHQoXCJDcmVhdGUgUm9vbVwiKTtcclxuICAgIHRoaXMucm9vbUJ1dHRvbkNvbnRhaW5lci5hcHBlbmQodGhpcy5jcmVhdGVSb29tQnRuKTtcclxuXHJcbiAgICB0aGlzLnJvb21MaXN0Q29udGFpbmVyID0gJChcIjxkaXY+XCIpO1xyXG4gICAgdGhpcy5yb29tTGlzdENvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktcm9vbS1saXN0XCIpO1xyXG4gICAgdGhpcy5yb29tTGlzdENvbnRhaW5lci5odG1sKFwiTG9hZGluZyByb29tcy4uLlwiKTtcclxuICAgIHRoaXMubGVmdENvbnRhaW5lci5hcHBlbmQodGhpcy5yb29tTGlzdENvbnRhaW5lcik7XHJcblxyXG4gICAgLy8gU2V0IHVwIHJpZ2h0IHNpZGVcclxuICAgIHRoaXMucmlnaHRDb250YWluZXIgPSAkKFwiPHNwYW4+XCIpO1xyXG4gICAgdGhpcy5yaWdodENvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktcmlnaHRcIik7XHJcbiAgICB0aGlzLnJpZ2h0Q29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1taW5pbWl6ZWQtc2lkZVwiKTtcclxuXHJcbiAgICB0aGlzLnNlbGVjdGVkUm9vbUxhYmVsID0gJChcIjxkaXY+XCIpO1xyXG4gICAgdGhpcy5zZWxlY3RlZFJvb21MYWJlbC5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktcm9vbS1sYWJlbC1jb250YWluZXJcIik7XHJcbiAgICBcclxuICAgIHRoaXMucmVuZGVyUm9vbUxhYmVsKCk7XHJcbiAgICB0aGlzLnJpZ2h0Q29udGFpbmVyLmFwcGVuZCh0aGlzLnNlbGVjdGVkUm9vbUxhYmVsKTtcclxuXHJcbiAgICB0aGlzLnN3aXRjaFRlYW1CdG4gPSAkKFwiPGJ1dHRvbj5cIik7XHJcbiAgICB0aGlzLnN3aXRjaFRlYW1CdG4udGV4dChcIlN3aXRjaCBUZWFtc1wiKTtcclxuICAgIHRoaXMuc3dpdGNoVGVhbUJ0bi5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktc3dpdGNoLXRlYW0tYnRuXCIpO1xyXG5cclxuICAgIHRoaXMudGVhbUFDb250YWluZXIgPSAkKFwiPGRpdj5cIik7XHJcbiAgICB0aGlzLnRlYW1BQ29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS10ZWFtQS1jb250YWluZXJcIik7XHJcbiAgICBcclxuICAgIHRoaXMudGVhbUJDb250YWluZXIgPSAkKFwiPGRpdj5cIik7XHJcbiAgICB0aGlzLnRlYW1CQ29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS10ZWFtQi1jb250YWluZXJcIik7XHJcbiAgICBcclxuICAgIHRoaXMucmVuZGVyUGxheWVycygpO1xyXG5cclxuICAgIHRoaXMucmlnaHRDb250YWluZXIuYXBwZW5kKHRoaXMudGVhbUFDb250YWluZXIpO1xyXG4gICAgdGhpcy5yaWdodENvbnRhaW5lci5hcHBlbmQodGhpcy5zd2l0Y2hUZWFtQnRuKTtcclxuICAgIHRoaXMucmlnaHRDb250YWluZXIuYXBwZW5kKHRoaXMudGVhbUJDb250YWluZXIpO1xyXG5cclxuICAgIHRoaXMubGVhdmVSb29tQnRuID0gJChcIjxidXR0b24+XCIpO1xyXG4gICAgdGhpcy5sZWF2ZVJvb21CdG4udGV4dChcIkxlYXZlIFJvb21cIik7XHJcbiAgICB0aGlzLmxlYXZlUm9vbUJ0bi5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktbGVhdmUtcm9vbS1idG5cIik7XHJcbiAgICB0aGlzLmxlYXZlUm9vbUJ0bi5oaWRlKCk7XHJcbiAgICB0aGlzLnJpZ2h0Q29udGFpbmVyLmFwcGVuZCh0aGlzLmxlYXZlUm9vbUJ0bik7XHJcblxyXG4gICAgdGhpcy5wbGF5QnRuID0gJChcIjxidXR0b24+XCIpO1xyXG4gICAgdGhpcy5wbGF5QnRuLnRleHQoXCJQbGF5XCIpO1xyXG4gICAgdGhpcy5wbGF5QnRuLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1wbGF5LWJ0blwiKTtcclxuICAgIHRoaXMucGxheUJ0bi5oaWRlKCk7XHJcbiAgICB0aGlzLnJpZ2h0Q29udGFpbmVyLmFwcGVuZCh0aGlzLnBsYXlCdG4pO1xyXG5cclxuICAgIHRoaXMuZG9tT2JqZWN0LmFwcGVuZCh0aGlzLmxlZnRDb250YWluZXIpO1xyXG4gICAgdGhpcy5kb21PYmplY3QuYXBwZW5kKHRoaXMucmlnaHRDb250YWluZXIpO1xyXG4gICAgdGhpcy5kb21PYmplY3QuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5XCIpO1xyXG4gICAgdGhpcy5kb21PYmplY3QuYWRkQ2xhc3MoXCJmYWRlLWluXCIpO1xyXG59O1xyXG5cclxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoTG9iYnlPdmVybGF5LCB7XHJcbiAgICBFdmVudCA6IHtcclxuICAgICAgICB2YWx1ZSA6IHtcclxuICAgICAgICAgICAgRU5URVJfUk9PTSA6IFwiZW50ZXJSb29tXCJcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pO1xyXG5cclxuTG9iYnlPdmVybGF5LnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShPdmVybGF5LnByb3RvdHlwZSwge1xyXG4gICAgc2hvd1Jvb21zIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKHJvb21EYXRhKSB7XHJcbiAgICAgICAgICAgIHRoaXMucm9vbUxpc3RDb250YWluZXIuaHRtbChcIlwiKTtcclxuXHJcbiAgICAgICAgICAgICQoXCIubG9iYnktb3ZlcmxheS1yb29tXCIpLm9mZihcImNsaWNrXCIpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhyb29tRGF0YSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoa2V5cy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucm9vbUxpc3RDb250YWluZXIuaHRtbChcIk5vIHJvb21zIGF2YWlsYWJsZVwiKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJSb29tID0gcm9vbURhdGFba2V5c1tpXV07XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1clJvb21Db250YWluZXIgPSAkKFwiPGRpdj5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgY3VyUm9vbUNvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktcm9vbVwiKTtcclxuICAgICAgICAgICAgICAgICAgICBjdXJSb29tQ29udGFpbmVyLmh0bWwoY3VyUm9vbS5uYW1lKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJChjdXJSb29tQ29udGFpbmVyKS5vbihcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJjbGlja1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJSb29tLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbkNsaWNrUm9vbS5iaW5kKHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yb29tTGlzdENvbnRhaW5lci5hcHBlbmQoY3VyUm9vbUNvbnRhaW5lcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHJlbmRlclJvb20gOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICBpZiAoZGF0YSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlclJvb21MYWJlbCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJQbGF5ZXJzKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5fb25FeGl0Um9vbSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJSb29tTGFiZWwoZGF0YS5uYW1lKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyUGxheWVycyhkYXRhKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9vbkVudGVyUm9vbSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICByZW5kZXJSb29tTGFiZWwgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAobGFiZWwpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBsYWJlbCAhPT0gXCJzdHJpbmdcIiB8fCBsYWJlbCA9PT0gXCJcIikge1xyXG4gICAgICAgICAgICAgICAgbGFiZWwgPSBcIk5vIHJvb20gc2VsZWN0ZWRcIjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGFiZWwgPSBcIkN1cnJlbnQgcm9vbTogXCIgKyBsYWJlbDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRSb29tTGFiZWwuaHRtbChsYWJlbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICByZW5kZXJQbGF5ZXJzIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKHJvb21EYXRhKSB7XHJcbiAgICAgICAgICAgIHRoaXMudGVhbUFDb250YWluZXIuaHRtbChcIlwiKTtcclxuICAgICAgICAgICAgdGhpcy50ZWFtQkNvbnRhaW5lci5odG1sKFwiXCIpO1xyXG4gICAgICAgICAgICB0aGlzLnN3aXRjaFRlYW1CdG4uaGlkZSgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHJvb21EYXRhICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIHZhciB0ZWFtQSA9IHJvb21EYXRhLnRlYW1BO1xyXG4gICAgICAgICAgICAgICAgdmFyIHRlYW1CID0gcm9vbURhdGEudGVhbUI7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHZhciB0ZWFtQUxhYmVsID0gJChcIjxkaXY+XCIpO1xyXG4gICAgICAgICAgICAgICAgdGVhbUFMYWJlbC5odG1sKFwiUm9zZSBUZWFtXCIpO1xyXG4gICAgICAgICAgICAgICAgdGVhbUFMYWJlbC5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktdGVhbS1sYWJlbFwiKTtcclxuICAgICAgICAgICAgICAgIHRoaXMudGVhbUFDb250YWluZXIuYXBwZW5kKHRlYW1BTGFiZWwpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB2YXIgdGVhbUJMYWJlbCA9ICQoXCI8ZGl2PlwiKTtcclxuICAgICAgICAgICAgICAgIHRlYW1CTGFiZWwuaHRtbChcIlNreSBUZWFtXCIpO1xyXG4gICAgICAgICAgICAgICAgdGVhbUJMYWJlbC5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktdGVhbS1sYWJlbFwiKTtcclxuICAgICAgICAgICAgICAgIHRoaXMudGVhbUJDb250YWluZXIuYXBwZW5kKHRlYW1CTGFiZWwpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEFkZCB0ZWFtIEEgcGxheWVyc1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA0OyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbGFiZWw7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBsYXllckNvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaSA8IHRlYW1BLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY3VySWQgPSB0ZWFtQVtpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGN1clBsYXllciA9IE5ldHdvcmsuY2xpZW50c1tjdXJJZF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsID0gY3VyUGxheWVyLmRhdGEudXNlcjtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbCA9IFwiLS0tLS0tXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllckNvbnRhaW5lci5odG1sKGxhYmVsKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRlYW1BQ29udGFpbmVyLmFwcGVuZChwbGF5ZXJDb250YWluZXIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIEFkZCB0ZWFtIEIgcGxheWVyc1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA0OyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbGFiZWw7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBsYXllckNvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaSA8IHRlYW1CLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY3VySWQgPSB0ZWFtQltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGN1clBsYXllciA9IE5ldHdvcmsuY2xpZW50c1tjdXJJZF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsID0gY3VyUGxheWVyLmRhdGEudXNlcjtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbCA9IFwiLS0tLS0tXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllckNvbnRhaW5lci5odG1sKGxhYmVsKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRlYW1CQ29udGFpbmVyLmFwcGVuZChwbGF5ZXJDb250YWluZXIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuc3dpdGNoVGVhbUJ0bi5zaG93KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkNsaWNrUm9vbSA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gZS5kYXRhO1xyXG4gICAgICAgICAgICB2YXIgcm9vbSA9IHtcclxuICAgICAgICAgICAgICAgIG5hbWUgOiBkYXRhLm5hbWUsXHJcbiAgICAgICAgICAgICAgICBpZCAgIDogZGF0YS5pZFxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgJCh0aGlzKS50cmlnZ2VyKExvYmJ5T3ZlcmxheS5FdmVudC5FTlRFUl9ST09NLCByb29tKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkV4aXRSb29tIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLmxlYXZlUm9vbUJ0bi5oaWRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMucGxheUJ0bi5oaWRlKCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmxlZnRDb250YWluZXIucmVtb3ZlQ2xhc3MoXCJsb2JieS1vdmVybGF5LW1pbmltaXplZC1zaWRlXCIpO1xyXG4gICAgICAgICAgICB0aGlzLnJpZ2h0Q29udGFpbmVyLnJlbW92ZUNsYXNzKFwibG9iYnktb3ZlcmxheS1tYXhpbWl6ZWQtc2lkZVwiKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubGVmdENvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktbWF4aW1pemVkLXNpZGVcIik7XHJcbiAgICAgICAgICAgIHRoaXMucmlnaHRDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LW1pbmltaXplZC1zaWRlXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uRW50ZXJSb29tIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLmxlYXZlUm9vbUJ0bi5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMucGxheUJ0bi5zaG93KCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmxlZnRDb250YWluZXIucmVtb3ZlQ2xhc3MoXCJsb2JieS1vdmVybGF5LW1heGltaXplZC1zaWRlXCIpO1xyXG4gICAgICAgICAgICB0aGlzLnJpZ2h0Q29udGFpbmVyLnJlbW92ZUNsYXNzKFwibG9iYnktb3ZlcmxheS1taW5pbWl6ZWQtc2lkZVwiKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubGVmdENvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktbWluaW1pemVkLXNpZGVcIik7XHJcbiAgICAgICAgICAgIHRoaXMucmlnaHRDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LW1heGltaXplZC1zaWRlXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkpO1xyXG5cclxuT2JqZWN0LmZyZWV6ZShMb2JieU92ZXJsYXkpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBMb2JieU92ZXJsYXk7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgT3ZlcmxheSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuZG9tT2JqZWN0ID0gJChcIjxkaXY+XCIpO1xyXG4gICAgdGhpcy5kb21PYmplY3QuYWRkQ2xhc3MoXCJjYW52YXMtb3ZlcmxheVwiKTtcclxufTtcclxuXHJcbk92ZXJsYXkucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKE92ZXJsYXkucHJvdG90eXBlLCB7XHJcblxyXG59KSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE92ZXJsYXk7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgT3ZlcmxheSA9IHJlcXVpcmUoJy4vT3ZlcmxheS5qcycpO1xyXG52YXIgTG9hZGluZ092ZXJsYXkgPSByZXF1aXJlKCcuL0xvYWRpbmdPdmVybGF5LmpzJyk7XHJcbnZhciBDcmVhdGVSb29tT3ZlcmxheSA9IHJlcXVpcmUoJy4vQ3JlYXRlUm9vbU92ZXJsYXkuanMnKTtcclxudmFyIExvYmJ5T3ZlcmxheSA9IHJlcXVpcmUoJy4vTG9iYnlPdmVybGF5LmpzJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIE92ZXJsYXkgOiBPdmVybGF5LFxyXG4gICAgTG9hZGluZ092ZXJsYXkgOiBMb2FkaW5nT3ZlcmxheSxcclxuICAgIENyZWF0ZVJvb21PdmVybGF5IDogQ3JlYXRlUm9vbU92ZXJsYXksXHJcbiAgICBMb2JieU92ZXJsYXkgOiBMb2JieU92ZXJsYXlcclxufTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xyXG52YXIgQXNzZXRzID0gdXRpbC5Bc3NldHM7XHJcbnZhciBOZXR3b3JrID0gcmVxdWlyZSgnLi4vbmV0d29yaycpO1xyXG52YXIgZW50aXRpZXMgPSByZXF1aXJlKCcuLi9lbnRpdGllcycpO1xyXG52YXIgRnVsbEJvY2sgPSBlbnRpdGllcy5GdWxsQmxvY2s7XHJcbnZhciBQbGF5ZXIgPSBlbnRpdGllcy5QbGF5ZXI7XHJcbnZhciBOZXR3b3JrU2NlbmUgPSByZXF1aXJlKCcuL05ldHdvcmtTY2VuZScpO1xyXG52YXIgYmFja2dyb3VuZHMgPSB3ZmwuZGlzcGxheS5iYWNrZ3JvdW5kcztcclxudmFyIGdlb20gPSB3ZmwuZ2VvbTtcclxuXHJcbnZhciBHYW1lU2NlbmUgPSBmdW5jdGlvbiAoY2FudmFzLCByb29tSWQpIHtcclxuICAgIE5ldHdvcmtTY2VuZS5jYWxsKHRoaXMsIGNhbnZhcywgcm9vbUlkKTtcclxuXHJcbiAgICB2YXIgd2FsbFNpemUgPSAxMDtcclxuICAgIHZhciBibG9ja1NpemUgPSAxMjg7XHJcbiAgICB2YXIgb2Zmc2V0ID0gLSh3YWxsU2l6ZSAqIDAuNSAtIDEpICogYmxvY2tTaXplO1xyXG5cclxuICAgIC8vIExpbmUgdGhlIHRvcFxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA5OyBpKyspIHtcclxuICAgICAgICB2YXIgbmV3QmxvY2sgPSBuZXcgRnVsbEJvY2soKTtcclxuICAgICAgICBuZXdCbG9jay5wb3NpdGlvbi54ID0gYmxvY2tTaXplICogaSArIG9mZnNldDtcclxuICAgICAgICBuZXdCbG9jay5wb3NpdGlvbi55ID0gb2Zmc2V0O1xyXG5cclxuICAgICAgICB0aGlzLmFkZEdhbWVPYmplY3QobmV3QmxvY2spO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIExpbmUgdGhlIGJvdHRvbVxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA5OyBpKyspIHtcclxuICAgICAgICB2YXIgbmV3QmxvY2sgPSBuZXcgRnVsbEJvY2soKTtcclxuICAgICAgICBuZXdCbG9jay5wb3NpdGlvbi54ID0gYmxvY2tTaXplICogaSArIG9mZnNldDtcclxuICAgICAgICBuZXdCbG9jay5wb3NpdGlvbi55ID0gLW9mZnNldDtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRHYW1lT2JqZWN0KG5ld0Jsb2NrKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBMaW5lIHRoZSBsZWZ0XHJcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IDg7IGkrKykge1xyXG4gICAgICAgIHZhciBuZXdCbG9jayA9IG5ldyBGdWxsQm9jaygpO1xyXG4gICAgICAgIG5ld0Jsb2NrLnBvc2l0aW9uLnggPSBvZmZzZXQ7XHJcbiAgICAgICAgbmV3QmxvY2sucG9zaXRpb24ueSA9IGJsb2NrU2l6ZSAqIGkgKyBvZmZzZXQ7XHJcblxyXG4gICAgICAgIHRoaXMuYWRkR2FtZU9iamVjdChuZXdCbG9jayk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTGluZSB0aGUgcmlnaHRcclxuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgODsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG5ld0Jsb2NrID0gbmV3IEZ1bGxCb2NrKCk7XHJcbiAgICAgICAgbmV3QmxvY2sucG9zaXRpb24ueCA9IC1vZmZzZXQ7XHJcbiAgICAgICAgbmV3QmxvY2sucG9zaXRpb24ueSA9IGJsb2NrU2l6ZSAqIGkgKyBvZmZzZXQ7XHJcblxyXG4gICAgICAgIHRoaXMuYWRkR2FtZU9iamVjdChuZXdCbG9jayk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHRoaXMuYmcgPSBuZXcgYmFja2dyb3VuZHMuUGFyYWxsYXhCYWNrZ3JvdW5kKFxyXG4gICAgICAgIEFzc2V0cy5nZXQoQXNzZXRzLkJHX1RJTEUpXHJcbiAgICApO1xyXG4gICAgXHJcbiAgICB0aGlzLnBsYXllciA9IE5ldHdvcmsubG9jYWxDbGllbnQuZ2FtZU9iamVjdDtcclxuICAgIHRoaXMuYWRkR2FtZU9iamVjdCh0aGlzLnBsYXllciwgMik7XHJcbn07XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKEdhbWVTY2VuZSwge1xyXG4gICAgRlJJQ1RJT04gOiB7XHJcbiAgICAgICAgdmFsdWUgOiAwLjkyNVxyXG4gICAgfSxcclxuXHJcbiAgICBNSU5JTUFQIDoge1xyXG4gICAgICAgIHZhbHVlIDogT2JqZWN0LmZyZWV6ZSh7XHJcbiAgICAgICAgICAgIFdJRFRIICAgICAgOiAxNTAsXHJcbiAgICAgICAgICAgIEhFSUdIVCAgICAgOiAxMDAsXHJcbiAgICAgICAgICAgIFNDQUxFICAgICAgOiAwLjEsXHJcbiAgICAgICAgICAgIEZJTExfU1RZTEUgOiBcIiMxOTI0MjdcIlxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcbn0pO1xyXG5HYW1lU2NlbmUucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKE5ldHdvcmtTY2VuZS5wcm90b3R5cGUsIHtcclxuICAgIHVwZGF0ZSA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChkdCkge1xyXG4gICAgICAgICAgICB2YXIgZ2FtZU9iamVjdHMgPSB0aGlzLmdldEdhbWVPYmplY3RzKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ2FtZU9iamVjdHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciBvYmogPSBnYW1lT2JqZWN0c1tpXTtcclxuICAgICAgICAgICAgICAgIG9iai5hY2NlbGVyYXRpb24ubXVsdGlwbHkoR2FtZVNjZW5lLkZSSUNUSU9OKTtcclxuICAgICAgICAgICAgICAgIG9iai52ZWxvY2l0eS5tdWx0aXBseShHYW1lU2NlbmUuRlJJQ1RJT04pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBOZXR3b3JrU2NlbmUucHJvdG90eXBlLnVwZGF0ZS5jYWxsKHRoaXMsIGR0KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlSW5wdXQoKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgXHJcbiAgICBoYW5kbGVJbnB1dCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHBsYXllciAgICAgICA9IHRoaXMucGxheWVyO1xyXG4gICAgICAgICAgICB2YXIga2V5Ym9hcmQgICAgID0gdGhpcy5rZXlib2FyZDtcclxuICAgICAgICAgICAgdmFyIGxlZnRQcmVzc2VkICA9IGtleWJvYXJkLmlzUHJlc3NlZChrZXlib2FyZC5MRUZUKTtcclxuICAgICAgICAgICAgdmFyIHJpZ2h0UHJlc3NlZCA9IGtleWJvYXJkLmlzUHJlc3NlZChrZXlib2FyZC5SSUdIVCk7XHJcbiAgICAgICAgICAgIHZhciB1cFByZXNzZWQgICAgPSBrZXlib2FyZC5pc1ByZXNzZWQoa2V5Ym9hcmQuVVApO1xyXG4gICAgICAgICAgICB2YXIgZG93blByZXNzZWQgID0ga2V5Ym9hcmQuaXNQcmVzc2VkKGtleWJvYXJkLkRPV04pO1xyXG5cclxuICAgICAgICAgICAgLy8gTGVmdC8gUmlnaHQgS2V5IC0tIFBsYXllciB0dXJuc1xyXG4gICAgICAgICAgICBpZiAobGVmdFByZXNzZWQgfHwgcmlnaHRQcmVzc2VkKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcm90YXRpb24gPSAwO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChsZWZ0UHJlc3NlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJvdGF0aW9uIC09IFBsYXllci5UVVJOX1NQRUVEO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChyaWdodFByZXNzZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICByb3RhdGlvbiArPSBQbGF5ZXIuVFVSTl9TUEVFRDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIucm90YXRlKHJvdGF0aW9uKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gVXAgS2V5IC0tIFBsYXllciBnb2VzIGZvcndhcmRcclxuICAgICAgICAgICAgaWYgKHVwUHJlc3NlZCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG1vdmVtZW50Rm9yY2UgPSBnZW9tLlZlYzIuZnJvbUFuZ2xlKHBsYXllci5nZXRSb3RhdGlvbigpKTtcclxuICAgICAgICAgICAgICAgIG1vdmVtZW50Rm9yY2UubXVsdGlwbHkoXHJcbiAgICAgICAgICAgICAgICAgICAgUGxheWVyLkJPT1NUX0FDQ0VMRVJBVElPTiAqIHBsYXllci5tYXNzXHJcbiAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgIHBsYXllci5hZGRGb3JjZShtb3ZlbWVudEZvcmNlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gRG93biBLZXkgLS0gQXBwbHkgYnJha2VzIHRvIHBsYXllclxyXG4gICAgICAgICAgICBpZiAoZG93blByZXNzZWQpIHtcclxuICAgICAgICAgICAgICAgIHBsYXllci52ZWxvY2l0eS5tdWx0aXBseShQbGF5ZXIuQlJBS0VfUkFURSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR2FtZVNjZW5lOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIFNjZW5lID0gd2ZsLmRpc3BsYXkuU2NlbmU7XHJcbnZhciBvdmVybGF5cyA9IHJlcXVpcmUoJy4uL292ZXJsYXlzJyk7XHJcblxyXG52YXIgTG9hZGluZ1NjZW5lID0gZnVuY3Rpb24gKGNhbnZhcykge1xyXG4gICAgU2NlbmUuY2FsbCh0aGlzLCBjYW52YXMpO1xyXG4gICAgXHJcbiAgICB0aGlzLmxvYWRpbmdPdmVybGF5ID0gbmV3IG92ZXJsYXlzLkxvYWRpbmdPdmVybGF5KCk7XHJcbiAgICAkKGNhbnZhcykucGFyZW50KCkuYXBwZW5kKHRoaXMubG9hZGluZ092ZXJsYXkuZG9tT2JqZWN0KTtcclxufTtcclxuTG9hZGluZ1NjZW5lLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShTY2VuZS5wcm90b3R5cGUsIHtcclxuICAgIGRlc3Ryb3kgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9hZGluZ092ZXJsYXkuZG9tT2JqZWN0LnJlbW92ZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBMb2FkaW5nU2NlbmU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgU2NlbmUgPSB3ZmwuZGlzcGxheS5TY2VuZTtcclxudmFyIG92ZXJsYXlzID0gcmVxdWlyZSgnLi4vb3ZlcmxheXMnKTtcclxudmFyIE5ldHdvcmsgPSByZXF1aXJlKCcuLi9uZXR3b3JrJyk7XHJcblxyXG52YXIgTG9iYnlTY2VuZSA9IGZ1bmN0aW9uIChjYW52YXMpIHtcclxuICAgIFNjZW5lLmNhbGwodGhpcywgY2FudmFzKTtcclxuXHJcbiAgICB0aGlzLmN1clJvb21JZCA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICB0aGlzLmxvYmJ5T3ZlcmxheSA9IG5ldyBvdmVybGF5cy5Mb2JieU92ZXJsYXkoKTtcclxuICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkgPSBuZXcgb3ZlcmxheXMuQ3JlYXRlUm9vbU92ZXJsYXkoKTtcclxuICAgICQoY2FudmFzKS5wYXJlbnQoKS5hcHBlbmQodGhpcy5sb2JieU92ZXJsYXkuZG9tT2JqZWN0KTtcclxuICAgICQoY2FudmFzKS5wYXJlbnQoKS5hcHBlbmQodGhpcy5jcmVhdGVSb29tT3ZlcmxheS5kb21PYmplY3QpO1xyXG5cclxuICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuZG9tT2JqZWN0LmhpZGUoKTtcclxuXHJcbiAgICB0aGlzLmxvYmJ5T3ZlcmxheS5sZWF2ZVJvb21CdG4uY2xpY2sodGhpcy5fb25MZWF2ZVJvb21CdXR0b25DbGljay5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMubG9iYnlPdmVybGF5LnBsYXlCdG4uY2xpY2sodGhpcy5fb25QbGF5QnV0dG9uQ2xpY2suYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLmxvYmJ5T3ZlcmxheS5zd2l0Y2hUZWFtQnRuLmNsaWNrKHRoaXMuX29uU3dpdGNoVGVhbUJ1dHRvbkNsaWNrLmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5sb2JieU92ZXJsYXkuY3JlYXRlUm9vbUJ0bi5jbGljayh0aGlzLl9vbkNyZWF0ZVJvb21CdXR0b25DbGljay5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICB0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmNhbmNlbEJ0bi5jbGljayh0aGlzLl9vbkNyZWF0ZVJvb21DYW5jZWwuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmNyZWF0ZUJ0bi5jbGljayh0aGlzLl9vbkNyZWF0ZVJvb20uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgJCh0aGlzLmxvYmJ5T3ZlcmxheSkub24ob3ZlcmxheXMuTG9iYnlPdmVybGF5LkV2ZW50LkVOVEVSX1JPT00sIHRoaXMuX29uRW50ZXJSb29tQXR0ZW1wdC5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAkKE5ldHdvcmspLm9uKE5ldHdvcmsuRXZlbnQuVVBEQVRFX1JPT01TLCB0aGlzLl9vblVwZGF0ZVJvb21MaXN0LmJpbmQodGhpcykpO1xyXG4gICAgJChOZXR3b3JrKS5vbihOZXR3b3JrLkV2ZW50LkVOVEVSX1JPT01fU1VDQ0VTUywgdGhpcy5fb25FbnRlclJvb21TdWNjZXNzLmJpbmQodGhpcykpO1xyXG4gICAgJChOZXR3b3JrKS5vbihOZXR3b3JrLkV2ZW50LkVOVEVSX1JPT01fRkFJTCwgdGhpcy5fb25FbnRlclJvb21GYWlsLmJpbmQodGhpcykpO1xyXG5cclxuICAgIHRoaXMucm9vbVVwZGF0ZUludGVydmFsID1cclxuICAgICAgICBzZXRJbnRlcnZhbCh0aGlzLnVwZGF0ZVJvb21MaXN0LmJpbmQodGhpcyksIExvYmJ5U2NlbmUuUk9PTV9VUERBVEVfRlJFUVVFTkNZKTtcclxuXHJcbiAgICB0aGlzLnVwZGF0ZVJvb21MaXN0KCk7XHJcbn07XHJcblxyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhMb2JieVNjZW5lLCB7XHJcbiAgICBST09NX1VQREFURV9GUkVRVUVOQ1kgOiB7XHJcbiAgICAgICAgdmFsdWUgOiA1MDAwXHJcbiAgICB9LFxyXG5cclxuICAgIEV2ZW50IDoge1xyXG4gICAgICAgIHZhbHVlIDoge1xyXG4gICAgICAgICAgICBQTEFZX0dBTUUgOiBcInBsYXktZ2FtZVwiXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KTtcclxuXHJcbkxvYmJ5U2NlbmUucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKFNjZW5lLnByb3RvdHlwZSwge1xyXG4gICAgZGVzdHJveSA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5sb2JieU92ZXJsYXkuZG9tT2JqZWN0LnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmRvbU9iamVjdC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5pbnB1dEZpZWxkLm9mZihcImtleXByZXNzXCIpO1xyXG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoaXMucm9vbVVwZGF0ZUludGVydmFsKTtcclxuICAgICAgICAgICAgJChOZXR3b3JrKS5vZmYoTmV0d29yay5FdmVudC5VUERBVEVfUk9PTVMpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgdXBkYXRlUm9vbUxpc3QgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIE5ldHdvcmsuZ2V0Um9vbXMoKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkxlYXZlUm9vbUJ1dHRvbkNsaWNrIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgTmV0d29yay5sZWF2ZVJvb20odGhpcy5jdXJSb29tSWQpO1xyXG4gICAgICAgICAgICB0aGlzLmN1clJvb21JZCA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vblBsYXlCdXR0b25DbGljayA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICQodGhpcykudHJpZ2dlcihMb2JieVNjZW5lLkV2ZW50LlBMQVlfR0FNRSwgdGhpcy5jdXJSb29tSWQpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uQ3JlYXRlUm9vbUJ1dHRvbkNsaWNrIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5pbnB1dEZpZWxkLm9mZihcImtleXByZXNzXCIpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5pbnB1dEZpZWxkLnZhbChcIlwiKTtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5kb21PYmplY3QucmVtb3ZlQ2xhc3MoXCJmYWRlLWluXCIpO1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmRvbU9iamVjdC5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuZG9tT2JqZWN0LmFkZENsYXNzKFwiZmFkZS1pblwiKTtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5pbnB1dEZpZWxkLmZvY3VzKCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmlucHV0RmllbGQub24oXCJrZXlwcmVzc1wiLCB0aGlzLl9vbkNyZWF0ZVJvb21LZXlQcmVzcy5iaW5kKHRoaXMpKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkNyZWF0ZVJvb21LZXlQcmVzcyA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT09IDEzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9vbkNyZWF0ZVJvb20oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uQ3JlYXRlUm9vbUNhbmNlbCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuZG9tT2JqZWN0LmhpZGUoKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkNyZWF0ZVJvb20gOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICB2YXIgbmFtZSA9IHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuaW5wdXRGaWVsZC52YWwoKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChuYW1lICE9PSBcIlwiKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmRvbU9iamVjdC5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICBOZXR3b3JrLmNyZWF0ZVJvb20obmFtZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgXHJcbiAgICBfb25Td2l0Y2hUZWFtQnV0dG9uQ2xpY2sgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBOZXR3b3JrLnN3aXRjaFRlYW0odGhpcy5jdXJSb29tSWQpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uVXBkYXRlUm9vbUxpc3QgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSwgZGF0YSkge1xyXG4gICAgICAgICAgICB0aGlzLmxvYmJ5T3ZlcmxheS5zaG93Um9vbXMoZGF0YSk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5jdXJSb29tSWQgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2JieU92ZXJsYXkucmVuZGVyUm9vbShkYXRhW3RoaXMuY3VyUm9vbUlkXSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvYmJ5T3ZlcmxheS5yZW5kZXJSb29tKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkVudGVyUm9vbUF0dGVtcHQgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSwgZGF0YSkge1xyXG4gICAgICAgICAgICBOZXR3b3JrLmVudGVyUm9vbShkYXRhLmlkKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkVudGVyUm9vbVN1Y2Nlc3MgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSwgZGF0YSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1clJvb21JZCA9IGRhdGEuaWQ7XHJcbiAgICAgICAgICAgIHRoaXMubG9iYnlPdmVybGF5LnJlbmRlclJvb20oZGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25FbnRlclJvb21GYWlsIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUsIGRhdGEpIHtcclxuICAgICAgICAgICAgYWxlcnQoZGF0YS5tc2cpO1xyXG4gICAgICAgICAgICB0aGlzLmN1clJvb21JZCA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgdGhpcy5sb2JieU92ZXJsYXkucmVuZGVyUm9vbSh1bmRlZmluZWQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkpO1xyXG5cclxuT2JqZWN0LmZyZWV6ZShMb2JieVNjZW5lKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTG9iYnlTY2VuZTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBOZXR3b3JrID0gcmVxdWlyZSgnLi4vbmV0d29yaycpO1xyXG52YXIgU2NlbmUgPSB3ZmwuZGlzcGxheS5TY2VuZTtcclxuXHJcbnZhciBOZXR3b3JrU2NlbmUgPSBmdW5jdGlvbiAoY2FudmFzLCByb29tSWQpIHtcclxuICAgIFNjZW5lLmNhbGwodGhpcywgY2FudmFzKTtcclxuXHJcbiAgICAvLyBBZGQgb3RoZXIgY2xpZW50cyB0aGF0IGFyZSBhbHJlYWR5IGNvbm5lY3RlZFxyXG4gICAgdmFyIHJvb20gPSBOZXR3b3JrLnJvb21zW3Jvb21JZF07XHJcbiAgICB2YXIgcGxheWVycyA9IHJvb20ucGxheWVycztcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBsYXllcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgaWQgPSBwbGF5ZXJzW2ldO1xyXG4gICAgICAgIHZhciBjbGllbnQgPSBOZXR3b3JrLmNsaWVudHNbaWRdO1xyXG5cclxuICAgICAgICBpZiAoY2xpZW50ICE9PSBOZXR3b3JrLmxvY2FsQ2xpZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkR2FtZU9iamVjdChjbGllbnQuZ2FtZU9iamVjdCwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5OZXR3b3JrU2NlbmUucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKFNjZW5lLnByb3RvdHlwZSwge1xyXG4gICAgb25BZGRDbGllbnQgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSwgY2xpZW50KSB7XHJcbiAgICAgICAgICAgIGlmIChjbGllbnQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWRkR2FtZU9iamVjdChjbGllbnQuZ2FtZU9iamVjdCwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIG9uUmVtb3ZlQ2xpZW50IDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUsIGNsaWVudCkge1xyXG4gICAgICAgICAgICBpZiAoY2xpZW50KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUdhbWVPYmplY3QoY2xpZW50LmdhbWVPYmplY3QsIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE5ldHdvcmtTY2VuZTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBMb2FkaW5nU2NlbmUgPSByZXF1aXJlKCcuL0xvYWRpbmdTY2VuZS5qcycpO1xyXG52YXIgTG9iYnlTY2VuZSA9IHJlcXVpcmUoJy4vTG9iYnlTY2VuZS5qcycpO1xyXG52YXIgTmV0d29ya1NjZW5lID0gcmVxdWlyZSgnLi9OZXR3b3JrU2NlbmUuanMnKTtcclxudmFyIEdhbWVTY2VuZSA9IHJlcXVpcmUoJy4vR2FtZVNjZW5lLmpzJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIExvYWRpbmdTY2VuZSA6IExvYWRpbmdTY2VuZSxcclxuICAgIExvYmJ5U2NlbmUgICA6IExvYmJ5U2NlbmUsXHJcbiAgICBOZXR3b3JrU2NlbmUgOiBOZXR3b3JrU2NlbmUsXHJcbiAgICBHYW1lU2NlbmUgICAgOiBHYW1lU2NlbmVcclxufTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgQkdfVElMRSAgICA6IFwiLi9hc3NldHMvaW1nL0JHLXRpbGUxLnBuZ1wiLFxyXG4gICAgQkxPQ0tfRlVMTCA6IFwiLi9hc3NldHMvaW1nL0Jsb2NrRnVsbC5wbmdcIixcclxuICAgIFBMQVlFUiAgICAgOiBcIi4vYXNzZXRzL2ltZy9TaGlwLnBuZ1wiLFxyXG4gICAgQ0xJRU5UICAgICA6IFwiLi9hc3NldHMvaW1nL090aGVyU2hpcC5wbmdcIixcclxuICAgIFxyXG4gICAgLy8gUHJlbG9hZGVyIHJlcGxhY2VzIGdldHRlciB3aXRoIGFwcHJvcHJpYXRlIGRlZmluaXRpb25cclxuICAgIGdldCAgICAgICAgOiBmdW5jdGlvbiAocGF0aCkgeyB9XHJcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgQXNzZXRzID0gcmVxdWlyZSgnLi9Bc3NldHMuanMnKTtcclxuXHJcbnZhciBQcmVsb2FkZXIgPSBmdW5jdGlvbiAob25Db21wbGV0ZSkge1xyXG4gICAgLy8gU2V0IHVwIHByZWxvYWRlclxyXG5cdHRoaXMucXVldWUgPSBuZXcgY3JlYXRlanMuTG9hZFF1ZXVlKGZhbHNlKTtcclxuXHJcbiAgICAvLyBSZXBsYWNlIGRlZmluaXRpb24gb2YgQXNzZXQgZ2V0dGVyIHRvIHVzZSB0aGUgZGF0YSBmcm9tIHRoZSBxdWV1ZVxyXG4gICAgQXNzZXRzLmdldCA9IHRoaXMucXVldWUuZ2V0UmVzdWx0LmJpbmQodGhpcy5xdWV1ZSk7XHJcblxyXG4gICAgLy8gT25jZSBldmVyeXRoaW5nIGhhcyBiZWVuIHByZWxvYWRlZCwgc3RhcnQgdGhlIGFwcGxpY2F0aW9uXHJcbiAgICBpZiAob25Db21wbGV0ZSkge1xyXG4gICAgICAgIHRoaXMucXVldWUub24oXCJjb21wbGV0ZVwiLCBvbkNvbXBsZXRlKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgbmVlZFRvTG9hZCA9IFtdO1xyXG5cclxuICAgIC8vIFByZXBhcmUgdG8gbG9hZCBpbWFnZXNcclxuICAgIGZvciAodmFyIGltZyBpbiBBc3NldHMpIHtcclxuICAgICAgICB2YXIgaW1nT2JqID0ge1xyXG4gICAgICAgICAgICBpZCA6IGltZyxcclxuICAgICAgICAgICAgc3JjIDogQXNzZXRzW2ltZ11cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG5lZWRUb0xvYWQucHVzaChpbWdPYmopO1xyXG4gICAgfVxyXG5cclxuXHR0aGlzLnF1ZXVlLmxvYWRNYW5pZmVzdChuZWVkVG9Mb2FkKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUHJlbG9hZGVyOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIEFzc2V0cyA9IHJlcXVpcmUoJy4vQXNzZXRzLmpzJyk7XHJcbnZhciBQcmVsb2FkZXIgPSByZXF1aXJlKCcuL1ByZWxvYWRlci5qcycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBBc3NldHMgOiBBc3NldHMsXHJcbiAgICBQcmVsb2FkZXIgOiBQcmVsb2FkZXJcclxufTsiXX0=
