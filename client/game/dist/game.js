(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.cf = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var util = require('../util');
var Assets = util.Assets;
var GameObject = wfl.core.entities.GameObject;
var PhysicsObject = wfl.core.entities.PhysicsObject;
var geom = wfl.geom;

/**
 * Projectiles created from a Ship
 */
var Bullet = function (damage, creator) {
    if (isNaN(damage) || damage <= 0) {
        damage = 1;
    }

    PhysicsObject.call(this);
    
    this.creator = creator;
    this.customData.team = creator.customData.team;
    this.customData.ignoreFriction = true;

    // Create default state
    this.graphic1 = Assets.get(Assets.WEAK_BULLET_1);
    this.graphic2 = Assets.get(Assets.WEAK_BULLET_2);
    this.graphic3 = Assets.get(Assets.WEAK_BULLET_3);
    this.graphic4 = Assets.get(Assets.WEAK_BULLET_4);
    this.defaultState = this.createState();
    this.defaultState.addFrame(
        this.createFrame(this.graphic1, 2)
    );
    this.defaultState.addFrame(
        this.createFrame(this.graphic2, 2)
    );
    this.defaultState.addFrame(
        this.createFrame(this.graphic3, 2)
    );
    this.defaultState.addFrame(
        this.createFrame(this.graphic4, 2)
    );
    this.addState(GameObject.STATE.DEFAULT, this.defaultState);

    this.damage = damage;
    this.age = 0;
    this.lifeTime = Bullet.DEFAULT_MAX_LIFE_TIME;
    this.maxSpeed = Bullet.DEFAULT_MAX_SPEED;
    this.solid = true;
};
Object.defineProperties(Bullet, {
    DEFAULT_MAX_LIFE_TIME : {
        value : 40
    },

    DEFAULT_SPEED : {
        value : 0.65
    },

    DEFAULT_MAX_SPEED : {
        value : 0.8
    }
});
Bullet.prototype = Object.freeze(Object.create(PhysicsObject.prototype, {
    update : {
        value : function (dt) {
            PhysicsObject.prototype.update.call(this, dt);

            this.age++;

            if (this.age >= this.lifeTime) {
                this.customData.removed = true;
            }
        }
    },

    resolveCollision : {
        value : function (physObj, collisionData) {
            var team = this.customData.team;
            var otherTeam = physObj.customData.team;
        
            if (physObj !== this.creator && physObj.solid) {
                this.customData.removed = true;
                
                // If hitting something that's on a team (player, bullet, etc)...
                if (otherTeam !== undefined) {
                    // If the bullet hits a player on a different team, deal damage to them
                    if (otherTeam !== team && physObj.takeDamage) {
                        physObj.takeDamage(this.damage);
                    }
                }
            }
        }
    }
}));
Object.freeze(Bullet);

module.exports = Bullet;
},{"../util":22}],2:[function(require,module,exports){
"use strict";

var util = require('../util');
var Assets = util.Assets;
var Player = require('./Player');
var GameObject = wfl.core.entities.GameObject;
var LivingObject = wfl.core.entities.LivingObject;
var geom = wfl.geom;

var ClientPlayer = function (team) {
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
    },

    resolveCollision : {
        value : function (physObj, collisionData) {
            Player.prototype.resolveCollision.call(this, physObj, collisionData);
        }
    }
}));
Object.freeze(ClientPlayer);

module.exports = ClientPlayer;
},{"../util":22,"./Player":4}],3:[function(require,module,exports){
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
},{"../util":22}],4:[function(require,module,exports){
"use strict";

var util = require('../util');
var Assets = util.Assets;
var Network = require('../network');
var GameObject = wfl.core.entities.GameObject;
var LivingObject = wfl.core.entities.LivingObject;
var geom = wfl.geom;

var Player = function (team) {
    LivingObject.call(this);

    this.solid = true;

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

    this.shootTimer = 0;
    this.maxShootTimer = Player.DEFAULT_MAX_SHOOT_TIMER;

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
},{"../network":9,"../util":22}],5:[function(require,module,exports){
"use strict";

var FullBlock = require('./FullBlock.js');
var Player = require('./Player.js');
var ClientPlayer = require('./ClientPlayer.js');
var Bullet = require('./Bullet.js');

module.exports = {
    FullBlock    : FullBlock,
    Player       : Player,
    ClientPlayer : ClientPlayer,
    Bullet       : Bullet
};
},{"./Bullet.js":1,"./ClientPlayer.js":2,"./FullBlock.js":3,"./Player.js":4}],6:[function(require,module,exports){
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

var goToGame = function (room) {
    // Update the game with the current time because the dt will be huge next
    // update since the game was stopped while in the lobby
    game.update(Date.now());

    $(game.getScene()).off();

    var gameScene = new scenes.GameScene(canvas, room);
    game.setScene(gameScene);

    $(Network).on(
        Network.Event.CLOCK_TICK,
        gameScene.onClockTick.bind(gameScene)
    );

    $(Network).on(
        Network.Event.END_GAME,
        onEndGame
    );

    // Start the game since it was stopped to help performance with overlays on
    // a canvas
    game.start();
};

var goToLobby = function () {
    // Stop the game so that canvas updates don't affect performance with
    // overlays
    game.stop();

    // Reset all listeners on the Network
    $(Network).off();

    var lobbyScene = new scenes.LobbyScene(canvas);
    game.setScene(lobbyScene);

    $(Network).on(
        Network.Event.START_GAME,
        onStartGame
    );

    // Transition the page's BG color to black to hide the BG image which
    // becomes distracting during game play
    $("body").css({"background-color": "#071213"});
};

var onStartGame = function (e, room) {
    goToGame(room);
};

var onEndGame = function (e, room) {
    goToLobby();

    // Trigger an event so the lobby scene knows to join the room it was just
    // in before playing the game
    Network._onEnterRoomSuccess(room);
};

var onNetworkConnect = function () {
    goToLobby();
};

var Preloader = new util.Preloader(onLoad.bind(this));
},{"./network":9,"./overlays":14,"./scenes":19,"./util":22}],7:[function(require,module,exports){
"use strict";

var entities = require('../entities');

var Client = function (id, data) {
    this.id = id;
    this.data = data;
    this.gameObject = undefined;
};
Object.freeze(Client);

module.exports = Client;
},{"../entities":5}],8:[function(require,module,exports){
"use strict";

var entities = require('../entities');

var LocalClient = function (id, data) {
    this.id = id;
    this.data = data;
    this.gameObject = undefined;
};
Object.freeze(LocalClient);

module.exports = LocalClient;
},{"../entities":5}],9:[function(require,module,exports){
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
        START_GAME         : "startGame",
        END_GAME           : "endGame",
        BULLET             : "bullet",
        CLOCK_TICK         : "clockTick"
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
        this.socket.on('endGame', this._onEndGame.bind(this));
        this.socket.on('bullet', this._onBullet.bind(this));
        this.socket.on('clockTick', this._onClockTick.bind(this));

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

    isHost : function () {
        return this.hostId === this.localClient.id;
    },

    _onConfirmClient : function (data) {
        var id = data.id;
        this.localClient = new LocalClient(id, data);
        this.clients[id] = this.localClient;

        this.connected = true;

        $(this).trigger(
            this.Event.CONNECT
        );
    },

    _onAddOtherClient : function (data) {
        var id = data.id;
        var newClient = new Client(id, data);

        this.clients[data.id] = newClient;
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

        if (client.gameObject) {
            client.gameObject.position.x = data.position.x;
            client.gameObject.position.y = data.position.y;
            client.gameObject.velocity.x = data.velocity.x;
            client.gameObject.velocity.y = data.velocity.y;
            client.gameObject.acceleration.x = data.acceleration.x;
            client.gameObject.acceleration.y = data.acceleration.y;
            client.gameObject.setRotation(data.rotation);
        }
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
    },

    _onStartGame : function (data) {
        $(this).trigger(
            this.Event.START_GAME,
            data
        );
    },

    _onEndGame : function (data) {
        var room = this.rooms[data.id];

        for (var i = 0; i < room.players.length; i++) {
            this.clients[room.players[i]].data.ready = false;
        }

        this.localClient.data.ready = false;

        $(this).trigger(
            this.Event.END_GAME,
            data
        );
    },

    _onBullet : function (data) {
        $(this).trigger(
            this.Event.BULLET,
            data
        );
    },

    _onClockTick : function (data) {
        $(this).trigger(
            this.Event.CLOCK_TICK,
            data
        );
    }
};

module.exports = Network;

var Client = require('./Client.js');
var LocalClient = require('./LocalClient.js');
},{"./Client.js":7,"./LocalClient.js":8}],10:[function(require,module,exports){
"use strict";

var Overlay = require('./Overlay.js');

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
},{"./Overlay.js":13}],11:[function(require,module,exports){
"use strict";

var Overlay = require('./Overlay.js');

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
},{"./Overlay.js":13}],12:[function(require,module,exports){
"use strict";

var Overlay = require('./Overlay.js');
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
},{"../network":9,"./Overlay.js":13}],13:[function(require,module,exports){
"use strict";

var Overlay = function () {
    this.domObject = $("<div>");
    this.domObject.addClass("canvas-overlay");
};

Overlay.prototype = Object.freeze(Object.create(Overlay.prototype, {

}));

module.exports = Overlay;
},{}],14:[function(require,module,exports){
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
},{"./CreateRoomOverlay.js":10,"./LoadingOverlay.js":11,"./LobbyOverlay.js":12,"./Overlay.js":13}],15:[function(require,module,exports){
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

var GameScene = function (canvas, room) {
    NetworkScene.call(this, canvas, room);

    this.timeRemaining = room.timeRemaining;

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

    this.player = new Player(Network.localClient.data.team);
    Network.localClient.gameObject = this.player;
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
    /**
     * Updates the scene and all game objects in it
     */
    update : {
        value : function (dt) {
            this.timeRemaining -= dt;
console.log(dt);
            // Apply friction
            var gameObjects = this.getGameObjects();
            for (var i = 0; i < gameObjects.length; i++) {
                var obj = gameObjects[i];
                if (!obj.customData.ignoreFriction) {
                    obj.acceleration.multiply(GameScene.FRICTION);
                    obj.velocity.multiply(GameScene.FRICTION);
                }
            }

            NetworkScene.prototype.update.call(this, dt);

            this.handleInput();

            // Go through all game objects and remove any that have been
            // flagged for removal
            gameObjects = this.getGameObjects(); // Get again in case of changes
            for (var i = gameObjects.length - 1; i >= 0; i--) {
                var obj = gameObjects[i];

                if (obj.customData.removed === true) {
                    this.removeGameObject(obj);
                }
            }

            if (Network.isHost()) {
                this.sendHostData();
            }
        }
    },

    sendHostData : {
        value : function () {
            if (Network.connected) {
                Network.socket.emit('clockTick', {
                    timeRemaining : this.timeRemaining
                });
            }
        }
    },

    /**
     * Draws the scene and all game objects in it
     */
    draw : {
        value : function (ctx) {
            NetworkScene.prototype.draw.call(this, ctx);

            ctx.save();

            var screenWidth  = ctx.canvas.width;
            var screenHeight = ctx.canvas.height;
            var offset       = new geom.Vec2(
                screenWidth  * 0.5,
                screenHeight * 0.5
            );

            var timeText;

            if (this.timeRemaining > 0) {
                var minutes = Math.floor(this.timeRemaining / (1000 * 60));
                var seconds = Math.floor((this.timeRemaining - minutes * 1000 * 60) / 1000);
                timeText = minutes + ":";

                if (seconds < 10) {
                    timeText += "0";
                }

                timeText += seconds;
            } else {
                timeText = "0:00";
            }

            ctx.translate(offset.x, 0);
            ctx.fillStyle = "#fff";
            ctx.textAlign = "center";
            ctx.font = "24px Munro";
            ctx.textBaseline = "top";
            ctx.fillText(timeText, 0, 0);

            ctx.restore();
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
            var shooting     = keyboard.isPressed(keyboard.Z);

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

            if (shooting) {
                player.shoot();
            }
        }
    },

    onClockTick : {
        value : function (e, data) {
            this.timeRemaining = data.timeRemaining;
        }
    }
}));

module.exports = GameScene;
},{"../entities":5,"../network":9,"../util":22,"./NetworkScene":18}],16:[function(require,module,exports){
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
},{"../overlays":14}],17:[function(require,module,exports){
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
            $(Network).off(Network.Event.ENTER_ROOM_SUCCESS);
            $(Network).off(Network.Event.ENTER_ROOM_FAIL);
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
            console.log("CLICKED READY BUTTON");
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
},{"../network":9,"../overlays":14}],18:[function(require,module,exports){
"use strict";

var Network = require('../network');
var Scene = wfl.display.Scene;
var PhysicsObject = wfl.core.entities.PhysicsObject;
var entities = require('../entities');
var Bullet = entities.Bullet;
var ClientPlayer = entities.ClientPlayer;
var geom = wfl.geom;

var NetworkScene = function (canvas, room) {
    Scene.call(this, canvas);

    // Add other clients that are already connected
    var room = Network.rooms[room.id];
    var players = room.players;

    for (var i = 0; i < players.length; i++) {
        var id = players[i];
        var client = Network.clients[id];

        if (client !== Network.localClient) {
            var gameObject = new ClientPlayer(client.data.team);
            client.gameObject = gameObject;
            this.addGameObject(gameObject, 1);
        }
    }
    
    $(Network).on(Network.Event.BULLET, this._onBullet.bind(this));
};
NetworkScene.prototype = Object.freeze(Object.create(Scene.prototype, {
    /**
     * Clears up references used in the scene
     */
    destroy : {
        value : function () {
            $(Network).off(Network.Event.BULLET);
        }
    },
    
    _onBullet : {
        value : function (e, data) {
            var rotation = PhysicsObject.prototype.getDisplayAngle(data.rotation);
            var forward = geom.Vec2.fromAngle(rotation);
            var player = Network.clients[data.playerId].gameObject;
            var bullet = new Bullet(1, player);
            bullet.position.x = data.position.x;
            bullet.position.y = data.position.y;
            bullet.velocity.x = forward.x;
            bullet.velocity.y = forward.y;
            bullet.rotate(rotation);
            bullet.velocity.multiply(Bullet.DEFAULT_SPEED);
            bullet.velocity.x += data.velocity.x;
            bullet.velocity.y += data.velocity.y;
            
            if (bullet.velocity.getMagnitudeSquared() < Bullet.DEFAULT_SPEED * Bullet.DEFAULT_SPEED) {
                bullet.velocity.setMagnitude(Bullet.DEFAULT_SPEED);
            }
            
            this.addGameObject(bullet, 1);
        }
    }
}));

module.exports = NetworkScene;
},{"../entities":5,"../network":9}],19:[function(require,module,exports){
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
},{"./GameScene.js":15,"./LoadingScene.js":16,"./LobbyScene.js":17,"./NetworkScene.js":18}],20:[function(require,module,exports){
"use strict";

module.exports = {
    BG_TILE       : "./assets/img/BG-tile1.png",
    BLOCK_FULL    : "./assets/img/BlockFull.png",
    SHIP_1        : "./assets/img/OtherShip.png",
    SHIP_2        : "./assets/img/Ship.png",
    WEAK_BULLET_1 : "./assets/img/BulletWeak_a.png",
    WEAK_BULLET_2 : "./assets/img/BulletWeak_b.png",
    WEAK_BULLET_3 : "./assets/img/BulletWeak_c.png",
    WEAK_BULLET_4 : "./assets/img/BulletWeak_d.png",
    
    // Preloader replaces getter with appropriate definition
    get        : function (path) { }
};
},{}],21:[function(require,module,exports){
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
},{"./Assets.js":20}],22:[function(require,module,exports){
"use strict";

var Assets = require('./Assets.js');
var Preloader = require('./Preloader.js');

module.exports = {
    Assets    : Assets,
    Preloader : Preloader
};
},{"./Assets.js":20,"./Preloader.js":21}]},{},[6])(6)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvZ2FtZS9zcmMvZW50aXRpZXMvQnVsbGV0LmpzIiwiY2xpZW50L2dhbWUvc3JjL2VudGl0aWVzL0NsaWVudFBsYXllci5qcyIsImNsaWVudC9nYW1lL3NyYy9lbnRpdGllcy9GdWxsQmxvY2suanMiLCJjbGllbnQvZ2FtZS9zcmMvZW50aXRpZXMvUGxheWVyLmpzIiwiY2xpZW50L2dhbWUvc3JjL2VudGl0aWVzL2luZGV4LmpzIiwiY2xpZW50L2dhbWUvc3JjL2luZGV4LmpzIiwiY2xpZW50L2dhbWUvc3JjL25ldHdvcmsvQ2xpZW50LmpzIiwiY2xpZW50L2dhbWUvc3JjL25ldHdvcmsvTG9jYWxDbGllbnQuanMiLCJjbGllbnQvZ2FtZS9zcmMvbmV0d29yay9pbmRleC5qcyIsImNsaWVudC9nYW1lL3NyYy9vdmVybGF5cy9DcmVhdGVSb29tT3ZlcmxheS5qcyIsImNsaWVudC9nYW1lL3NyYy9vdmVybGF5cy9Mb2FkaW5nT3ZlcmxheS5qcyIsImNsaWVudC9nYW1lL3NyYy9vdmVybGF5cy9Mb2JieU92ZXJsYXkuanMiLCJjbGllbnQvZ2FtZS9zcmMvb3ZlcmxheXMvT3ZlcmxheS5qcyIsImNsaWVudC9nYW1lL3NyYy9vdmVybGF5cy9pbmRleC5qcyIsImNsaWVudC9nYW1lL3NyYy9zY2VuZXMvR2FtZVNjZW5lLmpzIiwiY2xpZW50L2dhbWUvc3JjL3NjZW5lcy9Mb2FkaW5nU2NlbmUuanMiLCJjbGllbnQvZ2FtZS9zcmMvc2NlbmVzL0xvYmJ5U2NlbmUuanMiLCJjbGllbnQvZ2FtZS9zcmMvc2NlbmVzL05ldHdvcmtTY2VuZS5qcyIsImNsaWVudC9nYW1lL3NyYy9zY2VuZXMvaW5kZXguanMiLCJjbGllbnQvZ2FtZS9zcmMvdXRpbC9Bc3NldHMuanMiLCJjbGllbnQvZ2FtZS9zcmMvdXRpbC9QcmVsb2FkZXIuanMiLCJjbGllbnQvZ2FtZS9zcmMvdXRpbC9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcclxudmFyIEFzc2V0cyA9IHV0aWwuQXNzZXRzO1xyXG52YXIgR2FtZU9iamVjdCA9IHdmbC5jb3JlLmVudGl0aWVzLkdhbWVPYmplY3Q7XHJcbnZhciBQaHlzaWNzT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuUGh5c2ljc09iamVjdDtcclxudmFyIGdlb20gPSB3ZmwuZ2VvbTtcclxuXHJcbi8qKlxyXG4gKiBQcm9qZWN0aWxlcyBjcmVhdGVkIGZyb20gYSBTaGlwXHJcbiAqL1xyXG52YXIgQnVsbGV0ID0gZnVuY3Rpb24gKGRhbWFnZSwgY3JlYXRvcikge1xyXG4gICAgaWYgKGlzTmFOKGRhbWFnZSkgfHwgZGFtYWdlIDw9IDApIHtcclxuICAgICAgICBkYW1hZ2UgPSAxO1xyXG4gICAgfVxyXG5cclxuICAgIFBoeXNpY3NPYmplY3QuY2FsbCh0aGlzKTtcclxuICAgIFxyXG4gICAgdGhpcy5jcmVhdG9yID0gY3JlYXRvcjtcclxuICAgIHRoaXMuY3VzdG9tRGF0YS50ZWFtID0gY3JlYXRvci5jdXN0b21EYXRhLnRlYW07XHJcbiAgICB0aGlzLmN1c3RvbURhdGEuaWdub3JlRnJpY3Rpb24gPSB0cnVlO1xyXG5cclxuICAgIC8vIENyZWF0ZSBkZWZhdWx0IHN0YXRlXHJcbiAgICB0aGlzLmdyYXBoaWMxID0gQXNzZXRzLmdldChBc3NldHMuV0VBS19CVUxMRVRfMSk7XHJcbiAgICB0aGlzLmdyYXBoaWMyID0gQXNzZXRzLmdldChBc3NldHMuV0VBS19CVUxMRVRfMik7XHJcbiAgICB0aGlzLmdyYXBoaWMzID0gQXNzZXRzLmdldChBc3NldHMuV0VBS19CVUxMRVRfMyk7XHJcbiAgICB0aGlzLmdyYXBoaWM0ID0gQXNzZXRzLmdldChBc3NldHMuV0VBS19CVUxMRVRfNCk7XHJcbiAgICB0aGlzLmRlZmF1bHRTdGF0ZSA9IHRoaXMuY3JlYXRlU3RhdGUoKTtcclxuICAgIHRoaXMuZGVmYXVsdFN0YXRlLmFkZEZyYW1lKFxyXG4gICAgICAgIHRoaXMuY3JlYXRlRnJhbWUodGhpcy5ncmFwaGljMSwgMilcclxuICAgICk7XHJcbiAgICB0aGlzLmRlZmF1bHRTdGF0ZS5hZGRGcmFtZShcclxuICAgICAgICB0aGlzLmNyZWF0ZUZyYW1lKHRoaXMuZ3JhcGhpYzIsIDIpXHJcbiAgICApO1xyXG4gICAgdGhpcy5kZWZhdWx0U3RhdGUuYWRkRnJhbWUoXHJcbiAgICAgICAgdGhpcy5jcmVhdGVGcmFtZSh0aGlzLmdyYXBoaWMzLCAyKVxyXG4gICAgKTtcclxuICAgIHRoaXMuZGVmYXVsdFN0YXRlLmFkZEZyYW1lKFxyXG4gICAgICAgIHRoaXMuY3JlYXRlRnJhbWUodGhpcy5ncmFwaGljNCwgMilcclxuICAgICk7XHJcbiAgICB0aGlzLmFkZFN0YXRlKEdhbWVPYmplY3QuU1RBVEUuREVGQVVMVCwgdGhpcy5kZWZhdWx0U3RhdGUpO1xyXG5cclxuICAgIHRoaXMuZGFtYWdlID0gZGFtYWdlO1xyXG4gICAgdGhpcy5hZ2UgPSAwO1xyXG4gICAgdGhpcy5saWZlVGltZSA9IEJ1bGxldC5ERUZBVUxUX01BWF9MSUZFX1RJTUU7XHJcbiAgICB0aGlzLm1heFNwZWVkID0gQnVsbGV0LkRFRkFVTFRfTUFYX1NQRUVEO1xyXG4gICAgdGhpcy5zb2xpZCA9IHRydWU7XHJcbn07XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKEJ1bGxldCwge1xyXG4gICAgREVGQVVMVF9NQVhfTElGRV9USU1FIDoge1xyXG4gICAgICAgIHZhbHVlIDogNDBcclxuICAgIH0sXHJcblxyXG4gICAgREVGQVVMVF9TUEVFRCA6IHtcclxuICAgICAgICB2YWx1ZSA6IDAuNjVcclxuICAgIH0sXHJcblxyXG4gICAgREVGQVVMVF9NQVhfU1BFRUQgOiB7XHJcbiAgICAgICAgdmFsdWUgOiAwLjhcclxuICAgIH1cclxufSk7XHJcbkJ1bGxldC5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoUGh5c2ljc09iamVjdC5wcm90b3R5cGUsIHtcclxuICAgIHVwZGF0ZSA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChkdCkge1xyXG4gICAgICAgICAgICBQaHlzaWNzT2JqZWN0LnByb3RvdHlwZS51cGRhdGUuY2FsbCh0aGlzLCBkdCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmFnZSsrO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuYWdlID49IHRoaXMubGlmZVRpbWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VzdG9tRGF0YS5yZW1vdmVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgcmVzb2x2ZUNvbGxpc2lvbiA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChwaHlzT2JqLCBjb2xsaXNpb25EYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciB0ZWFtID0gdGhpcy5jdXN0b21EYXRhLnRlYW07XHJcbiAgICAgICAgICAgIHZhciBvdGhlclRlYW0gPSBwaHlzT2JqLmN1c3RvbURhdGEudGVhbTtcclxuICAgICAgICBcclxuICAgICAgICAgICAgaWYgKHBoeXNPYmogIT09IHRoaXMuY3JlYXRvciAmJiBwaHlzT2JqLnNvbGlkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbURhdGEucmVtb3ZlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIC8vIElmIGhpdHRpbmcgc29tZXRoaW5nIHRoYXQncyBvbiBhIHRlYW0gKHBsYXllciwgYnVsbGV0LCBldGMpLi4uXHJcbiAgICAgICAgICAgICAgICBpZiAob3RoZXJUZWFtICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgYnVsbGV0IGhpdHMgYSBwbGF5ZXIgb24gYSBkaWZmZXJlbnQgdGVhbSwgZGVhbCBkYW1hZ2UgdG8gdGhlbVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvdGhlclRlYW0gIT09IHRlYW0gJiYgcGh5c09iai50YWtlRGFtYWdlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBoeXNPYmoudGFrZURhbWFnZSh0aGlzLmRhbWFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSk7XHJcbk9iamVjdC5mcmVlemUoQnVsbGV0KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQnVsbGV0OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyk7XHJcbnZhciBBc3NldHMgPSB1dGlsLkFzc2V0cztcclxudmFyIFBsYXllciA9IHJlcXVpcmUoJy4vUGxheWVyJyk7XHJcbnZhciBHYW1lT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuR2FtZU9iamVjdDtcclxudmFyIExpdmluZ09iamVjdCA9IHdmbC5jb3JlLmVudGl0aWVzLkxpdmluZ09iamVjdDtcclxudmFyIGdlb20gPSB3ZmwuZ2VvbTtcclxuXHJcbnZhciBDbGllbnRQbGF5ZXIgPSBmdW5jdGlvbiAodGVhbSkge1xyXG4gICAgTGl2aW5nT2JqZWN0LmNhbGwodGhpcyk7XHJcblxyXG4gICAgdGhpcy5jdXN0b21EYXRhLnRlYW0gPSB0ZWFtO1xyXG5cclxuICAgIHZhciBzaGlwVHlwZTtcclxuICAgIGlmICh0ZWFtID09PSAwKSB7XHJcbiAgICAgICAgc2hpcFR5cGUgPSBBc3NldHMuU0hJUF8xO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBzaGlwVHlwZSA9IEFzc2V0cy5TSElQXzI7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ3JlYXRlIGRlZmF1bHQgc3RhdGVcclxuICAgIHRoaXMuZGVmYXVsdEdyYXBoaWMgPSBBc3NldHMuZ2V0KHNoaXBUeXBlKTtcclxuXHJcbiAgICB2YXIgdyA9IHRoaXMuZGVmYXVsdEdyYXBoaWMud2lkdGg7XHJcbiAgICB2YXIgaCA9IHRoaXMuZGVmYXVsdEdyYXBoaWMuaGVpZ2h0O1xyXG4gICAgdmFyIHZlcnRzID0gW1xyXG4gICAgICAgIG5ldyBnZW9tLlZlYzIoLXcgKiAwLjUsIC1oICogMC41KSxcclxuICAgICAgICBuZXcgZ2VvbS5WZWMyKHcgKiAwLjUsIDApLFxyXG4gICAgICAgIG5ldyBnZW9tLlZlYzIoLXcgKiAwLjUsIGggKiAwLjUpXHJcbiAgICBdO1xyXG4gICAgdmFyIGZyYW1lT2JqID0gdGhpcy5jcmVhdGVGcmFtZSh0aGlzLmRlZmF1bHRHcmFwaGljLCAxLCBmYWxzZSk7XHJcbiAgICBmcmFtZU9iai52ZXJ0aWNlcyA9IHZlcnRzO1xyXG5cclxuICAgIHRoaXMuZGVmYXVsdFN0YXRlID0gdGhpcy5jcmVhdGVTdGF0ZSgpO1xyXG4gICAgdGhpcy5kZWZhdWx0U3RhdGUuYWRkRnJhbWUoZnJhbWVPYmopO1xyXG4gICAgdGhpcy5hZGRTdGF0ZShHYW1lT2JqZWN0LlNUQVRFLkRFRkFVTFQsIHRoaXMuZGVmYXVsdFN0YXRlKTtcclxuXHJcbiAgICB0aGlzLnJvdGF0ZSgtTWF0aC5QSSAqIDAuNSk7XHJcbn07XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKENsaWVudFBsYXllciwge1xyXG4gICAgQVJSSVZBTF9TTE9XSU5HX1JBRElVUyA6IHtcclxuICAgICAgICB2YWx1ZSA6IDIwMFxyXG4gICAgfSxcclxuXHJcbiAgICBNSU5fQVJSSVZBTF9SQURJVVMgOiB7XHJcbiAgICAgICAgdmFsdWUgOiA4XHJcbiAgICB9LFxyXG5cclxuICAgIE1JTklNQVBfRklMTF9TVFlMRSA6IHtcclxuICAgICAgICB2YWx1ZSA6IFwiIzA2YzgzM1wiXHJcbiAgICB9XHJcbn0pO1xyXG5DbGllbnRQbGF5ZXIucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKExpdmluZ09iamVjdC5wcm90b3R5cGUsIHtcclxuICAgIGRyYXdPbk1pbmltYXAgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoY3R4KSB7XHJcbiAgICAgICAgICAgIHZhciB3ID0gdGhpcy5nZXRXaWR0aCgpO1xyXG4gICAgICAgICAgICB2YXIgaCA9IHRoaXMuZ2V0SGVpZ2h0KCk7XHJcbiAgICAgICAgICAgIHZhciBvZmZzZXRYID0gTWF0aC5yb3VuZCgtdyAqIDAuNSk7XHJcbiAgICAgICAgICAgIHZhciBvZmZzZXRZID0gTWF0aC5yb3VuZCgtaCAqIDAuNSk7XHJcbiAgICAgICAgICAgIHZhciBkaXNwbGF5V2lkdGggPSBNYXRoLnJvdW5kKHcpO1xyXG4gICAgICAgICAgICB2YXIgZGlzcGxheUhlaWdodCA9IE1hdGgucm91bmQoaCk7XHJcblxyXG4gICAgICAgICAgICBjdHguc2F2ZSgpO1xyXG5cclxuICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IENsaWVudFBsYXllci5NSU5JTUFQX0ZJTExfU1RZTEU7XHJcbiAgICAgICAgICAgIGN0eC5maWxsUmVjdChvZmZzZXRYLCBvZmZzZXRZLCBkaXNwbGF5V2lkdGgsIGRpc3BsYXlIZWlnaHQpO1xyXG5cclxuICAgICAgICAgICAgY3R4LnJlc3RvcmUoKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHJlc29sdmVDb2xsaXNpb24gOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAocGh5c09iaiwgY29sbGlzaW9uRGF0YSkge1xyXG4gICAgICAgICAgICBQbGF5ZXIucHJvdG90eXBlLnJlc29sdmVDb2xsaXNpb24uY2FsbCh0aGlzLCBwaHlzT2JqLCBjb2xsaXNpb25EYXRhKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKTtcclxuT2JqZWN0LmZyZWV6ZShDbGllbnRQbGF5ZXIpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDbGllbnRQbGF5ZXI7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcclxudmFyIEFzc2V0cyA9IHV0aWwuQXNzZXRzO1xyXG52YXIgR2FtZU9iamVjdCA9IHdmbC5jb3JlLmVudGl0aWVzLkdhbWVPYmplY3Q7XHJcbnZhciBQaHlzaWNzT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuUGh5c2ljc09iamVjdDtcclxuXHJcbi8qKlxyXG4gKiBBIGZ1bGwtc2l6ZWQsIHF1YWRyaWxhdGVyYWwgYmxvY2tcclxuICovXHJcbnZhciBGdWxsQmxvY2sgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBQaHlzaWNzT2JqZWN0LmNhbGwodGhpcyk7XHJcblxyXG4gICAgdGhpcy5pZCA9IEZ1bGxCbG9jay5pZDtcclxuXHJcbiAgICAvLyBDcmVhdGUgZGVmYXVsdCBzdGF0ZVxyXG4gICAgdGhpcy5kZWZhdWx0R3JhcGhpYyA9IEFzc2V0cy5nZXQoQXNzZXRzLkJMT0NLX0ZVTEwpO1xyXG4gICAgdGhpcy5kZWZhdWx0U3RhdGUgPSB0aGlzLmNyZWF0ZVN0YXRlKCk7XHJcbiAgICB0aGlzLmRlZmF1bHRTdGF0ZS5hZGRGcmFtZShcclxuICAgICAgICB0aGlzLmNyZWF0ZUZyYW1lKHRoaXMuZGVmYXVsdEdyYXBoaWMpXHJcbiAgICApO1xyXG4gICAgdGhpcy5hZGRTdGF0ZShHYW1lT2JqZWN0LlNUQVRFLkRFRkFVTFQsIHRoaXMuZGVmYXVsdFN0YXRlKTtcclxuXHJcbiAgICB0aGlzLnNvbGlkID0gdHJ1ZTtcclxuICAgIHRoaXMuZml4ZWQgPSB0cnVlO1xyXG4gICAgdGhpcy5yb3RhdGUoLU1hdGguUEkgKiAwLjUpO1xyXG59O1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhGdWxsQmxvY2ssIHtcclxuICAgIG5hbWUgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBcIkZ1bGxCbG9ja1wiXHJcbiAgICB9LFxyXG5cclxuICAgIGlkIDoge1xyXG4gICAgICAgIHZhbHVlIDogMFxyXG4gICAgfVxyXG59KTtcclxuRnVsbEJsb2NrLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShQaHlzaWNzT2JqZWN0LnByb3RvdHlwZSwge1xyXG4gICAgZHJhd09uTWluaW1hcCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChjdHgpIHtcclxuICAgICAgICAgICAgdmFyIHcgPSB0aGlzLmdldFdpZHRoKCk7XHJcbiAgICAgICAgICAgIHZhciBoID0gdGhpcy5nZXRIZWlnaHQoKTtcclxuICAgICAgICAgICAgdmFyIG9mZnNldFggPSBNYXRoLnJvdW5kKC13ICogMC41KTtcclxuICAgICAgICAgICAgdmFyIG9mZnNldFkgPSBNYXRoLnJvdW5kKC1oICogMC41KTtcclxuICAgICAgICAgICAgdmFyIGRpc3BsYXlXaWR0aCA9IE1hdGgucm91bmQodyk7XHJcbiAgICAgICAgICAgIHZhciBkaXNwbGF5SGVpZ2h0ID0gTWF0aC5yb3VuZChoKTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5zYXZlKCk7XHJcblxyXG4gICAgICAgICAgICBjdHgucm90YXRlKHRoaXMuZ2V0Um90YXRpb24oKSk7XHJcblxyXG4gICAgICAgICAgICAvKmN0eC5maWxsU3R5bGUgPVxyXG4gICAgICAgICAgICAgICAgYXBwLmdhbWVvYmplY3QuUGh5c2ljc09iamVjdC5NSU5JTUFQX0ZJTExfU1RZTEU7XHJcbiAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZSA9XHJcbiAgICAgICAgICAgICAgICBhcHAuZ2FtZW9iamVjdC5QaHlzaWNzT2JqZWN0Lk1JTklNQVBfU1RST0tFX1NUWUxFOyovXHJcblxyXG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICAgIGN0eC5yZWN0KG9mZnNldFgsIG9mZnNldFksIGRpc3BsYXlXaWR0aCwgZGlzcGxheUhlaWdodCk7XHJcbiAgICAgICAgICAgIGN0eC5maWxsKCk7XHJcbiAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5yZXN0b3JlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSk7XHJcbk9iamVjdC5mcmVlemUoRnVsbEJsb2NrKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRnVsbEJsb2NrOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyk7XHJcbnZhciBBc3NldHMgPSB1dGlsLkFzc2V0cztcclxudmFyIE5ldHdvcmsgPSByZXF1aXJlKCcuLi9uZXR3b3JrJyk7XHJcbnZhciBHYW1lT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuR2FtZU9iamVjdDtcclxudmFyIExpdmluZ09iamVjdCA9IHdmbC5jb3JlLmVudGl0aWVzLkxpdmluZ09iamVjdDtcclxudmFyIGdlb20gPSB3ZmwuZ2VvbTtcclxuXHJcbnZhciBQbGF5ZXIgPSBmdW5jdGlvbiAodGVhbSkge1xyXG4gICAgTGl2aW5nT2JqZWN0LmNhbGwodGhpcyk7XHJcblxyXG4gICAgdGhpcy5zb2xpZCA9IHRydWU7XHJcblxyXG4gICAgdGhpcy5jdXN0b21EYXRhLnRlYW0gPSB0ZWFtO1xyXG5cclxuICAgIHZhciBzaGlwVHlwZTtcclxuICAgIGlmICh0ZWFtID09PSAwKSB7XHJcbiAgICAgICAgc2hpcFR5cGUgPSBBc3NldHMuU0hJUF8xO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBzaGlwVHlwZSA9IEFzc2V0cy5TSElQXzI7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ3JlYXRlIGRlZmF1bHQgc3RhdGVcclxuICAgIHRoaXMuZGVmYXVsdEdyYXBoaWMgPSBBc3NldHMuZ2V0KHNoaXBUeXBlKTtcclxuXHJcbiAgICB2YXIgdyA9IHRoaXMuZGVmYXVsdEdyYXBoaWMud2lkdGg7XHJcbiAgICB2YXIgaCA9IHRoaXMuZGVmYXVsdEdyYXBoaWMuaGVpZ2h0O1xyXG4gICAgdmFyIHZlcnRzID0gW1xyXG4gICAgICAgIG5ldyBnZW9tLlZlYzIoLXcgKiAwLjUsIC1oICogMC41KSxcclxuICAgICAgICBuZXcgZ2VvbS5WZWMyKHcgKiAwLjUsIDApLFxyXG4gICAgICAgIG5ldyBnZW9tLlZlYzIoLXcgKiAwLjUsIGggKiAwLjUpXHJcbiAgICBdO1xyXG4gICAgdmFyIGZyYW1lT2JqID0gdGhpcy5jcmVhdGVGcmFtZSh0aGlzLmRlZmF1bHRHcmFwaGljLCAxLCBmYWxzZSk7XHJcbiAgICBmcmFtZU9iai52ZXJ0aWNlcyA9IHZlcnRzO1xyXG5cclxuICAgIHRoaXMuZGVmYXVsdFN0YXRlID0gdGhpcy5jcmVhdGVTdGF0ZSgpO1xyXG4gICAgdGhpcy5kZWZhdWx0U3RhdGUuYWRkRnJhbWUoZnJhbWVPYmopO1xyXG4gICAgdGhpcy5hZGRTdGF0ZShHYW1lT2JqZWN0LlNUQVRFLkRFRkFVTFQsIHRoaXMuZGVmYXVsdFN0YXRlKTtcclxuXHJcbiAgICB0aGlzLnNob290VGltZXIgPSAwO1xyXG4gICAgdGhpcy5tYXhTaG9vdFRpbWVyID0gUGxheWVyLkRFRkFVTFRfTUFYX1NIT09UX1RJTUVSO1xyXG5cclxuICAgIHRoaXMucm90YXRlKC1NYXRoLlBJICogMC41KTtcclxufTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoUGxheWVyLCB7XHJcbiAgICBUVVJOX1NQRUVEIDoge1xyXG4gICAgICAgIHZhbHVlIDogMC4wNVxyXG4gICAgfSxcclxuXHJcbiAgICBCUkFLRV9SQVRFIDoge1xyXG4gICAgICAgIHZhbHVlIDogMC45NVxyXG4gICAgfSxcclxuXHJcbiAgICBCT09TVF9BQ0NFTEVSQVRJT04gOiB7XHJcbiAgICAgICAgdmFsdWUgOiAwLjAwMDJcclxuICAgIH0sXHJcblxyXG4gICAgUE9TSVRJT05fVVBEQVRFX0RJU1RBTkNFIDoge1xyXG4gICAgICAgIHZhbHVlIDogMC41XHJcbiAgICB9LFxyXG5cclxuICAgIE1JTklNQVBfRklMTF9TVFlMRSA6IHtcclxuICAgICAgICB2YWx1ZSA6IFwiIzg2YzhkM1wiXHJcbiAgICB9LFxyXG5cclxuICAgIERFRkFVTFRfTUFYX1NIT09UX1RJTUVSIDoge1xyXG4gICAgICAgIHZhbHVlIDogMjBcclxuICAgIH1cclxufSk7XHJcblBsYXllci5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoTGl2aW5nT2JqZWN0LnByb3RvdHlwZSwge1xyXG4gICAgdXBkYXRlIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGR0KSB7XHJcbiAgICAgICAgICAgIExpdmluZ09iamVjdC5wcm90b3R5cGUudXBkYXRlLmNhbGwodGhpcywgZHQpO1xyXG5cclxuICAgICAgICAgICAgLy8gVXBkYXRlIHNob290IHRpbWVyIHdoZW4ganVzdCBzaG90XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmp1c3RTaG90KCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvb3RUaW1lcisrO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNob290VGltZXIgPj0gdGhpcy5tYXhTaG9vdFRpbWVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG9vdFRpbWVyID0gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gSWYgdGhlIHBsYXllciBpcyBjb25uZWN0ZWQgdG8gdGhlIG5ldHdvcmssIHNlbmQgb3V0IHVwZGF0ZXMgdG9cclxuICAgICAgICAgICAgLy8gb3RoZXIgcGxheWVycyB3aGVuIG5lY2Vzc2FyeVxyXG4gICAgICAgICAgICBpZiAoTmV0d29yay5jb25uZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgIE5ldHdvcmsuc29ja2V0LmVtaXQoJ3VwZGF0ZU90aGVyJywge1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uICAgICA6IHRoaXMucG9zaXRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgdmVsb2NpdHkgICAgIDogdGhpcy52ZWxvY2l0eSxcclxuICAgICAgICAgICAgICAgICAgICBhY2NlbGVyYXRpb24gOiB0aGlzLmFjY2VsZXJhdGlvbixcclxuICAgICAgICAgICAgICAgICAgICByb3RhdGlvbiAgICAgOiB0aGlzLmdldFJvdGF0aW9uKClcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBkcmF3T25NaW5pbWFwIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGN0eCkge1xyXG4gICAgICAgICAgICB2YXIgdyA9IHRoaXMuZ2V0V2lkdGgoKTtcclxuICAgICAgICAgICAgdmFyIGggPSB0aGlzLmdldEhlaWdodCgpO1xyXG4gICAgICAgICAgICB2YXIgb2Zmc2V0WCA9IE1hdGgucm91bmQoLXcgKiAwLjUpO1xyXG4gICAgICAgICAgICB2YXIgb2Zmc2V0WSA9IE1hdGgucm91bmQoLWggKiAwLjUpO1xyXG4gICAgICAgICAgICB2YXIgZGlzcGxheVdpZHRoID0gTWF0aC5yb3VuZCh3KTtcclxuICAgICAgICAgICAgdmFyIGRpc3BsYXlIZWlnaHQgPSBNYXRoLnJvdW5kKGgpO1xyXG5cclxuICAgICAgICAgICAgY3R4LnNhdmUoKTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSBQbGF5ZXIuTUlOSU1BUF9GSUxMX1NUWUxFO1xyXG4gICAgICAgICAgICBjdHguZmlsbFJlY3Qob2Zmc2V0WCwgb2Zmc2V0WSwgZGlzcGxheVdpZHRoLCBkaXNwbGF5SGVpZ2h0KTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5yZXN0b3JlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBzaG9vdCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmp1c3RTaG90KCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvb3RUaW1lciA9IDE7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKE5ldHdvcmsuY29ubmVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgTmV0d29yay5zb2NrZXQuZW1pdCgnYnVsbGV0Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbiAgICAgOiB0aGlzLnBvc2l0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZWxvY2l0eSAgICAgOiB0aGlzLnZlbG9jaXR5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhY2NlbGVyYXRpb24gOiB0aGlzLmFjY2VsZXJhdGlvbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgcm90YXRpb24gICAgIDogdGhpcy5nZXRSb3RhdGlvbigpXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGp1c3RTaG90IDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gKHRoaXMuc2hvb3RUaW1lciA+IDApO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgcmVzb2x2ZUNvbGxpc2lvbiA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChwaHlzT2JqLCBjb2xsaXNpb25EYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciB0ZWFtID0gdGhpcy5jdXN0b21EYXRhLnRlYW07XHJcbiAgICAgICAgICAgIHZhciBvdGhlclRlYW0gPSBwaHlzT2JqLmN1c3RvbURhdGEudGVhbTtcclxuICAgICAgICBcclxuICAgICAgICAgICAgLy8gSWYgaGl0dGluZyBzb21ldGhpbmcgdGhhdCdzIG5vdCBvbiB0aGlzIHRlYW1cclxuICAgICAgICAgICAgaWYgKG90aGVyVGVhbSA9PT0gdW5kZWZpbmVkIHx8IG90aGVyVGVhbSAhPT0gdGVhbSB8fCBwaHlzT2JqLnRha2VEYW1hZ2UpIHtcclxuICAgICAgICAgICAgICAgIExpdmluZ09iamVjdC5wcm90b3R5cGUucmVzb2x2ZUNvbGxpc2lvbi5jYWxsKHRoaXMsIHBoeXNPYmosIGNvbGxpc2lvbkRhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSk7XHJcbk9iamVjdC5mcmVlemUoUGxheWVyKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUGxheWVyOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIEZ1bGxCbG9jayA9IHJlcXVpcmUoJy4vRnVsbEJsb2NrLmpzJyk7XHJcbnZhciBQbGF5ZXIgPSByZXF1aXJlKCcuL1BsYXllci5qcycpO1xyXG52YXIgQ2xpZW50UGxheWVyID0gcmVxdWlyZSgnLi9DbGllbnRQbGF5ZXIuanMnKTtcclxudmFyIEJ1bGxldCA9IHJlcXVpcmUoJy4vQnVsbGV0LmpzJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIEZ1bGxCbG9jayAgICA6IEZ1bGxCbG9jayxcclxuICAgIFBsYXllciAgICAgICA6IFBsYXllcixcclxuICAgIENsaWVudFBsYXllciA6IENsaWVudFBsYXllcixcclxuICAgIEJ1bGxldCAgICAgICA6IEJ1bGxldFxyXG59OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIE5ldHdvcmsgPSByZXF1aXJlKCcuL25ldHdvcmsnKTtcclxudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcclxudmFyIEFzc2V0cyA9IHV0aWwuQXNzZXRzO1xyXG52YXIgc2NlbmVzID0gcmVxdWlyZSgnLi9zY2VuZXMnKTtcclxudmFyIG92ZXJsYXlzID0gcmVxdWlyZSgnLi9vdmVybGF5cycpO1xyXG5cclxuLy8gQ3JlYXRlIGdhbWVcclxudmFyIGNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZ2FtZS1jYW52YXNcIik7XHJcbnZhciBnYW1lICAgPSB3ZmwuY3JlYXRlKGNhbnZhcyk7XHJcblxyXG52YXIgbG9hZGluZ1NjZW5lID0gbmV3IHNjZW5lcy5Mb2FkaW5nU2NlbmUoY2FudmFzKTtcclxuZ2FtZS5zZXRTY2VuZShsb2FkaW5nU2NlbmUpO1xyXG5cclxuLy8gU3RvcCB0aGUgZ2FtZSBzbyB0aGF0IGNhbnZhcyB1cGRhdGVzIGRvbid0IGFmZmVjdCBwZXJmb3JtYW5jZSB3aXRoXHJcbi8vIG92ZXJsYXlzXHJcbmdhbWUuc3RvcCgpO1xyXG5cclxuLy8gRHJhdyBpbml0aWFsIGJsYWNrIEJHIG9uIGNhbnZhc1xyXG52YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcclxuY3R4LmZpbGxTdHlsZSA9IFwiIzA0MEIwQ1wiO1xyXG5jdHguZmlsbFJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcclxuXHJcbnZhciBvbkxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAkKE5ldHdvcmspLm9uKFxyXG4gICAgICAgIE5ldHdvcmsuRXZlbnQuQ09OTkVDVCxcclxuICAgICAgICBvbk5ldHdvcmtDb25uZWN0XHJcbiAgICApO1xyXG5cclxuICAgIE5ldHdvcmsuaW5pdCgpO1xyXG59O1xyXG5cclxudmFyIGdvVG9HYW1lID0gZnVuY3Rpb24gKHJvb20pIHtcclxuICAgIC8vIFVwZGF0ZSB0aGUgZ2FtZSB3aXRoIHRoZSBjdXJyZW50IHRpbWUgYmVjYXVzZSB0aGUgZHQgd2lsbCBiZSBodWdlIG5leHRcclxuICAgIC8vIHVwZGF0ZSBzaW5jZSB0aGUgZ2FtZSB3YXMgc3RvcHBlZCB3aGlsZSBpbiB0aGUgbG9iYnlcclxuICAgIGdhbWUudXBkYXRlKERhdGUubm93KCkpO1xyXG5cclxuICAgICQoZ2FtZS5nZXRTY2VuZSgpKS5vZmYoKTtcclxuXHJcbiAgICB2YXIgZ2FtZVNjZW5lID0gbmV3IHNjZW5lcy5HYW1lU2NlbmUoY2FudmFzLCByb29tKTtcclxuICAgIGdhbWUuc2V0U2NlbmUoZ2FtZVNjZW5lKTtcclxuXHJcbiAgICAkKE5ldHdvcmspLm9uKFxyXG4gICAgICAgIE5ldHdvcmsuRXZlbnQuQ0xPQ0tfVElDSyxcclxuICAgICAgICBnYW1lU2NlbmUub25DbG9ja1RpY2suYmluZChnYW1lU2NlbmUpXHJcbiAgICApO1xyXG5cclxuICAgICQoTmV0d29yaykub24oXHJcbiAgICAgICAgTmV0d29yay5FdmVudC5FTkRfR0FNRSxcclxuICAgICAgICBvbkVuZEdhbWVcclxuICAgICk7XHJcblxyXG4gICAgLy8gU3RhcnQgdGhlIGdhbWUgc2luY2UgaXQgd2FzIHN0b3BwZWQgdG8gaGVscCBwZXJmb3JtYW5jZSB3aXRoIG92ZXJsYXlzIG9uXHJcbiAgICAvLyBhIGNhbnZhc1xyXG4gICAgZ2FtZS5zdGFydCgpO1xyXG59O1xyXG5cclxudmFyIGdvVG9Mb2JieSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIC8vIFN0b3AgdGhlIGdhbWUgc28gdGhhdCBjYW52YXMgdXBkYXRlcyBkb24ndCBhZmZlY3QgcGVyZm9ybWFuY2Ugd2l0aFxyXG4gICAgLy8gb3ZlcmxheXNcclxuICAgIGdhbWUuc3RvcCgpO1xyXG5cclxuICAgIC8vIFJlc2V0IGFsbCBsaXN0ZW5lcnMgb24gdGhlIE5ldHdvcmtcclxuICAgICQoTmV0d29yaykub2ZmKCk7XHJcblxyXG4gICAgdmFyIGxvYmJ5U2NlbmUgPSBuZXcgc2NlbmVzLkxvYmJ5U2NlbmUoY2FudmFzKTtcclxuICAgIGdhbWUuc2V0U2NlbmUobG9iYnlTY2VuZSk7XHJcblxyXG4gICAgJChOZXR3b3JrKS5vbihcclxuICAgICAgICBOZXR3b3JrLkV2ZW50LlNUQVJUX0dBTUUsXHJcbiAgICAgICAgb25TdGFydEdhbWVcclxuICAgICk7XHJcblxyXG4gICAgLy8gVHJhbnNpdGlvbiB0aGUgcGFnZSdzIEJHIGNvbG9yIHRvIGJsYWNrIHRvIGhpZGUgdGhlIEJHIGltYWdlIHdoaWNoXHJcbiAgICAvLyBiZWNvbWVzIGRpc3RyYWN0aW5nIGR1cmluZyBnYW1lIHBsYXlcclxuICAgICQoXCJib2R5XCIpLmNzcyh7XCJiYWNrZ3JvdW5kLWNvbG9yXCI6IFwiIzA3MTIxM1wifSk7XHJcbn07XHJcblxyXG52YXIgb25TdGFydEdhbWUgPSBmdW5jdGlvbiAoZSwgcm9vbSkge1xyXG4gICAgZ29Ub0dhbWUocm9vbSk7XHJcbn07XHJcblxyXG52YXIgb25FbmRHYW1lID0gZnVuY3Rpb24gKGUsIHJvb20pIHtcclxuICAgIGdvVG9Mb2JieSgpO1xyXG5cclxuICAgIC8vIFRyaWdnZXIgYW4gZXZlbnQgc28gdGhlIGxvYmJ5IHNjZW5lIGtub3dzIHRvIGpvaW4gdGhlIHJvb20gaXQgd2FzIGp1c3RcclxuICAgIC8vIGluIGJlZm9yZSBwbGF5aW5nIHRoZSBnYW1lXHJcbiAgICBOZXR3b3JrLl9vbkVudGVyUm9vbVN1Y2Nlc3Mocm9vbSk7XHJcbn07XHJcblxyXG52YXIgb25OZXR3b3JrQ29ubmVjdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIGdvVG9Mb2JieSgpO1xyXG59O1xyXG5cclxudmFyIFByZWxvYWRlciA9IG5ldyB1dGlsLlByZWxvYWRlcihvbkxvYWQuYmluZCh0aGlzKSk7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgZW50aXRpZXMgPSByZXF1aXJlKCcuLi9lbnRpdGllcycpO1xyXG5cclxudmFyIENsaWVudCA9IGZ1bmN0aW9uIChpZCwgZGF0YSkge1xyXG4gICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgdGhpcy5kYXRhID0gZGF0YTtcclxuICAgIHRoaXMuZ2FtZU9iamVjdCA9IHVuZGVmaW5lZDtcclxufTtcclxuT2JqZWN0LmZyZWV6ZShDbGllbnQpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDbGllbnQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgZW50aXRpZXMgPSByZXF1aXJlKCcuLi9lbnRpdGllcycpO1xyXG5cclxudmFyIExvY2FsQ2xpZW50ID0gZnVuY3Rpb24gKGlkLCBkYXRhKSB7XHJcbiAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICB0aGlzLmRhdGEgPSBkYXRhO1xyXG4gICAgdGhpcy5nYW1lT2JqZWN0ID0gdW5kZWZpbmVkO1xyXG59O1xyXG5PYmplY3QuZnJlZXplKExvY2FsQ2xpZW50KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTG9jYWxDbGllbnQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgTmV0d29yayA9IHtcclxuICAgIHNvY2tldCAgICAgIDogdW5kZWZpbmVkLFxyXG4gICAgbG9jYWxDbGllbnQgOiB7fSxcclxuICAgIGNsaWVudHMgICAgIDoge30sXHJcbiAgICByb29tcyAgICAgICA6IHt9LFxyXG4gICAgY29ubmVjdGVkICAgOiBmYWxzZSxcclxuICAgIGhvc3RJZCAgICAgIDogLTEsXHJcblxyXG4gICAgLy8gRXZlbnRzIGZvciBleHRlcm5hbCBlbnRpdGllcyB0byBzdWJzY3JpYmUgdG9cclxuICAgIEV2ZW50ICAgICAgIDoge1xyXG4gICAgICAgIENPTk5FQ1QgICAgICAgICAgICA6IFwiY29ubmVjdFwiLFxyXG4gICAgICAgIFVQREFURV9ST09NUyAgICAgICA6IFwidXBkYXRlUm9vbXNcIixcclxuICAgICAgICBFTlRFUl9ST09NX1NVQ0NFU1MgOiBcImVudGVyUm9vbVN1Y2Nlc3NcIixcclxuICAgICAgICBFTlRFUl9ST09NX0ZBSUwgICAgOiBcImVudGVyUm9vbUZhaWxcIixcclxuICAgICAgICBQTEFZICAgICAgICAgICAgICAgOiBcInBsYXlcIixcclxuICAgICAgICBTVEFSVF9HQU1FICAgICAgICAgOiBcInN0YXJ0R2FtZVwiLFxyXG4gICAgICAgIEVORF9HQU1FICAgICAgICAgICA6IFwiZW5kR2FtZVwiLFxyXG4gICAgICAgIEJVTExFVCAgICAgICAgICAgICA6IFwiYnVsbGV0XCIsXHJcbiAgICAgICAgQ0xPQ0tfVElDSyAgICAgICAgIDogXCJjbG9ja1RpY2tcIlxyXG4gICAgfSxcclxuXHJcbiAgICBpbml0IDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuc29ja2V0ID0gaW8uY29ubmVjdCgpO1xyXG5cclxuICAgICAgICB0aGlzLnNvY2tldC5vbignY29uZmlybScsIHRoaXMuX29uQ29uZmlybUNsaWVudC5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbignYWRkT3RoZXInLCB0aGlzLl9vbkFkZE90aGVyQ2xpZW50LmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdyZW1vdmVPdGhlcicsIHRoaXMuX29uUmVtb3ZlT3RoZXJDbGllbnQuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ2xvYWRQcmV2aW91cycsIHRoaXMuX29uTG9hZFByZXZpb3VzQ2xpZW50cy5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbigndXBkYXRlT3RoZXInLCB0aGlzLl9vblVwZGF0ZUNsaWVudC5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbigndXBkYXRlUm9vbXMnLCB0aGlzLl9vblVwZGF0ZVJvb21zLmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdlbnRlclJvb21TdWNjZXNzJywgdGhpcy5fb25FbnRlclJvb21TdWNjZXNzLmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdlbnRlclJvb21GYWlsJywgdGhpcy5fb25FbnRlclJvb21GYWlsLmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdwaW5nJywgdGhpcy5fb25QaW5nLmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdzZXRIb3N0JywgdGhpcy5fb25TZXRIb3N0LmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdzdGFydEdhbWUnLCB0aGlzLl9vblN0YXJ0R2FtZS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbignZW5kR2FtZScsIHRoaXMuX29uRW5kR2FtZS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbignYnVsbGV0JywgdGhpcy5fb25CdWxsZXQuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ2Nsb2NrVGljaycsIHRoaXMuX29uQ2xvY2tUaWNrLmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdpbml0Jywge1xyXG4gICAgICAgICAgICB1c2VyIDogJChcIiN1c2VyTmFtZVwiKS5odG1sKClcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0Um9vbXMgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgndXBkYXRlUm9vbXMnKTtcclxuICAgIH0sXHJcblxyXG4gICAgY3JlYXRlUm9vbSA6IGZ1bmN0aW9uIChuYW1lKSB7XHJcbiAgICAgICAgdmFyIHJvb21EYXRhID0ge1xyXG4gICAgICAgICAgICBuYW1lICA6IG5hbWUsXHJcbiAgICAgICAgICAgIGVudGVyIDogdHJ1ZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ2NyZWF0ZVJvb20nLCByb29tRGF0YSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGVudGVyUm9vbSA6IGZ1bmN0aW9uIChyb29tSWQpIHtcclxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdlbnRlclJvb20nLCByb29tSWQpO1xyXG4gICAgfSxcclxuXHJcbiAgICBsZWF2ZVJvb20gOiBmdW5jdGlvbiAocm9vbUlkKSB7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnbGVhdmVSb29tJywgcm9vbUlkKTtcclxuICAgIH0sXHJcblxyXG4gICAgc3dpdGNoVGVhbSA6IGZ1bmN0aW9uIChyb29tSWQpIHtcclxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdzd2l0Y2hUZWFtJywgcm9vbUlkKTtcclxuICAgIH0sXHJcblxyXG4gICAgaXNIb3N0IDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmhvc3RJZCA9PT0gdGhpcy5sb2NhbENsaWVudC5pZDtcclxuICAgIH0sXHJcblxyXG4gICAgX29uQ29uZmlybUNsaWVudCA6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgdmFyIGlkID0gZGF0YS5pZDtcclxuICAgICAgICB0aGlzLmxvY2FsQ2xpZW50ID0gbmV3IExvY2FsQ2xpZW50KGlkLCBkYXRhKTtcclxuICAgICAgICB0aGlzLmNsaWVudHNbaWRdID0gdGhpcy5sb2NhbENsaWVudDtcclxuXHJcbiAgICAgICAgdGhpcy5jb25uZWN0ZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICAkKHRoaXMpLnRyaWdnZXIoXHJcbiAgICAgICAgICAgIHRoaXMuRXZlbnQuQ09OTkVDVFxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkFkZE90aGVyQ2xpZW50IDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICB2YXIgaWQgPSBkYXRhLmlkO1xyXG4gICAgICAgIHZhciBuZXdDbGllbnQgPSBuZXcgQ2xpZW50KGlkLCBkYXRhKTtcclxuXHJcbiAgICAgICAgdGhpcy5jbGllbnRzW2RhdGEuaWRdID0gbmV3Q2xpZW50O1xyXG4gICAgfSxcclxuXHJcbiAgICBfb25SZW1vdmVPdGhlckNsaWVudCA6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgdGhpcy5jbGllbnRzW2RhdGEuaWRdID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLmNsaWVudHNbZGF0YS5pZF07XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkxvYWRQcmV2aW91c0NsaWVudHMgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoZGF0YSk7XHJcblxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgaWQgPSBwYXJzZUludChrZXlzW2ldKTtcclxuICAgICAgICAgICAgdmFyIHVzZXJEYXRhID0gZGF0YVtpZF07XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9vbkFkZE90aGVyQ2xpZW50KHVzZXJEYXRhKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vblVwZGF0ZUNsaWVudCA6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgdmFyIGlkID0gZGF0YS5pZDtcclxuICAgICAgICB2YXIgY2xpZW50ID0gdGhpcy5jbGllbnRzW2lkXTtcclxuXHJcbiAgICAgICAgY2xpZW50LmRhdGEgPSBkYXRhO1xyXG5cclxuICAgICAgICBpZiAoY2xpZW50LmdhbWVPYmplY3QpIHtcclxuICAgICAgICAgICAgY2xpZW50LmdhbWVPYmplY3QucG9zaXRpb24ueCA9IGRhdGEucG9zaXRpb24ueDtcclxuICAgICAgICAgICAgY2xpZW50LmdhbWVPYmplY3QucG9zaXRpb24ueSA9IGRhdGEucG9zaXRpb24ueTtcclxuICAgICAgICAgICAgY2xpZW50LmdhbWVPYmplY3QudmVsb2NpdHkueCA9IGRhdGEudmVsb2NpdHkueDtcclxuICAgICAgICAgICAgY2xpZW50LmdhbWVPYmplY3QudmVsb2NpdHkueSA9IGRhdGEudmVsb2NpdHkueTtcclxuICAgICAgICAgICAgY2xpZW50LmdhbWVPYmplY3QuYWNjZWxlcmF0aW9uLnggPSBkYXRhLmFjY2VsZXJhdGlvbi54O1xyXG4gICAgICAgICAgICBjbGllbnQuZ2FtZU9iamVjdC5hY2NlbGVyYXRpb24ueSA9IGRhdGEuYWNjZWxlcmF0aW9uLnk7XHJcbiAgICAgICAgICAgIGNsaWVudC5nYW1lT2JqZWN0LnNldFJvdGF0aW9uKGRhdGEucm90YXRpb24pO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uVXBkYXRlUm9vbXMgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgIHRoaXMucm9vbXMgPSBkYXRhO1xyXG5cclxuICAgICAgICAkKHRoaXMpLnRyaWdnZXIoXHJcbiAgICAgICAgICAgIHRoaXMuRXZlbnQuVVBEQVRFX1JPT01TLFxyXG4gICAgICAgICAgICBkYXRhXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgX29uRW50ZXJSb29tU3VjY2VzcyA6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgJCh0aGlzKS50cmlnZ2VyKFxyXG4gICAgICAgICAgICB0aGlzLkV2ZW50LkVOVEVSX1JPT01fU1VDQ0VTUyxcclxuICAgICAgICAgICAgZGF0YVxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkVudGVyUm9vbUZhaWwgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICQodGhpcykudHJpZ2dlcihcclxuICAgICAgICAgICAgdGhpcy5FdmVudC5FTlRFUl9ST09NX0ZBSUwsXHJcbiAgICAgICAgICAgIGRhdGFcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBfb25QaW5nIDogZnVuY3Rpb24gKHBpbmdPYmopIHtcclxuICAgICAgICBpZiAocGluZ09iaikge1xyXG4gICAgICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdyZXR1cm5QaW5nJywgcGluZ09iaik7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25TZXRIb3N0IDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICB0aGlzLmhvc3RJZCA9IGRhdGEuaWQ7XHJcbiAgICB9LFxyXG5cclxuICAgIF9vblN0YXJ0R2FtZSA6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgJCh0aGlzKS50cmlnZ2VyKFxyXG4gICAgICAgICAgICB0aGlzLkV2ZW50LlNUQVJUX0dBTUUsXHJcbiAgICAgICAgICAgIGRhdGFcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBfb25FbmRHYW1lIDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICB2YXIgcm9vbSA9IHRoaXMucm9vbXNbZGF0YS5pZF07XHJcblxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcm9vbS5wbGF5ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpZW50c1tyb29tLnBsYXllcnNbaV1dLmRhdGEucmVhZHkgPSBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubG9jYWxDbGllbnQuZGF0YS5yZWFkeSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAkKHRoaXMpLnRyaWdnZXIoXHJcbiAgICAgICAgICAgIHRoaXMuRXZlbnQuRU5EX0dBTUUsXHJcbiAgICAgICAgICAgIGRhdGFcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBfb25CdWxsZXQgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICQodGhpcykudHJpZ2dlcihcclxuICAgICAgICAgICAgdGhpcy5FdmVudC5CVUxMRVQsXHJcbiAgICAgICAgICAgIGRhdGFcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBfb25DbG9ja1RpY2sgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICQodGhpcykudHJpZ2dlcihcclxuICAgICAgICAgICAgdGhpcy5FdmVudC5DTE9DS19USUNLLFxyXG4gICAgICAgICAgICBkYXRhXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTmV0d29yaztcclxuXHJcbnZhciBDbGllbnQgPSByZXF1aXJlKCcuL0NsaWVudC5qcycpO1xyXG52YXIgTG9jYWxDbGllbnQgPSByZXF1aXJlKCcuL0xvY2FsQ2xpZW50LmpzJyk7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgT3ZlcmxheSA9IHJlcXVpcmUoJy4vT3ZlcmxheS5qcycpO1xyXG5cclxudmFyIENyZWF0ZVJvb21PdmVybGF5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgT3ZlcmxheS5jYWxsKHRoaXMpO1xyXG4gICAgXHJcbiAgICB0aGlzLmlucHV0RmllbGQgPSAkKFwiPGlucHV0PlwiKTtcclxuICAgIHRoaXMuaW5wdXRGaWVsZC5hdHRyKHsgXCJwbGFjZWhvbGRlclwiIDogXCJSb29tIE5hbWVcIiB9KTtcclxuICAgIHRoaXMuaW5wdXRGaWVsZC5hZGRDbGFzcyhcImNyZWF0ZS1yb29tLW92ZXJsYXktaW5wdXRcIik7XHJcbiAgICBcclxuICAgIHRoaXMuYnV0dG9uQ29udGFpbmVyID0gJChcIjxkaXY+XCIpO1xyXG4gICAgdGhpcy5idXR0b25Db250YWluZXIuYWRkQ2xhc3MoXCJjcmVhdGUtcm9vbS1vdmVybGF5LWJ1dHRvbi1jb250YWluZXJcIik7XHJcbiAgICBcclxuICAgIHRoaXMuY2FuY2VsQnRuID0gJChcIjxidXR0b24+XCIpO1xyXG4gICAgdGhpcy5jYW5jZWxCdG4udGV4dChcIkNhbmNlbFwiKTtcclxuICAgIHRoaXMuYnV0dG9uQ29udGFpbmVyLmFwcGVuZCh0aGlzLmNhbmNlbEJ0bik7XHJcbiAgICBcclxuICAgIHRoaXMuY3JlYXRlQnRuID0gJChcIjxidXR0b24+XCIpO1xyXG4gICAgdGhpcy5jcmVhdGVCdG4udGV4dChcIkNyZWF0ZVwiKTtcclxuICAgIHRoaXMuYnV0dG9uQ29udGFpbmVyLmFwcGVuZCh0aGlzLmNyZWF0ZUJ0bik7XHJcblxyXG4gICAgdGhpcy5kb21PYmplY3QuYXBwZW5kKHRoaXMuaW5wdXRGaWVsZCk7XHJcbiAgICB0aGlzLmRvbU9iamVjdC5hcHBlbmQodGhpcy5idXR0b25Db250YWluZXIpO1xyXG4gICAgdGhpcy5kb21PYmplY3QuYWRkQ2xhc3MoXCJjcmVhdGUtcm9vbS1vdmVybGF5XCIpO1xyXG59O1xyXG5cclxuQ3JlYXRlUm9vbU92ZXJsYXkucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKE92ZXJsYXkucHJvdG90eXBlLCB7XHJcblxyXG59KSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENyZWF0ZVJvb21PdmVybGF5OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIE92ZXJsYXkgPSByZXF1aXJlKCcuL092ZXJsYXkuanMnKTtcclxuXHJcbnZhciBMb2FkaW5nT3ZlcmxheSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIE92ZXJsYXkuY2FsbCh0aGlzKTtcclxuICAgIFxyXG4gICAgdGhpcy5kb21PYmplY3QuYWRkQ2xhc3MoXCJsb2FkaW5nLW92ZXJsYXktYmdcIik7XHJcbiAgICBcclxuICAgIHRoaXMubG9hZGluZ0ljb24gPSAkKFwiPGRpdj5cIik7XHJcbiAgICB0aGlzLmxvYWRpbmdJY29uLmFkZENsYXNzKFwibG9hZGluZy1vdmVybGF5XCIpO1xyXG4gICAgXHJcbiAgICB0aGlzLmRvbU9iamVjdC5hcHBlbmQodGhpcy5sb2FkaW5nSWNvbik7XHJcbn07XHJcblxyXG5Mb2FkaW5nT3ZlcmxheS5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoT3ZlcmxheS5wcm90b3R5cGUsIHtcclxuXHJcbn0pKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTG9hZGluZ092ZXJsYXk7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgT3ZlcmxheSA9IHJlcXVpcmUoJy4vT3ZlcmxheS5qcycpO1xyXG52YXIgTmV0d29yayA9IHJlcXVpcmUoJy4uL25ldHdvcmsnKTtcclxuXHJcbnZhciBMb2JieU92ZXJsYXkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBPdmVybGF5LmNhbGwodGhpcyk7XHJcblxyXG4gICAgLy8gU2V0IHVwIGxlZnQgc2lkZVxyXG4gICAgdGhpcy5sZWZ0Q29udGFpbmVyID0gJChcIjxzcGFuPlwiKTtcclxuICAgIHRoaXMubGVmdENvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktbGVmdFwiKTtcclxuICAgIHRoaXMubGVmdENvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktbWF4aW1pemVkLXNpZGVcIik7XHJcblxyXG4gICAgdGhpcy5yb29tQnV0dG9uQ29udGFpbmVyID0gJChcIjxkaXY+XCIpO1xyXG4gICAgdGhpcy5yb29tQnV0dG9uQ29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1idXR0b24tY29udGFpbmVyXCIpO1xyXG4gICAgdGhpcy5sZWZ0Q29udGFpbmVyLmFwcGVuZCh0aGlzLnJvb21CdXR0b25Db250YWluZXIpO1xyXG5cclxuICAgIHRoaXMuc2VsZWN0Um9vbUxhYmVsID0gJChcIjxkaXY+XCIpO1xyXG4gICAgdGhpcy5zZWxlY3RSb29tTGFiZWwuaHRtbChcIlNlbGVjdCBvciBjcmVhdGUgcm9vbVwiKTtcclxuICAgIHRoaXMucm9vbUJ1dHRvbkNvbnRhaW5lci5hcHBlbmQodGhpcy5zZWxlY3RSb29tTGFiZWwpO1xyXG4gICAgdGhpcy5yb29tQnV0dG9uQ29udGFpbmVyLmFwcGVuZCgkKFwiPGJyPlwiKSk7XHJcblxyXG4gICAgdGhpcy5jcmVhdGVSb29tQnRuID0gJChcIjxidXR0b24+XCIpO1xyXG4gICAgdGhpcy5jcmVhdGVSb29tQnRuLnRleHQoXCJDcmVhdGUgUm9vbVwiKTtcclxuICAgIHRoaXMucm9vbUJ1dHRvbkNvbnRhaW5lci5hcHBlbmQodGhpcy5jcmVhdGVSb29tQnRuKTtcclxuXHJcbiAgICB0aGlzLnJvb21MaXN0Q29udGFpbmVyID0gJChcIjxkaXY+XCIpO1xyXG4gICAgdGhpcy5yb29tTGlzdENvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktcm9vbS1saXN0XCIpO1xyXG4gICAgdGhpcy5yb29tTGlzdENvbnRhaW5lci5odG1sKFwiTG9hZGluZyByb29tcy4uLlwiKTtcclxuICAgIHRoaXMubGVmdENvbnRhaW5lci5hcHBlbmQodGhpcy5yb29tTGlzdENvbnRhaW5lcik7XHJcblxyXG4gICAgLy8gU2V0IHVwIHJpZ2h0IHNpZGVcclxuICAgIHRoaXMucmlnaHRDb250YWluZXIgPSAkKFwiPHNwYW4+XCIpO1xyXG4gICAgdGhpcy5yaWdodENvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktcmlnaHRcIik7XHJcbiAgICB0aGlzLnJpZ2h0Q29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1taW5pbWl6ZWQtc2lkZVwiKTtcclxuXHJcbiAgICB0aGlzLnNlbGVjdGVkUm9vbUxhYmVsID0gJChcIjxkaXY+XCIpO1xyXG4gICAgdGhpcy5zZWxlY3RlZFJvb21MYWJlbC5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktcm9vbS1sYWJlbC1jb250YWluZXJcIik7XHJcblxyXG4gICAgdGhpcy5yZW5kZXJSb29tTGFiZWwoKTtcclxuICAgIHRoaXMucmlnaHRDb250YWluZXIuYXBwZW5kKHRoaXMuc2VsZWN0ZWRSb29tTGFiZWwpO1xyXG5cclxuICAgIHRoaXMuc3dpdGNoVGVhbUJ0biA9ICQoXCI8YnV0dG9uPlwiKTtcclxuICAgIHRoaXMuc3dpdGNoVGVhbUJ0bi50ZXh0KFwiU3dpdGNoIFRlYW1zXCIpO1xyXG4gICAgdGhpcy5zd2l0Y2hUZWFtQnRuLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1zd2l0Y2gtdGVhbS1idG5cIik7XHJcblxyXG4gICAgdGhpcy50ZWFtQUNvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcclxuICAgIHRoaXMudGVhbUFDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LXRlYW1BLWNvbnRhaW5lclwiKTtcclxuXHJcbiAgICB0aGlzLnRlYW1CQ29udGFpbmVyID0gJChcIjxkaXY+XCIpO1xyXG4gICAgdGhpcy50ZWFtQkNvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktdGVhbUItY29udGFpbmVyXCIpO1xyXG5cclxuICAgIHRoaXMucmVuZGVyUGxheWVycygpO1xyXG5cclxuICAgIHRoaXMucmlnaHRDb250YWluZXIuYXBwZW5kKHRoaXMudGVhbUFDb250YWluZXIpO1xyXG4gICAgdGhpcy5yaWdodENvbnRhaW5lci5hcHBlbmQodGhpcy5zd2l0Y2hUZWFtQnRuKTtcclxuICAgIHRoaXMucmlnaHRDb250YWluZXIuYXBwZW5kKHRoaXMudGVhbUJDb250YWluZXIpO1xyXG5cclxuICAgIHRoaXMubGVhdmVSb29tQnRuID0gJChcIjxidXR0b24+XCIpO1xyXG4gICAgdGhpcy5sZWF2ZVJvb21CdG4udGV4dChcIkxlYXZlIFJvb21cIik7XHJcbiAgICB0aGlzLmxlYXZlUm9vbUJ0bi5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktbGVhdmUtcm9vbS1idG5cIik7XHJcbiAgICB0aGlzLmxlYXZlUm9vbUJ0bi5oaWRlKCk7XHJcbiAgICB0aGlzLnJpZ2h0Q29udGFpbmVyLmFwcGVuZCh0aGlzLmxlYXZlUm9vbUJ0bik7XHJcblxyXG4gICAgdGhpcy5yZWFkeUJ0biA9ICQoXCI8YnV0dG9uPlwiKTtcclxuICAgIHRoaXMucmVhZHlCdG4udGV4dChcIlJlYWR5XCIpO1xyXG4gICAgdGhpcy5yZWFkeUJ0bi5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktcmVhZHktYnRuXCIpO1xyXG4gICAgdGhpcy5yZWFkeUJ0bi5oaWRlKCk7XHJcbiAgICB0aGlzLnJpZ2h0Q29udGFpbmVyLmFwcGVuZCh0aGlzLnJlYWR5QnRuKTtcclxuXHJcbiAgICB0aGlzLmRvbU9iamVjdC5hcHBlbmQodGhpcy5sZWZ0Q29udGFpbmVyKTtcclxuICAgIHRoaXMuZG9tT2JqZWN0LmFwcGVuZCh0aGlzLnJpZ2h0Q29udGFpbmVyKTtcclxuICAgIHRoaXMuZG9tT2JqZWN0LmFkZENsYXNzKFwibG9iYnktb3ZlcmxheVwiKTtcclxuICAgIHRoaXMuZG9tT2JqZWN0LmFkZENsYXNzKFwiZmFkZS1pblwiKTtcclxufTtcclxuXHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKExvYmJ5T3ZlcmxheSwge1xyXG4gICAgRXZlbnQgOiB7XHJcbiAgICAgICAgdmFsdWUgOiB7XHJcbiAgICAgICAgICAgIEVOVEVSX1JPT00gOiBcImVudGVyUm9vbVwiXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KTtcclxuXHJcbkxvYmJ5T3ZlcmxheS5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoT3ZlcmxheS5wcm90b3R5cGUsIHtcclxuICAgIHNob3dSb29tcyA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChyb29tRGF0YSkge1xyXG4gICAgICAgICAgICB0aGlzLnJvb21MaXN0Q29udGFpbmVyLmh0bWwoXCJcIik7XHJcblxyXG4gICAgICAgICAgICAkKFwiLmxvYmJ5LW92ZXJsYXktcm9vbVwiKS5vZmYoXCJjbGlja1wiKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMocm9vbURhdGEpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJvb21MaXN0Q29udGFpbmVyLmh0bWwoXCJObyByb29tcyBhdmFpbGFibGVcIik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY3VyUm9vbSA9IHJvb21EYXRhW2tleXNbaV1dO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJSb29tQ29udGFpbmVyID0gJChcIjxkaXY+XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGN1clJvb21Db250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LXJvb21cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgY3VyUm9vbUNvbnRhaW5lci5odG1sKGN1clJvb20ubmFtZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQoY3VyUm9vbUNvbnRhaW5lcikub24oXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiY2xpY2tcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VyUm9vbSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fb25DbGlja1Jvb20uYmluZCh0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucm9vbUxpc3RDb250YWluZXIuYXBwZW5kKGN1clJvb21Db250YWluZXIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICByZW5kZXJSb29tIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgaWYgKGRhdGEgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJSb29tTGFiZWwoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyUGxheWVycygpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuX29uRXhpdFJvb20oKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyUm9vbUxhYmVsKGRhdGEubmFtZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlclBsYXllcnMoZGF0YSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5fb25FbnRlclJvb20oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgcmVuZGVyUm9vbUxhYmVsIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGxhYmVsKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgbGFiZWwgIT09IFwic3RyaW5nXCIgfHwgbGFiZWwgPT09IFwiXCIpIHtcclxuICAgICAgICAgICAgICAgIGxhYmVsID0gXCJObyByb29tIHNlbGVjdGVkXCI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxhYmVsID0gXCJDdXJyZW50IHJvb206IFwiICsgbGFiZWw7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkUm9vbUxhYmVsLmh0bWwobGFiZWwpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgcmVuZGVyUGxheWVycyA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChyb29tRGF0YSkge1xyXG4gICAgICAgICAgICB0aGlzLnRlYW1BQ29udGFpbmVyLmh0bWwoXCJcIik7XHJcbiAgICAgICAgICAgIHRoaXMudGVhbUJDb250YWluZXIuaHRtbChcIlwiKTtcclxuICAgICAgICAgICAgdGhpcy5zd2l0Y2hUZWFtQnRuLmhpZGUoKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChyb29tRGF0YSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdGVhbUEgPSByb29tRGF0YS50ZWFtQTtcclxuICAgICAgICAgICAgICAgIHZhciB0ZWFtQiA9IHJvb21EYXRhLnRlYW1CO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciB0ZWFtQUxhYmVsID0gJChcIjxkaXY+XCIpO1xyXG4gICAgICAgICAgICAgICAgdGVhbUFMYWJlbC5odG1sKFwiUm9zZSBUZWFtXCIpO1xyXG4gICAgICAgICAgICAgICAgdGVhbUFMYWJlbC5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktdGVhbS1sYWJlbFwiKTtcclxuICAgICAgICAgICAgICAgIHRoaXMudGVhbUFDb250YWluZXIuYXBwZW5kKHRlYW1BTGFiZWwpO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciB0ZWFtQkxhYmVsID0gJChcIjxkaXY+XCIpO1xyXG4gICAgICAgICAgICAgICAgdGVhbUJMYWJlbC5odG1sKFwiU2t5IFRlYW1cIik7XHJcbiAgICAgICAgICAgICAgICB0ZWFtQkxhYmVsLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS10ZWFtLWxhYmVsXCIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy50ZWFtQkNvbnRhaW5lci5hcHBlbmQodGVhbUJMYWJlbCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGxvY2FsSWQgPSBOZXR3b3JrLmxvY2FsQ2xpZW50LmlkO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEFkZCB0ZWFtIEEgcGxheWVyc1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA0OyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbGFiZWw7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBsYXllckNvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVhZHkgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgPCB0ZWFtQS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGN1cklkID0gdGVhbUFbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjdXJQbGF5ZXIgPSBOZXR3b3JrLmNsaWVudHNbY3VySWRdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWFkeSA9IGN1clBsYXllci5kYXRhLnJlYWR5O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbCA9IGN1clBsYXllci5kYXRhLnVzZXI7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VySWQgPT09IGxvY2FsSWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllckNvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktbG9jYWwtcGxheWVyLWNvbnRhaW5lclwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXJlYWR5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWFkeUJ0bi5odG1sKFwiUmVhZHlcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zd2l0Y2hUZWFtQnRuLnByb3AoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVhZHlCdG4uaHRtbChcIkNhbmNlbFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN3aXRjaFRlYW1CdG4ucHJvcChcImRpc2FibGVkXCIsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWwgPSBcIi0tLS0tLVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyQ29udGFpbmVyLmh0bWwobGFiZWwpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGVhbUFDb250YWluZXIuYXBwZW5kKHBsYXllckNvbnRhaW5lcik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZWFkeSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVhZHlDb250YWluZXIgPSAkKFwiPHNwYW4+XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWFkeUNvbnRhaW5lci5odG1sKFwiUmVhZHlcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYWR5Q29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1yZWFkeS1jb250YWluZXJcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllckNvbnRhaW5lci5hcHBlbmQocmVhZHlDb250YWluZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBBZGQgdGVhbSBCIHBsYXllcnNcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxhYmVsO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwbGF5ZXJDb250YWluZXIgPSAkKFwiPGRpdj5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlYWR5ID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpIDwgdGVhbUIubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjdXJJZCA9IHRlYW1CW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY3VyUGxheWVyID0gTmV0d29yay5jbGllbnRzW2N1cklkXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVhZHkgPSBjdXJQbGF5ZXIuZGF0YS5yZWFkeTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWwgPSBjdXJQbGF5ZXIuZGF0YS51c2VyO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cklkID09PSBsb2NhbElkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXJDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LWxvY2FsLXBsYXllci1jb250YWluZXJcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZWFkeSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVhZHlCdG4uaHRtbChcIlJlYWR5XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3dpdGNoVGVhbUJ0bi5wcm9wKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlYWR5QnRuLmh0bWwoXCJDYW5jZWxcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zd2l0Y2hUZWFtQnRuLnByb3AoXCJkaXNhYmxlZFwiLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsID0gXCItLS0tLS1cIjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllckNvbnRhaW5lci5odG1sKGxhYmVsKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRlYW1CQ29udGFpbmVyLmFwcGVuZChwbGF5ZXJDb250YWluZXIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVhZHkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlYWR5Q29udGFpbmVyID0gJChcIjxzcGFuPlwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVhZHlDb250YWluZXIuaHRtbChcIlJlYWR5XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWFkeUNvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktcmVhZHktY29udGFpbmVyXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXJDb250YWluZXIuYXBwZW5kKHJlYWR5Q29udGFpbmVyKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5zd2l0Y2hUZWFtQnRuLnNob3coKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uQ2xpY2tSb29tIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSBlLmRhdGE7XHJcbiAgICAgICAgICAgIHZhciByb29tID0ge1xyXG4gICAgICAgICAgICAgICAgbmFtZSA6IGRhdGEubmFtZSxcclxuICAgICAgICAgICAgICAgIGlkICAgOiBkYXRhLmlkXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAkKHRoaXMpLnRyaWdnZXIoTG9iYnlPdmVybGF5LkV2ZW50LkVOVEVSX1JPT00sIHJvb20pO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uRXhpdFJvb20gOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGVhdmVSb29tQnRuLmhpZGUoKTtcclxuICAgICAgICAgICAgdGhpcy5yZWFkeUJ0bi5oaWRlKCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmxlZnRDb250YWluZXIucmVtb3ZlQ2xhc3MoXCJsb2JieS1vdmVybGF5LW1pbmltaXplZC1zaWRlXCIpO1xyXG4gICAgICAgICAgICB0aGlzLnJpZ2h0Q29udGFpbmVyLnJlbW92ZUNsYXNzKFwibG9iYnktb3ZlcmxheS1tYXhpbWl6ZWQtc2lkZVwiKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubGVmdENvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktbWF4aW1pemVkLXNpZGVcIik7XHJcbiAgICAgICAgICAgIHRoaXMucmlnaHRDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LW1pbmltaXplZC1zaWRlXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uRW50ZXJSb29tIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLmxlYXZlUm9vbUJ0bi5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMucmVhZHlCdG4uc2hvdygpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5sZWZ0Q29udGFpbmVyLnJlbW92ZUNsYXNzKFwibG9iYnktb3ZlcmxheS1tYXhpbWl6ZWQtc2lkZVwiKTtcclxuICAgICAgICAgICAgdGhpcy5yaWdodENvbnRhaW5lci5yZW1vdmVDbGFzcyhcImxvYmJ5LW92ZXJsYXktbWluaW1pemVkLXNpZGVcIik7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmxlZnRDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LW1pbmltaXplZC1zaWRlXCIpO1xyXG4gICAgICAgICAgICB0aGlzLnJpZ2h0Q29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1tYXhpbWl6ZWQtc2lkZVwiKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKTtcclxuXHJcbk9iamVjdC5mcmVlemUoTG9iYnlPdmVybGF5KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTG9iYnlPdmVybGF5OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIE92ZXJsYXkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLmRvbU9iamVjdCA9ICQoXCI8ZGl2PlwiKTtcclxuICAgIHRoaXMuZG9tT2JqZWN0LmFkZENsYXNzKFwiY2FudmFzLW92ZXJsYXlcIik7XHJcbn07XHJcblxyXG5PdmVybGF5LnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShPdmVybGF5LnByb3RvdHlwZSwge1xyXG5cclxufSkpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBPdmVybGF5OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIE92ZXJsYXkgPSByZXF1aXJlKCcuL092ZXJsYXkuanMnKTtcclxudmFyIExvYWRpbmdPdmVybGF5ID0gcmVxdWlyZSgnLi9Mb2FkaW5nT3ZlcmxheS5qcycpO1xyXG52YXIgQ3JlYXRlUm9vbU92ZXJsYXkgPSByZXF1aXJlKCcuL0NyZWF0ZVJvb21PdmVybGF5LmpzJyk7XHJcbnZhciBMb2JieU92ZXJsYXkgPSByZXF1aXJlKCcuL0xvYmJ5T3ZlcmxheS5qcycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBPdmVybGF5IDogT3ZlcmxheSxcclxuICAgIExvYWRpbmdPdmVybGF5IDogTG9hZGluZ092ZXJsYXksXHJcbiAgICBDcmVhdGVSb29tT3ZlcmxheSA6IENyZWF0ZVJvb21PdmVybGF5LFxyXG4gICAgTG9iYnlPdmVybGF5IDogTG9iYnlPdmVybGF5XHJcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcclxudmFyIEFzc2V0cyA9IHV0aWwuQXNzZXRzO1xyXG52YXIgTmV0d29yayA9IHJlcXVpcmUoJy4uL25ldHdvcmsnKTtcclxudmFyIGVudGl0aWVzID0gcmVxdWlyZSgnLi4vZW50aXRpZXMnKTtcclxudmFyIEZ1bGxCb2NrID0gZW50aXRpZXMuRnVsbEJsb2NrO1xyXG52YXIgUGxheWVyID0gZW50aXRpZXMuUGxheWVyO1xyXG52YXIgTmV0d29ya1NjZW5lID0gcmVxdWlyZSgnLi9OZXR3b3JrU2NlbmUnKTtcclxudmFyIGJhY2tncm91bmRzID0gd2ZsLmRpc3BsYXkuYmFja2dyb3VuZHM7XHJcbnZhciBnZW9tID0gd2ZsLmdlb207XHJcblxyXG52YXIgR2FtZVNjZW5lID0gZnVuY3Rpb24gKGNhbnZhcywgcm9vbSkge1xyXG4gICAgTmV0d29ya1NjZW5lLmNhbGwodGhpcywgY2FudmFzLCByb29tKTtcclxuXHJcbiAgICB0aGlzLnRpbWVSZW1haW5pbmcgPSByb29tLnRpbWVSZW1haW5pbmc7XHJcblxyXG4gICAgdmFyIHdhbGxTaXplID0gMTA7XHJcbiAgICB2YXIgYmxvY2tTaXplID0gMTI4O1xyXG4gICAgdmFyIG9mZnNldCA9IC0od2FsbFNpemUgKiAwLjUgLSAxKSAqIGJsb2NrU2l6ZTtcclxuXHJcbiAgICAvLyBMaW5lIHRoZSB0b3BcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgOTsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG5ld0Jsb2NrID0gbmV3IEZ1bGxCb2NrKCk7XHJcbiAgICAgICAgbmV3QmxvY2sucG9zaXRpb24ueCA9IGJsb2NrU2l6ZSAqIGkgKyBvZmZzZXQ7XHJcbiAgICAgICAgbmV3QmxvY2sucG9zaXRpb24ueSA9IG9mZnNldDtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRHYW1lT2JqZWN0KG5ld0Jsb2NrKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBMaW5lIHRoZSBib3R0b21cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgOTsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG5ld0Jsb2NrID0gbmV3IEZ1bGxCb2NrKCk7XHJcbiAgICAgICAgbmV3QmxvY2sucG9zaXRpb24ueCA9IGJsb2NrU2l6ZSAqIGkgKyBvZmZzZXQ7XHJcbiAgICAgICAgbmV3QmxvY2sucG9zaXRpb24ueSA9IC1vZmZzZXQ7XHJcblxyXG4gICAgICAgIHRoaXMuYWRkR2FtZU9iamVjdChuZXdCbG9jayk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTGluZSB0aGUgbGVmdFxyXG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCA4OyBpKyspIHtcclxuICAgICAgICB2YXIgbmV3QmxvY2sgPSBuZXcgRnVsbEJvY2soKTtcclxuICAgICAgICBuZXdCbG9jay5wb3NpdGlvbi54ID0gb2Zmc2V0O1xyXG4gICAgICAgIG5ld0Jsb2NrLnBvc2l0aW9uLnkgPSBibG9ja1NpemUgKiBpICsgb2Zmc2V0O1xyXG5cclxuICAgICAgICB0aGlzLmFkZEdhbWVPYmplY3QobmV3QmxvY2spO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIExpbmUgdGhlIHJpZ2h0XHJcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IDg7IGkrKykge1xyXG4gICAgICAgIHZhciBuZXdCbG9jayA9IG5ldyBGdWxsQm9jaygpO1xyXG4gICAgICAgIG5ld0Jsb2NrLnBvc2l0aW9uLnggPSAtb2Zmc2V0O1xyXG4gICAgICAgIG5ld0Jsb2NrLnBvc2l0aW9uLnkgPSBibG9ja1NpemUgKiBpICsgb2Zmc2V0O1xyXG5cclxuICAgICAgICB0aGlzLmFkZEdhbWVPYmplY3QobmV3QmxvY2spO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuYmcgPSBuZXcgYmFja2dyb3VuZHMuUGFyYWxsYXhCYWNrZ3JvdW5kKFxyXG4gICAgICAgIEFzc2V0cy5nZXQoQXNzZXRzLkJHX1RJTEUpXHJcbiAgICApO1xyXG5cclxuICAgIHRoaXMucGxheWVyID0gbmV3IFBsYXllcihOZXR3b3JrLmxvY2FsQ2xpZW50LmRhdGEudGVhbSk7XHJcbiAgICBOZXR3b3JrLmxvY2FsQ2xpZW50LmdhbWVPYmplY3QgPSB0aGlzLnBsYXllcjtcclxuICAgIHRoaXMuYWRkR2FtZU9iamVjdCh0aGlzLnBsYXllciwgMik7XHJcbn07XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKEdhbWVTY2VuZSwge1xyXG4gICAgRlJJQ1RJT04gOiB7XHJcbiAgICAgICAgdmFsdWUgOiAwLjkyNVxyXG4gICAgfSxcclxuXHJcbiAgICBNSU5JTUFQIDoge1xyXG4gICAgICAgIHZhbHVlIDogT2JqZWN0LmZyZWV6ZSh7XHJcbiAgICAgICAgICAgIFdJRFRIICAgICAgOiAxNTAsXHJcbiAgICAgICAgICAgIEhFSUdIVCAgICAgOiAxMDAsXHJcbiAgICAgICAgICAgIFNDQUxFICAgICAgOiAwLjEsXHJcbiAgICAgICAgICAgIEZJTExfU1RZTEUgOiBcIiMxOTI0MjdcIlxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcbn0pO1xyXG5HYW1lU2NlbmUucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKE5ldHdvcmtTY2VuZS5wcm90b3R5cGUsIHtcclxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlcyB0aGUgc2NlbmUgYW5kIGFsbCBnYW1lIG9iamVjdHMgaW4gaXRcclxuICAgICAqL1xyXG4gICAgdXBkYXRlIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGR0KSB7XHJcbiAgICAgICAgICAgIHRoaXMudGltZVJlbWFpbmluZyAtPSBkdDtcclxuY29uc29sZS5sb2coZHQpO1xyXG4gICAgICAgICAgICAvLyBBcHBseSBmcmljdGlvblxyXG4gICAgICAgICAgICB2YXIgZ2FtZU9iamVjdHMgPSB0aGlzLmdldEdhbWVPYmplY3RzKCk7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ2FtZU9iamVjdHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciBvYmogPSBnYW1lT2JqZWN0c1tpXTtcclxuICAgICAgICAgICAgICAgIGlmICghb2JqLmN1c3RvbURhdGEuaWdub3JlRnJpY3Rpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBvYmouYWNjZWxlcmF0aW9uLm11bHRpcGx5KEdhbWVTY2VuZS5GUklDVElPTik7XHJcbiAgICAgICAgICAgICAgICAgICAgb2JqLnZlbG9jaXR5Lm11bHRpcGx5KEdhbWVTY2VuZS5GUklDVElPTik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIE5ldHdvcmtTY2VuZS5wcm90b3R5cGUudXBkYXRlLmNhbGwodGhpcywgZHQpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVJbnB1dCgpO1xyXG5cclxuICAgICAgICAgICAgLy8gR28gdGhyb3VnaCBhbGwgZ2FtZSBvYmplY3RzIGFuZCByZW1vdmUgYW55IHRoYXQgaGF2ZSBiZWVuXHJcbiAgICAgICAgICAgIC8vIGZsYWdnZWQgZm9yIHJlbW92YWxcclxuICAgICAgICAgICAgZ2FtZU9iamVjdHMgPSB0aGlzLmdldEdhbWVPYmplY3RzKCk7IC8vIEdldCBhZ2FpbiBpbiBjYXNlIG9mIGNoYW5nZXNcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IGdhbWVPYmplY3RzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgb2JqID0gZ2FtZU9iamVjdHNbaV07XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKG9iai5jdXN0b21EYXRhLnJlbW92ZWQgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUdhbWVPYmplY3Qob2JqKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKE5ldHdvcmsuaXNIb3N0KCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VuZEhvc3REYXRhKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHNlbmRIb3N0RGF0YSA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKE5ldHdvcmsuY29ubmVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICBOZXR3b3JrLnNvY2tldC5lbWl0KCdjbG9ja1RpY2snLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGltZVJlbWFpbmluZyA6IHRoaXMudGltZVJlbWFpbmluZ1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRHJhd3MgdGhlIHNjZW5lIGFuZCBhbGwgZ2FtZSBvYmplY3RzIGluIGl0XHJcbiAgICAgKi9cclxuICAgIGRyYXcgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoY3R4KSB7XHJcbiAgICAgICAgICAgIE5ldHdvcmtTY2VuZS5wcm90b3R5cGUuZHJhdy5jYWxsKHRoaXMsIGN0eCk7XHJcblxyXG4gICAgICAgICAgICBjdHguc2F2ZSgpO1xyXG5cclxuICAgICAgICAgICAgdmFyIHNjcmVlbldpZHRoICA9IGN0eC5jYW52YXMud2lkdGg7XHJcbiAgICAgICAgICAgIHZhciBzY3JlZW5IZWlnaHQgPSBjdHguY2FudmFzLmhlaWdodDtcclxuICAgICAgICAgICAgdmFyIG9mZnNldCAgICAgICA9IG5ldyBnZW9tLlZlYzIoXHJcbiAgICAgICAgICAgICAgICBzY3JlZW5XaWR0aCAgKiAwLjUsXHJcbiAgICAgICAgICAgICAgICBzY3JlZW5IZWlnaHQgKiAwLjVcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIHZhciB0aW1lVGV4dDtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnRpbWVSZW1haW5pbmcgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWludXRlcyA9IE1hdGguZmxvb3IodGhpcy50aW1lUmVtYWluaW5nIC8gKDEwMDAgKiA2MCkpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHNlY29uZHMgPSBNYXRoLmZsb29yKCh0aGlzLnRpbWVSZW1haW5pbmcgLSBtaW51dGVzICogMTAwMCAqIDYwKSAvIDEwMDApO1xyXG4gICAgICAgICAgICAgICAgdGltZVRleHQgPSBtaW51dGVzICsgXCI6XCI7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHNlY29uZHMgPCAxMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRpbWVUZXh0ICs9IFwiMFwiO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRpbWVUZXh0ICs9IHNlY29uZHM7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aW1lVGV4dCA9IFwiMDowMFwiO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjdHgudHJhbnNsYXRlKG9mZnNldC54LCAwKTtcclxuICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwiI2ZmZlwiO1xyXG4gICAgICAgICAgICBjdHgudGV4dEFsaWduID0gXCJjZW50ZXJcIjtcclxuICAgICAgICAgICAgY3R4LmZvbnQgPSBcIjI0cHggTXVucm9cIjtcclxuICAgICAgICAgICAgY3R4LnRleHRCYXNlbGluZSA9IFwidG9wXCI7XHJcbiAgICAgICAgICAgIGN0eC5maWxsVGV4dCh0aW1lVGV4dCwgMCwgMCk7XHJcblxyXG4gICAgICAgICAgICBjdHgucmVzdG9yZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgaGFuZGxlSW5wdXQgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBwbGF5ZXIgICAgICAgPSB0aGlzLnBsYXllcjtcclxuICAgICAgICAgICAgdmFyIGtleWJvYXJkICAgICA9IHRoaXMua2V5Ym9hcmQ7XHJcbiAgICAgICAgICAgIHZhciBsZWZ0UHJlc3NlZCAgPSBrZXlib2FyZC5pc1ByZXNzZWQoa2V5Ym9hcmQuTEVGVCk7XHJcbiAgICAgICAgICAgIHZhciByaWdodFByZXNzZWQgPSBrZXlib2FyZC5pc1ByZXNzZWQoa2V5Ym9hcmQuUklHSFQpO1xyXG4gICAgICAgICAgICB2YXIgdXBQcmVzc2VkICAgID0ga2V5Ym9hcmQuaXNQcmVzc2VkKGtleWJvYXJkLlVQKTtcclxuICAgICAgICAgICAgdmFyIGRvd25QcmVzc2VkICA9IGtleWJvYXJkLmlzUHJlc3NlZChrZXlib2FyZC5ET1dOKTtcclxuICAgICAgICAgICAgdmFyIHNob290aW5nICAgICA9IGtleWJvYXJkLmlzUHJlc3NlZChrZXlib2FyZC5aKTtcclxuXHJcbiAgICAgICAgICAgIC8vIExlZnQvIFJpZ2h0IEtleSAtLSBQbGF5ZXIgdHVybnNcclxuICAgICAgICAgICAgaWYgKGxlZnRQcmVzc2VkIHx8IHJpZ2h0UHJlc3NlZCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHJvdGF0aW9uID0gMDtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAobGVmdFByZXNzZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICByb3RhdGlvbiAtPSBQbGF5ZXIuVFVSTl9TUEVFRDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocmlnaHRQcmVzc2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcm90YXRpb24gKz0gUGxheWVyLlRVUk5fU1BFRUQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcGxheWVyLnJvdGF0ZShyb3RhdGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFVwIEtleSAtLSBQbGF5ZXIgZ29lcyBmb3J3YXJkXHJcbiAgICAgICAgICAgIGlmICh1cFByZXNzZWQpIHtcclxuICAgICAgICAgICAgICAgIHZhciBtb3ZlbWVudEZvcmNlID0gZ2VvbS5WZWMyLmZyb21BbmdsZShwbGF5ZXIuZ2V0Um90YXRpb24oKSk7XHJcbiAgICAgICAgICAgICAgICBtb3ZlbWVudEZvcmNlLm11bHRpcGx5KFxyXG4gICAgICAgICAgICAgICAgICAgIFBsYXllci5CT09TVF9BQ0NFTEVSQVRJT04gKiBwbGF5ZXIubWFzc1xyXG4gICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIuYWRkRm9yY2UobW92ZW1lbnRGb3JjZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIERvd24gS2V5IC0tIEFwcGx5IGJyYWtlcyB0byBwbGF5ZXJcclxuICAgICAgICAgICAgaWYgKGRvd25QcmVzc2VkKSB7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIudmVsb2NpdHkubXVsdGlwbHkoUGxheWVyLkJSQUtFX1JBVEUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoc2hvb3RpbmcpIHtcclxuICAgICAgICAgICAgICAgIHBsYXllci5zaG9vdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBvbkNsb2NrVGljayA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlLCBkYXRhKSB7XHJcbiAgICAgICAgICAgIHRoaXMudGltZVJlbWFpbmluZyA9IGRhdGEudGltZVJlbWFpbmluZztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR2FtZVNjZW5lOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIFNjZW5lID0gd2ZsLmRpc3BsYXkuU2NlbmU7XHJcbnZhciBvdmVybGF5cyA9IHJlcXVpcmUoJy4uL292ZXJsYXlzJyk7XHJcblxyXG52YXIgTG9hZGluZ1NjZW5lID0gZnVuY3Rpb24gKGNhbnZhcykge1xyXG4gICAgU2NlbmUuY2FsbCh0aGlzLCBjYW52YXMpO1xyXG4gICAgXHJcbiAgICB0aGlzLmxvYWRpbmdPdmVybGF5ID0gbmV3IG92ZXJsYXlzLkxvYWRpbmdPdmVybGF5KCk7XHJcbiAgICAkKGNhbnZhcykucGFyZW50KCkuYXBwZW5kKHRoaXMubG9hZGluZ092ZXJsYXkuZG9tT2JqZWN0KTtcclxufTtcclxuTG9hZGluZ1NjZW5lLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShTY2VuZS5wcm90b3R5cGUsIHtcclxuICAgIGRlc3Ryb3kgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9hZGluZ092ZXJsYXkuZG9tT2JqZWN0LnJlbW92ZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBMb2FkaW5nU2NlbmU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgU2NlbmUgPSB3ZmwuZGlzcGxheS5TY2VuZTtcclxudmFyIG92ZXJsYXlzID0gcmVxdWlyZSgnLi4vb3ZlcmxheXMnKTtcclxudmFyIE5ldHdvcmsgPSByZXF1aXJlKCcuLi9uZXR3b3JrJyk7XHJcblxyXG52YXIgTG9iYnlTY2VuZSA9IGZ1bmN0aW9uIChjYW52YXMpIHtcclxuICAgIFNjZW5lLmNhbGwodGhpcywgY2FudmFzKTtcclxuXHJcbiAgICB0aGlzLmN1clJvb21JZCA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICB0aGlzLmxvYmJ5T3ZlcmxheSA9IG5ldyBvdmVybGF5cy5Mb2JieU92ZXJsYXkoKTtcclxuICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkgPSBuZXcgb3ZlcmxheXMuQ3JlYXRlUm9vbU92ZXJsYXkoKTtcclxuICAgICQoY2FudmFzKS5wYXJlbnQoKS5hcHBlbmQodGhpcy5sb2JieU92ZXJsYXkuZG9tT2JqZWN0KTtcclxuICAgICQoY2FudmFzKS5wYXJlbnQoKS5hcHBlbmQodGhpcy5jcmVhdGVSb29tT3ZlcmxheS5kb21PYmplY3QpO1xyXG5cclxuICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuZG9tT2JqZWN0LmhpZGUoKTtcclxuXHJcbiAgICB0aGlzLmxvYmJ5T3ZlcmxheS5sZWF2ZVJvb21CdG4uY2xpY2sodGhpcy5fb25MZWF2ZVJvb21CdXR0b25DbGljay5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMubG9iYnlPdmVybGF5LnJlYWR5QnRuLmNsaWNrKHRoaXMuX29uUmVhZHlCdXR0b25DbGljay5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMubG9iYnlPdmVybGF5LnN3aXRjaFRlYW1CdG4uY2xpY2sodGhpcy5fb25Td2l0Y2hUZWFtQnV0dG9uQ2xpY2suYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLmxvYmJ5T3ZlcmxheS5jcmVhdGVSb29tQnRuLmNsaWNrKHRoaXMuX29uQ3JlYXRlUm9vbUJ1dHRvbkNsaWNrLmJpbmQodGhpcykpO1xyXG5cclxuICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuY2FuY2VsQnRuLmNsaWNrKHRoaXMuX29uQ3JlYXRlUm9vbUNhbmNlbC5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuY3JlYXRlQnRuLmNsaWNrKHRoaXMuX29uQ3JlYXRlUm9vbS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAkKHRoaXMubG9iYnlPdmVybGF5KS5vbihvdmVybGF5cy5Mb2JieU92ZXJsYXkuRXZlbnQuRU5URVJfUk9PTSwgdGhpcy5fb25FbnRlclJvb21BdHRlbXB0LmJpbmQodGhpcykpO1xyXG5cclxuICAgICQoTmV0d29yaykub24oTmV0d29yay5FdmVudC5VUERBVEVfUk9PTVMsIHRoaXMuX29uVXBkYXRlUm9vbUxpc3QuYmluZCh0aGlzKSk7XHJcbiAgICAkKE5ldHdvcmspLm9uKE5ldHdvcmsuRXZlbnQuRU5URVJfUk9PTV9TVUNDRVNTLCB0aGlzLl9vbkVudGVyUm9vbVN1Y2Nlc3MuYmluZCh0aGlzKSk7XHJcbiAgICAkKE5ldHdvcmspLm9uKE5ldHdvcmsuRXZlbnQuRU5URVJfUk9PTV9GQUlMLCB0aGlzLl9vbkVudGVyUm9vbUZhaWwuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgdGhpcy5yb29tVXBkYXRlSW50ZXJ2YWwgPVxyXG4gICAgICAgIHNldEludGVydmFsKHRoaXMudXBkYXRlUm9vbUxpc3QuYmluZCh0aGlzKSwgTG9iYnlTY2VuZS5ST09NX1VQREFURV9GUkVRVUVOQ1kpO1xyXG5cclxuICAgIHRoaXMudXBkYXRlUm9vbUxpc3QoKTtcclxufTtcclxuXHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKExvYmJ5U2NlbmUsIHtcclxuICAgIFJPT01fVVBEQVRFX0ZSRVFVRU5DWSA6IHtcclxuICAgICAgICB2YWx1ZSA6IDUwMDBcclxuICAgIH0sXHJcblxyXG4gICAgRXZlbnQgOiB7XHJcbiAgICAgICAgdmFsdWUgOiB7XHJcbiAgICAgICAgICAgIFRPR0dMRV9SRUFEWSA6IFwidG9nZ2xlUmVhZHlcIlxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcblxyXG5Mb2JieVNjZW5lLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShTY2VuZS5wcm90b3R5cGUsIHtcclxuICAgIGRlc3Ryb3kgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9iYnlPdmVybGF5LmRvbU9iamVjdC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5kb21PYmplY3QucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuaW5wdXRGaWVsZC5vZmYoXCJrZXlwcmVzc1wiKTtcclxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLnJvb21VcGRhdGVJbnRlcnZhbCk7XHJcbiAgICAgICAgICAgICQoTmV0d29yaykub2ZmKE5ldHdvcmsuRXZlbnQuVVBEQVRFX1JPT01TKTtcclxuICAgICAgICAgICAgJChOZXR3b3JrKS5vZmYoTmV0d29yay5FdmVudC5FTlRFUl9ST09NX1NVQ0NFU1MpO1xyXG4gICAgICAgICAgICAkKE5ldHdvcmspLm9mZihOZXR3b3JrLkV2ZW50LkVOVEVSX1JPT01fRkFJTCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICB1cGRhdGVSb29tTGlzdCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgTmV0d29yay5nZXRSb29tcygpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uTGVhdmVSb29tQnV0dG9uQ2xpY2sgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBOZXR3b3JrLmxlYXZlUm9vbSh0aGlzLmN1clJvb21JZCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VyUm9vbUlkID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uUmVhZHlCdXR0b25DbGljayA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIHZhciBjbGllbnRXaWxsQmVSZWFkeSA9ICFOZXR3b3JrLmxvY2FsQ2xpZW50LmRhdGEucmVhZHk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmxvYmJ5T3ZlcmxheS5zd2l0Y2hUZWFtQnRuLnByb3AoXCJkaXNhYmxlZFwiLCBjbGllbnRXaWxsQmVSZWFkeSk7XHJcblxyXG4gICAgICAgICAgICBOZXR3b3JrLnNvY2tldC5lbWl0KCd1cGRhdGVSZWFkeScsIHtcclxuICAgICAgICAgICAgICAgIHJlYWR5IDogY2xpZW50V2lsbEJlUmVhZHlcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ0xJQ0tFRCBSRUFEWSBCVVRUT05cIik7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25DcmVhdGVSb29tQnV0dG9uQ2xpY2sgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmlucHV0RmllbGQub2ZmKFwia2V5cHJlc3NcIik7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmlucHV0RmllbGQudmFsKFwiXCIpO1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmRvbU9iamVjdC5yZW1vdmVDbGFzcyhcImZhZGUtaW5cIik7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuZG9tT2JqZWN0LnNob3coKTtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5kb21PYmplY3QuYWRkQ2xhc3MoXCJmYWRlLWluXCIpO1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmlucHV0RmllbGQuZm9jdXMoKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuaW5wdXRGaWVsZC5vbihcImtleXByZXNzXCIsIHRoaXMuX29uQ3JlYXRlUm9vbUtleVByZXNzLmJpbmQodGhpcykpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uQ3JlYXRlUm9vbUtleVByZXNzIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMTMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX29uQ3JlYXRlUm9vbSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25DcmVhdGVSb29tQ2FuY2VsIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5kb21PYmplY3QuaGlkZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uQ3JlYXRlUm9vbSA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIHZhciBuYW1lID0gdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5pbnB1dEZpZWxkLnZhbCgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKG5hbWUgIT09IFwiXCIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuZG9tT2JqZWN0LmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIE5ldHdvcmsuY3JlYXRlUm9vbShuYW1lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uU3dpdGNoVGVhbUJ1dHRvbkNsaWNrIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgTmV0d29yay5zd2l0Y2hUZWFtKHRoaXMuY3VyUm9vbUlkKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vblVwZGF0ZVJvb21MaXN0IDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUsIGRhdGEpIHtcclxuICAgICAgICAgICAgdGhpcy5sb2JieU92ZXJsYXkuc2hvd1Jvb21zKGRhdGEpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuY3VyUm9vbUlkICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9iYnlPdmVybGF5LnJlbmRlclJvb20oZGF0YVt0aGlzLmN1clJvb21JZF0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2JieU92ZXJsYXkucmVuZGVyUm9vbSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25FbnRlclJvb21BdHRlbXB0IDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUsIGRhdGEpIHtcclxuICAgICAgICAgICAgTmV0d29yay5lbnRlclJvb20oZGF0YS5pZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25FbnRlclJvb21TdWNjZXNzIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUsIGRhdGEpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJSb29tSWQgPSBkYXRhLmlkO1xyXG4gICAgICAgICAgICB0aGlzLmxvYmJ5T3ZlcmxheS5yZW5kZXJSb29tKGRhdGEpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uRW50ZXJSb29tRmFpbCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlLCBkYXRhKSB7XHJcbiAgICAgICAgICAgIGFsZXJ0KGRhdGEubXNnKTtcclxuICAgICAgICAgICAgdGhpcy5jdXJSb29tSWQgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIHRoaXMubG9iYnlPdmVybGF5LnJlbmRlclJvb20odW5kZWZpbmVkKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKTtcclxuXHJcbk9iamVjdC5mcmVlemUoTG9iYnlTY2VuZSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IExvYmJ5U2NlbmU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgTmV0d29yayA9IHJlcXVpcmUoJy4uL25ldHdvcmsnKTtcclxudmFyIFNjZW5lID0gd2ZsLmRpc3BsYXkuU2NlbmU7XHJcbnZhciBQaHlzaWNzT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuUGh5c2ljc09iamVjdDtcclxudmFyIGVudGl0aWVzID0gcmVxdWlyZSgnLi4vZW50aXRpZXMnKTtcclxudmFyIEJ1bGxldCA9IGVudGl0aWVzLkJ1bGxldDtcclxudmFyIENsaWVudFBsYXllciA9IGVudGl0aWVzLkNsaWVudFBsYXllcjtcclxudmFyIGdlb20gPSB3ZmwuZ2VvbTtcclxuXHJcbnZhciBOZXR3b3JrU2NlbmUgPSBmdW5jdGlvbiAoY2FudmFzLCByb29tKSB7XHJcbiAgICBTY2VuZS5jYWxsKHRoaXMsIGNhbnZhcyk7XHJcblxyXG4gICAgLy8gQWRkIG90aGVyIGNsaWVudHMgdGhhdCBhcmUgYWxyZWFkeSBjb25uZWN0ZWRcclxuICAgIHZhciByb29tID0gTmV0d29yay5yb29tc1tyb29tLmlkXTtcclxuICAgIHZhciBwbGF5ZXJzID0gcm9vbS5wbGF5ZXJzO1xyXG5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGxheWVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBpZCA9IHBsYXllcnNbaV07XHJcbiAgICAgICAgdmFyIGNsaWVudCA9IE5ldHdvcmsuY2xpZW50c1tpZF07XHJcblxyXG4gICAgICAgIGlmIChjbGllbnQgIT09IE5ldHdvcmsubG9jYWxDbGllbnQpIHtcclxuICAgICAgICAgICAgdmFyIGdhbWVPYmplY3QgPSBuZXcgQ2xpZW50UGxheWVyKGNsaWVudC5kYXRhLnRlYW0pO1xyXG4gICAgICAgICAgICBjbGllbnQuZ2FtZU9iamVjdCA9IGdhbWVPYmplY3Q7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkR2FtZU9iamVjdChnYW1lT2JqZWN0LCAxKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgICQoTmV0d29yaykub24oTmV0d29yay5FdmVudC5CVUxMRVQsIHRoaXMuX29uQnVsbGV0LmJpbmQodGhpcykpO1xyXG59O1xyXG5OZXR3b3JrU2NlbmUucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKFNjZW5lLnByb3RvdHlwZSwge1xyXG4gICAgLyoqXHJcbiAgICAgKiBDbGVhcnMgdXAgcmVmZXJlbmNlcyB1c2VkIGluIHRoZSBzY2VuZVxyXG4gICAgICovXHJcbiAgICBkZXN0cm95IDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKE5ldHdvcmspLm9mZihOZXR3b3JrLkV2ZW50LkJVTExFVCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIFxyXG4gICAgX29uQnVsbGV0IDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUsIGRhdGEpIHtcclxuICAgICAgICAgICAgdmFyIHJvdGF0aW9uID0gUGh5c2ljc09iamVjdC5wcm90b3R5cGUuZ2V0RGlzcGxheUFuZ2xlKGRhdGEucm90YXRpb24pO1xyXG4gICAgICAgICAgICB2YXIgZm9yd2FyZCA9IGdlb20uVmVjMi5mcm9tQW5nbGUocm90YXRpb24pO1xyXG4gICAgICAgICAgICB2YXIgcGxheWVyID0gTmV0d29yay5jbGllbnRzW2RhdGEucGxheWVySWRdLmdhbWVPYmplY3Q7XHJcbiAgICAgICAgICAgIHZhciBidWxsZXQgPSBuZXcgQnVsbGV0KDEsIHBsYXllcik7XHJcbiAgICAgICAgICAgIGJ1bGxldC5wb3NpdGlvbi54ID0gZGF0YS5wb3NpdGlvbi54O1xyXG4gICAgICAgICAgICBidWxsZXQucG9zaXRpb24ueSA9IGRhdGEucG9zaXRpb24ueTtcclxuICAgICAgICAgICAgYnVsbGV0LnZlbG9jaXR5LnggPSBmb3J3YXJkLng7XHJcbiAgICAgICAgICAgIGJ1bGxldC52ZWxvY2l0eS55ID0gZm9yd2FyZC55O1xyXG4gICAgICAgICAgICBidWxsZXQucm90YXRlKHJvdGF0aW9uKTtcclxuICAgICAgICAgICAgYnVsbGV0LnZlbG9jaXR5Lm11bHRpcGx5KEJ1bGxldC5ERUZBVUxUX1NQRUVEKTtcclxuICAgICAgICAgICAgYnVsbGV0LnZlbG9jaXR5LnggKz0gZGF0YS52ZWxvY2l0eS54O1xyXG4gICAgICAgICAgICBidWxsZXQudmVsb2NpdHkueSArPSBkYXRhLnZlbG9jaXR5Lnk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAoYnVsbGV0LnZlbG9jaXR5LmdldE1hZ25pdHVkZVNxdWFyZWQoKSA8IEJ1bGxldC5ERUZBVUxUX1NQRUVEICogQnVsbGV0LkRFRkFVTFRfU1BFRUQpIHtcclxuICAgICAgICAgICAgICAgIGJ1bGxldC52ZWxvY2l0eS5zZXRNYWduaXR1ZGUoQnVsbGV0LkRFRkFVTFRfU1BFRUQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLmFkZEdhbWVPYmplY3QoYnVsbGV0LCAxKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTmV0d29ya1NjZW5lOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIExvYWRpbmdTY2VuZSA9IHJlcXVpcmUoJy4vTG9hZGluZ1NjZW5lLmpzJyk7XHJcbnZhciBMb2JieVNjZW5lID0gcmVxdWlyZSgnLi9Mb2JieVNjZW5lLmpzJyk7XHJcbnZhciBOZXR3b3JrU2NlbmUgPSByZXF1aXJlKCcuL05ldHdvcmtTY2VuZS5qcycpO1xyXG52YXIgR2FtZVNjZW5lID0gcmVxdWlyZSgnLi9HYW1lU2NlbmUuanMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgTG9hZGluZ1NjZW5lIDogTG9hZGluZ1NjZW5lLFxyXG4gICAgTG9iYnlTY2VuZSAgIDogTG9iYnlTY2VuZSxcclxuICAgIE5ldHdvcmtTY2VuZSA6IE5ldHdvcmtTY2VuZSxcclxuICAgIEdhbWVTY2VuZSAgICA6IEdhbWVTY2VuZVxyXG59OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBCR19USUxFICAgICAgIDogXCIuL2Fzc2V0cy9pbWcvQkctdGlsZTEucG5nXCIsXHJcbiAgICBCTE9DS19GVUxMICAgIDogXCIuL2Fzc2V0cy9pbWcvQmxvY2tGdWxsLnBuZ1wiLFxyXG4gICAgU0hJUF8xICAgICAgICA6IFwiLi9hc3NldHMvaW1nL090aGVyU2hpcC5wbmdcIixcclxuICAgIFNISVBfMiAgICAgICAgOiBcIi4vYXNzZXRzL2ltZy9TaGlwLnBuZ1wiLFxyXG4gICAgV0VBS19CVUxMRVRfMSA6IFwiLi9hc3NldHMvaW1nL0J1bGxldFdlYWtfYS5wbmdcIixcclxuICAgIFdFQUtfQlVMTEVUXzIgOiBcIi4vYXNzZXRzL2ltZy9CdWxsZXRXZWFrX2IucG5nXCIsXHJcbiAgICBXRUFLX0JVTExFVF8zIDogXCIuL2Fzc2V0cy9pbWcvQnVsbGV0V2Vha19jLnBuZ1wiLFxyXG4gICAgV0VBS19CVUxMRVRfNCA6IFwiLi9hc3NldHMvaW1nL0J1bGxldFdlYWtfZC5wbmdcIixcclxuICAgIFxyXG4gICAgLy8gUHJlbG9hZGVyIHJlcGxhY2VzIGdldHRlciB3aXRoIGFwcHJvcHJpYXRlIGRlZmluaXRpb25cclxuICAgIGdldCAgICAgICAgOiBmdW5jdGlvbiAocGF0aCkgeyB9XHJcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgQXNzZXRzID0gcmVxdWlyZSgnLi9Bc3NldHMuanMnKTtcclxuXHJcbnZhciBQcmVsb2FkZXIgPSBmdW5jdGlvbiAob25Db21wbGV0ZSkge1xyXG4gICAgLy8gU2V0IHVwIHByZWxvYWRlclxyXG5cdHRoaXMucXVldWUgPSBuZXcgY3JlYXRlanMuTG9hZFF1ZXVlKGZhbHNlKTtcclxuXHJcbiAgICAvLyBSZXBsYWNlIGRlZmluaXRpb24gb2YgQXNzZXQgZ2V0dGVyIHRvIHVzZSB0aGUgZGF0YSBmcm9tIHRoZSBxdWV1ZVxyXG4gICAgQXNzZXRzLmdldCA9IHRoaXMucXVldWUuZ2V0UmVzdWx0LmJpbmQodGhpcy5xdWV1ZSk7XHJcblxyXG4gICAgLy8gT25jZSBldmVyeXRoaW5nIGhhcyBiZWVuIHByZWxvYWRlZCwgc3RhcnQgdGhlIGFwcGxpY2F0aW9uXHJcbiAgICBpZiAob25Db21wbGV0ZSkge1xyXG4gICAgICAgIHRoaXMucXVldWUub24oXCJjb21wbGV0ZVwiLCBvbkNvbXBsZXRlKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgbmVlZFRvTG9hZCA9IFtdO1xyXG5cclxuICAgIC8vIFByZXBhcmUgdG8gbG9hZCBpbWFnZXNcclxuICAgIGZvciAodmFyIGltZyBpbiBBc3NldHMpIHtcclxuICAgICAgICB2YXIgaW1nT2JqID0ge1xyXG4gICAgICAgICAgICBpZCA6IGltZyxcclxuICAgICAgICAgICAgc3JjIDogQXNzZXRzW2ltZ11cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG5lZWRUb0xvYWQucHVzaChpbWdPYmopO1xyXG4gICAgfVxyXG5cclxuXHR0aGlzLnF1ZXVlLmxvYWRNYW5pZmVzdChuZWVkVG9Mb2FkKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUHJlbG9hZGVyOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIEFzc2V0cyA9IHJlcXVpcmUoJy4vQXNzZXRzLmpzJyk7XHJcbnZhciBQcmVsb2FkZXIgPSByZXF1aXJlKCcuL1ByZWxvYWRlci5qcycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBBc3NldHMgICAgOiBBc3NldHMsXHJcbiAgICBQcmVsb2FkZXIgOiBQcmVsb2FkZXJcclxufTsiXX0=
