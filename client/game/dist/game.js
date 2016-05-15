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

                // If hitting something that's on a team (player, bullet,
                // etc)...
                if (otherTeam !== undefined) {
                    // If the bullet hits a player on a different team, deal
                    // damage to them
                    if (otherTeam !== team && physObj.takeDamage) {
                        physObj.takeDamage(this.damage);

                        // If killed the player, we'll make the cam follow this
                        // bullet's creator
                        if (physObj.health <= 0) {
                            physObj.customData.killer = this.creator;
                        }
                    }
                }
            }
        }
    }
}));
Object.freeze(Bullet);

module.exports = Bullet;
},{"../util":27}],2:[function(require,module,exports){
"use strict";

var util = require('../util');
var Assets = util.Assets;
var Player = require('./Player');
var LivingObject = wfl.core.entities.LivingObject;
var geom = wfl.geom;

var ClientPlayer = function (team) {
    Player.call(this, team);
};
Object.defineProperties(ClientPlayer, {
    MINIMAP_FILL_STYLE : {
        value : "#06c833"
    }
});
ClientPlayer.prototype = Object.freeze(Object.create(Player.prototype, {
    update : {
        value : function (dt) {
            LivingObject.prototype.update.call(this, dt);
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
},{"../util":27,"./Player":5}],3:[function(require,module,exports){
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
},{"../util":27}],4:[function(require,module,exports){
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
},{"../util":27}],5:[function(require,module,exports){
"use strict";

var util = require('../util');
var Assets = util.Assets;
var Network = require('../network');
var GameObject = wfl.core.entities.GameObject;
var LivingObject = wfl.core.entities.LivingObject;
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
},{"../network":12,"../util":27}],6:[function(require,module,exports){
"use strict";

var FullBlock = require('./FullBlock.js');
var HalfBlock = require('./HalfBlock.js');
var Player = require('./Player.js');
var ClientPlayer = require('./ClientPlayer.js');
var Bullet = require('./Bullet.js');

module.exports = {
    FullBlock    : FullBlock,
    HalfBlock    : HalfBlock,
    Player       : Player,
    ClientPlayer : ClientPlayer,
    Bullet       : Bullet
};
},{"./Bullet.js":1,"./ClientPlayer.js":2,"./FullBlock.js":3,"./HalfBlock.js":4,"./Player.js":5}],7:[function(require,module,exports){
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
        Network.Event.END_GAME,
        onEndGame
    );

    // If the player receives data for game over before they actually load the
    // gave over screen, skip immediately to the game over screen (because only
    // the host would send that data)
    $(Network).on(
        Network.Event.GAME_OVER_DATA,
        room,
        onGetGameOverData
    );

    // Start the game since it was stopped to help performance with overlays on
    // a canvas
    game.start();
};

var goToGameStart = function (room) {
    // Stop the game so that canvas updates don't affect performance with
    // overlays
    game.stop();

    // Reset all listeners on the Network
    $(Network).off();

    var gameStartScene = new scenes.GameStartScene(canvas, room);
    game.setScene(gameStartScene);

    $(gameStartScene).on(
        scenes.GameStartScene.Event.START_GAME,
        onGameStartToGame
    );
};

var goToLobby = function () {
    // Draw black over the canvas
    ctx.fillStyle = "#040B0C";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stop the game so that canvas updates don't affect performance with
    // overlays
    game.stop();

    $(game.getScene()).off();

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

var goToGameOver = function (room) {
    // Stop the game so that canvas updates don't affect performance with
    // overlays
    game.stop();

    // Reset all listeners on the Network
    $(Network).off();

    var gameOverScene = new scenes.GameOverScene(canvas, room);
    game.setScene(gameOverScene);

    $(gameOverScene).on(
        scenes.GameOverScene.Event.RETURN_TO_LOBBY,
        onGameOverToLobby
    );
};

var onStartGame = function (e, room) {
    goToGameStart(room);
};

var onEndGame = function (e, room) {
    goToGameOver(room);
};

var onGameStartToGame = function (e, room) {
    goToGame(room);
};

var onGetGameOverData = function (e, gameOverData) {
    goToGameOver(e.data);
    game.getScene()._onUpdateScore(gameOverData);
};

var onGameOverToLobby = function (e, room) {
    goToLobby();

    // Trigger an event so the lobby scene knows to join the room it was just
    // in before playing the game
    Network._onEnterRoomSuccess(room);
};

var onNetworkConnect = function () {
    goToLobby();
};

var Preloader = new util.Preloader(onLoad.bind(this));
},{"./network":12,"./overlays":18,"./scenes":24,"./util":27}],8:[function(require,module,exports){
"use strict";

var entities = require('../entities');
var FullBock = entities.FullBlock;
var HalfBlock = entities.HalfBlock;

var Level1 = function (scene) {
    var blockSize = 128;

    // Line the top
    for (var i = 0; i < 16; i++) {
        var newBlock = new FullBock();
        newBlock.position.x = blockSize * i;
        newBlock.position.y = 0;

        scene.addGameObject(newBlock);
    }

    // Line the bottom
    for (var i = 0; i < 16; i++) {
        var newBlock = new FullBock();
        newBlock.position.x = blockSize * i;
        newBlock.position.y = blockSize * 10;

        scene.addGameObject(newBlock);
    }

    // Line the left
    for (var i = 1; i < 10; i++) {
        var newBlock = new FullBock();
        newBlock.position.x = 0;
        newBlock.position.y = blockSize * i;

        scene.addGameObject(newBlock);
    }

    // Line the right
    for (var i = 1; i < 10; i++) {
        var newBlock = new FullBock();
        newBlock.position.x = blockSize * 15;
        newBlock.position.y = blockSize * i;

        scene.addGameObject(newBlock);
    }

    var obj;
    
    obj = new FullBock();
    obj.position.x = blockSize * 3;
    obj.position.y = blockSize * 3;
    scene.addGameObject(obj);
    
    obj = new FullBock();
    obj.position.x = blockSize * 4;
    obj.position.y = blockSize * 4;
    scene.addGameObject(obj);
    
    obj = new FullBock();
    obj.position.x = blockSize * 7;
    obj.position.y = blockSize * 4;
    scene.addGameObject(obj);
    
    obj = new FullBock();
    obj.position.x = blockSize * 8;
    obj.position.y = blockSize * 6;
    scene.addGameObject(obj);
    
    obj = new FullBock();
    obj.position.x = blockSize * 11;
    obj.position.y = blockSize * 6;
    scene.addGameObject(obj);
    
    obj = new FullBock();
    obj.position.x = blockSize * 12;
    obj.position.y = blockSize * 7;
    scene.addGameObject(obj);

    obj = new HalfBlock();
    obj.position.x = blockSize * 1;
    obj.position.y = blockSize * 6;
    scene.addGameObject(obj);

    obj = new HalfBlock();
    obj.position.x = blockSize * 4;
    obj.position.y = blockSize * 3;
    scene.addGameObject(obj);

    obj = new HalfBlock();
    obj.position.x = blockSize * 4;
    obj.position.y = blockSize * 9;
    scene.addGameObject(obj);

    obj = new HalfBlock();
    obj.position.x = blockSize * 8;
    obj.position.y = blockSize * 5;
    scene.addGameObject(obj);

    obj = new HalfBlock();
    obj.position.x = blockSize * 7;
    obj.position.y = blockSize * 5;
    obj.rotate(Math.PI);
    scene.addGameObject(obj);

    obj = new HalfBlock();
    obj.position.x = blockSize * 11;
    obj.position.y = blockSize * 1;
    obj.rotate(Math.PI);
    scene.addGameObject(obj);

    obj = new HalfBlock();
    obj.position.x = blockSize * 11;
    obj.position.y = blockSize * 7;
    obj.rotate(Math.PI);
    scene.addGameObject(obj);

    obj = new HalfBlock();
    obj.position.x = blockSize * 14;
    obj.position.y = blockSize * 4;
    obj.rotate(Math.PI);
    scene.addGameObject(obj);
};

Object.freeze(Level1);

module.exports = Level1;
},{"../entities":6}],9:[function(require,module,exports){
"use strict";

var Level1 = require("./Level1.js");

module.exports = {
    Level1 : Level1
};
},{"./Level1.js":8}],10:[function(require,module,exports){
"use strict";

var entities = require('../entities');

var Client = function (id, data) {
    this.id = id;
    this.data = data;
    this.gameObject = undefined;
};
Object.freeze(Client);

module.exports = Client;
},{"../entities":6}],11:[function(require,module,exports){
"use strict";

var entities = require('../entities');

var LocalClient = function (id, data) {
    this.id = id;
    this.data = data;
    this.gameObject = undefined;
};
Object.freeze(LocalClient);

module.exports = LocalClient;
},{"../entities":6}],12:[function(require,module,exports){
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
        PLAYER_DEATH       : "playerDeath",
        PLAYER_RESPAWN     : "playerRespawn",
        BULLET             : "bullet",
        CLOCK_TICK         : "clockTick",
        COUNTDOWN          : "countdown",
        GAME_START_DATA    : "gameStartData",
        GAME_OVER_DATA     : "gameOverData"
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
        this.socket.on('playerDeath', this._onPlayerDeath.bind(this));
        this.socket.on('playerRespawn', this._onPlayerRespawn.bind(this));
        this.socket.on('bullet', this._onBullet.bind(this));
        this.socket.on('countdown', this._onCountdown.bind(this));
        this.socket.on('clockTick', this._onClockTick.bind(this));
        this.socket.on('gameStartData', this._onGameStartData.bind(this));
        this.socket.on('gameOverData', this._onGameOverData.bind(this));

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

    _onPlayerDeath : function (data) {
        $(this).trigger(
            this.Event.PLAYER_DEATH,
            data
        );
    },

    _onPlayerRespawn : function (data) {
        $(this).trigger(
            this.Event.PLAYER_RESPAWN,
            data
        );
    },

    _onBullet : function (data) {
        $(this).trigger(
            this.Event.BULLET,
            data
        );
    },

    _onCountdown : function (data) {
        $(this).trigger(
            this.Event.COUNTDOWN,
            data
        );
    },

    _onClockTick : function (data) {
        $(this).trigger(
            this.Event.CLOCK_TICK,
            data
        );
    },

    _onGameStartData : function (data) {
        $(this).trigger(
            this.Event.GAME_START_DATA,
            data
        );
    },

    _onGameOverData : function (data) {
        $(this).trigger(
            this.Event.GAME_OVER_DATA,
            data
        );
    }
};

module.exports = Network;

var Client = require('./Client.js');
var LocalClient = require('./LocalClient.js');
},{"./Client.js":10,"./LocalClient.js":11}],13:[function(require,module,exports){
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
},{"./Overlay.js":17}],14:[function(require,module,exports){
"use strict";

var Overlay = require('./Overlay.js');
var Network = require('../network');

var GameOverOverlay = function () {
    Overlay.call(this);

    this.resultsLabel = $("<div>");
    this.resultsLabel.html("Results");
    this.resultsLabel.addClass("game-over-overlay-results-label");

    this.teamAContainer = $("<div>");
    this.teamAContainer.addClass("lobby-overlay-teamA-container");

    this.teamBContainer = $("<div>");
    this.teamBContainer.addClass("lobby-overlay-teamB-container");

    this.returnToLobbyBtn = $("<button>");
    this.returnToLobbyBtn.text("Return to Lobby");
    this.returnToLobbyBtn.addClass("game-over-overlay-return-to-lobby-button");

    this.domObject.append(this.resultsLabel);
    this.domObject.append(this.loadingIcon);
    this.domObject.append(this.teamAContainer);
    this.domObject.append(this.teamBContainer);
    this.domObject.append(this.returnToLobbyBtn);

    this.domObject.addClass("game-over-overlay");
    this.domObject.addClass("fade-in");

    this.renderScore();
};

GameOverOverlay.prototype = Object.freeze(Object.create(Overlay.prototype, {
    renderScore : {
        value : function (roomData) {
            this.teamAContainer.html("");
            this.teamBContainer.html("");

            var teamALabel = $("<span>");
            teamALabel.html("Rose Team");
            teamALabel.addClass("game-over-overlay-team-label");

            var teamAKillLabel = $("<span>");
            teamAKillLabel.html("K");
            teamAKillLabel.addClass("game-over-overlay-team-kill-label");

            var teamADeathLabel = $("<span>");
            teamADeathLabel.html("D");
            teamADeathLabel.addClass("game-over-overlay-team-death-label");

            this.teamAContainer.append(teamALabel);
            this.teamAContainer.append(teamAKillLabel);
            this.teamAContainer.append(teamADeathLabel);

            var teamBLabel = $("<span>");
            teamBLabel.html("Sky Team");
            teamBLabel.addClass("game-over-overlay-team-label");

            var teamBKillLabel = $("<span>");
            teamBKillLabel.html("K");
            teamBKillLabel.addClass("game-over-overlay-team-kill-label");

            var teamBDeathLabel = $("<span>");
            teamBDeathLabel.html("D");
            teamBDeathLabel.addClass("game-over-overlay-team-death-label");

            this.teamBContainer.append(teamBLabel);
            this.teamBContainer.append(teamBKillLabel);
            this.teamBContainer.append(teamBDeathLabel);

            if (!roomData) {
                var teamALoadingContainer = $("<div>");
                teamALoadingContainer.html("Loading...");
                teamALabel.append(teamALoadingContainer);

                var teamBLoadingContainer = $("<div>");
                teamBLoadingContainer.html("Loading...");
                teamBLabel.append(teamBLoadingContainer);

                return;
            }

            var teamA = roomData.teamA;
            var teamB = roomData.teamB;
            var localId = Network.localClient.id;

            var teamANameContainer = $("<span>");
            var teamAKillsContainer = $("<span>");
            var teamADeathsContainer = $("<span>");
            teamANameContainer.addClass("game-over-overlay-name-container");
            teamAKillsContainer.addClass("game-over-overlay-kills-container");
            teamADeathsContainer.addClass("game-over-overlay-deaths-container");

            var teamBNameContainer = $("<span>");
            var teamBKillsContainer = $("<span>");
            var teamBDeathsContainer = $("<span>");
            teamBNameContainer.addClass("game-over-overlay-name-container");
            teamBKillsContainer.addClass("game-over-overlay-kills-container");
            teamBDeathsContainer.addClass("game-over-overlay-deaths-container");

            // Add team A players
            for (var i = 0; i < 4; i++) {
                var label;
                var kills;
                var deaths;
                var playerContainer = $("<div>");
                var killsContainer = $("<div>");
                var deathsContainer = $("<div>");

                if (i < teamA.length) {
                    var curPlayer = teamA[i];
                    label = curPlayer.user;
                    kills = curPlayer.kills;
                    deaths = curPlayer.deaths;

                    if (curPlayer.id === localId) {
                        playerContainer.addClass("lobby-overlay-local-player-container");
                    }
                } else {
                    label = "------";
                    kills = "-";
                    deaths = "-";
                }

                playerContainer.html(label);
                killsContainer.html(kills);
                deathsContainer.html(deaths);
                teamANameContainer.append(playerContainer);
                teamAKillsContainer.append(killsContainer);
                teamADeathsContainer.append(deathsContainer);
            }

            this.teamAContainer.append(teamANameContainer);
            this.teamAContainer.append(teamAKillsContainer);
            this.teamAContainer.append(teamADeathsContainer);

            // Add team B players
            for (var i = 0; i < 4; i++) {
                var label;
                var kills;
                var deaths;
                var playerContainer = $("<div>");
                var killsContainer = $("<div>");
                var deathsContainer = $("<div>");

                if (i < teamB.length) {
                    var curPlayer = teamB[i];
                    label = curPlayer.user;
                    kills = curPlayer.kills;
                    deaths = curPlayer.deaths;

                    if (curPlayer.id === localId) {
                        playerContainer.addClass("lobby-overlay-local-player-container");
                    }
                } else {
                    label = "------";
                    kills = "-";
                    deaths = "-";
                }

                playerContainer.html(label);
                killsContainer.html(kills);
                deathsContainer.html(deaths);
                teamBNameContainer.append(playerContainer);
                teamBKillsContainer.append(killsContainer);
                teamBDeathsContainer.append(deathsContainer);
            }

            this.teamBContainer.append(teamBNameContainer);
            this.teamBContainer.append(teamBKillsContainer);
            this.teamBContainer.append(teamBDeathsContainer);
        }
    }
}));

module.exports = GameOverOverlay;
},{"../network":12,"./Overlay.js":17}],15:[function(require,module,exports){
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
},{"./Overlay.js":17}],16:[function(require,module,exports){
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
},{"../network":12,"./Overlay.js":17}],17:[function(require,module,exports){
"use strict";

var Overlay = function () {
    this.domObject = $("<div>");
    this.domObject.addClass("canvas-overlay");
};

Overlay.prototype = Object.freeze(Object.create(Overlay.prototype, {

}));

module.exports = Overlay;
},{}],18:[function(require,module,exports){
"use strict";

var Overlay = require('./Overlay.js');
var LoadingOverlay = require('./LoadingOverlay.js');
var CreateRoomOverlay = require('./CreateRoomOverlay.js');
var GameOverOverlay = require('./GameOverOverlay.js');
var LobbyOverlay = require('./LobbyOverlay.js');

module.exports = {
    Overlay : Overlay,
    LoadingOverlay : LoadingOverlay,
    CreateRoomOverlay : CreateRoomOverlay,
    GameOverOverlay : GameOverOverlay,
    LobbyOverlay : LobbyOverlay
};
},{"./CreateRoomOverlay.js":13,"./GameOverOverlay.js":14,"./LoadingOverlay.js":15,"./LobbyOverlay.js":16,"./Overlay.js":17}],19:[function(require,module,exports){
"use strict";

var Scene = wfl.display.Scene;
var overlays = require('../overlays');
var Network = require('../network');

var GameOverScene = function (canvas, room) {
    Scene.call(this, canvas);

    this.room = room;

    $(Network).on(Network.Event.GAME_OVER_DATA, this._onUpdateScore.bind(this));

    if (Network.isHost()) {
        Network.socket.emit(Network.Event.GAME_OVER_DATA, room.id);
    }

    this.gameOverOverlay = new overlays.GameOverOverlay();
    $(canvas).parent().append(this.gameOverOverlay.domObject);

    this.loadingOverlay = new overlays.LoadingOverlay();
    $(canvas).parent().append(this.loadingOverlay.domObject);

    this.gameOverOverlay.returnToLobbyBtn.click(this._onReturnToLobby.bind(this));
};
Object.defineProperties(GameOverScene, {
    Event : {
        value : {
            RETURN_TO_LOBBY : "returnToLobby"
        }
    }
});
GameOverScene.prototype = Object.freeze(Object.create(Scene.prototype, {
    destroy : {
        value : function () {
            this.gameOverOverlay.domObject.remove();
            this.loadingOverlay.domObject.remove();
        }
    },

    _onUpdateScore : {
        value : function (e, data) {
            this.loadingOverlay.domObject.remove();
            this.gameOverOverlay.renderScore(data);
        }
    },

    _onReturnToLobby : {
        value : function (e) {
            $(this).trigger(
                GameOverScene.Event.RETURN_TO_LOBBY,
                this.room
            );
        }
    }
}));
Object.freeze(GameOverScene);

module.exports = GameOverScene;
},{"../network":12,"../overlays":18}],20:[function(require,module,exports){
"use strict";

var util = require('../util');
var Assets = util.Assets;
var Scene = wfl.display.Scene;
var Network = require('../network');
var GameObject = wfl.core.entities.GameObject;
var PhysicsObject = wfl.core.entities.PhysicsObject;
var entities = require('../entities');
var Bullet = entities.Bullet;
var ClientPlayer = entities.ClientPlayer;
var Player = entities.Player;
var levels = require('../levels');
var backgrounds = wfl.display.backgrounds;
var geom = wfl.geom;

var GameScene = function (canvas, room) {
    Scene.call(this, canvas, room);

    // Add other clients that are already connected
    var room = Network.rooms[room.id];
    var players = room.players;

    for (var i = 0; i < players.length; i++) {
        var id = players[i];
        var client = Network.clients[id];

        if (client !== Network.localClient) {
            var gameObject = new ClientPlayer(client.data.team);
            client.gameObject = gameObject;
            client.gameObject.customData.clientId = client.data.id;
            client.gameObject.position.x = client.data.position.x;
            client.gameObject.position.y = client.data.position.y;
            client.gameObject.setRotation(client.data.rotation);
            client.gameObject.customData.spawnPosition = client.data.position;
            client.gameObject.customData.spawnRotation = client.data.rotation;
            this.addGameObject(gameObject, 1);
        }
    }

    $(Network).on(
        Network.Event.BULLET,
        this.onBullet.bind(this)
    );

    $(Network).on(
        Network.Event.CLOCK_TICK,
        this.onClockTick.bind(this)
    );

    $(Network).on(
        Network.Event.COUNTDOWN,
        this.onCountdown.bind(this)
    );

    $(Network).on(
        Network.Event.PLAYER_DEATH,
        this.onPlayerDeath.bind(this)
    );

    $(Network).on(
        Network.Event.PLAYER_RESPAWN,
        this.onPlayerRespawn.bind(this)
    );

    // TODO: Design levels better
    levels.Level1(this);

    this.timeRemaining = room.timeRemaining;
    this.initialCountdown = room.countdown;
    this.countingDown = true;
    this.respawnTime = room.respawnTime;
    this.respawnTimeRemaining = this.respawnTime;

    this.bg = new backgrounds.ParallaxBackground(
        Assets.get(Assets.BG_TILE)
    );

    this.player = new Player(Network.localClient.data.team);
    this.player.position.x = Network.localClient.data.position.x;
    this.player.position.y = Network.localClient.data.position.y;
    this.player.setRotation(Network.localClient.data.rotation);
    this.player.customData.spawnPosition = Network.localClient.data.position;
    this.player.customData.spawnRotation = Network.localClient.data.rotation;

    Network.localClient.gameObject = this.player;
    this.player.customData.clientId = Network.localClient.data.id;
    this.addGameObject(this.player, 2);

    this.camera.follow(this.player);
    this.camera.position.x = this.player.position.x;
    this.camera.position.y = this.player.position.y;
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
GameScene.prototype = Object.freeze(Object.create(Scene.prototype, {
    /**
     * Updates the scene and all game objects in it
     */
    update : {
        value : function (dt) {
            if (this.countingDown === true) {
                this.initialCountdown -= dt;

                if (Network.isHost()) {
                    this.sendCountdown();
                }

                if (this.initialCountdown <= 0) {
                    this.countingDown = false;
                }
            } else {
                Scene.prototype.update.call(this, dt);

                this.timeRemaining -= dt;

                // Make the camera follow the killer if the player was killed
                if (this.player.health === 0) {
                    this._handlePlayerDeath(dt);

                // Otherwise, allow the player to move
                } else {
                    this._handleInput();
                }

                this._applyFriction();
                this._removeDeadGameObjects();

                if (Network.isHost()) {
                    this.sendClockTick();
                }
            }
        }
    },

    sendCountdown : {
        value : function () {
            if (Network.connected) {
                Network.socket.emit('countdown', {
                    countdown : this.initialCountdown
                });
            }
        }
    },

    sendClockTick : {
        value : function () {
            if (Network.connected) {
                Network.socket.emit('clockTick', {
                    timeRemaining : this.timeRemaining
                });
            }
        }
    },

    sendPlayerDeath : {
        value : function () {
            if (Network.connected) {
                Network.socket.emit('playerDeath', {
                    dead : this.player.customData.clientId,
                    killer : this.player.customData.killer.customData.clientId
                });
            }
        }
    },

    /**
     * Draws the scene and all game objects in it
     */
    draw : {
        value : function (ctx) {
            Scene.prototype.draw.call(this, ctx);

            ctx.save();

            var screenWidth  = ctx.canvas.width;
            var screenHeight = ctx.canvas.height;
            var offset       = new geom.Vec2(
                screenWidth  * 0.5,
                screenHeight * 0.5
            );

            ctx.fillStyle = "#fff";
            ctx.font = "24px Munro";

            // Show the remaining duration of the game
            var timeText;
            if (this.timeRemaining > 0) {
                var minutes = Math.floor((this.timeRemaining) / (1000 * 60));
                var seconds = Math.floor((this.timeRemaining - minutes * 1000 * 60) / 1000);
                timeText = minutes + ":";

                if (seconds < 10) {
                    timeText += "0";
                }

                timeText += seconds;
            } else {
                timeText = "0:00";
            }

            if (this.timeRemaining < 1000 * 10) {
                if (this.timeRemaining % 500 < 250) {
                    ctx.fillStyle = "rgb(255, 79, 79)";
                } else {
                    ctx.fillStyle = "rgba(0, 0, 0, 0)";
                }
                ctx.font = "30px Munro";
            } else if (this.timeRemaining < 1000 * 30) {
                ctx.fillStyle = "rgb(241, 208, 92)";
            }

            ctx.translate(offset.x, 0);
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillText(timeText, 0, 0);

            // Show the initial countdown before the game
            if (this.initialCountdown > 0) {
                var countdownSeconds = Math.round(this.initialCountdown / 1000);
                var countdownText = countdownSeconds.toString();
                ctx.fillStyle = "#fff";

                switch (countdownSeconds) {
                default:
                case 5:
                    ctx.fillStyle = "rgb(255, 79, 79)";
                    break;

                case 4:
                    ctx.fillStyle = "rgb(247, 155, 87)";
                    break;

                case 3:
                    ctx.fillStyle = "rgb(241, 208, 92)";
                    break;

                case 2:
                    ctx.fillStyle = "rgb(215, 235, 99)";
                    break;

                case 1:
                    ctx.fillStyle = "rgb(132, 231, 103)";
                    break;

                case 0:
                    countdownText = "FIGHT";
                    ctx.fillStyle = "#fff";
                    break;
                }

                ctx.translate(0, offset.y);
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.font = "96px Munro";
                ctx.fillText(countdownText, 0, 0);
            }

            ctx.restore();

            // Draw HP
            ctx.save();

            ctx.translate(4, 4);

            for (var i = 0; i < this.player.maxHealth; i++) {
                var graphic;
                if (this.player.health > i) {
                    graphic = Assets.get(Assets.HP_FULL);
                } else {
                    graphic = Assets.get(Assets.HP_EMPTY);
                }

                ctx.drawImage(graphic, 0, 0);
                ctx.translate(24, 0);
            }

            ctx.restore();

            // Draw Respawn message if necessary
            if (this.player.health <= 0) {
                ctx.save();

                var respawnTimeRemaining = Math.round(this.respawnTimeRemaining / 1000);
                var respawnMessage = "Respawn in " + respawnTimeRemaining.toString() + " seconds";

                ctx.translate(offset.x, offset.y);
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.font = "48px Munro";
                ctx.fillStyle = "#fff";
                ctx.fillText(respawnMessage, 0, 0);

                ctx.restore();
            }
        }
    },

    onCountdown : {
        value : function (e, data) {
            this.initialCountdown = data.countdown;
        }
    },

    onClockTick : {
        value : function (e, data) {
            this.timeRemaining = parseInt(data.timeRemaining);
        }
    },

    onBullet : {
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
    },

    onPlayerDeath : {
        value : function (e, data) {
            var player = Network.clients[data.dead].gameObject;
            player.solid = false;
            player.setState(Player.STATE.EXPLOSION);
        }
    },

    onPlayerRespawn : {
        value : function (e, data) {
            var player = Network.clients[data.respawn].gameObject;
            player.position.x = player.customData.spawnPosition.x;
            player.position.y = player.customData.spawnPosition.y;
            player.setRotation(player.customData.spawnRotation);
            player.setState(GameObject.STATE.DEFAULT);
            player.health = player.maxHealth;
            player.solid = true;

            // Activate "spawn shield"
            player.takeDamage(0);

            // If this client's player is respawning, then make the camera
            // start following it again
            if (player === this.player) {
                this.camera.follow(player);
            }
        }
    },

    _handleInput : {
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

    _handlePlayerDeath : {
        value : function (dt) {
            if (this.player.customData.killer) {
                this.sendPlayerDeath();

                this.camera.follow(this.player.customData.killer);

                this.player.customData.killer = undefined;
                this.player.setState(Player.STATE.EXPLOSION);

                this.respawnTimeRemaining = this.respawnTime;
            }

            this.respawnTimeRemaining -= dt;
        }
    },

    _applyFriction : {
        value : function () {
            var gameObjects = this.getGameObjects();

            for (var i = 0; i < gameObjects.length; i++) {
                var obj = gameObjects[i];
                if (!obj.customData.ignoreFriction) {
                    obj.acceleration.multiply(GameScene.FRICTION);
                    obj.velocity.multiply(GameScene.FRICTION);
                }
            }
        }
    },

    _removeDeadGameObjects : {
        value : function () {
            var gameObjects = this.getGameObjects();

            // Go through all game objects and remove any that have been
            // flagged for removal
            for (var i = gameObjects.length - 1; i >= 0; i--) {
                var obj = gameObjects[i];

                if (obj.customData.removed === true) {
                    this.removeGameObject(obj);
                }
            }
        }
    }
}));

module.exports = GameScene;
},{"../entities":6,"../levels":9,"../network":12,"../util":27}],21:[function(require,module,exports){
"use strict";

var Scene = wfl.display.Scene;
var overlays = require('../overlays');
var Network = require('../network');

var GameStartScene = function (canvas, room) {
    Scene.call(this, canvas);

    this.room = room;

    $(Network).on(Network.Event.GAME_START_DATA, this._onGetStartData.bind(this));

    if (Network.isHost()) {
        Network.socket.emit(Network.Event.GAME_START_DATA, room.id);
    }

    this.loadingOverlay = new overlays.LoadingOverlay();
    $(canvas).parent().append(this.loadingOverlay.domObject);
};
Object.defineProperties(GameStartScene, {
    Event : {
        value : {
            START_GAME : "startGame"
        }
    }
});
GameStartScene.prototype = Object.freeze(Object.create(Scene.prototype, {
    destroy : {
        value : function () {
            this.loadingOverlay.domObject.remove();
        }
    },

    _onGetStartData : {
        value : function (e, data) {
            var teamA = data.teamA;
            var teamB = data.teamB;

            for (var i = 0; i < teamA.length; i++) {
                var ref = teamA[i];
                Network.clients[ref.id].data = ref;
            }

            for (var i = 0; i < teamB.length; i++) {
                var ref = teamB[i];
                Network.clients[ref.id].data = ref;
            }

            $(this).trigger(
                GameStartScene.Event.START_GAME,
                this.room
            );
        }
    }
}));
Object.freeze(GameStartScene);

module.exports = GameStartScene;
},{"../network":12,"../overlays":18}],22:[function(require,module,exports){
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
},{"../overlays":18}],23:[function(require,module,exports){
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
},{"../network":12,"../overlays":18}],24:[function(require,module,exports){
"use strict";

var LoadingScene = require('./LoadingScene.js');
var LobbyScene = require('./LobbyScene.js');
var GameStartScene = require('./GameStartScene.js');
var GameOverScene = require('./GameOverScene.js');
var GameScene = require('./GameScene.js');

module.exports = {
    LoadingScene   : LoadingScene,
    LobbyScene     : LobbyScene,
    GameStartScene : GameStartScene,
    GameOverScene  : GameOverScene,
    GameScene      : GameScene
};
},{"./GameOverScene.js":19,"./GameScene.js":20,"./GameStartScene.js":21,"./LoadingScene.js":22,"./LobbyScene.js":23}],25:[function(require,module,exports){
"use strict";

module.exports = {
    BG_TILE       : "./assets/img/BG-tile1.png",
    BLOCK_FULL    : "./assets/img/BlockFull.png",
    BLOCK_HALF    : "./assets/img/BlockHalf.png",
    SHIP_1        : "./assets/img/OtherShip.png",
    SHIP_2        : "./assets/img/Ship.png",
    WEAK_BULLET_1 : "./assets/img/BulletWeak_a.png",
    WEAK_BULLET_2 : "./assets/img/BulletWeak_b.png",
    WEAK_BULLET_3 : "./assets/img/BulletWeak_c.png",
    WEAK_BULLET_4 : "./assets/img/BulletWeak_d.png",
    EXPLOSION_A_1 : "./assets/img/OtherExplosion1.png",
    EXPLOSION_A_2 : "./assets/img/OtherExplosion2.png",
    EXPLOSION_A_3 : "./assets/img/OtherExplosion3.png",
    EXPLOSION_B_1 : "./assets/img/Explosion1.png",
    EXPLOSION_B_2 : "./assets/img/Explosion2.png",
    EXPLOSION_B_3 : "./assets/img/Explosion3.png",
    EXPLOSION_END : "./assets/img/ExplosionEnd.png",
    HP_FULL       : "./assets/img/HealthOrbFull.png",
    HP_EMPTY      : "./assets/img/HealthOrbEmpty.png",

    // Preloader replaces getter with appropriate definition
    get        : function (path) { }
};
},{}],26:[function(require,module,exports){
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
},{"./Assets.js":25}],27:[function(require,module,exports){
"use strict";

var Assets = require('./Assets.js');
var Preloader = require('./Preloader.js');

module.exports = {
    Assets    : Assets,
    Preloader : Preloader
};
},{"./Assets.js":25,"./Preloader.js":26}]},{},[7])(7)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvZ2FtZS9zcmMvZW50aXRpZXMvQnVsbGV0LmpzIiwiY2xpZW50L2dhbWUvc3JjL2VudGl0aWVzL0NsaWVudFBsYXllci5qcyIsImNsaWVudC9nYW1lL3NyYy9lbnRpdGllcy9GdWxsQmxvY2suanMiLCJjbGllbnQvZ2FtZS9zcmMvZW50aXRpZXMvSGFsZkJsb2NrLmpzIiwiY2xpZW50L2dhbWUvc3JjL2VudGl0aWVzL1BsYXllci5qcyIsImNsaWVudC9nYW1lL3NyYy9lbnRpdGllcy9pbmRleC5qcyIsImNsaWVudC9nYW1lL3NyYy9pbmRleC5qcyIsImNsaWVudC9nYW1lL3NyYy9sZXZlbHMvTGV2ZWwxLmpzIiwiY2xpZW50L2dhbWUvc3JjL2xldmVscy9pbmRleC5qcyIsImNsaWVudC9nYW1lL3NyYy9uZXR3b3JrL0NsaWVudC5qcyIsImNsaWVudC9nYW1lL3NyYy9uZXR3b3JrL0xvY2FsQ2xpZW50LmpzIiwiY2xpZW50L2dhbWUvc3JjL25ldHdvcmsvaW5kZXguanMiLCJjbGllbnQvZ2FtZS9zcmMvb3ZlcmxheXMvQ3JlYXRlUm9vbU92ZXJsYXkuanMiLCJjbGllbnQvZ2FtZS9zcmMvb3ZlcmxheXMvR2FtZU92ZXJPdmVybGF5LmpzIiwiY2xpZW50L2dhbWUvc3JjL292ZXJsYXlzL0xvYWRpbmdPdmVybGF5LmpzIiwiY2xpZW50L2dhbWUvc3JjL292ZXJsYXlzL0xvYmJ5T3ZlcmxheS5qcyIsImNsaWVudC9nYW1lL3NyYy9vdmVybGF5cy9PdmVybGF5LmpzIiwiY2xpZW50L2dhbWUvc3JjL292ZXJsYXlzL2luZGV4LmpzIiwiY2xpZW50L2dhbWUvc3JjL3NjZW5lcy9HYW1lT3ZlclNjZW5lLmpzIiwiY2xpZW50L2dhbWUvc3JjL3NjZW5lcy9HYW1lU2NlbmUuanMiLCJjbGllbnQvZ2FtZS9zcmMvc2NlbmVzL0dhbWVTdGFydFNjZW5lLmpzIiwiY2xpZW50L2dhbWUvc3JjL3NjZW5lcy9Mb2FkaW5nU2NlbmUuanMiLCJjbGllbnQvZ2FtZS9zcmMvc2NlbmVzL0xvYmJ5U2NlbmUuanMiLCJjbGllbnQvZ2FtZS9zcmMvc2NlbmVzL2luZGV4LmpzIiwiY2xpZW50L2dhbWUvc3JjL3V0aWwvQXNzZXRzLmpzIiwiY2xpZW50L2dhbWUvc3JjL3V0aWwvUHJlbG9hZGVyLmpzIiwiY2xpZW50L2dhbWUvc3JjL3V0aWwvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcclxudmFyIEFzc2V0cyA9IHV0aWwuQXNzZXRzO1xyXG52YXIgR2FtZU9iamVjdCA9IHdmbC5jb3JlLmVudGl0aWVzLkdhbWVPYmplY3Q7XHJcbnZhciBQaHlzaWNzT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuUGh5c2ljc09iamVjdDtcclxudmFyIGdlb20gPSB3ZmwuZ2VvbTtcclxuXHJcbi8qKlxyXG4gKiBQcm9qZWN0aWxlcyBjcmVhdGVkIGZyb20gYSBTaGlwXHJcbiAqL1xyXG52YXIgQnVsbGV0ID0gZnVuY3Rpb24gKGRhbWFnZSwgY3JlYXRvcikge1xyXG4gICAgaWYgKGlzTmFOKGRhbWFnZSkgfHwgZGFtYWdlIDw9IDApIHtcclxuICAgICAgICBkYW1hZ2UgPSAxO1xyXG4gICAgfVxyXG5cclxuICAgIFBoeXNpY3NPYmplY3QuY2FsbCh0aGlzKTtcclxuXHJcbiAgICB0aGlzLmNyZWF0b3IgPSBjcmVhdG9yO1xyXG4gICAgdGhpcy5jdXN0b21EYXRhLnRlYW0gPSBjcmVhdG9yLmN1c3RvbURhdGEudGVhbTtcclxuICAgIHRoaXMuY3VzdG9tRGF0YS5pZ25vcmVGcmljdGlvbiA9IHRydWU7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGRlZmF1bHQgc3RhdGVcclxuICAgIHRoaXMuZ3JhcGhpYzEgPSBBc3NldHMuZ2V0KEFzc2V0cy5XRUFLX0JVTExFVF8xKTtcclxuICAgIHRoaXMuZ3JhcGhpYzIgPSBBc3NldHMuZ2V0KEFzc2V0cy5XRUFLX0JVTExFVF8yKTtcclxuICAgIHRoaXMuZ3JhcGhpYzMgPSBBc3NldHMuZ2V0KEFzc2V0cy5XRUFLX0JVTExFVF8zKTtcclxuICAgIHRoaXMuZ3JhcGhpYzQgPSBBc3NldHMuZ2V0KEFzc2V0cy5XRUFLX0JVTExFVF80KTtcclxuICAgIHRoaXMuZGVmYXVsdFN0YXRlID0gdGhpcy5jcmVhdGVTdGF0ZSgpO1xyXG4gICAgdGhpcy5kZWZhdWx0U3RhdGUuYWRkRnJhbWUoXHJcbiAgICAgICAgdGhpcy5jcmVhdGVGcmFtZSh0aGlzLmdyYXBoaWMxLCAyKVxyXG4gICAgKTtcclxuICAgIHRoaXMuZGVmYXVsdFN0YXRlLmFkZEZyYW1lKFxyXG4gICAgICAgIHRoaXMuY3JlYXRlRnJhbWUodGhpcy5ncmFwaGljMiwgMilcclxuICAgICk7XHJcbiAgICB0aGlzLmRlZmF1bHRTdGF0ZS5hZGRGcmFtZShcclxuICAgICAgICB0aGlzLmNyZWF0ZUZyYW1lKHRoaXMuZ3JhcGhpYzMsIDIpXHJcbiAgICApO1xyXG4gICAgdGhpcy5kZWZhdWx0U3RhdGUuYWRkRnJhbWUoXHJcbiAgICAgICAgdGhpcy5jcmVhdGVGcmFtZSh0aGlzLmdyYXBoaWM0LCAyKVxyXG4gICAgKTtcclxuICAgIHRoaXMuYWRkU3RhdGUoR2FtZU9iamVjdC5TVEFURS5ERUZBVUxULCB0aGlzLmRlZmF1bHRTdGF0ZSk7XHJcblxyXG4gICAgdGhpcy5kYW1hZ2UgPSBkYW1hZ2U7XHJcbiAgICB0aGlzLmFnZSA9IDA7XHJcbiAgICB0aGlzLmxpZmVUaW1lID0gQnVsbGV0LkRFRkFVTFRfTUFYX0xJRkVfVElNRTtcclxuICAgIHRoaXMubWF4U3BlZWQgPSBCdWxsZXQuREVGQVVMVF9NQVhfU1BFRUQ7XHJcbiAgICB0aGlzLnNvbGlkID0gdHJ1ZTtcclxufTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoQnVsbGV0LCB7XHJcbiAgICBERUZBVUxUX01BWF9MSUZFX1RJTUUgOiB7XHJcbiAgICAgICAgdmFsdWUgOiA0MFxyXG4gICAgfSxcclxuXHJcbiAgICBERUZBVUxUX1NQRUVEIDoge1xyXG4gICAgICAgIHZhbHVlIDogMC42NVxyXG4gICAgfSxcclxuXHJcbiAgICBERUZBVUxUX01BWF9TUEVFRCA6IHtcclxuICAgICAgICB2YWx1ZSA6IDAuOFxyXG4gICAgfVxyXG59KTtcclxuQnVsbGV0LnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShQaHlzaWNzT2JqZWN0LnByb3RvdHlwZSwge1xyXG4gICAgdXBkYXRlIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGR0KSB7XHJcbiAgICAgICAgICAgIFBoeXNpY3NPYmplY3QucHJvdG90eXBlLnVwZGF0ZS5jYWxsKHRoaXMsIGR0KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYWdlKys7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5hZ2UgPj0gdGhpcy5saWZlVGltZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXN0b21EYXRhLnJlbW92ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICByZXNvbHZlQ29sbGlzaW9uIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKHBoeXNPYmosIGNvbGxpc2lvbkRhdGEpIHtcclxuICAgICAgICAgICAgdmFyIHRlYW0gPSB0aGlzLmN1c3RvbURhdGEudGVhbTtcclxuICAgICAgICAgICAgdmFyIG90aGVyVGVhbSA9IHBoeXNPYmouY3VzdG9tRGF0YS50ZWFtO1xyXG5cclxuICAgICAgICAgICAgaWYgKHBoeXNPYmogIT09IHRoaXMuY3JlYXRvciAmJiBwaHlzT2JqLnNvbGlkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbURhdGEucmVtb3ZlZCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gSWYgaGl0dGluZyBzb21ldGhpbmcgdGhhdCdzIG9uIGEgdGVhbSAocGxheWVyLCBidWxsZXQsXHJcbiAgICAgICAgICAgICAgICAvLyBldGMpLi4uXHJcbiAgICAgICAgICAgICAgICBpZiAob3RoZXJUZWFtICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgYnVsbGV0IGhpdHMgYSBwbGF5ZXIgb24gYSBkaWZmZXJlbnQgdGVhbSwgZGVhbFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGRhbWFnZSB0byB0aGVtXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG90aGVyVGVhbSAhPT0gdGVhbSAmJiBwaHlzT2JqLnRha2VEYW1hZ2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGh5c09iai50YWtlRGFtYWdlKHRoaXMuZGFtYWdlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIGtpbGxlZCB0aGUgcGxheWVyLCB3ZSdsbCBtYWtlIHRoZSBjYW0gZm9sbG93IHRoaXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYnVsbGV0J3MgY3JlYXRvclxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGh5c09iai5oZWFsdGggPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGh5c09iai5jdXN0b21EYXRhLmtpbGxlciA9IHRoaXMuY3JlYXRvcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkpO1xyXG5PYmplY3QuZnJlZXplKEJ1bGxldCk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJ1bGxldDsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xyXG52YXIgQXNzZXRzID0gdXRpbC5Bc3NldHM7XHJcbnZhciBQbGF5ZXIgPSByZXF1aXJlKCcuL1BsYXllcicpO1xyXG52YXIgTGl2aW5nT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuTGl2aW5nT2JqZWN0O1xyXG52YXIgZ2VvbSA9IHdmbC5nZW9tO1xyXG5cclxudmFyIENsaWVudFBsYXllciA9IGZ1bmN0aW9uICh0ZWFtKSB7XHJcbiAgICBQbGF5ZXIuY2FsbCh0aGlzLCB0ZWFtKTtcclxufTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoQ2xpZW50UGxheWVyLCB7XHJcbiAgICBNSU5JTUFQX0ZJTExfU1RZTEUgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBcIiMwNmM4MzNcIlxyXG4gICAgfVxyXG59KTtcclxuQ2xpZW50UGxheWVyLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShQbGF5ZXIucHJvdG90eXBlLCB7XHJcbiAgICB1cGRhdGUgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZHQpIHtcclxuICAgICAgICAgICAgTGl2aW5nT2JqZWN0LnByb3RvdHlwZS51cGRhdGUuY2FsbCh0aGlzLCBkdCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIFxyXG4gICAgZHJhd09uTWluaW1hcCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChjdHgpIHtcclxuICAgICAgICAgICAgdmFyIHcgPSB0aGlzLmdldFdpZHRoKCk7XHJcbiAgICAgICAgICAgIHZhciBoID0gdGhpcy5nZXRIZWlnaHQoKTtcclxuICAgICAgICAgICAgdmFyIG9mZnNldFggPSBNYXRoLnJvdW5kKC13ICogMC41KTtcclxuICAgICAgICAgICAgdmFyIG9mZnNldFkgPSBNYXRoLnJvdW5kKC1oICogMC41KTtcclxuICAgICAgICAgICAgdmFyIGRpc3BsYXlXaWR0aCA9IE1hdGgucm91bmQodyk7XHJcbiAgICAgICAgICAgIHZhciBkaXNwbGF5SGVpZ2h0ID0gTWF0aC5yb3VuZChoKTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5zYXZlKCk7XHJcblxyXG4gICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gQ2xpZW50UGxheWVyLk1JTklNQVBfRklMTF9TVFlMRTtcclxuICAgICAgICAgICAgY3R4LmZpbGxSZWN0KG9mZnNldFgsIG9mZnNldFksIGRpc3BsYXlXaWR0aCwgZGlzcGxheUhlaWdodCk7XHJcblxyXG4gICAgICAgICAgICBjdHgucmVzdG9yZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgc2hvb3QgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7IH1cclxuICAgIH0sXHJcblxyXG4gICAganVzdFNob3QgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7IH1cclxuICAgIH1cclxufSkpO1xyXG5PYmplY3QuZnJlZXplKENsaWVudFBsYXllcik7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENsaWVudFBsYXllcjsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xyXG52YXIgQXNzZXRzID0gdXRpbC5Bc3NldHM7XHJcbnZhciBHYW1lT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuR2FtZU9iamVjdDtcclxudmFyIFBoeXNpY3NPYmplY3QgPSB3ZmwuY29yZS5lbnRpdGllcy5QaHlzaWNzT2JqZWN0O1xyXG5cclxuLyoqXHJcbiAqIEEgZnVsbC1zaXplZCwgcXVhZHJpbGF0ZXJhbCBibG9ja1xyXG4gKi9cclxudmFyIEZ1bGxCbG9jayA9IGZ1bmN0aW9uICgpIHtcclxuICAgIFBoeXNpY3NPYmplY3QuY2FsbCh0aGlzKTtcclxuXHJcbiAgICB0aGlzLmlkID0gRnVsbEJsb2NrLmlkO1xyXG5cclxuICAgIC8vIENyZWF0ZSBkZWZhdWx0IHN0YXRlXHJcbiAgICB0aGlzLmRlZmF1bHRHcmFwaGljID0gQXNzZXRzLmdldChBc3NldHMuQkxPQ0tfRlVMTCk7XHJcbiAgICB0aGlzLmRlZmF1bHRTdGF0ZSA9IHRoaXMuY3JlYXRlU3RhdGUoKTtcclxuICAgIHRoaXMuZGVmYXVsdFN0YXRlLmFkZEZyYW1lKFxyXG4gICAgICAgIHRoaXMuY3JlYXRlRnJhbWUodGhpcy5kZWZhdWx0R3JhcGhpYylcclxuICAgICk7XHJcbiAgICB0aGlzLmFkZFN0YXRlKEdhbWVPYmplY3QuU1RBVEUuREVGQVVMVCwgdGhpcy5kZWZhdWx0U3RhdGUpO1xyXG5cclxuICAgIHRoaXMuc29saWQgPSB0cnVlO1xyXG4gICAgdGhpcy5maXhlZCA9IHRydWU7XHJcbiAgICB0aGlzLnJvdGF0ZSgtTWF0aC5QSSAqIDAuNSk7XHJcbn07XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKEZ1bGxCbG9jaywge1xyXG4gICAgbmFtZSA6IHtcclxuICAgICAgICB2YWx1ZSA6IFwiRnVsbEJsb2NrXCJcclxuICAgIH0sXHJcblxyXG4gICAgaWQgOiB7XHJcbiAgICAgICAgdmFsdWUgOiAwXHJcbiAgICB9XHJcbn0pO1xyXG5GdWxsQmxvY2sucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKFBoeXNpY3NPYmplY3QucHJvdG90eXBlLCB7XHJcbiAgICBkcmF3T25NaW5pbWFwIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGN0eCkge1xyXG4gICAgICAgICAgICB2YXIgdyA9IHRoaXMuZ2V0V2lkdGgoKTtcclxuICAgICAgICAgICAgdmFyIGggPSB0aGlzLmdldEhlaWdodCgpO1xyXG4gICAgICAgICAgICB2YXIgb2Zmc2V0WCA9IE1hdGgucm91bmQoLXcgKiAwLjUpO1xyXG4gICAgICAgICAgICB2YXIgb2Zmc2V0WSA9IE1hdGgucm91bmQoLWggKiAwLjUpO1xyXG4gICAgICAgICAgICB2YXIgZGlzcGxheVdpZHRoID0gTWF0aC5yb3VuZCh3KTtcclxuICAgICAgICAgICAgdmFyIGRpc3BsYXlIZWlnaHQgPSBNYXRoLnJvdW5kKGgpO1xyXG5cclxuICAgICAgICAgICAgY3R4LnNhdmUoKTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5yb3RhdGUodGhpcy5nZXRSb3RhdGlvbigpKTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgY3R4LnJlY3Qob2Zmc2V0WCwgb2Zmc2V0WSwgZGlzcGxheVdpZHRoLCBkaXNwbGF5SGVpZ2h0KTtcclxuICAgICAgICAgICAgY3R4LmZpbGwoKTtcclxuICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xyXG5cclxuICAgICAgICAgICAgY3R4LnJlc3RvcmUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKTtcclxuT2JqZWN0LmZyZWV6ZShGdWxsQmxvY2spO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBGdWxsQmxvY2s7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcclxudmFyIEFzc2V0cyA9IHV0aWwuQXNzZXRzO1xyXG52YXIgR2FtZU9iamVjdCA9IHdmbC5jb3JlLmVudGl0aWVzLkdhbWVPYmplY3Q7XHJcbnZhciBQaHlzaWNzT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuUGh5c2ljc09iamVjdDtcclxudmFyIGdlb20gPSB3ZmwuZ2VvbTtcclxuXHJcbi8qKlxyXG4gKiBBIGZ1bGwtc2l6ZWQsIHF1YWRyaWxhdGVyYWwgYmxvY2tcclxuICovXHJcbnZhciBIYWxmQmxvY2sgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBQaHlzaWNzT2JqZWN0LmNhbGwodGhpcyk7XHJcblxyXG4gICAgdGhpcy5pZCA9IEhhbGZCbG9jay5pZDtcclxuXHJcbiAgICAvLyBDcmVhdGUgZGVmYXVsdCBzdGF0ZVxyXG4gICAgdGhpcy5kZWZhdWx0R3JhcGhpYyA9IEFzc2V0cy5nZXQoQXNzZXRzLkJMT0NLX0hBTEYpO1xyXG5cclxuICAgIHZhciB3ID0gdGhpcy5kZWZhdWx0R3JhcGhpYy53aWR0aDtcclxuICAgIHZhciBoID0gdGhpcy5kZWZhdWx0R3JhcGhpYy5oZWlnaHQ7XHJcbiAgICB2YXIgdmVydHMgPSBbXHJcbiAgICAgICAgbmV3IGdlb20uVmVjMigtdyAqIDAuNSwgLWggKiAwLjUpLFxyXG4gICAgICAgIG5ldyBnZW9tLlZlYzIodyAqIDAuNSwgLWggKiAwLjUpLFxyXG4gICAgICAgIG5ldyBnZW9tLlZlYzIoLXcgKiAwLjUsIGggKiAwLjUpXHJcbiAgICBdO1xyXG4gICAgdmFyIGZyYW1lT2JqID0gdGhpcy5jcmVhdGVGcmFtZSh0aGlzLmRlZmF1bHRHcmFwaGljLCAxLCBmYWxzZSk7XHJcbiAgICBmcmFtZU9iai52ZXJ0aWNlcyA9IHZlcnRzO1xyXG5cclxuICAgIHRoaXMuZGVmYXVsdFN0YXRlID0gdGhpcy5jcmVhdGVTdGF0ZSgpO1xyXG4gICAgdGhpcy5kZWZhdWx0U3RhdGUuYWRkRnJhbWUoZnJhbWVPYmopO1xyXG4gICAgdGhpcy5hZGRTdGF0ZShHYW1lT2JqZWN0LlNUQVRFLkRFRkFVTFQsIHRoaXMuZGVmYXVsdFN0YXRlKTtcclxuXHJcbiAgICB0aGlzLnNvbGlkID0gdHJ1ZTtcclxuICAgIHRoaXMuZml4ZWQgPSB0cnVlO1xyXG4gICAgdGhpcy5yb3RhdGUoLU1hdGguUEkgKiAwLjUpO1xyXG59O1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhIYWxmQmxvY2ssIHtcclxuICAgIG5hbWUgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBcIkhhbGZCbG9ja1wiXHJcbiAgICB9LFxyXG5cclxuICAgIGlkIDoge1xyXG4gICAgICAgIHZhbHVlIDogMFxyXG4gICAgfVxyXG59KTtcclxuSGFsZkJsb2NrLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShQaHlzaWNzT2JqZWN0LnByb3RvdHlwZSwge1xyXG4gICAgZHJhd09uTWluaW1hcCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChjdHgpIHtcclxuICAgICAgICAgICAgdmFyIHcgPSB0aGlzLmdldFdpZHRoKCk7XHJcbiAgICAgICAgICAgIHZhciBoID0gdGhpcy5nZXRIZWlnaHQoKTtcclxuICAgICAgICAgICAgdmFyIG9mZnNldFggPSBNYXRoLnJvdW5kKC13ICogMC41KTtcclxuICAgICAgICAgICAgdmFyIG9mZnNldFkgPSBNYXRoLnJvdW5kKC1oICogMC41KTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5zYXZlKCk7XHJcbiAgICAgICAgICAgIGN0eC5yb3RhdGUodGhpcy5nZXRSb3RhdGlvbigpKTtcclxuICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IGFwcC5QaHlzaWNzT2JqZWN0Lk1JTklNQVBfRklMTF9TVFlMRTtcclxuICAgICAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gYXBwLlBoeXNpY3NPYmplY3QuTUlOSU1BUF9TVFJPS0VfU1RZTEU7XHJcbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgY3R4Lm1vdmVUbyhvZmZzZXRYLCBvZmZzZXRZKTtcclxuICAgICAgICAgICAgY3R4LmxpbmVUbygtb2Zmc2V0WCwgb2Zmc2V0WSk7XHJcbiAgICAgICAgICAgIGN0eC5saW5lVG8ob2Zmc2V0WCwgLW9mZnNldFkpO1xyXG4gICAgICAgICAgICBjdHguY2xvc2VQYXRoKCk7XHJcbiAgICAgICAgICAgIGN0eC5maWxsKCk7XHJcbiAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5yZXN0b3JlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSk7XHJcbk9iamVjdC5mcmVlemUoSGFsZkJsb2NrKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gSGFsZkJsb2NrOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyk7XHJcbnZhciBBc3NldHMgPSB1dGlsLkFzc2V0cztcclxudmFyIE5ldHdvcmsgPSByZXF1aXJlKCcuLi9uZXR3b3JrJyk7XHJcbnZhciBHYW1lT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuR2FtZU9iamVjdDtcclxudmFyIExpdmluZ09iamVjdCA9IHdmbC5jb3JlLmVudGl0aWVzLkxpdmluZ09iamVjdDtcclxudmFyIGdlb20gPSB3ZmwuZ2VvbTtcclxuXHJcbnZhciBQbGF5ZXIgPSBmdW5jdGlvbiAodGVhbSkge1xyXG4gICAgTGl2aW5nT2JqZWN0LmNhbGwodGhpcyk7XHJcblxyXG4gICAgdGhpcy5jdXN0b21EYXRhLnRlYW0gPSB0ZWFtO1xyXG5cclxuICAgIHZhciBzaGlwVHlwZTtcclxuICAgIGlmICh0ZWFtID09PSAwKSB7XHJcbiAgICAgICAgc2hpcFR5cGUgPSBBc3NldHMuU0hJUF8xO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBzaGlwVHlwZSA9IEFzc2V0cy5TSElQXzI7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ3JlYXRlIGRlZmF1bHQgc3RhdGVcclxuICAgIHRoaXMuZGVmYXVsdEdyYXBoaWMgPSBBc3NldHMuZ2V0KHNoaXBUeXBlKTtcclxuXHJcbiAgICB2YXIgdyA9IHRoaXMuZGVmYXVsdEdyYXBoaWMud2lkdGg7XHJcbiAgICB2YXIgaCA9IHRoaXMuZGVmYXVsdEdyYXBoaWMuaGVpZ2h0O1xyXG4gICAgdmFyIHZlcnRzID0gW1xyXG4gICAgICAgIG5ldyBnZW9tLlZlYzIoLXcgKiAwLjUsIC1oICogMC41KSxcclxuICAgICAgICBuZXcgZ2VvbS5WZWMyKHcgKiAwLjUsIDApLFxyXG4gICAgICAgIG5ldyBnZW9tLlZlYzIoLXcgKiAwLjUsIGggKiAwLjUpXHJcbiAgICBdO1xyXG4gICAgdmFyIGZyYW1lT2JqID0gdGhpcy5jcmVhdGVGcmFtZSh0aGlzLmRlZmF1bHRHcmFwaGljLCAxLCBmYWxzZSk7XHJcbiAgICBmcmFtZU9iai52ZXJ0aWNlcyA9IHZlcnRzO1xyXG5cclxuICAgIHRoaXMuZGVmYXVsdFN0YXRlID0gdGhpcy5jcmVhdGVTdGF0ZSgpO1xyXG4gICAgdGhpcy5kZWZhdWx0U3RhdGUuYWRkRnJhbWUoZnJhbWVPYmopO1xyXG4gICAgdGhpcy5hZGRTdGF0ZShHYW1lT2JqZWN0LlNUQVRFLkRFRkFVTFQsIHRoaXMuZGVmYXVsdFN0YXRlKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgZXhwbG9zaW9uIHN0YXRlXHJcblxyXG4gICAgaWYgKHRlYW0gPT09IDApIHtcclxuICAgICAgICB0aGlzLmV4cGxvc2lvbkdyYXBoaWMxID0gQXNzZXRzLmdldChBc3NldHMuRVhQTE9TSU9OX0FfMSk7XHJcbiAgICAgICAgdGhpcy5leHBsb3Npb25HcmFwaGljMiA9IEFzc2V0cy5nZXQoQXNzZXRzLkVYUExPU0lPTl9BXzIpO1xyXG4gICAgICAgIHRoaXMuZXhwbG9zaW9uR3JhcGhpYzMgPSBBc3NldHMuZ2V0KEFzc2V0cy5FWFBMT1NJT05fQV8zKTtcclxuICAgICAgICB0aGlzLmV4cGxvc2lvbkdyYXBoaWM0ID0gQXNzZXRzLmdldChBc3NldHMuRVhQTE9TSU9OX0VORCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZXhwbG9zaW9uR3JhcGhpYzEgPSBBc3NldHMuZ2V0KEFzc2V0cy5FWFBMT1NJT05fQl8xKTtcclxuICAgICAgICB0aGlzLmV4cGxvc2lvbkdyYXBoaWMyID0gQXNzZXRzLmdldChBc3NldHMuRVhQTE9TSU9OX0JfMik7XHJcbiAgICAgICAgdGhpcy5leHBsb3Npb25HcmFwaGljMyA9IEFzc2V0cy5nZXQoQXNzZXRzLkVYUExPU0lPTl9CXzMpO1xyXG4gICAgICAgIHRoaXMuZXhwbG9zaW9uR3JhcGhpYzQgPSBBc3NldHMuZ2V0KEFzc2V0cy5FWFBMT1NJT05fRU5EKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmV4cGxvc2lvblN0YXRlID0gdGhpcy5jcmVhdGVTdGF0ZSgpO1xyXG5cclxuICAgIHRoaXMuZXhwbG9zaW9uU3RhdGUuYWRkRnJhbWUodGhpcy5jcmVhdGVGcmFtZSh0aGlzLmV4cGxvc2lvbkdyYXBoaWMxLCAyKSk7XHJcbiAgICB0aGlzLmV4cGxvc2lvblN0YXRlLmFkZEZyYW1lKHRoaXMuY3JlYXRlRnJhbWUodGhpcy5leHBsb3Npb25HcmFwaGljMiwgMikpO1xyXG4gICAgdGhpcy5leHBsb3Npb25TdGF0ZS5hZGRGcmFtZSh0aGlzLmNyZWF0ZUZyYW1lKHRoaXMuZXhwbG9zaW9uR3JhcGhpYzMsIDIpKTtcclxuICAgIHRoaXMuZXhwbG9zaW9uU3RhdGUuYWRkRnJhbWUodGhpcy5jcmVhdGVGcmFtZSh0aGlzLmV4cGxvc2lvbkdyYXBoaWM0LCBJbmZpbml0eSkpO1xyXG4gICAgdGhpcy5hZGRTdGF0ZShQbGF5ZXIuU1RBVEUuRVhQTE9TSU9OLCB0aGlzLmV4cGxvc2lvblN0YXRlKTtcclxuXHJcbiAgICB0aGlzLnNob290VGltZXIgPSAwO1xyXG4gICAgdGhpcy5tYXhTaG9vdFRpbWVyID0gUGxheWVyLkRFRkFVTFRfTUFYX1NIT09UX1RJTUVSO1xyXG5cclxuICAgIHRoaXMuaGVhbHRoID0gTmV0d29yay5sb2NhbENsaWVudC5kYXRhLmhlYWx0aDtcclxuICAgIHRoaXMubWF4SGVhbHRoID0gTmV0d29yay5sb2NhbENsaWVudC5kYXRhLmhlYWx0aDtcclxuXHJcbiAgICB0aGlzLnJvdGF0ZSgtTWF0aC5QSSAqIDAuNSk7XHJcbn07XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKFBsYXllciwge1xyXG4gICAgVFVSTl9TUEVFRCA6IHtcclxuICAgICAgICB2YWx1ZSA6IDAuMDVcclxuICAgIH0sXHJcblxyXG4gICAgQlJBS0VfUkFURSA6IHtcclxuICAgICAgICB2YWx1ZSA6IDAuOTVcclxuICAgIH0sXHJcblxyXG4gICAgQk9PU1RfQUNDRUxFUkFUSU9OIDoge1xyXG4gICAgICAgIHZhbHVlIDogMC4wMDAyXHJcbiAgICB9LFxyXG5cclxuICAgIFBPU0lUSU9OX1VQREFURV9ESVNUQU5DRSA6IHtcclxuICAgICAgICB2YWx1ZSA6IDAuNVxyXG4gICAgfSxcclxuXHJcbiAgICBNSU5JTUFQX0ZJTExfU1RZTEUgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBcIiM4NmM4ZDNcIlxyXG4gICAgfSxcclxuXHJcbiAgICBERUZBVUxUX01BWF9TSE9PVF9USU1FUiA6IHtcclxuICAgICAgICB2YWx1ZSA6IDIwXHJcbiAgICB9LFxyXG5cclxuICAgIFNUQVRFIDoge1xyXG4gICAgICAgIHZhbHVlIDoge1xyXG4gICAgICAgICAgICBFWFBMT1NJT04gOiBcImV4cGxvc2lvblwiXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KTtcclxuUGxheWVyLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShMaXZpbmdPYmplY3QucHJvdG90eXBlLCB7XHJcbiAgICB1cGRhdGUgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZHQpIHtcclxuICAgICAgICAgICAgTGl2aW5nT2JqZWN0LnByb3RvdHlwZS51cGRhdGUuY2FsbCh0aGlzLCBkdCk7XHJcblxyXG4gICAgICAgICAgICAvLyBVcGRhdGUgc2hvb3QgdGltZXIgd2hlbiBqdXN0IHNob3RcclxuICAgICAgICAgICAgaWYgKHRoaXMuanVzdFNob3QoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zaG9vdFRpbWVyKys7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2hvb3RUaW1lciA+PSB0aGlzLm1heFNob290VGltZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNob290VGltZXIgPSAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBJZiB0aGUgcGxheWVyIGlzIGNvbm5lY3RlZCB0byB0aGUgbmV0d29yaywgc2VuZCBvdXQgdXBkYXRlcyB0b1xyXG4gICAgICAgICAgICAvLyBvdGhlciBwbGF5ZXJzIHdoZW4gbmVjZXNzYXJ5XHJcbiAgICAgICAgICAgIGlmIChOZXR3b3JrLmNvbm5lY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgTmV0d29yay5zb2NrZXQuZW1pdCgndXBkYXRlT3RoZXInLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb24gICAgIDogdGhpcy5wb3NpdGlvbixcclxuICAgICAgICAgICAgICAgICAgICB2ZWxvY2l0eSAgICAgOiB0aGlzLnZlbG9jaXR5LFxyXG4gICAgICAgICAgICAgICAgICAgIGFjY2VsZXJhdGlvbiA6IHRoaXMuYWNjZWxlcmF0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIHJvdGF0aW9uICAgICA6IHRoaXMuZ2V0Um90YXRpb24oKVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGRyYXdPbk1pbmltYXAgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoY3R4KSB7XHJcbiAgICAgICAgICAgIHZhciB3ID0gdGhpcy5nZXRXaWR0aCgpO1xyXG4gICAgICAgICAgICB2YXIgaCA9IHRoaXMuZ2V0SGVpZ2h0KCk7XHJcbiAgICAgICAgICAgIHZhciBvZmZzZXRYID0gTWF0aC5yb3VuZCgtdyAqIDAuNSk7XHJcbiAgICAgICAgICAgIHZhciBvZmZzZXRZID0gTWF0aC5yb3VuZCgtaCAqIDAuNSk7XHJcbiAgICAgICAgICAgIHZhciBkaXNwbGF5V2lkdGggPSBNYXRoLnJvdW5kKHcpO1xyXG4gICAgICAgICAgICB2YXIgZGlzcGxheUhlaWdodCA9IE1hdGgucm91bmQoaCk7XHJcblxyXG4gICAgICAgICAgICBjdHguc2F2ZSgpO1xyXG5cclxuICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFBsYXllci5NSU5JTUFQX0ZJTExfU1RZTEU7XHJcbiAgICAgICAgICAgIGN0eC5maWxsUmVjdChvZmZzZXRYLCBvZmZzZXRZLCBkaXNwbGF5V2lkdGgsIGRpc3BsYXlIZWlnaHQpO1xyXG5cclxuICAgICAgICAgICAgY3R4LnJlc3RvcmUoKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHNob290IDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuanVzdFNob3QoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zaG9vdFRpbWVyID0gMTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoTmV0d29yay5jb25uZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBOZXR3b3JrLnNvY2tldC5lbWl0KCdidWxsZXQnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uICAgICA6IHRoaXMucG9zaXRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlbG9jaXR5ICAgICA6IHRoaXMudmVsb2NpdHksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjY2VsZXJhdGlvbiA6IHRoaXMuYWNjZWxlcmF0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByb3RhdGlvbiAgICAgOiB0aGlzLmdldFJvdGF0aW9uKClcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAganVzdFNob3QgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAodGhpcy5zaG9vdFRpbWVyID4gMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICByZXNvbHZlQ29sbGlzaW9uIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKHBoeXNPYmosIGNvbGxpc2lvbkRhdGEpIHtcclxuICAgICAgICAgICAgdmFyIHRlYW0gPSB0aGlzLmN1c3RvbURhdGEudGVhbTtcclxuICAgICAgICAgICAgdmFyIG90aGVyVGVhbSA9IHBoeXNPYmouY3VzdG9tRGF0YS50ZWFtO1xyXG5cclxuICAgICAgICAgICAgLy8gSWYgaGl0dGluZyBzb21ldGhpbmcgdGhhdCdzIG5vdCBvbiB0aGlzIHRlYW1cclxuICAgICAgICAgICAgaWYgKG90aGVyVGVhbSA9PT0gdW5kZWZpbmVkIHx8IG90aGVyVGVhbSAhPT0gdGVhbSB8fCBwaHlzT2JqLnRha2VEYW1hZ2UpIHtcclxuICAgICAgICAgICAgICAgIExpdmluZ09iamVjdC5wcm90b3R5cGUucmVzb2x2ZUNvbGxpc2lvbi5jYWxsKHRoaXMsIHBoeXNPYmosIGNvbGxpc2lvbkRhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSk7XHJcbk9iamVjdC5mcmVlemUoUGxheWVyKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUGxheWVyOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIEZ1bGxCbG9jayA9IHJlcXVpcmUoJy4vRnVsbEJsb2NrLmpzJyk7XHJcbnZhciBIYWxmQmxvY2sgPSByZXF1aXJlKCcuL0hhbGZCbG9jay5qcycpO1xyXG52YXIgUGxheWVyID0gcmVxdWlyZSgnLi9QbGF5ZXIuanMnKTtcclxudmFyIENsaWVudFBsYXllciA9IHJlcXVpcmUoJy4vQ2xpZW50UGxheWVyLmpzJyk7XHJcbnZhciBCdWxsZXQgPSByZXF1aXJlKCcuL0J1bGxldC5qcycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBGdWxsQmxvY2sgICAgOiBGdWxsQmxvY2ssXHJcbiAgICBIYWxmQmxvY2sgICAgOiBIYWxmQmxvY2ssXHJcbiAgICBQbGF5ZXIgICAgICAgOiBQbGF5ZXIsXHJcbiAgICBDbGllbnRQbGF5ZXIgOiBDbGllbnRQbGF5ZXIsXHJcbiAgICBCdWxsZXQgICAgICAgOiBCdWxsZXRcclxufTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBOZXR3b3JrID0gcmVxdWlyZSgnLi9uZXR3b3JrJyk7XHJcbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XHJcbnZhciBBc3NldHMgPSB1dGlsLkFzc2V0cztcclxudmFyIHNjZW5lcyA9IHJlcXVpcmUoJy4vc2NlbmVzJyk7XHJcbnZhciBvdmVybGF5cyA9IHJlcXVpcmUoJy4vb3ZlcmxheXMnKTtcclxuXHJcbi8vIENyZWF0ZSBnYW1lXHJcbnZhciBjYW52YXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2dhbWUtY2FudmFzXCIpO1xyXG52YXIgZ2FtZSAgID0gd2ZsLmNyZWF0ZShjYW52YXMpO1xyXG5cclxudmFyIGxvYWRpbmdTY2VuZSA9IG5ldyBzY2VuZXMuTG9hZGluZ1NjZW5lKGNhbnZhcyk7XHJcbmdhbWUuc2V0U2NlbmUobG9hZGluZ1NjZW5lKTtcclxuXHJcbi8vIFN0b3AgdGhlIGdhbWUgc28gdGhhdCBjYW52YXMgdXBkYXRlcyBkb24ndCBhZmZlY3QgcGVyZm9ybWFuY2Ugd2l0aFxyXG4vLyBvdmVybGF5c1xyXG5nYW1lLnN0b3AoKTtcclxuXHJcbi8vIERyYXcgaW5pdGlhbCBibGFjayBCRyBvbiBjYW52YXNcclxudmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcbmN0eC5maWxsU3R5bGUgPSBcIiMwNDBCMENcIjtcclxuY3R4LmZpbGxSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XHJcblxyXG52YXIgb25Mb2FkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgJChOZXR3b3JrKS5vbihcclxuICAgICAgICBOZXR3b3JrLkV2ZW50LkNPTk5FQ1QsXHJcbiAgICAgICAgb25OZXR3b3JrQ29ubmVjdFxyXG4gICAgKTtcclxuXHJcbiAgICBOZXR3b3JrLmluaXQoKTtcclxufTtcclxuXHJcbnZhciBnb1RvR2FtZSA9IGZ1bmN0aW9uIChyb29tKSB7XHJcbiAgICAvLyBVcGRhdGUgdGhlIGdhbWUgd2l0aCB0aGUgY3VycmVudCB0aW1lIGJlY2F1c2UgdGhlIGR0IHdpbGwgYmUgaHVnZSBuZXh0XHJcbiAgICAvLyB1cGRhdGUgc2luY2UgdGhlIGdhbWUgd2FzIHN0b3BwZWQgd2hpbGUgaW4gdGhlIGxvYmJ5XHJcbiAgICBnYW1lLnVwZGF0ZShEYXRlLm5vdygpKTtcclxuXHJcbiAgICAkKGdhbWUuZ2V0U2NlbmUoKSkub2ZmKCk7XHJcblxyXG4gICAgdmFyIGdhbWVTY2VuZSA9IG5ldyBzY2VuZXMuR2FtZVNjZW5lKGNhbnZhcywgcm9vbSk7XHJcbiAgICBnYW1lLnNldFNjZW5lKGdhbWVTY2VuZSk7XHJcblxyXG4gICAgJChOZXR3b3JrKS5vbihcclxuICAgICAgICBOZXR3b3JrLkV2ZW50LkVORF9HQU1FLFxyXG4gICAgICAgIG9uRW5kR2FtZVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBJZiB0aGUgcGxheWVyIHJlY2VpdmVzIGRhdGEgZm9yIGdhbWUgb3ZlciBiZWZvcmUgdGhleSBhY3R1YWxseSBsb2FkIHRoZVxyXG4gICAgLy8gZ2F2ZSBvdmVyIHNjcmVlbiwgc2tpcCBpbW1lZGlhdGVseSB0byB0aGUgZ2FtZSBvdmVyIHNjcmVlbiAoYmVjYXVzZSBvbmx5XHJcbiAgICAvLyB0aGUgaG9zdCB3b3VsZCBzZW5kIHRoYXQgZGF0YSlcclxuICAgICQoTmV0d29yaykub24oXHJcbiAgICAgICAgTmV0d29yay5FdmVudC5HQU1FX09WRVJfREFUQSxcclxuICAgICAgICByb29tLFxyXG4gICAgICAgIG9uR2V0R2FtZU92ZXJEYXRhXHJcbiAgICApO1xyXG5cclxuICAgIC8vIFN0YXJ0IHRoZSBnYW1lIHNpbmNlIGl0IHdhcyBzdG9wcGVkIHRvIGhlbHAgcGVyZm9ybWFuY2Ugd2l0aCBvdmVybGF5cyBvblxyXG4gICAgLy8gYSBjYW52YXNcclxuICAgIGdhbWUuc3RhcnQoKTtcclxufTtcclxuXHJcbnZhciBnb1RvR2FtZVN0YXJ0ID0gZnVuY3Rpb24gKHJvb20pIHtcclxuICAgIC8vIFN0b3AgdGhlIGdhbWUgc28gdGhhdCBjYW52YXMgdXBkYXRlcyBkb24ndCBhZmZlY3QgcGVyZm9ybWFuY2Ugd2l0aFxyXG4gICAgLy8gb3ZlcmxheXNcclxuICAgIGdhbWUuc3RvcCgpO1xyXG5cclxuICAgIC8vIFJlc2V0IGFsbCBsaXN0ZW5lcnMgb24gdGhlIE5ldHdvcmtcclxuICAgICQoTmV0d29yaykub2ZmKCk7XHJcblxyXG4gICAgdmFyIGdhbWVTdGFydFNjZW5lID0gbmV3IHNjZW5lcy5HYW1lU3RhcnRTY2VuZShjYW52YXMsIHJvb20pO1xyXG4gICAgZ2FtZS5zZXRTY2VuZShnYW1lU3RhcnRTY2VuZSk7XHJcblxyXG4gICAgJChnYW1lU3RhcnRTY2VuZSkub24oXHJcbiAgICAgICAgc2NlbmVzLkdhbWVTdGFydFNjZW5lLkV2ZW50LlNUQVJUX0dBTUUsXHJcbiAgICAgICAgb25HYW1lU3RhcnRUb0dhbWVcclxuICAgICk7XHJcbn07XHJcblxyXG52YXIgZ29Ub0xvYmJ5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgLy8gRHJhdyBibGFjayBvdmVyIHRoZSBjYW52YXNcclxuICAgIGN0eC5maWxsU3R5bGUgPSBcIiMwNDBCMENcIjtcclxuICAgIGN0eC5maWxsUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xyXG5cclxuICAgIC8vIFN0b3AgdGhlIGdhbWUgc28gdGhhdCBjYW52YXMgdXBkYXRlcyBkb24ndCBhZmZlY3QgcGVyZm9ybWFuY2Ugd2l0aFxyXG4gICAgLy8gb3ZlcmxheXNcclxuICAgIGdhbWUuc3RvcCgpO1xyXG5cclxuICAgICQoZ2FtZS5nZXRTY2VuZSgpKS5vZmYoKTtcclxuXHJcbiAgICAvLyBSZXNldCBhbGwgbGlzdGVuZXJzIG9uIHRoZSBOZXR3b3JrXHJcbiAgICAkKE5ldHdvcmspLm9mZigpO1xyXG5cclxuICAgIHZhciBsb2JieVNjZW5lID0gbmV3IHNjZW5lcy5Mb2JieVNjZW5lKGNhbnZhcyk7XHJcbiAgICBnYW1lLnNldFNjZW5lKGxvYmJ5U2NlbmUpO1xyXG5cclxuICAgICQoTmV0d29yaykub24oXHJcbiAgICAgICAgTmV0d29yay5FdmVudC5TVEFSVF9HQU1FLFxyXG4gICAgICAgIG9uU3RhcnRHYW1lXHJcbiAgICApO1xyXG5cclxuICAgIC8vIFRyYW5zaXRpb24gdGhlIHBhZ2UncyBCRyBjb2xvciB0byBibGFjayB0byBoaWRlIHRoZSBCRyBpbWFnZSB3aGljaFxyXG4gICAgLy8gYmVjb21lcyBkaXN0cmFjdGluZyBkdXJpbmcgZ2FtZSBwbGF5XHJcbiAgICAkKFwiYm9keVwiKS5jc3Moe1wiYmFja2dyb3VuZC1jb2xvclwiOiBcIiMwNzEyMTNcIn0pO1xyXG59O1xyXG5cclxudmFyIGdvVG9HYW1lT3ZlciA9IGZ1bmN0aW9uIChyb29tKSB7XHJcbiAgICAvLyBTdG9wIHRoZSBnYW1lIHNvIHRoYXQgY2FudmFzIHVwZGF0ZXMgZG9uJ3QgYWZmZWN0IHBlcmZvcm1hbmNlIHdpdGhcclxuICAgIC8vIG92ZXJsYXlzXHJcbiAgICBnYW1lLnN0b3AoKTtcclxuXHJcbiAgICAvLyBSZXNldCBhbGwgbGlzdGVuZXJzIG9uIHRoZSBOZXR3b3JrXHJcbiAgICAkKE5ldHdvcmspLm9mZigpO1xyXG5cclxuICAgIHZhciBnYW1lT3ZlclNjZW5lID0gbmV3IHNjZW5lcy5HYW1lT3ZlclNjZW5lKGNhbnZhcywgcm9vbSk7XHJcbiAgICBnYW1lLnNldFNjZW5lKGdhbWVPdmVyU2NlbmUpO1xyXG5cclxuICAgICQoZ2FtZU92ZXJTY2VuZSkub24oXHJcbiAgICAgICAgc2NlbmVzLkdhbWVPdmVyU2NlbmUuRXZlbnQuUkVUVVJOX1RPX0xPQkJZLFxyXG4gICAgICAgIG9uR2FtZU92ZXJUb0xvYmJ5XHJcbiAgICApO1xyXG59O1xyXG5cclxudmFyIG9uU3RhcnRHYW1lID0gZnVuY3Rpb24gKGUsIHJvb20pIHtcclxuICAgIGdvVG9HYW1lU3RhcnQocm9vbSk7XHJcbn07XHJcblxyXG52YXIgb25FbmRHYW1lID0gZnVuY3Rpb24gKGUsIHJvb20pIHtcclxuICAgIGdvVG9HYW1lT3Zlcihyb29tKTtcclxufTtcclxuXHJcbnZhciBvbkdhbWVTdGFydFRvR2FtZSA9IGZ1bmN0aW9uIChlLCByb29tKSB7XHJcbiAgICBnb1RvR2FtZShyb29tKTtcclxufTtcclxuXHJcbnZhciBvbkdldEdhbWVPdmVyRGF0YSA9IGZ1bmN0aW9uIChlLCBnYW1lT3ZlckRhdGEpIHtcclxuICAgIGdvVG9HYW1lT3ZlcihlLmRhdGEpO1xyXG4gICAgZ2FtZS5nZXRTY2VuZSgpLl9vblVwZGF0ZVNjb3JlKGdhbWVPdmVyRGF0YSk7XHJcbn07XHJcblxyXG52YXIgb25HYW1lT3ZlclRvTG9iYnkgPSBmdW5jdGlvbiAoZSwgcm9vbSkge1xyXG4gICAgZ29Ub0xvYmJ5KCk7XHJcblxyXG4gICAgLy8gVHJpZ2dlciBhbiBldmVudCBzbyB0aGUgbG9iYnkgc2NlbmUga25vd3MgdG8gam9pbiB0aGUgcm9vbSBpdCB3YXMganVzdFxyXG4gICAgLy8gaW4gYmVmb3JlIHBsYXlpbmcgdGhlIGdhbWVcclxuICAgIE5ldHdvcmsuX29uRW50ZXJSb29tU3VjY2Vzcyhyb29tKTtcclxufTtcclxuXHJcbnZhciBvbk5ldHdvcmtDb25uZWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgZ29Ub0xvYmJ5KCk7XHJcbn07XHJcblxyXG52YXIgUHJlbG9hZGVyID0gbmV3IHV0aWwuUHJlbG9hZGVyKG9uTG9hZC5iaW5kKHRoaXMpKTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBlbnRpdGllcyA9IHJlcXVpcmUoJy4uL2VudGl0aWVzJyk7XHJcbnZhciBGdWxsQm9jayA9IGVudGl0aWVzLkZ1bGxCbG9jaztcclxudmFyIEhhbGZCbG9jayA9IGVudGl0aWVzLkhhbGZCbG9jaztcclxuXHJcbnZhciBMZXZlbDEgPSBmdW5jdGlvbiAoc2NlbmUpIHtcclxuICAgIHZhciBibG9ja1NpemUgPSAxMjg7XHJcblxyXG4gICAgLy8gTGluZSB0aGUgdG9wXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDE2OyBpKyspIHtcclxuICAgICAgICB2YXIgbmV3QmxvY2sgPSBuZXcgRnVsbEJvY2soKTtcclxuICAgICAgICBuZXdCbG9jay5wb3NpdGlvbi54ID0gYmxvY2tTaXplICogaTtcclxuICAgICAgICBuZXdCbG9jay5wb3NpdGlvbi55ID0gMDtcclxuXHJcbiAgICAgICAgc2NlbmUuYWRkR2FtZU9iamVjdChuZXdCbG9jayk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTGluZSB0aGUgYm90dG9tXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDE2OyBpKyspIHtcclxuICAgICAgICB2YXIgbmV3QmxvY2sgPSBuZXcgRnVsbEJvY2soKTtcclxuICAgICAgICBuZXdCbG9jay5wb3NpdGlvbi54ID0gYmxvY2tTaXplICogaTtcclxuICAgICAgICBuZXdCbG9jay5wb3NpdGlvbi55ID0gYmxvY2tTaXplICogMTA7XHJcblxyXG4gICAgICAgIHNjZW5lLmFkZEdhbWVPYmplY3QobmV3QmxvY2spO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIExpbmUgdGhlIGxlZnRcclxuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgMTA7IGkrKykge1xyXG4gICAgICAgIHZhciBuZXdCbG9jayA9IG5ldyBGdWxsQm9jaygpO1xyXG4gICAgICAgIG5ld0Jsb2NrLnBvc2l0aW9uLnggPSAwO1xyXG4gICAgICAgIG5ld0Jsb2NrLnBvc2l0aW9uLnkgPSBibG9ja1NpemUgKiBpO1xyXG5cclxuICAgICAgICBzY2VuZS5hZGRHYW1lT2JqZWN0KG5ld0Jsb2NrKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBMaW5lIHRoZSByaWdodFxyXG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCAxMDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG5ld0Jsb2NrID0gbmV3IEZ1bGxCb2NrKCk7XHJcbiAgICAgICAgbmV3QmxvY2sucG9zaXRpb24ueCA9IGJsb2NrU2l6ZSAqIDE1O1xyXG4gICAgICAgIG5ld0Jsb2NrLnBvc2l0aW9uLnkgPSBibG9ja1NpemUgKiBpO1xyXG5cclxuICAgICAgICBzY2VuZS5hZGRHYW1lT2JqZWN0KG5ld0Jsb2NrKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgb2JqO1xyXG4gICAgXHJcbiAgICBvYmogPSBuZXcgRnVsbEJvY2soKTtcclxuICAgIG9iai5wb3NpdGlvbi54ID0gYmxvY2tTaXplICogMztcclxuICAgIG9iai5wb3NpdGlvbi55ID0gYmxvY2tTaXplICogMztcclxuICAgIHNjZW5lLmFkZEdhbWVPYmplY3Qob2JqKTtcclxuICAgIFxyXG4gICAgb2JqID0gbmV3IEZ1bGxCb2NrKCk7XHJcbiAgICBvYmoucG9zaXRpb24ueCA9IGJsb2NrU2l6ZSAqIDQ7XHJcbiAgICBvYmoucG9zaXRpb24ueSA9IGJsb2NrU2l6ZSAqIDQ7XHJcbiAgICBzY2VuZS5hZGRHYW1lT2JqZWN0KG9iaik7XHJcbiAgICBcclxuICAgIG9iaiA9IG5ldyBGdWxsQm9jaygpO1xyXG4gICAgb2JqLnBvc2l0aW9uLnggPSBibG9ja1NpemUgKiA3O1xyXG4gICAgb2JqLnBvc2l0aW9uLnkgPSBibG9ja1NpemUgKiA0O1xyXG4gICAgc2NlbmUuYWRkR2FtZU9iamVjdChvYmopO1xyXG4gICAgXHJcbiAgICBvYmogPSBuZXcgRnVsbEJvY2soKTtcclxuICAgIG9iai5wb3NpdGlvbi54ID0gYmxvY2tTaXplICogODtcclxuICAgIG9iai5wb3NpdGlvbi55ID0gYmxvY2tTaXplICogNjtcclxuICAgIHNjZW5lLmFkZEdhbWVPYmplY3Qob2JqKTtcclxuICAgIFxyXG4gICAgb2JqID0gbmV3IEZ1bGxCb2NrKCk7XHJcbiAgICBvYmoucG9zaXRpb24ueCA9IGJsb2NrU2l6ZSAqIDExO1xyXG4gICAgb2JqLnBvc2l0aW9uLnkgPSBibG9ja1NpemUgKiA2O1xyXG4gICAgc2NlbmUuYWRkR2FtZU9iamVjdChvYmopO1xyXG4gICAgXHJcbiAgICBvYmogPSBuZXcgRnVsbEJvY2soKTtcclxuICAgIG9iai5wb3NpdGlvbi54ID0gYmxvY2tTaXplICogMTI7XHJcbiAgICBvYmoucG9zaXRpb24ueSA9IGJsb2NrU2l6ZSAqIDc7XHJcbiAgICBzY2VuZS5hZGRHYW1lT2JqZWN0KG9iaik7XHJcblxyXG4gICAgb2JqID0gbmV3IEhhbGZCbG9jaygpO1xyXG4gICAgb2JqLnBvc2l0aW9uLnggPSBibG9ja1NpemUgKiAxO1xyXG4gICAgb2JqLnBvc2l0aW9uLnkgPSBibG9ja1NpemUgKiA2O1xyXG4gICAgc2NlbmUuYWRkR2FtZU9iamVjdChvYmopO1xyXG5cclxuICAgIG9iaiA9IG5ldyBIYWxmQmxvY2soKTtcclxuICAgIG9iai5wb3NpdGlvbi54ID0gYmxvY2tTaXplICogNDtcclxuICAgIG9iai5wb3NpdGlvbi55ID0gYmxvY2tTaXplICogMztcclxuICAgIHNjZW5lLmFkZEdhbWVPYmplY3Qob2JqKTtcclxuXHJcbiAgICBvYmogPSBuZXcgSGFsZkJsb2NrKCk7XHJcbiAgICBvYmoucG9zaXRpb24ueCA9IGJsb2NrU2l6ZSAqIDQ7XHJcbiAgICBvYmoucG9zaXRpb24ueSA9IGJsb2NrU2l6ZSAqIDk7XHJcbiAgICBzY2VuZS5hZGRHYW1lT2JqZWN0KG9iaik7XHJcblxyXG4gICAgb2JqID0gbmV3IEhhbGZCbG9jaygpO1xyXG4gICAgb2JqLnBvc2l0aW9uLnggPSBibG9ja1NpemUgKiA4O1xyXG4gICAgb2JqLnBvc2l0aW9uLnkgPSBibG9ja1NpemUgKiA1O1xyXG4gICAgc2NlbmUuYWRkR2FtZU9iamVjdChvYmopO1xyXG5cclxuICAgIG9iaiA9IG5ldyBIYWxmQmxvY2soKTtcclxuICAgIG9iai5wb3NpdGlvbi54ID0gYmxvY2tTaXplICogNztcclxuICAgIG9iai5wb3NpdGlvbi55ID0gYmxvY2tTaXplICogNTtcclxuICAgIG9iai5yb3RhdGUoTWF0aC5QSSk7XHJcbiAgICBzY2VuZS5hZGRHYW1lT2JqZWN0KG9iaik7XHJcblxyXG4gICAgb2JqID0gbmV3IEhhbGZCbG9jaygpO1xyXG4gICAgb2JqLnBvc2l0aW9uLnggPSBibG9ja1NpemUgKiAxMTtcclxuICAgIG9iai5wb3NpdGlvbi55ID0gYmxvY2tTaXplICogMTtcclxuICAgIG9iai5yb3RhdGUoTWF0aC5QSSk7XHJcbiAgICBzY2VuZS5hZGRHYW1lT2JqZWN0KG9iaik7XHJcblxyXG4gICAgb2JqID0gbmV3IEhhbGZCbG9jaygpO1xyXG4gICAgb2JqLnBvc2l0aW9uLnggPSBibG9ja1NpemUgKiAxMTtcclxuICAgIG9iai5wb3NpdGlvbi55ID0gYmxvY2tTaXplICogNztcclxuICAgIG9iai5yb3RhdGUoTWF0aC5QSSk7XHJcbiAgICBzY2VuZS5hZGRHYW1lT2JqZWN0KG9iaik7XHJcblxyXG4gICAgb2JqID0gbmV3IEhhbGZCbG9jaygpO1xyXG4gICAgb2JqLnBvc2l0aW9uLnggPSBibG9ja1NpemUgKiAxNDtcclxuICAgIG9iai5wb3NpdGlvbi55ID0gYmxvY2tTaXplICogNDtcclxuICAgIG9iai5yb3RhdGUoTWF0aC5QSSk7XHJcbiAgICBzY2VuZS5hZGRHYW1lT2JqZWN0KG9iaik7XHJcbn07XHJcblxyXG5PYmplY3QuZnJlZXplKExldmVsMSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IExldmVsMTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBMZXZlbDEgPSByZXF1aXJlKFwiLi9MZXZlbDEuanNcIik7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIExldmVsMSA6IExldmVsMVxyXG59OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIGVudGl0aWVzID0gcmVxdWlyZSgnLi4vZW50aXRpZXMnKTtcclxuXHJcbnZhciBDbGllbnQgPSBmdW5jdGlvbiAoaWQsIGRhdGEpIHtcclxuICAgIHRoaXMuaWQgPSBpZDtcclxuICAgIHRoaXMuZGF0YSA9IGRhdGE7XHJcbiAgICB0aGlzLmdhbWVPYmplY3QgPSB1bmRlZmluZWQ7XHJcbn07XHJcbk9iamVjdC5mcmVlemUoQ2xpZW50KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ2xpZW50OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIGVudGl0aWVzID0gcmVxdWlyZSgnLi4vZW50aXRpZXMnKTtcclxuXHJcbnZhciBMb2NhbENsaWVudCA9IGZ1bmN0aW9uIChpZCwgZGF0YSkge1xyXG4gICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgdGhpcy5kYXRhID0gZGF0YTtcclxuICAgIHRoaXMuZ2FtZU9iamVjdCA9IHVuZGVmaW5lZDtcclxufTtcclxuT2JqZWN0LmZyZWV6ZShMb2NhbENsaWVudCk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IExvY2FsQ2xpZW50OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIE5ldHdvcmsgPSB7XHJcbiAgICBzb2NrZXQgICAgICA6IHVuZGVmaW5lZCxcclxuICAgIGxvY2FsQ2xpZW50IDoge30sXHJcbiAgICBjbGllbnRzICAgICA6IHt9LFxyXG4gICAgcm9vbXMgICAgICAgOiB7fSxcclxuICAgIGNvbm5lY3RlZCAgIDogZmFsc2UsXHJcbiAgICBob3N0SWQgICAgICA6IC0xLFxyXG5cclxuICAgIC8vIEV2ZW50cyBmb3IgZXh0ZXJuYWwgZW50aXRpZXMgdG8gc3Vic2NyaWJlIHRvXHJcbiAgICBFdmVudCAgICAgICA6IHtcclxuICAgICAgICBDT05ORUNUICAgICAgICAgICAgOiBcImNvbm5lY3RcIixcclxuICAgICAgICBVUERBVEVfUk9PTVMgICAgICAgOiBcInVwZGF0ZVJvb21zXCIsXHJcbiAgICAgICAgRU5URVJfUk9PTV9TVUNDRVNTIDogXCJlbnRlclJvb21TdWNjZXNzXCIsXHJcbiAgICAgICAgRU5URVJfUk9PTV9GQUlMICAgIDogXCJlbnRlclJvb21GYWlsXCIsXHJcbiAgICAgICAgUExBWSAgICAgICAgICAgICAgIDogXCJwbGF5XCIsXHJcbiAgICAgICAgU1RBUlRfR0FNRSAgICAgICAgIDogXCJzdGFydEdhbWVcIixcclxuICAgICAgICBFTkRfR0FNRSAgICAgICAgICAgOiBcImVuZEdhbWVcIixcclxuICAgICAgICBQTEFZRVJfREVBVEggICAgICAgOiBcInBsYXllckRlYXRoXCIsXHJcbiAgICAgICAgUExBWUVSX1JFU1BBV04gICAgIDogXCJwbGF5ZXJSZXNwYXduXCIsXHJcbiAgICAgICAgQlVMTEVUICAgICAgICAgICAgIDogXCJidWxsZXRcIixcclxuICAgICAgICBDTE9DS19USUNLICAgICAgICAgOiBcImNsb2NrVGlja1wiLFxyXG4gICAgICAgIENPVU5URE9XTiAgICAgICAgICA6IFwiY291bnRkb3duXCIsXHJcbiAgICAgICAgR0FNRV9TVEFSVF9EQVRBICAgIDogXCJnYW1lU3RhcnREYXRhXCIsXHJcbiAgICAgICAgR0FNRV9PVkVSX0RBVEEgICAgIDogXCJnYW1lT3ZlckRhdGFcIlxyXG4gICAgfSxcclxuXHJcbiAgICBpbml0IDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuc29ja2V0ID0gaW8uY29ubmVjdCgpO1xyXG5cclxuICAgICAgICB0aGlzLnNvY2tldC5vbignY29uZmlybScsIHRoaXMuX29uQ29uZmlybUNsaWVudC5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbignYWRkT3RoZXInLCB0aGlzLl9vbkFkZE90aGVyQ2xpZW50LmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdyZW1vdmVPdGhlcicsIHRoaXMuX29uUmVtb3ZlT3RoZXJDbGllbnQuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ2xvYWRQcmV2aW91cycsIHRoaXMuX29uTG9hZFByZXZpb3VzQ2xpZW50cy5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbigndXBkYXRlT3RoZXInLCB0aGlzLl9vblVwZGF0ZUNsaWVudC5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbigndXBkYXRlUm9vbXMnLCB0aGlzLl9vblVwZGF0ZVJvb21zLmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdlbnRlclJvb21TdWNjZXNzJywgdGhpcy5fb25FbnRlclJvb21TdWNjZXNzLmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdlbnRlclJvb21GYWlsJywgdGhpcy5fb25FbnRlclJvb21GYWlsLmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdwaW5nJywgdGhpcy5fb25QaW5nLmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdzZXRIb3N0JywgdGhpcy5fb25TZXRIb3N0LmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdzdGFydEdhbWUnLCB0aGlzLl9vblN0YXJ0R2FtZS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbignZW5kR2FtZScsIHRoaXMuX29uRW5kR2FtZS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbigncGxheWVyRGVhdGgnLCB0aGlzLl9vblBsYXllckRlYXRoLmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdwbGF5ZXJSZXNwYXduJywgdGhpcy5fb25QbGF5ZXJSZXNwYXduLmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdidWxsZXQnLCB0aGlzLl9vbkJ1bGxldC5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbignY291bnRkb3duJywgdGhpcy5fb25Db3VudGRvd24uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ2Nsb2NrVGljaycsIHRoaXMuX29uQ2xvY2tUaWNrLmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdnYW1lU3RhcnREYXRhJywgdGhpcy5fb25HYW1lU3RhcnREYXRhLmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdnYW1lT3ZlckRhdGEnLCB0aGlzLl9vbkdhbWVPdmVyRGF0YS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnaW5pdCcsIHtcclxuICAgICAgICAgICAgdXNlciA6ICQoXCIjdXNlck5hbWVcIikuaHRtbCgpXHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldFJvb21zIDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ3VwZGF0ZVJvb21zJyk7XHJcbiAgICB9LFxyXG5cclxuICAgIGNyZWF0ZVJvb20gOiBmdW5jdGlvbiAobmFtZSkge1xyXG4gICAgICAgIHZhciByb29tRGF0YSA9IHtcclxuICAgICAgICAgICAgbmFtZSAgOiBuYW1lLFxyXG4gICAgICAgICAgICBlbnRlciA6IHRydWVcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdjcmVhdGVSb29tJywgcm9vbURhdGEpO1xyXG4gICAgfSxcclxuXHJcbiAgICBlbnRlclJvb20gOiBmdW5jdGlvbiAocm9vbUlkKSB7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnZW50ZXJSb29tJywgcm9vbUlkKTtcclxuICAgIH0sXHJcblxyXG4gICAgbGVhdmVSb29tIDogZnVuY3Rpb24gKHJvb21JZCkge1xyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ2xlYXZlUm9vbScsIHJvb21JZCk7XHJcbiAgICB9LFxyXG5cclxuICAgIHN3aXRjaFRlYW0gOiBmdW5jdGlvbiAocm9vbUlkKSB7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnc3dpdGNoVGVhbScsIHJvb21JZCk7XHJcbiAgICB9LFxyXG5cclxuICAgIGlzSG9zdCA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5ob3N0SWQgPT09IHRoaXMubG9jYWxDbGllbnQuaWQ7XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkNvbmZpcm1DbGllbnQgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgIHZhciBpZCA9IGRhdGEuaWQ7XHJcbiAgICAgICAgdGhpcy5sb2NhbENsaWVudCA9IG5ldyBMb2NhbENsaWVudChpZCwgZGF0YSk7XHJcbiAgICAgICAgdGhpcy5jbGllbnRzW2lkXSA9IHRoaXMubG9jYWxDbGllbnQ7XHJcblxyXG4gICAgICAgIHRoaXMuY29ubmVjdGVkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgJCh0aGlzKS50cmlnZ2VyKFxyXG4gICAgICAgICAgICB0aGlzLkV2ZW50LkNPTk5FQ1RcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBfb25BZGRPdGhlckNsaWVudCA6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgdmFyIGlkID0gZGF0YS5pZDtcclxuICAgICAgICB2YXIgbmV3Q2xpZW50ID0gbmV3IENsaWVudChpZCwgZGF0YSk7XHJcblxyXG4gICAgICAgIHRoaXMuY2xpZW50c1tkYXRhLmlkXSA9IG5ld0NsaWVudDtcclxuICAgIH0sXHJcblxyXG4gICAgX29uUmVtb3ZlT3RoZXJDbGllbnQgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgIHRoaXMuY2xpZW50c1tkYXRhLmlkXSA9IHVuZGVmaW5lZDtcclxuICAgICAgICBkZWxldGUgdGhpcy5jbGllbnRzW2RhdGEuaWRdO1xyXG4gICAgfSxcclxuXHJcbiAgICBfb25Mb2FkUHJldmlvdXNDbGllbnRzIDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGRhdGEpO1xyXG5cclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIGlkID0gcGFyc2VJbnQoa2V5c1tpXSk7XHJcbiAgICAgICAgICAgIHZhciB1c2VyRGF0YSA9IGRhdGFbaWRdO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fb25BZGRPdGhlckNsaWVudCh1c2VyRGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25VcGRhdGVDbGllbnQgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgIHZhciBpZCA9IGRhdGEuaWQ7XHJcbiAgICAgICAgdmFyIGNsaWVudCA9IHRoaXMuY2xpZW50c1tpZF07XHJcblxyXG4gICAgICAgIGNsaWVudC5kYXRhID0gZGF0YTtcclxuXHJcbiAgICAgICAgaWYgKGNsaWVudC5nYW1lT2JqZWN0KSB7XHJcbiAgICAgICAgICAgIGNsaWVudC5nYW1lT2JqZWN0LnBvc2l0aW9uLnggPSBkYXRhLnBvc2l0aW9uLng7XHJcbiAgICAgICAgICAgIGNsaWVudC5nYW1lT2JqZWN0LnBvc2l0aW9uLnkgPSBkYXRhLnBvc2l0aW9uLnk7XHJcbiAgICAgICAgICAgIGNsaWVudC5nYW1lT2JqZWN0LnZlbG9jaXR5LnggPSBkYXRhLnZlbG9jaXR5Lng7XHJcbiAgICAgICAgICAgIGNsaWVudC5nYW1lT2JqZWN0LnZlbG9jaXR5LnkgPSBkYXRhLnZlbG9jaXR5Lnk7XHJcbiAgICAgICAgICAgIGNsaWVudC5nYW1lT2JqZWN0LmFjY2VsZXJhdGlvbi54ID0gZGF0YS5hY2NlbGVyYXRpb24ueDtcclxuICAgICAgICAgICAgY2xpZW50LmdhbWVPYmplY3QuYWNjZWxlcmF0aW9uLnkgPSBkYXRhLmFjY2VsZXJhdGlvbi55O1xyXG4gICAgICAgICAgICBjbGllbnQuZ2FtZU9iamVjdC5zZXRSb3RhdGlvbihkYXRhLnJvdGF0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vblVwZGF0ZVJvb21zIDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICB0aGlzLnJvb21zID0gZGF0YTtcclxuXHJcbiAgICAgICAgJCh0aGlzKS50cmlnZ2VyKFxyXG4gICAgICAgICAgICB0aGlzLkV2ZW50LlVQREFURV9ST09NUyxcclxuICAgICAgICAgICAgZGF0YVxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkVudGVyUm9vbVN1Y2Nlc3MgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICQodGhpcykudHJpZ2dlcihcclxuICAgICAgICAgICAgdGhpcy5FdmVudC5FTlRFUl9ST09NX1NVQ0NFU1MsXHJcbiAgICAgICAgICAgIGRhdGFcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBfb25FbnRlclJvb21GYWlsIDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAkKHRoaXMpLnRyaWdnZXIoXHJcbiAgICAgICAgICAgIHRoaXMuRXZlbnQuRU5URVJfUk9PTV9GQUlMLFxyXG4gICAgICAgICAgICBkYXRhXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgX29uUGluZyA6IGZ1bmN0aW9uIChwaW5nT2JqKSB7XHJcbiAgICAgICAgaWYgKHBpbmdPYmopIHtcclxuICAgICAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgncmV0dXJuUGluZycsIHBpbmdPYmopO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uU2V0SG9zdCA6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgdGhpcy5ob3N0SWQgPSBkYXRhLmlkO1xyXG4gICAgfSxcclxuXHJcbiAgICBfb25TdGFydEdhbWUgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICQodGhpcykudHJpZ2dlcihcclxuICAgICAgICAgICAgdGhpcy5FdmVudC5TVEFSVF9HQU1FLFxyXG4gICAgICAgICAgICBkYXRhXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgX29uRW5kR2FtZSA6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgdmFyIHJvb20gPSB0aGlzLnJvb21zW2RhdGEuaWRdO1xyXG5cclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJvb20ucGxheWVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLmNsaWVudHNbcm9vbS5wbGF5ZXJzW2ldXS5kYXRhLnJlYWR5ID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmxvY2FsQ2xpZW50LmRhdGEucmVhZHkgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgJCh0aGlzKS50cmlnZ2VyKFxyXG4gICAgICAgICAgICB0aGlzLkV2ZW50LkVORF9HQU1FLFxyXG4gICAgICAgICAgICBkYXRhXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgX29uUGxheWVyRGVhdGggOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICQodGhpcykudHJpZ2dlcihcclxuICAgICAgICAgICAgdGhpcy5FdmVudC5QTEFZRVJfREVBVEgsXHJcbiAgICAgICAgICAgIGRhdGFcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBfb25QbGF5ZXJSZXNwYXduIDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAkKHRoaXMpLnRyaWdnZXIoXHJcbiAgICAgICAgICAgIHRoaXMuRXZlbnQuUExBWUVSX1JFU1BBV04sXHJcbiAgICAgICAgICAgIGRhdGFcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBfb25CdWxsZXQgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICQodGhpcykudHJpZ2dlcihcclxuICAgICAgICAgICAgdGhpcy5FdmVudC5CVUxMRVQsXHJcbiAgICAgICAgICAgIGRhdGFcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBfb25Db3VudGRvd24gOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICQodGhpcykudHJpZ2dlcihcclxuICAgICAgICAgICAgdGhpcy5FdmVudC5DT1VOVERPV04sXHJcbiAgICAgICAgICAgIGRhdGFcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBfb25DbG9ja1RpY2sgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICQodGhpcykudHJpZ2dlcihcclxuICAgICAgICAgICAgdGhpcy5FdmVudC5DTE9DS19USUNLLFxyXG4gICAgICAgICAgICBkYXRhXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgX29uR2FtZVN0YXJ0RGF0YSA6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgJCh0aGlzKS50cmlnZ2VyKFxyXG4gICAgICAgICAgICB0aGlzLkV2ZW50LkdBTUVfU1RBUlRfREFUQSxcclxuICAgICAgICAgICAgZGF0YVxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkdhbWVPdmVyRGF0YSA6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgJCh0aGlzKS50cmlnZ2VyKFxyXG4gICAgICAgICAgICB0aGlzLkV2ZW50LkdBTUVfT1ZFUl9EQVRBLFxyXG4gICAgICAgICAgICBkYXRhXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTmV0d29yaztcclxuXHJcbnZhciBDbGllbnQgPSByZXF1aXJlKCcuL0NsaWVudC5qcycpO1xyXG52YXIgTG9jYWxDbGllbnQgPSByZXF1aXJlKCcuL0xvY2FsQ2xpZW50LmpzJyk7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgT3ZlcmxheSA9IHJlcXVpcmUoJy4vT3ZlcmxheS5qcycpO1xyXG5cclxudmFyIENyZWF0ZVJvb21PdmVybGF5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgT3ZlcmxheS5jYWxsKHRoaXMpO1xyXG4gICAgXHJcbiAgICB0aGlzLmlucHV0RmllbGQgPSAkKFwiPGlucHV0PlwiKTtcclxuICAgIHRoaXMuaW5wdXRGaWVsZC5hdHRyKHsgXCJwbGFjZWhvbGRlclwiIDogXCJSb29tIE5hbWVcIiB9KTtcclxuICAgIHRoaXMuaW5wdXRGaWVsZC5hZGRDbGFzcyhcImNyZWF0ZS1yb29tLW92ZXJsYXktaW5wdXRcIik7XHJcbiAgICBcclxuICAgIHRoaXMuYnV0dG9uQ29udGFpbmVyID0gJChcIjxkaXY+XCIpO1xyXG4gICAgdGhpcy5idXR0b25Db250YWluZXIuYWRkQ2xhc3MoXCJjcmVhdGUtcm9vbS1vdmVybGF5LWJ1dHRvbi1jb250YWluZXJcIik7XHJcbiAgICBcclxuICAgIHRoaXMuY2FuY2VsQnRuID0gJChcIjxidXR0b24+XCIpO1xyXG4gICAgdGhpcy5jYW5jZWxCdG4udGV4dChcIkNhbmNlbFwiKTtcclxuICAgIHRoaXMuYnV0dG9uQ29udGFpbmVyLmFwcGVuZCh0aGlzLmNhbmNlbEJ0bik7XHJcbiAgICBcclxuICAgIHRoaXMuY3JlYXRlQnRuID0gJChcIjxidXR0b24+XCIpO1xyXG4gICAgdGhpcy5jcmVhdGVCdG4udGV4dChcIkNyZWF0ZVwiKTtcclxuICAgIHRoaXMuYnV0dG9uQ29udGFpbmVyLmFwcGVuZCh0aGlzLmNyZWF0ZUJ0bik7XHJcblxyXG4gICAgdGhpcy5kb21PYmplY3QuYXBwZW5kKHRoaXMuaW5wdXRGaWVsZCk7XHJcbiAgICB0aGlzLmRvbU9iamVjdC5hcHBlbmQodGhpcy5idXR0b25Db250YWluZXIpO1xyXG4gICAgdGhpcy5kb21PYmplY3QuYWRkQ2xhc3MoXCJjcmVhdGUtcm9vbS1vdmVybGF5XCIpO1xyXG59O1xyXG5cclxuQ3JlYXRlUm9vbU92ZXJsYXkucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKE92ZXJsYXkucHJvdG90eXBlLCB7XHJcblxyXG59KSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENyZWF0ZVJvb21PdmVybGF5OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIE92ZXJsYXkgPSByZXF1aXJlKCcuL092ZXJsYXkuanMnKTtcclxudmFyIE5ldHdvcmsgPSByZXF1aXJlKCcuLi9uZXR3b3JrJyk7XHJcblxyXG52YXIgR2FtZU92ZXJPdmVybGF5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgT3ZlcmxheS5jYWxsKHRoaXMpO1xyXG5cclxuICAgIHRoaXMucmVzdWx0c0xhYmVsID0gJChcIjxkaXY+XCIpO1xyXG4gICAgdGhpcy5yZXN1bHRzTGFiZWwuaHRtbChcIlJlc3VsdHNcIik7XHJcbiAgICB0aGlzLnJlc3VsdHNMYWJlbC5hZGRDbGFzcyhcImdhbWUtb3Zlci1vdmVybGF5LXJlc3VsdHMtbGFiZWxcIik7XHJcblxyXG4gICAgdGhpcy50ZWFtQUNvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcclxuICAgIHRoaXMudGVhbUFDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LXRlYW1BLWNvbnRhaW5lclwiKTtcclxuXHJcbiAgICB0aGlzLnRlYW1CQ29udGFpbmVyID0gJChcIjxkaXY+XCIpO1xyXG4gICAgdGhpcy50ZWFtQkNvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktdGVhbUItY29udGFpbmVyXCIpO1xyXG5cclxuICAgIHRoaXMucmV0dXJuVG9Mb2JieUJ0biA9ICQoXCI8YnV0dG9uPlwiKTtcclxuICAgIHRoaXMucmV0dXJuVG9Mb2JieUJ0bi50ZXh0KFwiUmV0dXJuIHRvIExvYmJ5XCIpO1xyXG4gICAgdGhpcy5yZXR1cm5Ub0xvYmJ5QnRuLmFkZENsYXNzKFwiZ2FtZS1vdmVyLW92ZXJsYXktcmV0dXJuLXRvLWxvYmJ5LWJ1dHRvblwiKTtcclxuXHJcbiAgICB0aGlzLmRvbU9iamVjdC5hcHBlbmQodGhpcy5yZXN1bHRzTGFiZWwpO1xyXG4gICAgdGhpcy5kb21PYmplY3QuYXBwZW5kKHRoaXMubG9hZGluZ0ljb24pO1xyXG4gICAgdGhpcy5kb21PYmplY3QuYXBwZW5kKHRoaXMudGVhbUFDb250YWluZXIpO1xyXG4gICAgdGhpcy5kb21PYmplY3QuYXBwZW5kKHRoaXMudGVhbUJDb250YWluZXIpO1xyXG4gICAgdGhpcy5kb21PYmplY3QuYXBwZW5kKHRoaXMucmV0dXJuVG9Mb2JieUJ0bik7XHJcblxyXG4gICAgdGhpcy5kb21PYmplY3QuYWRkQ2xhc3MoXCJnYW1lLW92ZXItb3ZlcmxheVwiKTtcclxuICAgIHRoaXMuZG9tT2JqZWN0LmFkZENsYXNzKFwiZmFkZS1pblwiKTtcclxuXHJcbiAgICB0aGlzLnJlbmRlclNjb3JlKCk7XHJcbn07XHJcblxyXG5HYW1lT3Zlck92ZXJsYXkucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKE92ZXJsYXkucHJvdG90eXBlLCB7XHJcbiAgICByZW5kZXJTY29yZSA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChyb29tRGF0YSkge1xyXG4gICAgICAgICAgICB0aGlzLnRlYW1BQ29udGFpbmVyLmh0bWwoXCJcIik7XHJcbiAgICAgICAgICAgIHRoaXMudGVhbUJDb250YWluZXIuaHRtbChcIlwiKTtcclxuXHJcbiAgICAgICAgICAgIHZhciB0ZWFtQUxhYmVsID0gJChcIjxzcGFuPlwiKTtcclxuICAgICAgICAgICAgdGVhbUFMYWJlbC5odG1sKFwiUm9zZSBUZWFtXCIpO1xyXG4gICAgICAgICAgICB0ZWFtQUxhYmVsLmFkZENsYXNzKFwiZ2FtZS1vdmVyLW92ZXJsYXktdGVhbS1sYWJlbFwiKTtcclxuXHJcbiAgICAgICAgICAgIHZhciB0ZWFtQUtpbGxMYWJlbCA9ICQoXCI8c3Bhbj5cIik7XHJcbiAgICAgICAgICAgIHRlYW1BS2lsbExhYmVsLmh0bWwoXCJLXCIpO1xyXG4gICAgICAgICAgICB0ZWFtQUtpbGxMYWJlbC5hZGRDbGFzcyhcImdhbWUtb3Zlci1vdmVybGF5LXRlYW0ta2lsbC1sYWJlbFwiKTtcclxuXHJcbiAgICAgICAgICAgIHZhciB0ZWFtQURlYXRoTGFiZWwgPSAkKFwiPHNwYW4+XCIpO1xyXG4gICAgICAgICAgICB0ZWFtQURlYXRoTGFiZWwuaHRtbChcIkRcIik7XHJcbiAgICAgICAgICAgIHRlYW1BRGVhdGhMYWJlbC5hZGRDbGFzcyhcImdhbWUtb3Zlci1vdmVybGF5LXRlYW0tZGVhdGgtbGFiZWxcIik7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnRlYW1BQ29udGFpbmVyLmFwcGVuZCh0ZWFtQUxhYmVsKTtcclxuICAgICAgICAgICAgdGhpcy50ZWFtQUNvbnRhaW5lci5hcHBlbmQodGVhbUFLaWxsTGFiZWwpO1xyXG4gICAgICAgICAgICB0aGlzLnRlYW1BQ29udGFpbmVyLmFwcGVuZCh0ZWFtQURlYXRoTGFiZWwpO1xyXG5cclxuICAgICAgICAgICAgdmFyIHRlYW1CTGFiZWwgPSAkKFwiPHNwYW4+XCIpO1xyXG4gICAgICAgICAgICB0ZWFtQkxhYmVsLmh0bWwoXCJTa3kgVGVhbVwiKTtcclxuICAgICAgICAgICAgdGVhbUJMYWJlbC5hZGRDbGFzcyhcImdhbWUtb3Zlci1vdmVybGF5LXRlYW0tbGFiZWxcIik7XHJcblxyXG4gICAgICAgICAgICB2YXIgdGVhbUJLaWxsTGFiZWwgPSAkKFwiPHNwYW4+XCIpO1xyXG4gICAgICAgICAgICB0ZWFtQktpbGxMYWJlbC5odG1sKFwiS1wiKTtcclxuICAgICAgICAgICAgdGVhbUJLaWxsTGFiZWwuYWRkQ2xhc3MoXCJnYW1lLW92ZXItb3ZlcmxheS10ZWFtLWtpbGwtbGFiZWxcIik7XHJcblxyXG4gICAgICAgICAgICB2YXIgdGVhbUJEZWF0aExhYmVsID0gJChcIjxzcGFuPlwiKTtcclxuICAgICAgICAgICAgdGVhbUJEZWF0aExhYmVsLmh0bWwoXCJEXCIpO1xyXG4gICAgICAgICAgICB0ZWFtQkRlYXRoTGFiZWwuYWRkQ2xhc3MoXCJnYW1lLW92ZXItb3ZlcmxheS10ZWFtLWRlYXRoLWxhYmVsXCIpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy50ZWFtQkNvbnRhaW5lci5hcHBlbmQodGVhbUJMYWJlbCk7XHJcbiAgICAgICAgICAgIHRoaXMudGVhbUJDb250YWluZXIuYXBwZW5kKHRlYW1CS2lsbExhYmVsKTtcclxuICAgICAgICAgICAgdGhpcy50ZWFtQkNvbnRhaW5lci5hcHBlbmQodGVhbUJEZWF0aExhYmVsKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghcm9vbURhdGEpIHtcclxuICAgICAgICAgICAgICAgIHZhciB0ZWFtQUxvYWRpbmdDb250YWluZXIgPSAkKFwiPGRpdj5cIik7XHJcbiAgICAgICAgICAgICAgICB0ZWFtQUxvYWRpbmdDb250YWluZXIuaHRtbChcIkxvYWRpbmcuLi5cIik7XHJcbiAgICAgICAgICAgICAgICB0ZWFtQUxhYmVsLmFwcGVuZCh0ZWFtQUxvYWRpbmdDb250YWluZXIpO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciB0ZWFtQkxvYWRpbmdDb250YWluZXIgPSAkKFwiPGRpdj5cIik7XHJcbiAgICAgICAgICAgICAgICB0ZWFtQkxvYWRpbmdDb250YWluZXIuaHRtbChcIkxvYWRpbmcuLi5cIik7XHJcbiAgICAgICAgICAgICAgICB0ZWFtQkxhYmVsLmFwcGVuZCh0ZWFtQkxvYWRpbmdDb250YWluZXIpO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIHRlYW1BID0gcm9vbURhdGEudGVhbUE7XHJcbiAgICAgICAgICAgIHZhciB0ZWFtQiA9IHJvb21EYXRhLnRlYW1CO1xyXG4gICAgICAgICAgICB2YXIgbG9jYWxJZCA9IE5ldHdvcmsubG9jYWxDbGllbnQuaWQ7XHJcblxyXG4gICAgICAgICAgICB2YXIgdGVhbUFOYW1lQ29udGFpbmVyID0gJChcIjxzcGFuPlwiKTtcclxuICAgICAgICAgICAgdmFyIHRlYW1BS2lsbHNDb250YWluZXIgPSAkKFwiPHNwYW4+XCIpO1xyXG4gICAgICAgICAgICB2YXIgdGVhbUFEZWF0aHNDb250YWluZXIgPSAkKFwiPHNwYW4+XCIpO1xyXG4gICAgICAgICAgICB0ZWFtQU5hbWVDb250YWluZXIuYWRkQ2xhc3MoXCJnYW1lLW92ZXItb3ZlcmxheS1uYW1lLWNvbnRhaW5lclwiKTtcclxuICAgICAgICAgICAgdGVhbUFLaWxsc0NvbnRhaW5lci5hZGRDbGFzcyhcImdhbWUtb3Zlci1vdmVybGF5LWtpbGxzLWNvbnRhaW5lclwiKTtcclxuICAgICAgICAgICAgdGVhbUFEZWF0aHNDb250YWluZXIuYWRkQ2xhc3MoXCJnYW1lLW92ZXItb3ZlcmxheS1kZWF0aHMtY29udGFpbmVyXCIpO1xyXG5cclxuICAgICAgICAgICAgdmFyIHRlYW1CTmFtZUNvbnRhaW5lciA9ICQoXCI8c3Bhbj5cIik7XHJcbiAgICAgICAgICAgIHZhciB0ZWFtQktpbGxzQ29udGFpbmVyID0gJChcIjxzcGFuPlwiKTtcclxuICAgICAgICAgICAgdmFyIHRlYW1CRGVhdGhzQ29udGFpbmVyID0gJChcIjxzcGFuPlwiKTtcclxuICAgICAgICAgICAgdGVhbUJOYW1lQ29udGFpbmVyLmFkZENsYXNzKFwiZ2FtZS1vdmVyLW92ZXJsYXktbmFtZS1jb250YWluZXJcIik7XHJcbiAgICAgICAgICAgIHRlYW1CS2lsbHNDb250YWluZXIuYWRkQ2xhc3MoXCJnYW1lLW92ZXItb3ZlcmxheS1raWxscy1jb250YWluZXJcIik7XHJcbiAgICAgICAgICAgIHRlYW1CRGVhdGhzQ29udGFpbmVyLmFkZENsYXNzKFwiZ2FtZS1vdmVyLW92ZXJsYXktZGVhdGhzLWNvbnRhaW5lclwiKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCB0ZWFtIEEgcGxheWVyc1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDQ7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGxhYmVsO1xyXG4gICAgICAgICAgICAgICAgdmFyIGtpbGxzO1xyXG4gICAgICAgICAgICAgICAgdmFyIGRlYXRocztcclxuICAgICAgICAgICAgICAgIHZhciBwbGF5ZXJDb250YWluZXIgPSAkKFwiPGRpdj5cIik7XHJcbiAgICAgICAgICAgICAgICB2YXIga2lsbHNDb250YWluZXIgPSAkKFwiPGRpdj5cIik7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGVhdGhzQ29udGFpbmVyID0gJChcIjxkaXY+XCIpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpIDwgdGVhbUEubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1clBsYXllciA9IHRlYW1BW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsID0gY3VyUGxheWVyLnVzZXI7XHJcbiAgICAgICAgICAgICAgICAgICAga2lsbHMgPSBjdXJQbGF5ZXIua2lsbHM7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVhdGhzID0gY3VyUGxheWVyLmRlYXRocztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1clBsYXllci5pZCA9PT0gbG9jYWxJZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXJDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LWxvY2FsLXBsYXllci1jb250YWluZXJcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbCA9IFwiLS0tLS0tXCI7XHJcbiAgICAgICAgICAgICAgICAgICAga2lsbHMgPSBcIi1cIjtcclxuICAgICAgICAgICAgICAgICAgICBkZWF0aHMgPSBcIi1cIjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBwbGF5ZXJDb250YWluZXIuaHRtbChsYWJlbCk7XHJcbiAgICAgICAgICAgICAgICBraWxsc0NvbnRhaW5lci5odG1sKGtpbGxzKTtcclxuICAgICAgICAgICAgICAgIGRlYXRoc0NvbnRhaW5lci5odG1sKGRlYXRocyk7XHJcbiAgICAgICAgICAgICAgICB0ZWFtQU5hbWVDb250YWluZXIuYXBwZW5kKHBsYXllckNvbnRhaW5lcik7XHJcbiAgICAgICAgICAgICAgICB0ZWFtQUtpbGxzQ29udGFpbmVyLmFwcGVuZChraWxsc0NvbnRhaW5lcik7XHJcbiAgICAgICAgICAgICAgICB0ZWFtQURlYXRoc0NvbnRhaW5lci5hcHBlbmQoZGVhdGhzQ29udGFpbmVyKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy50ZWFtQUNvbnRhaW5lci5hcHBlbmQodGVhbUFOYW1lQ29udGFpbmVyKTtcclxuICAgICAgICAgICAgdGhpcy50ZWFtQUNvbnRhaW5lci5hcHBlbmQodGVhbUFLaWxsc0NvbnRhaW5lcik7XHJcbiAgICAgICAgICAgIHRoaXMudGVhbUFDb250YWluZXIuYXBwZW5kKHRlYW1BRGVhdGhzQ29udGFpbmVyKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCB0ZWFtIEIgcGxheWVyc1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDQ7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGxhYmVsO1xyXG4gICAgICAgICAgICAgICAgdmFyIGtpbGxzO1xyXG4gICAgICAgICAgICAgICAgdmFyIGRlYXRocztcclxuICAgICAgICAgICAgICAgIHZhciBwbGF5ZXJDb250YWluZXIgPSAkKFwiPGRpdj5cIik7XHJcbiAgICAgICAgICAgICAgICB2YXIga2lsbHNDb250YWluZXIgPSAkKFwiPGRpdj5cIik7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGVhdGhzQ29udGFpbmVyID0gJChcIjxkaXY+XCIpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpIDwgdGVhbUIubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1clBsYXllciA9IHRlYW1CW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsID0gY3VyUGxheWVyLnVzZXI7XHJcbiAgICAgICAgICAgICAgICAgICAga2lsbHMgPSBjdXJQbGF5ZXIua2lsbHM7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVhdGhzID0gY3VyUGxheWVyLmRlYXRocztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1clBsYXllci5pZCA9PT0gbG9jYWxJZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXJDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LWxvY2FsLXBsYXllci1jb250YWluZXJcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbCA9IFwiLS0tLS0tXCI7XHJcbiAgICAgICAgICAgICAgICAgICAga2lsbHMgPSBcIi1cIjtcclxuICAgICAgICAgICAgICAgICAgICBkZWF0aHMgPSBcIi1cIjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBwbGF5ZXJDb250YWluZXIuaHRtbChsYWJlbCk7XHJcbiAgICAgICAgICAgICAgICBraWxsc0NvbnRhaW5lci5odG1sKGtpbGxzKTtcclxuICAgICAgICAgICAgICAgIGRlYXRoc0NvbnRhaW5lci5odG1sKGRlYXRocyk7XHJcbiAgICAgICAgICAgICAgICB0ZWFtQk5hbWVDb250YWluZXIuYXBwZW5kKHBsYXllckNvbnRhaW5lcik7XHJcbiAgICAgICAgICAgICAgICB0ZWFtQktpbGxzQ29udGFpbmVyLmFwcGVuZChraWxsc0NvbnRhaW5lcik7XHJcbiAgICAgICAgICAgICAgICB0ZWFtQkRlYXRoc0NvbnRhaW5lci5hcHBlbmQoZGVhdGhzQ29udGFpbmVyKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy50ZWFtQkNvbnRhaW5lci5hcHBlbmQodGVhbUJOYW1lQ29udGFpbmVyKTtcclxuICAgICAgICAgICAgdGhpcy50ZWFtQkNvbnRhaW5lci5hcHBlbmQodGVhbUJLaWxsc0NvbnRhaW5lcik7XHJcbiAgICAgICAgICAgIHRoaXMudGVhbUJDb250YWluZXIuYXBwZW5kKHRlYW1CRGVhdGhzQ29udGFpbmVyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR2FtZU92ZXJPdmVybGF5OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIE92ZXJsYXkgPSByZXF1aXJlKCcuL092ZXJsYXkuanMnKTtcclxuXHJcbnZhciBMb2FkaW5nT3ZlcmxheSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIE92ZXJsYXkuY2FsbCh0aGlzKTtcclxuICAgIFxyXG4gICAgdGhpcy5kb21PYmplY3QuYWRkQ2xhc3MoXCJsb2FkaW5nLW92ZXJsYXktYmdcIik7XHJcbiAgICBcclxuICAgIHRoaXMubG9hZGluZ0ljb24gPSAkKFwiPGRpdj5cIik7XHJcbiAgICB0aGlzLmxvYWRpbmdJY29uLmFkZENsYXNzKFwibG9hZGluZy1vdmVybGF5XCIpO1xyXG4gICAgXHJcbiAgICB0aGlzLmRvbU9iamVjdC5hcHBlbmQodGhpcy5sb2FkaW5nSWNvbik7XHJcbn07XHJcblxyXG5Mb2FkaW5nT3ZlcmxheS5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoT3ZlcmxheS5wcm90b3R5cGUsIHtcclxuXHJcbn0pKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTG9hZGluZ092ZXJsYXk7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgT3ZlcmxheSA9IHJlcXVpcmUoJy4vT3ZlcmxheS5qcycpO1xyXG52YXIgTmV0d29yayA9IHJlcXVpcmUoJy4uL25ldHdvcmsnKTtcclxuXHJcbnZhciBMb2JieU92ZXJsYXkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBPdmVybGF5LmNhbGwodGhpcyk7XHJcblxyXG4gICAgLy8gU2V0IHVwIGxlZnQgc2lkZVxyXG4gICAgdGhpcy5sZWZ0Q29udGFpbmVyID0gJChcIjxzcGFuPlwiKTtcclxuICAgIHRoaXMubGVmdENvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktbGVmdFwiKTtcclxuICAgIHRoaXMubGVmdENvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktbWF4aW1pemVkLXNpZGVcIik7XHJcblxyXG4gICAgdGhpcy5yb29tQnV0dG9uQ29udGFpbmVyID0gJChcIjxkaXY+XCIpO1xyXG4gICAgdGhpcy5yb29tQnV0dG9uQ29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1idXR0b24tY29udGFpbmVyXCIpO1xyXG4gICAgdGhpcy5sZWZ0Q29udGFpbmVyLmFwcGVuZCh0aGlzLnJvb21CdXR0b25Db250YWluZXIpO1xyXG5cclxuICAgIHRoaXMuc2VsZWN0Um9vbUxhYmVsID0gJChcIjxkaXY+XCIpO1xyXG4gICAgdGhpcy5zZWxlY3RSb29tTGFiZWwuaHRtbChcIlNlbGVjdCBvciBjcmVhdGUgcm9vbVwiKTtcclxuICAgIHRoaXMucm9vbUJ1dHRvbkNvbnRhaW5lci5hcHBlbmQodGhpcy5zZWxlY3RSb29tTGFiZWwpO1xyXG4gICAgdGhpcy5yb29tQnV0dG9uQ29udGFpbmVyLmFwcGVuZCgkKFwiPGJyPlwiKSk7XHJcblxyXG4gICAgdGhpcy5jcmVhdGVSb29tQnRuID0gJChcIjxidXR0b24+XCIpO1xyXG4gICAgdGhpcy5jcmVhdGVSb29tQnRuLnRleHQoXCJDcmVhdGUgUm9vbVwiKTtcclxuICAgIHRoaXMucm9vbUJ1dHRvbkNvbnRhaW5lci5hcHBlbmQodGhpcy5jcmVhdGVSb29tQnRuKTtcclxuXHJcbiAgICB0aGlzLnJvb21MaXN0Q29udGFpbmVyID0gJChcIjxkaXY+XCIpO1xyXG4gICAgdGhpcy5yb29tTGlzdENvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktcm9vbS1saXN0XCIpO1xyXG4gICAgdGhpcy5yb29tTGlzdENvbnRhaW5lci5odG1sKFwiTG9hZGluZyByb29tcy4uLlwiKTtcclxuICAgIHRoaXMubGVmdENvbnRhaW5lci5hcHBlbmQodGhpcy5yb29tTGlzdENvbnRhaW5lcik7XHJcblxyXG4gICAgLy8gU2V0IHVwIHJpZ2h0IHNpZGVcclxuICAgIHRoaXMucmlnaHRDb250YWluZXIgPSAkKFwiPHNwYW4+XCIpO1xyXG4gICAgdGhpcy5yaWdodENvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktcmlnaHRcIik7XHJcbiAgICB0aGlzLnJpZ2h0Q29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1taW5pbWl6ZWQtc2lkZVwiKTtcclxuXHJcbiAgICB0aGlzLnNlbGVjdGVkUm9vbUxhYmVsID0gJChcIjxkaXY+XCIpO1xyXG4gICAgdGhpcy5zZWxlY3RlZFJvb21MYWJlbC5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktcm9vbS1sYWJlbC1jb250YWluZXJcIik7XHJcblxyXG4gICAgdGhpcy5yZW5kZXJSb29tTGFiZWwoKTtcclxuICAgIHRoaXMucmlnaHRDb250YWluZXIuYXBwZW5kKHRoaXMuc2VsZWN0ZWRSb29tTGFiZWwpO1xyXG5cclxuICAgIHRoaXMuc3dpdGNoVGVhbUJ0biA9ICQoXCI8YnV0dG9uPlwiKTtcclxuICAgIHRoaXMuc3dpdGNoVGVhbUJ0bi50ZXh0KFwiU3dpdGNoIFRlYW1zXCIpO1xyXG4gICAgdGhpcy5zd2l0Y2hUZWFtQnRuLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1zd2l0Y2gtdGVhbS1idG5cIik7XHJcblxyXG4gICAgdGhpcy50ZWFtQUNvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcclxuICAgIHRoaXMudGVhbUFDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LXRlYW1BLWNvbnRhaW5lclwiKTtcclxuXHJcbiAgICB0aGlzLnRlYW1CQ29udGFpbmVyID0gJChcIjxkaXY+XCIpO1xyXG4gICAgdGhpcy50ZWFtQkNvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktdGVhbUItY29udGFpbmVyXCIpO1xyXG5cclxuICAgIHRoaXMucmVuZGVyUGxheWVycygpO1xyXG5cclxuICAgIHRoaXMucmlnaHRDb250YWluZXIuYXBwZW5kKHRoaXMudGVhbUFDb250YWluZXIpO1xyXG4gICAgdGhpcy5yaWdodENvbnRhaW5lci5hcHBlbmQodGhpcy5zd2l0Y2hUZWFtQnRuKTtcclxuICAgIHRoaXMucmlnaHRDb250YWluZXIuYXBwZW5kKHRoaXMudGVhbUJDb250YWluZXIpO1xyXG5cclxuICAgIHRoaXMubGVhdmVSb29tQnRuID0gJChcIjxidXR0b24+XCIpO1xyXG4gICAgdGhpcy5sZWF2ZVJvb21CdG4udGV4dChcIkxlYXZlIFJvb21cIik7XHJcbiAgICB0aGlzLmxlYXZlUm9vbUJ0bi5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktbGVhdmUtcm9vbS1idG5cIik7XHJcbiAgICB0aGlzLmxlYXZlUm9vbUJ0bi5oaWRlKCk7XHJcbiAgICB0aGlzLnJpZ2h0Q29udGFpbmVyLmFwcGVuZCh0aGlzLmxlYXZlUm9vbUJ0bik7XHJcblxyXG4gICAgdGhpcy5yZWFkeUJ0biA9ICQoXCI8YnV0dG9uPlwiKTtcclxuICAgIHRoaXMucmVhZHlCdG4udGV4dChcIlJlYWR5XCIpO1xyXG4gICAgdGhpcy5yZWFkeUJ0bi5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktcmVhZHktYnRuXCIpO1xyXG4gICAgdGhpcy5yZWFkeUJ0bi5oaWRlKCk7XHJcbiAgICB0aGlzLnJpZ2h0Q29udGFpbmVyLmFwcGVuZCh0aGlzLnJlYWR5QnRuKTtcclxuXHJcbiAgICB0aGlzLmRvbU9iamVjdC5hcHBlbmQodGhpcy5sZWZ0Q29udGFpbmVyKTtcclxuICAgIHRoaXMuZG9tT2JqZWN0LmFwcGVuZCh0aGlzLnJpZ2h0Q29udGFpbmVyKTtcclxuICAgIHRoaXMuZG9tT2JqZWN0LmFkZENsYXNzKFwibG9iYnktb3ZlcmxheVwiKTtcclxuICAgIHRoaXMuZG9tT2JqZWN0LmFkZENsYXNzKFwiZmFkZS1pblwiKTtcclxufTtcclxuXHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKExvYmJ5T3ZlcmxheSwge1xyXG4gICAgRXZlbnQgOiB7XHJcbiAgICAgICAgdmFsdWUgOiB7XHJcbiAgICAgICAgICAgIEVOVEVSX1JPT00gOiBcImVudGVyUm9vbVwiXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KTtcclxuXHJcbkxvYmJ5T3ZlcmxheS5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoT3ZlcmxheS5wcm90b3R5cGUsIHtcclxuICAgIHNob3dSb29tcyA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChyb29tRGF0YSkge1xyXG4gICAgICAgICAgICB0aGlzLnJvb21MaXN0Q29udGFpbmVyLmh0bWwoXCJcIik7XHJcblxyXG4gICAgICAgICAgICAkKFwiLmxvYmJ5LW92ZXJsYXktcm9vbVwiKS5vZmYoXCJjbGlja1wiKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMocm9vbURhdGEpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJvb21MaXN0Q29udGFpbmVyLmh0bWwoXCJObyByb29tcyBhdmFpbGFibGVcIik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY3VyUm9vbSA9IHJvb21EYXRhW2tleXNbaV1dO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJSb29tQ29udGFpbmVyID0gJChcIjxkaXY+XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGN1clJvb21Db250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LXJvb21cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgY3VyUm9vbUNvbnRhaW5lci5odG1sKGN1clJvb20ubmFtZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQoY3VyUm9vbUNvbnRhaW5lcikub24oXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiY2xpY2tcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VyUm9vbSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fb25DbGlja1Jvb20uYmluZCh0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucm9vbUxpc3RDb250YWluZXIuYXBwZW5kKGN1clJvb21Db250YWluZXIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICByZW5kZXJSb29tIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgaWYgKGRhdGEgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJSb29tTGFiZWwoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyUGxheWVycygpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuX29uRXhpdFJvb20oKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyUm9vbUxhYmVsKGRhdGEubmFtZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlclBsYXllcnMoZGF0YSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5fb25FbnRlclJvb20oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgcmVuZGVyUm9vbUxhYmVsIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGxhYmVsKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgbGFiZWwgIT09IFwic3RyaW5nXCIgfHwgbGFiZWwgPT09IFwiXCIpIHtcclxuICAgICAgICAgICAgICAgIGxhYmVsID0gXCJObyByb29tIHNlbGVjdGVkXCI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxhYmVsID0gXCJDdXJyZW50IHJvb206IFwiICsgbGFiZWw7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkUm9vbUxhYmVsLmh0bWwobGFiZWwpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgcmVuZGVyUGxheWVycyA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChyb29tRGF0YSkge1xyXG4gICAgICAgICAgICB0aGlzLnRlYW1BQ29udGFpbmVyLmh0bWwoXCJcIik7XHJcbiAgICAgICAgICAgIHRoaXMudGVhbUJDb250YWluZXIuaHRtbChcIlwiKTtcclxuICAgICAgICAgICAgdGhpcy5zd2l0Y2hUZWFtQnRuLmhpZGUoKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChyb29tRGF0YSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdGVhbUEgPSByb29tRGF0YS50ZWFtQTtcclxuICAgICAgICAgICAgICAgIHZhciB0ZWFtQiA9IHJvb21EYXRhLnRlYW1CO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciB0ZWFtQUxhYmVsID0gJChcIjxkaXY+XCIpO1xyXG4gICAgICAgICAgICAgICAgdGVhbUFMYWJlbC5odG1sKFwiUm9zZSBUZWFtXCIpO1xyXG4gICAgICAgICAgICAgICAgdGVhbUFMYWJlbC5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktdGVhbS1sYWJlbFwiKTtcclxuICAgICAgICAgICAgICAgIHRoaXMudGVhbUFDb250YWluZXIuYXBwZW5kKHRlYW1BTGFiZWwpO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciB0ZWFtQkxhYmVsID0gJChcIjxkaXY+XCIpO1xyXG4gICAgICAgICAgICAgICAgdGVhbUJMYWJlbC5odG1sKFwiU2t5IFRlYW1cIik7XHJcbiAgICAgICAgICAgICAgICB0ZWFtQkxhYmVsLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS10ZWFtLWxhYmVsXCIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy50ZWFtQkNvbnRhaW5lci5hcHBlbmQodGVhbUJMYWJlbCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGxvY2FsSWQgPSBOZXR3b3JrLmxvY2FsQ2xpZW50LmlkO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEFkZCB0ZWFtIEEgcGxheWVyc1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA0OyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbGFiZWw7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBsYXllckNvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVhZHkgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgPCB0ZWFtQS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGN1cklkID0gdGVhbUFbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjdXJQbGF5ZXIgPSBOZXR3b3JrLmNsaWVudHNbY3VySWRdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWFkeSA9IGN1clBsYXllci5kYXRhLnJlYWR5O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbCA9IGN1clBsYXllci5kYXRhLnVzZXI7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VySWQgPT09IGxvY2FsSWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllckNvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktbG9jYWwtcGxheWVyLWNvbnRhaW5lclwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXJlYWR5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWFkeUJ0bi5odG1sKFwiUmVhZHlcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zd2l0Y2hUZWFtQnRuLnByb3AoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVhZHlCdG4uaHRtbChcIkNhbmNlbFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN3aXRjaFRlYW1CdG4ucHJvcChcImRpc2FibGVkXCIsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWwgPSBcIi0tLS0tLVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyQ29udGFpbmVyLmh0bWwobGFiZWwpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGVhbUFDb250YWluZXIuYXBwZW5kKHBsYXllckNvbnRhaW5lcik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZWFkeSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVhZHlDb250YWluZXIgPSAkKFwiPHNwYW4+XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWFkeUNvbnRhaW5lci5odG1sKFwiUmVhZHlcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYWR5Q29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1yZWFkeS1jb250YWluZXJcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllckNvbnRhaW5lci5hcHBlbmQocmVhZHlDb250YWluZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBBZGQgdGVhbSBCIHBsYXllcnNcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxhYmVsO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwbGF5ZXJDb250YWluZXIgPSAkKFwiPGRpdj5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlYWR5ID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpIDwgdGVhbUIubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjdXJJZCA9IHRlYW1CW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY3VyUGxheWVyID0gTmV0d29yay5jbGllbnRzW2N1cklkXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVhZHkgPSBjdXJQbGF5ZXIuZGF0YS5yZWFkeTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWwgPSBjdXJQbGF5ZXIuZGF0YS51c2VyO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cklkID09PSBsb2NhbElkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXJDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LWxvY2FsLXBsYXllci1jb250YWluZXJcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZWFkeSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVhZHlCdG4uaHRtbChcIlJlYWR5XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3dpdGNoVGVhbUJ0bi5wcm9wKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlYWR5QnRuLmh0bWwoXCJDYW5jZWxcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zd2l0Y2hUZWFtQnRuLnByb3AoXCJkaXNhYmxlZFwiLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsID0gXCItLS0tLS1cIjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllckNvbnRhaW5lci5odG1sKGxhYmVsKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRlYW1CQ29udGFpbmVyLmFwcGVuZChwbGF5ZXJDb250YWluZXIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVhZHkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlYWR5Q29udGFpbmVyID0gJChcIjxzcGFuPlwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVhZHlDb250YWluZXIuaHRtbChcIlJlYWR5XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWFkeUNvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktcmVhZHktY29udGFpbmVyXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXJDb250YWluZXIuYXBwZW5kKHJlYWR5Q29udGFpbmVyKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5zd2l0Y2hUZWFtQnRuLnNob3coKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uQ2xpY2tSb29tIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSBlLmRhdGE7XHJcbiAgICAgICAgICAgIHZhciByb29tID0ge1xyXG4gICAgICAgICAgICAgICAgbmFtZSA6IGRhdGEubmFtZSxcclxuICAgICAgICAgICAgICAgIGlkICAgOiBkYXRhLmlkXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAkKHRoaXMpLnRyaWdnZXIoTG9iYnlPdmVybGF5LkV2ZW50LkVOVEVSX1JPT00sIHJvb20pO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uRXhpdFJvb20gOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGVhdmVSb29tQnRuLmhpZGUoKTtcclxuICAgICAgICAgICAgdGhpcy5yZWFkeUJ0bi5oaWRlKCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmxlZnRDb250YWluZXIucmVtb3ZlQ2xhc3MoXCJsb2JieS1vdmVybGF5LW1pbmltaXplZC1zaWRlXCIpO1xyXG4gICAgICAgICAgICB0aGlzLnJpZ2h0Q29udGFpbmVyLnJlbW92ZUNsYXNzKFwibG9iYnktb3ZlcmxheS1tYXhpbWl6ZWQtc2lkZVwiKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubGVmdENvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktbWF4aW1pemVkLXNpZGVcIik7XHJcbiAgICAgICAgICAgIHRoaXMucmlnaHRDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LW1pbmltaXplZC1zaWRlXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uRW50ZXJSb29tIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLmxlYXZlUm9vbUJ0bi5zaG93KCk7XHJcbiAgICAgICAgICAgIHRoaXMucmVhZHlCdG4uc2hvdygpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5sZWZ0Q29udGFpbmVyLnJlbW92ZUNsYXNzKFwibG9iYnktb3ZlcmxheS1tYXhpbWl6ZWQtc2lkZVwiKTtcclxuICAgICAgICAgICAgdGhpcy5yaWdodENvbnRhaW5lci5yZW1vdmVDbGFzcyhcImxvYmJ5LW92ZXJsYXktbWluaW1pemVkLXNpZGVcIik7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmxlZnRDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LW1pbmltaXplZC1zaWRlXCIpO1xyXG4gICAgICAgICAgICB0aGlzLnJpZ2h0Q29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1tYXhpbWl6ZWQtc2lkZVwiKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKTtcclxuXHJcbk9iamVjdC5mcmVlemUoTG9iYnlPdmVybGF5KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTG9iYnlPdmVybGF5OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIE92ZXJsYXkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLmRvbU9iamVjdCA9ICQoXCI8ZGl2PlwiKTtcclxuICAgIHRoaXMuZG9tT2JqZWN0LmFkZENsYXNzKFwiY2FudmFzLW92ZXJsYXlcIik7XHJcbn07XHJcblxyXG5PdmVybGF5LnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShPdmVybGF5LnByb3RvdHlwZSwge1xyXG5cclxufSkpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBPdmVybGF5OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIE92ZXJsYXkgPSByZXF1aXJlKCcuL092ZXJsYXkuanMnKTtcclxudmFyIExvYWRpbmdPdmVybGF5ID0gcmVxdWlyZSgnLi9Mb2FkaW5nT3ZlcmxheS5qcycpO1xyXG52YXIgQ3JlYXRlUm9vbU92ZXJsYXkgPSByZXF1aXJlKCcuL0NyZWF0ZVJvb21PdmVybGF5LmpzJyk7XHJcbnZhciBHYW1lT3Zlck92ZXJsYXkgPSByZXF1aXJlKCcuL0dhbWVPdmVyT3ZlcmxheS5qcycpO1xyXG52YXIgTG9iYnlPdmVybGF5ID0gcmVxdWlyZSgnLi9Mb2JieU92ZXJsYXkuanMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgT3ZlcmxheSA6IE92ZXJsYXksXHJcbiAgICBMb2FkaW5nT3ZlcmxheSA6IExvYWRpbmdPdmVybGF5LFxyXG4gICAgQ3JlYXRlUm9vbU92ZXJsYXkgOiBDcmVhdGVSb29tT3ZlcmxheSxcclxuICAgIEdhbWVPdmVyT3ZlcmxheSA6IEdhbWVPdmVyT3ZlcmxheSxcclxuICAgIExvYmJ5T3ZlcmxheSA6IExvYmJ5T3ZlcmxheVxyXG59OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIFNjZW5lID0gd2ZsLmRpc3BsYXkuU2NlbmU7XHJcbnZhciBvdmVybGF5cyA9IHJlcXVpcmUoJy4uL292ZXJsYXlzJyk7XHJcbnZhciBOZXR3b3JrID0gcmVxdWlyZSgnLi4vbmV0d29yaycpO1xyXG5cclxudmFyIEdhbWVPdmVyU2NlbmUgPSBmdW5jdGlvbiAoY2FudmFzLCByb29tKSB7XHJcbiAgICBTY2VuZS5jYWxsKHRoaXMsIGNhbnZhcyk7XHJcblxyXG4gICAgdGhpcy5yb29tID0gcm9vbTtcclxuXHJcbiAgICAkKE5ldHdvcmspLm9uKE5ldHdvcmsuRXZlbnQuR0FNRV9PVkVSX0RBVEEsIHRoaXMuX29uVXBkYXRlU2NvcmUuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgaWYgKE5ldHdvcmsuaXNIb3N0KCkpIHtcclxuICAgICAgICBOZXR3b3JrLnNvY2tldC5lbWl0KE5ldHdvcmsuRXZlbnQuR0FNRV9PVkVSX0RBVEEsIHJvb20uaWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZ2FtZU92ZXJPdmVybGF5ID0gbmV3IG92ZXJsYXlzLkdhbWVPdmVyT3ZlcmxheSgpO1xyXG4gICAgJChjYW52YXMpLnBhcmVudCgpLmFwcGVuZCh0aGlzLmdhbWVPdmVyT3ZlcmxheS5kb21PYmplY3QpO1xyXG5cclxuICAgIHRoaXMubG9hZGluZ092ZXJsYXkgPSBuZXcgb3ZlcmxheXMuTG9hZGluZ092ZXJsYXkoKTtcclxuICAgICQoY2FudmFzKS5wYXJlbnQoKS5hcHBlbmQodGhpcy5sb2FkaW5nT3ZlcmxheS5kb21PYmplY3QpO1xyXG5cclxuICAgIHRoaXMuZ2FtZU92ZXJPdmVybGF5LnJldHVyblRvTG9iYnlCdG4uY2xpY2sodGhpcy5fb25SZXR1cm5Ub0xvYmJ5LmJpbmQodGhpcykpO1xyXG59O1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhHYW1lT3ZlclNjZW5lLCB7XHJcbiAgICBFdmVudCA6IHtcclxuICAgICAgICB2YWx1ZSA6IHtcclxuICAgICAgICAgICAgUkVUVVJOX1RPX0xPQkJZIDogXCJyZXR1cm5Ub0xvYmJ5XCJcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pO1xyXG5HYW1lT3ZlclNjZW5lLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShTY2VuZS5wcm90b3R5cGUsIHtcclxuICAgIGRlc3Ryb3kgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXJPdmVybGF5LmRvbU9iamVjdC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgdGhpcy5sb2FkaW5nT3ZlcmxheS5kb21PYmplY3QucmVtb3ZlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25VcGRhdGVTY29yZSA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlLCBkYXRhKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9hZGluZ092ZXJsYXkuZG9tT2JqZWN0LnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmdhbWVPdmVyT3ZlcmxheS5yZW5kZXJTY29yZShkYXRhKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vblJldHVyblRvTG9iYnkgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAkKHRoaXMpLnRyaWdnZXIoXHJcbiAgICAgICAgICAgICAgICBHYW1lT3ZlclNjZW5lLkV2ZW50LlJFVFVSTl9UT19MT0JCWSxcclxuICAgICAgICAgICAgICAgIHRoaXMucm9vbVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkpO1xyXG5PYmplY3QuZnJlZXplKEdhbWVPdmVyU2NlbmUpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBHYW1lT3ZlclNjZW5lOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyk7XHJcbnZhciBBc3NldHMgPSB1dGlsLkFzc2V0cztcclxudmFyIFNjZW5lID0gd2ZsLmRpc3BsYXkuU2NlbmU7XHJcbnZhciBOZXR3b3JrID0gcmVxdWlyZSgnLi4vbmV0d29yaycpO1xyXG52YXIgR2FtZU9iamVjdCA9IHdmbC5jb3JlLmVudGl0aWVzLkdhbWVPYmplY3Q7XHJcbnZhciBQaHlzaWNzT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuUGh5c2ljc09iamVjdDtcclxudmFyIGVudGl0aWVzID0gcmVxdWlyZSgnLi4vZW50aXRpZXMnKTtcclxudmFyIEJ1bGxldCA9IGVudGl0aWVzLkJ1bGxldDtcclxudmFyIENsaWVudFBsYXllciA9IGVudGl0aWVzLkNsaWVudFBsYXllcjtcclxudmFyIFBsYXllciA9IGVudGl0aWVzLlBsYXllcjtcclxudmFyIGxldmVscyA9IHJlcXVpcmUoJy4uL2xldmVscycpO1xyXG52YXIgYmFja2dyb3VuZHMgPSB3ZmwuZGlzcGxheS5iYWNrZ3JvdW5kcztcclxudmFyIGdlb20gPSB3ZmwuZ2VvbTtcclxuXHJcbnZhciBHYW1lU2NlbmUgPSBmdW5jdGlvbiAoY2FudmFzLCByb29tKSB7XHJcbiAgICBTY2VuZS5jYWxsKHRoaXMsIGNhbnZhcywgcm9vbSk7XHJcblxyXG4gICAgLy8gQWRkIG90aGVyIGNsaWVudHMgdGhhdCBhcmUgYWxyZWFkeSBjb25uZWN0ZWRcclxuICAgIHZhciByb29tID0gTmV0d29yay5yb29tc1tyb29tLmlkXTtcclxuICAgIHZhciBwbGF5ZXJzID0gcm9vbS5wbGF5ZXJzO1xyXG5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGxheWVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBpZCA9IHBsYXllcnNbaV07XHJcbiAgICAgICAgdmFyIGNsaWVudCA9IE5ldHdvcmsuY2xpZW50c1tpZF07XHJcblxyXG4gICAgICAgIGlmIChjbGllbnQgIT09IE5ldHdvcmsubG9jYWxDbGllbnQpIHtcclxuICAgICAgICAgICAgdmFyIGdhbWVPYmplY3QgPSBuZXcgQ2xpZW50UGxheWVyKGNsaWVudC5kYXRhLnRlYW0pO1xyXG4gICAgICAgICAgICBjbGllbnQuZ2FtZU9iamVjdCA9IGdhbWVPYmplY3Q7XHJcbiAgICAgICAgICAgIGNsaWVudC5nYW1lT2JqZWN0LmN1c3RvbURhdGEuY2xpZW50SWQgPSBjbGllbnQuZGF0YS5pZDtcclxuICAgICAgICAgICAgY2xpZW50LmdhbWVPYmplY3QucG9zaXRpb24ueCA9IGNsaWVudC5kYXRhLnBvc2l0aW9uLng7XHJcbiAgICAgICAgICAgIGNsaWVudC5nYW1lT2JqZWN0LnBvc2l0aW9uLnkgPSBjbGllbnQuZGF0YS5wb3NpdGlvbi55O1xyXG4gICAgICAgICAgICBjbGllbnQuZ2FtZU9iamVjdC5zZXRSb3RhdGlvbihjbGllbnQuZGF0YS5yb3RhdGlvbik7XHJcbiAgICAgICAgICAgIGNsaWVudC5nYW1lT2JqZWN0LmN1c3RvbURhdGEuc3Bhd25Qb3NpdGlvbiA9IGNsaWVudC5kYXRhLnBvc2l0aW9uO1xyXG4gICAgICAgICAgICBjbGllbnQuZ2FtZU9iamVjdC5jdXN0b21EYXRhLnNwYXduUm90YXRpb24gPSBjbGllbnQuZGF0YS5yb3RhdGlvbjtcclxuICAgICAgICAgICAgdGhpcy5hZGRHYW1lT2JqZWN0KGdhbWVPYmplY3QsIDEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAkKE5ldHdvcmspLm9uKFxyXG4gICAgICAgIE5ldHdvcmsuRXZlbnQuQlVMTEVULFxyXG4gICAgICAgIHRoaXMub25CdWxsZXQuYmluZCh0aGlzKVxyXG4gICAgKTtcclxuXHJcbiAgICAkKE5ldHdvcmspLm9uKFxyXG4gICAgICAgIE5ldHdvcmsuRXZlbnQuQ0xPQ0tfVElDSyxcclxuICAgICAgICB0aGlzLm9uQ2xvY2tUaWNrLmJpbmQodGhpcylcclxuICAgICk7XHJcblxyXG4gICAgJChOZXR3b3JrKS5vbihcclxuICAgICAgICBOZXR3b3JrLkV2ZW50LkNPVU5URE9XTixcclxuICAgICAgICB0aGlzLm9uQ291bnRkb3duLmJpbmQodGhpcylcclxuICAgICk7XHJcblxyXG4gICAgJChOZXR3b3JrKS5vbihcclxuICAgICAgICBOZXR3b3JrLkV2ZW50LlBMQVlFUl9ERUFUSCxcclxuICAgICAgICB0aGlzLm9uUGxheWVyRGVhdGguYmluZCh0aGlzKVxyXG4gICAgKTtcclxuXHJcbiAgICAkKE5ldHdvcmspLm9uKFxyXG4gICAgICAgIE5ldHdvcmsuRXZlbnQuUExBWUVSX1JFU1BBV04sXHJcbiAgICAgICAgdGhpcy5vblBsYXllclJlc3Bhd24uYmluZCh0aGlzKVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBUT0RPOiBEZXNpZ24gbGV2ZWxzIGJldHRlclxyXG4gICAgbGV2ZWxzLkxldmVsMSh0aGlzKTtcclxuXHJcbiAgICB0aGlzLnRpbWVSZW1haW5pbmcgPSByb29tLnRpbWVSZW1haW5pbmc7XHJcbiAgICB0aGlzLmluaXRpYWxDb3VudGRvd24gPSByb29tLmNvdW50ZG93bjtcclxuICAgIHRoaXMuY291bnRpbmdEb3duID0gdHJ1ZTtcclxuICAgIHRoaXMucmVzcGF3blRpbWUgPSByb29tLnJlc3Bhd25UaW1lO1xyXG4gICAgdGhpcy5yZXNwYXduVGltZVJlbWFpbmluZyA9IHRoaXMucmVzcGF3blRpbWU7XHJcblxyXG4gICAgdGhpcy5iZyA9IG5ldyBiYWNrZ3JvdW5kcy5QYXJhbGxheEJhY2tncm91bmQoXHJcbiAgICAgICAgQXNzZXRzLmdldChBc3NldHMuQkdfVElMRSlcclxuICAgICk7XHJcblxyXG4gICAgdGhpcy5wbGF5ZXIgPSBuZXcgUGxheWVyKE5ldHdvcmsubG9jYWxDbGllbnQuZGF0YS50ZWFtKTtcclxuICAgIHRoaXMucGxheWVyLnBvc2l0aW9uLnggPSBOZXR3b3JrLmxvY2FsQ2xpZW50LmRhdGEucG9zaXRpb24ueDtcclxuICAgIHRoaXMucGxheWVyLnBvc2l0aW9uLnkgPSBOZXR3b3JrLmxvY2FsQ2xpZW50LmRhdGEucG9zaXRpb24ueTtcclxuICAgIHRoaXMucGxheWVyLnNldFJvdGF0aW9uKE5ldHdvcmsubG9jYWxDbGllbnQuZGF0YS5yb3RhdGlvbik7XHJcbiAgICB0aGlzLnBsYXllci5jdXN0b21EYXRhLnNwYXduUG9zaXRpb24gPSBOZXR3b3JrLmxvY2FsQ2xpZW50LmRhdGEucG9zaXRpb247XHJcbiAgICB0aGlzLnBsYXllci5jdXN0b21EYXRhLnNwYXduUm90YXRpb24gPSBOZXR3b3JrLmxvY2FsQ2xpZW50LmRhdGEucm90YXRpb247XHJcblxyXG4gICAgTmV0d29yay5sb2NhbENsaWVudC5nYW1lT2JqZWN0ID0gdGhpcy5wbGF5ZXI7XHJcbiAgICB0aGlzLnBsYXllci5jdXN0b21EYXRhLmNsaWVudElkID0gTmV0d29yay5sb2NhbENsaWVudC5kYXRhLmlkO1xyXG4gICAgdGhpcy5hZGRHYW1lT2JqZWN0KHRoaXMucGxheWVyLCAyKTtcclxuXHJcbiAgICB0aGlzLmNhbWVyYS5mb2xsb3codGhpcy5wbGF5ZXIpO1xyXG4gICAgdGhpcy5jYW1lcmEucG9zaXRpb24ueCA9IHRoaXMucGxheWVyLnBvc2l0aW9uLng7XHJcbiAgICB0aGlzLmNhbWVyYS5wb3NpdGlvbi55ID0gdGhpcy5wbGF5ZXIucG9zaXRpb24ueTtcclxufTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoR2FtZVNjZW5lLCB7XHJcbiAgICBGUklDVElPTiA6IHtcclxuICAgICAgICB2YWx1ZSA6IDAuOTI1XHJcbiAgICB9LFxyXG5cclxuICAgIE1JTklNQVAgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBPYmplY3QuZnJlZXplKHtcclxuICAgICAgICAgICAgV0lEVEggICAgICA6IDE1MCxcclxuICAgICAgICAgICAgSEVJR0hUICAgICA6IDEwMCxcclxuICAgICAgICAgICAgU0NBTEUgICAgICA6IDAuMSxcclxuICAgICAgICAgICAgRklMTF9TVFlMRSA6IFwiIzE5MjQyN1wiXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxufSk7XHJcbkdhbWVTY2VuZS5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoU2NlbmUucHJvdG90eXBlLCB7XHJcbiAgICAvKipcclxuICAgICAqIFVwZGF0ZXMgdGhlIHNjZW5lIGFuZCBhbGwgZ2FtZSBvYmplY3RzIGluIGl0XHJcbiAgICAgKi9cclxuICAgIHVwZGF0ZSA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChkdCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jb3VudGluZ0Rvd24gPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW5pdGlhbENvdW50ZG93biAtPSBkdDtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoTmV0d29yay5pc0hvc3QoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VuZENvdW50ZG93bigpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmluaXRpYWxDb3VudGRvd24gPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY291bnRpbmdEb3duID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBTY2VuZS5wcm90b3R5cGUudXBkYXRlLmNhbGwodGhpcywgZHQpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMudGltZVJlbWFpbmluZyAtPSBkdDtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBNYWtlIHRoZSBjYW1lcmEgZm9sbG93IHRoZSBraWxsZXIgaWYgdGhlIHBsYXllciB3YXMga2lsbGVkXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wbGF5ZXIuaGVhbHRoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faGFuZGxlUGxheWVyRGVhdGgoZHQpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIE90aGVyd2lzZSwgYWxsb3cgdGhlIHBsYXllciB0byBtb3ZlXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2hhbmRsZUlucHV0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5fYXBwbHlGcmljdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVtb3ZlRGVhZEdhbWVPYmplY3RzKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKE5ldHdvcmsuaXNIb3N0KCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbmRDbG9ja1RpY2soKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgc2VuZENvdW50ZG93biA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKE5ldHdvcmsuY29ubmVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICBOZXR3b3JrLnNvY2tldC5lbWl0KCdjb3VudGRvd24nLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgY291bnRkb3duIDogdGhpcy5pbml0aWFsQ291bnRkb3duXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgc2VuZENsb2NrVGljayA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKE5ldHdvcmsuY29ubmVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICBOZXR3b3JrLnNvY2tldC5lbWl0KCdjbG9ja1RpY2snLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGltZVJlbWFpbmluZyA6IHRoaXMudGltZVJlbWFpbmluZ1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHNlbmRQbGF5ZXJEZWF0aCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKE5ldHdvcmsuY29ubmVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICBOZXR3b3JrLnNvY2tldC5lbWl0KCdwbGF5ZXJEZWF0aCcsIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWFkIDogdGhpcy5wbGF5ZXIuY3VzdG9tRGF0YS5jbGllbnRJZCxcclxuICAgICAgICAgICAgICAgICAgICBraWxsZXIgOiB0aGlzLnBsYXllci5jdXN0b21EYXRhLmtpbGxlci5jdXN0b21EYXRhLmNsaWVudElkXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEcmF3cyB0aGUgc2NlbmUgYW5kIGFsbCBnYW1lIG9iamVjdHMgaW4gaXRcclxuICAgICAqL1xyXG4gICAgZHJhdyA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChjdHgpIHtcclxuICAgICAgICAgICAgU2NlbmUucHJvdG90eXBlLmRyYXcuY2FsbCh0aGlzLCBjdHgpO1xyXG5cclxuICAgICAgICAgICAgY3R4LnNhdmUoKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBzY3JlZW5XaWR0aCAgPSBjdHguY2FudmFzLndpZHRoO1xyXG4gICAgICAgICAgICB2YXIgc2NyZWVuSGVpZ2h0ID0gY3R4LmNhbnZhcy5oZWlnaHQ7XHJcbiAgICAgICAgICAgIHZhciBvZmZzZXQgICAgICAgPSBuZXcgZ2VvbS5WZWMyKFxyXG4gICAgICAgICAgICAgICAgc2NyZWVuV2lkdGggICogMC41LFxyXG4gICAgICAgICAgICAgICAgc2NyZWVuSGVpZ2h0ICogMC41XHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gXCIjZmZmXCI7XHJcbiAgICAgICAgICAgIGN0eC5mb250ID0gXCIyNHB4IE11bnJvXCI7XHJcblxyXG4gICAgICAgICAgICAvLyBTaG93IHRoZSByZW1haW5pbmcgZHVyYXRpb24gb2YgdGhlIGdhbWVcclxuICAgICAgICAgICAgdmFyIHRpbWVUZXh0O1xyXG4gICAgICAgICAgICBpZiAodGhpcy50aW1lUmVtYWluaW5nID4gMCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG1pbnV0ZXMgPSBNYXRoLmZsb29yKCh0aGlzLnRpbWVSZW1haW5pbmcpIC8gKDEwMDAgKiA2MCkpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHNlY29uZHMgPSBNYXRoLmZsb29yKCh0aGlzLnRpbWVSZW1haW5pbmcgLSBtaW51dGVzICogMTAwMCAqIDYwKSAvIDEwMDApO1xyXG4gICAgICAgICAgICAgICAgdGltZVRleHQgPSBtaW51dGVzICsgXCI6XCI7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHNlY29uZHMgPCAxMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRpbWVUZXh0ICs9IFwiMFwiO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRpbWVUZXh0ICs9IHNlY29uZHM7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aW1lVGV4dCA9IFwiMDowMFwiO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy50aW1lUmVtYWluaW5nIDwgMTAwMCAqIDEwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy50aW1lUmVtYWluaW5nICUgNTAwIDwgMjUwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiKDI1NSwgNzksIDc5KVwiO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2JhKDAsIDAsIDAsIDApXCI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjdHguZm9udCA9IFwiMzBweCBNdW5yb1wiO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMudGltZVJlbWFpbmluZyA8IDEwMDAgKiAzMCkge1xyXG4gICAgICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiKDI0MSwgMjA4LCA5MilcIjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY3R4LnRyYW5zbGF0ZShvZmZzZXQueCwgMCk7XHJcbiAgICAgICAgICAgIGN0eC50ZXh0QWxpZ24gPSBcImNlbnRlclwiO1xyXG4gICAgICAgICAgICBjdHgudGV4dEJhc2VsaW5lID0gXCJ0b3BcIjtcclxuICAgICAgICAgICAgY3R4LmZpbGxUZXh0KHRpbWVUZXh0LCAwLCAwKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFNob3cgdGhlIGluaXRpYWwgY291bnRkb3duIGJlZm9yZSB0aGUgZ2FtZVxyXG4gICAgICAgICAgICBpZiAodGhpcy5pbml0aWFsQ291bnRkb3duID4gMCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGNvdW50ZG93blNlY29uZHMgPSBNYXRoLnJvdW5kKHRoaXMuaW5pdGlhbENvdW50ZG93biAvIDEwMDApO1xyXG4gICAgICAgICAgICAgICAgdmFyIGNvdW50ZG93blRleHQgPSBjb3VudGRvd25TZWNvbmRzLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gXCIjZmZmXCI7XHJcblxyXG4gICAgICAgICAgICAgICAgc3dpdGNoIChjb3VudGRvd25TZWNvbmRzKSB7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgY2FzZSA1OlxyXG4gICAgICAgICAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSBcInJnYigyNTUsIDc5LCA3OSlcIjtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiKDI0NywgMTU1LCA4NylcIjtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiKDI0MSwgMjA4LCA5MilcIjtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiKDIxNSwgMjM1LCA5OSlcIjtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiKDEzMiwgMjMxLCAxMDMpXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSAwOlxyXG4gICAgICAgICAgICAgICAgICAgIGNvdW50ZG93blRleHQgPSBcIkZJR0hUXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwiI2ZmZlwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGN0eC50cmFuc2xhdGUoMCwgb2Zmc2V0LnkpO1xyXG4gICAgICAgICAgICAgICAgY3R4LnRleHRBbGlnbiA9IFwiY2VudGVyXCI7XHJcbiAgICAgICAgICAgICAgICBjdHgudGV4dEJhc2VsaW5lID0gXCJtaWRkbGVcIjtcclxuICAgICAgICAgICAgICAgIGN0eC5mb250ID0gXCI5NnB4IE11bnJvXCI7XHJcbiAgICAgICAgICAgICAgICBjdHguZmlsbFRleHQoY291bnRkb3duVGV4dCwgMCwgMCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGN0eC5yZXN0b3JlKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBEcmF3IEhQXHJcbiAgICAgICAgICAgIGN0eC5zYXZlKCk7XHJcblxyXG4gICAgICAgICAgICBjdHgudHJhbnNsYXRlKDQsIDQpO1xyXG5cclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBsYXllci5tYXhIZWFsdGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGdyYXBoaWM7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wbGF5ZXIuaGVhbHRoID4gaSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGdyYXBoaWMgPSBBc3NldHMuZ2V0KEFzc2V0cy5IUF9GVUxMKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ3JhcGhpYyA9IEFzc2V0cy5nZXQoQXNzZXRzLkhQX0VNUFRZKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBjdHguZHJhd0ltYWdlKGdyYXBoaWMsIDAsIDApO1xyXG4gICAgICAgICAgICAgICAgY3R4LnRyYW5zbGF0ZSgyNCwgMCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGN0eC5yZXN0b3JlKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBEcmF3IFJlc3Bhd24gbWVzc2FnZSBpZiBuZWNlc3NhcnlcclxuICAgICAgICAgICAgaWYgKHRoaXMucGxheWVyLmhlYWx0aCA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBjdHguc2F2ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciByZXNwYXduVGltZVJlbWFpbmluZyA9IE1hdGgucm91bmQodGhpcy5yZXNwYXduVGltZVJlbWFpbmluZyAvIDEwMDApO1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlc3Bhd25NZXNzYWdlID0gXCJSZXNwYXduIGluIFwiICsgcmVzcGF3blRpbWVSZW1haW5pbmcudG9TdHJpbmcoKSArIFwiIHNlY29uZHNcIjtcclxuXHJcbiAgICAgICAgICAgICAgICBjdHgudHJhbnNsYXRlKG9mZnNldC54LCBvZmZzZXQueSk7XHJcbiAgICAgICAgICAgICAgICBjdHgudGV4dEFsaWduID0gXCJjZW50ZXJcIjtcclxuICAgICAgICAgICAgICAgIGN0eC50ZXh0QmFzZWxpbmUgPSBcIm1pZGRsZVwiO1xyXG4gICAgICAgICAgICAgICAgY3R4LmZvbnQgPSBcIjQ4cHggTXVucm9cIjtcclxuICAgICAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSBcIiNmZmZcIjtcclxuICAgICAgICAgICAgICAgIGN0eC5maWxsVGV4dChyZXNwYXduTWVzc2FnZSwgMCwgMCk7XHJcblxyXG4gICAgICAgICAgICAgICAgY3R4LnJlc3RvcmUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgb25Db3VudGRvd24gOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSwgZGF0YSkge1xyXG4gICAgICAgICAgICB0aGlzLmluaXRpYWxDb3VudGRvd24gPSBkYXRhLmNvdW50ZG93bjtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIG9uQ2xvY2tUaWNrIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUsIGRhdGEpIHtcclxuICAgICAgICAgICAgdGhpcy50aW1lUmVtYWluaW5nID0gcGFyc2VJbnQoZGF0YS50aW1lUmVtYWluaW5nKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIG9uQnVsbGV0IDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUsIGRhdGEpIHtcclxuICAgICAgICAgICAgdmFyIHJvdGF0aW9uID0gUGh5c2ljc09iamVjdC5wcm90b3R5cGUuZ2V0RGlzcGxheUFuZ2xlKGRhdGEucm90YXRpb24pO1xyXG4gICAgICAgICAgICB2YXIgZm9yd2FyZCA9IGdlb20uVmVjMi5mcm9tQW5nbGUocm90YXRpb24pO1xyXG4gICAgICAgICAgICB2YXIgcGxheWVyID0gTmV0d29yay5jbGllbnRzW2RhdGEucGxheWVySWRdLmdhbWVPYmplY3Q7XHJcbiAgICAgICAgICAgIHZhciBidWxsZXQgPSBuZXcgQnVsbGV0KDEsIHBsYXllcik7XHJcbiAgICAgICAgICAgIGJ1bGxldC5wb3NpdGlvbi54ID0gZGF0YS5wb3NpdGlvbi54O1xyXG4gICAgICAgICAgICBidWxsZXQucG9zaXRpb24ueSA9IGRhdGEucG9zaXRpb24ueTtcclxuICAgICAgICAgICAgYnVsbGV0LnZlbG9jaXR5LnggPSBmb3J3YXJkLng7XHJcbiAgICAgICAgICAgIGJ1bGxldC52ZWxvY2l0eS55ID0gZm9yd2FyZC55O1xyXG4gICAgICAgICAgICBidWxsZXQucm90YXRlKHJvdGF0aW9uKTtcclxuICAgICAgICAgICAgYnVsbGV0LnZlbG9jaXR5Lm11bHRpcGx5KEJ1bGxldC5ERUZBVUxUX1NQRUVEKTtcclxuICAgICAgICAgICAgYnVsbGV0LnZlbG9jaXR5LnggKz0gZGF0YS52ZWxvY2l0eS54O1xyXG4gICAgICAgICAgICBidWxsZXQudmVsb2NpdHkueSArPSBkYXRhLnZlbG9jaXR5Lnk7XHJcblxyXG4gICAgICAgICAgICBpZiAoYnVsbGV0LnZlbG9jaXR5LmdldE1hZ25pdHVkZVNxdWFyZWQoKSA8IEJ1bGxldC5ERUZBVUxUX1NQRUVEICogQnVsbGV0LkRFRkFVTFRfU1BFRUQpIHtcclxuICAgICAgICAgICAgICAgIGJ1bGxldC52ZWxvY2l0eS5zZXRNYWduaXR1ZGUoQnVsbGV0LkRFRkFVTFRfU1BFRUQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLmFkZEdhbWVPYmplY3QoYnVsbGV0LCAxKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIG9uUGxheWVyRGVhdGggOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSwgZGF0YSkge1xyXG4gICAgICAgICAgICB2YXIgcGxheWVyID0gTmV0d29yay5jbGllbnRzW2RhdGEuZGVhZF0uZ2FtZU9iamVjdDtcclxuICAgICAgICAgICAgcGxheWVyLnNvbGlkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHBsYXllci5zZXRTdGF0ZShQbGF5ZXIuU1RBVEUuRVhQTE9TSU9OKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIG9uUGxheWVyUmVzcGF3biA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlLCBkYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciBwbGF5ZXIgPSBOZXR3b3JrLmNsaWVudHNbZGF0YS5yZXNwYXduXS5nYW1lT2JqZWN0O1xyXG4gICAgICAgICAgICBwbGF5ZXIucG9zaXRpb24ueCA9IHBsYXllci5jdXN0b21EYXRhLnNwYXduUG9zaXRpb24ueDtcclxuICAgICAgICAgICAgcGxheWVyLnBvc2l0aW9uLnkgPSBwbGF5ZXIuY3VzdG9tRGF0YS5zcGF3blBvc2l0aW9uLnk7XHJcbiAgICAgICAgICAgIHBsYXllci5zZXRSb3RhdGlvbihwbGF5ZXIuY3VzdG9tRGF0YS5zcGF3blJvdGF0aW9uKTtcclxuICAgICAgICAgICAgcGxheWVyLnNldFN0YXRlKEdhbWVPYmplY3QuU1RBVEUuREVGQVVMVCk7XHJcbiAgICAgICAgICAgIHBsYXllci5oZWFsdGggPSBwbGF5ZXIubWF4SGVhbHRoO1xyXG4gICAgICAgICAgICBwbGF5ZXIuc29saWQgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgLy8gQWN0aXZhdGUgXCJzcGF3biBzaGllbGRcIlxyXG4gICAgICAgICAgICBwbGF5ZXIudGFrZURhbWFnZSgwKTtcclxuXHJcbiAgICAgICAgICAgIC8vIElmIHRoaXMgY2xpZW50J3MgcGxheWVyIGlzIHJlc3Bhd25pbmcsIHRoZW4gbWFrZSB0aGUgY2FtZXJhXHJcbiAgICAgICAgICAgIC8vIHN0YXJ0IGZvbGxvd2luZyBpdCBhZ2FpblxyXG4gICAgICAgICAgICBpZiAocGxheWVyID09PSB0aGlzLnBsYXllcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jYW1lcmEuZm9sbG93KHBsYXllcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9oYW5kbGVJbnB1dCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHBsYXllciAgICAgICA9IHRoaXMucGxheWVyO1xyXG4gICAgICAgICAgICB2YXIga2V5Ym9hcmQgICAgID0gdGhpcy5rZXlib2FyZDtcclxuICAgICAgICAgICAgdmFyIGxlZnRQcmVzc2VkICA9IGtleWJvYXJkLmlzUHJlc3NlZChrZXlib2FyZC5MRUZUKTtcclxuICAgICAgICAgICAgdmFyIHJpZ2h0UHJlc3NlZCA9IGtleWJvYXJkLmlzUHJlc3NlZChrZXlib2FyZC5SSUdIVCk7XHJcbiAgICAgICAgICAgIHZhciB1cFByZXNzZWQgICAgPSBrZXlib2FyZC5pc1ByZXNzZWQoa2V5Ym9hcmQuVVApO1xyXG4gICAgICAgICAgICB2YXIgZG93blByZXNzZWQgID0ga2V5Ym9hcmQuaXNQcmVzc2VkKGtleWJvYXJkLkRPV04pO1xyXG4gICAgICAgICAgICB2YXIgc2hvb3RpbmcgICAgID0ga2V5Ym9hcmQuaXNQcmVzc2VkKGtleWJvYXJkLlopO1xyXG5cclxuICAgICAgICAgICAgLy8gTGVmdC8gUmlnaHQgS2V5IC0tIFBsYXllciB0dXJuc1xyXG4gICAgICAgICAgICBpZiAobGVmdFByZXNzZWQgfHwgcmlnaHRQcmVzc2VkKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcm90YXRpb24gPSAwO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChsZWZ0UHJlc3NlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJvdGF0aW9uIC09IFBsYXllci5UVVJOX1NQRUVEO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChyaWdodFByZXNzZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICByb3RhdGlvbiArPSBQbGF5ZXIuVFVSTl9TUEVFRDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIucm90YXRlKHJvdGF0aW9uKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gVXAgS2V5IC0tIFBsYXllciBnb2VzIGZvcndhcmRcclxuICAgICAgICAgICAgaWYgKHVwUHJlc3NlZCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG1vdmVtZW50Rm9yY2UgPSBnZW9tLlZlYzIuZnJvbUFuZ2xlKHBsYXllci5nZXRSb3RhdGlvbigpKTtcclxuICAgICAgICAgICAgICAgIG1vdmVtZW50Rm9yY2UubXVsdGlwbHkoXHJcbiAgICAgICAgICAgICAgICAgICAgUGxheWVyLkJPT1NUX0FDQ0VMRVJBVElPTiAqIHBsYXllci5tYXNzXHJcbiAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgIHBsYXllci5hZGRGb3JjZShtb3ZlbWVudEZvcmNlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gRG93biBLZXkgLS0gQXBwbHkgYnJha2VzIHRvIHBsYXllclxyXG4gICAgICAgICAgICBpZiAoZG93blByZXNzZWQpIHtcclxuICAgICAgICAgICAgICAgIHBsYXllci52ZWxvY2l0eS5tdWx0aXBseShQbGF5ZXIuQlJBS0VfUkFURSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChzaG9vdGluZykge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLnNob290KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9oYW5kbGVQbGF5ZXJEZWF0aCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChkdCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wbGF5ZXIuY3VzdG9tRGF0YS5raWxsZXIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VuZFBsYXllckRlYXRoKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jYW1lcmEuZm9sbG93KHRoaXMucGxheWVyLmN1c3RvbURhdGEua2lsbGVyKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllci5jdXN0b21EYXRhLmtpbGxlciA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIHRoaXMucGxheWVyLnNldFN0YXRlKFBsYXllci5TVEFURS5FWFBMT1NJT04pO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMucmVzcGF3blRpbWVSZW1haW5pbmcgPSB0aGlzLnJlc3Bhd25UaW1lO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLnJlc3Bhd25UaW1lUmVtYWluaW5nIC09IGR0O1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX2FwcGx5RnJpY3Rpb24gOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBnYW1lT2JqZWN0cyA9IHRoaXMuZ2V0R2FtZU9iamVjdHMoKTtcclxuXHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ2FtZU9iamVjdHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciBvYmogPSBnYW1lT2JqZWN0c1tpXTtcclxuICAgICAgICAgICAgICAgIGlmICghb2JqLmN1c3RvbURhdGEuaWdub3JlRnJpY3Rpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBvYmouYWNjZWxlcmF0aW9uLm11bHRpcGx5KEdhbWVTY2VuZS5GUklDVElPTik7XHJcbiAgICAgICAgICAgICAgICAgICAgb2JqLnZlbG9jaXR5Lm11bHRpcGx5KEdhbWVTY2VuZS5GUklDVElPTik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9yZW1vdmVEZWFkR2FtZU9iamVjdHMgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBnYW1lT2JqZWN0cyA9IHRoaXMuZ2V0R2FtZU9iamVjdHMoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEdvIHRocm91Z2ggYWxsIGdhbWUgb2JqZWN0cyBhbmQgcmVtb3ZlIGFueSB0aGF0IGhhdmUgYmVlblxyXG4gICAgICAgICAgICAvLyBmbGFnZ2VkIGZvciByZW1vdmFsXHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSBnYW1lT2JqZWN0cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG9iaiA9IGdhbWVPYmplY3RzW2ldO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChvYmouY3VzdG9tRGF0YS5yZW1vdmVkID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVHYW1lT2JqZWN0KG9iaik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR2FtZVNjZW5lOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIFNjZW5lID0gd2ZsLmRpc3BsYXkuU2NlbmU7XHJcbnZhciBvdmVybGF5cyA9IHJlcXVpcmUoJy4uL292ZXJsYXlzJyk7XHJcbnZhciBOZXR3b3JrID0gcmVxdWlyZSgnLi4vbmV0d29yaycpO1xyXG5cclxudmFyIEdhbWVTdGFydFNjZW5lID0gZnVuY3Rpb24gKGNhbnZhcywgcm9vbSkge1xyXG4gICAgU2NlbmUuY2FsbCh0aGlzLCBjYW52YXMpO1xyXG5cclxuICAgIHRoaXMucm9vbSA9IHJvb207XHJcblxyXG4gICAgJChOZXR3b3JrKS5vbihOZXR3b3JrLkV2ZW50LkdBTUVfU1RBUlRfREFUQSwgdGhpcy5fb25HZXRTdGFydERhdGEuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgaWYgKE5ldHdvcmsuaXNIb3N0KCkpIHtcclxuICAgICAgICBOZXR3b3JrLnNvY2tldC5lbWl0KE5ldHdvcmsuRXZlbnQuR0FNRV9TVEFSVF9EQVRBLCByb29tLmlkKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmxvYWRpbmdPdmVybGF5ID0gbmV3IG92ZXJsYXlzLkxvYWRpbmdPdmVybGF5KCk7XHJcbiAgICAkKGNhbnZhcykucGFyZW50KCkuYXBwZW5kKHRoaXMubG9hZGluZ092ZXJsYXkuZG9tT2JqZWN0KTtcclxufTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoR2FtZVN0YXJ0U2NlbmUsIHtcclxuICAgIEV2ZW50IDoge1xyXG4gICAgICAgIHZhbHVlIDoge1xyXG4gICAgICAgICAgICBTVEFSVF9HQU1FIDogXCJzdGFydEdhbWVcIlxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcbkdhbWVTdGFydFNjZW5lLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShTY2VuZS5wcm90b3R5cGUsIHtcclxuICAgIGRlc3Ryb3kgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9hZGluZ092ZXJsYXkuZG9tT2JqZWN0LnJlbW92ZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uR2V0U3RhcnREYXRhIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUsIGRhdGEpIHtcclxuICAgICAgICAgICAgdmFyIHRlYW1BID0gZGF0YS50ZWFtQTtcclxuICAgICAgICAgICAgdmFyIHRlYW1CID0gZGF0YS50ZWFtQjtcclxuXHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGVhbUEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciByZWYgPSB0ZWFtQVtpXTtcclxuICAgICAgICAgICAgICAgIE5ldHdvcmsuY2xpZW50c1tyZWYuaWRdLmRhdGEgPSByZWY7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGVhbUIubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciByZWYgPSB0ZWFtQltpXTtcclxuICAgICAgICAgICAgICAgIE5ldHdvcmsuY2xpZW50c1tyZWYuaWRdLmRhdGEgPSByZWY7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICQodGhpcykudHJpZ2dlcihcclxuICAgICAgICAgICAgICAgIEdhbWVTdGFydFNjZW5lLkV2ZW50LlNUQVJUX0dBTUUsXHJcbiAgICAgICAgICAgICAgICB0aGlzLnJvb21cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKTtcclxuT2JqZWN0LmZyZWV6ZShHYW1lU3RhcnRTY2VuZSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVTdGFydFNjZW5lOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIFNjZW5lID0gd2ZsLmRpc3BsYXkuU2NlbmU7XHJcbnZhciBvdmVybGF5cyA9IHJlcXVpcmUoJy4uL292ZXJsYXlzJyk7XHJcblxyXG52YXIgTG9hZGluZ1NjZW5lID0gZnVuY3Rpb24gKGNhbnZhcykge1xyXG4gICAgU2NlbmUuY2FsbCh0aGlzLCBjYW52YXMpO1xyXG4gICAgXHJcbiAgICB0aGlzLmxvYWRpbmdPdmVybGF5ID0gbmV3IG92ZXJsYXlzLkxvYWRpbmdPdmVybGF5KCk7XHJcbiAgICAkKGNhbnZhcykucGFyZW50KCkuYXBwZW5kKHRoaXMubG9hZGluZ092ZXJsYXkuZG9tT2JqZWN0KTtcclxufTtcclxuTG9hZGluZ1NjZW5lLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShTY2VuZS5wcm90b3R5cGUsIHtcclxuICAgIGRlc3Ryb3kgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9hZGluZ092ZXJsYXkuZG9tT2JqZWN0LnJlbW92ZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBMb2FkaW5nU2NlbmU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgU2NlbmUgPSB3ZmwuZGlzcGxheS5TY2VuZTtcclxudmFyIG92ZXJsYXlzID0gcmVxdWlyZSgnLi4vb3ZlcmxheXMnKTtcclxudmFyIE5ldHdvcmsgPSByZXF1aXJlKCcuLi9uZXR3b3JrJyk7XHJcblxyXG52YXIgTG9iYnlTY2VuZSA9IGZ1bmN0aW9uIChjYW52YXMpIHtcclxuICAgIFNjZW5lLmNhbGwodGhpcywgY2FudmFzKTtcclxuXHJcbiAgICB0aGlzLmN1clJvb21JZCA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICB0aGlzLmxvYmJ5T3ZlcmxheSA9IG5ldyBvdmVybGF5cy5Mb2JieU92ZXJsYXkoKTtcclxuICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkgPSBuZXcgb3ZlcmxheXMuQ3JlYXRlUm9vbU92ZXJsYXkoKTtcclxuICAgICQoY2FudmFzKS5wYXJlbnQoKS5hcHBlbmQodGhpcy5sb2JieU92ZXJsYXkuZG9tT2JqZWN0KTtcclxuICAgICQoY2FudmFzKS5wYXJlbnQoKS5hcHBlbmQodGhpcy5jcmVhdGVSb29tT3ZlcmxheS5kb21PYmplY3QpO1xyXG5cclxuICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuZG9tT2JqZWN0LmhpZGUoKTtcclxuXHJcbiAgICB0aGlzLmxvYmJ5T3ZlcmxheS5sZWF2ZVJvb21CdG4uY2xpY2sodGhpcy5fb25MZWF2ZVJvb21CdXR0b25DbGljay5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMubG9iYnlPdmVybGF5LnJlYWR5QnRuLmNsaWNrKHRoaXMuX29uUmVhZHlCdXR0b25DbGljay5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMubG9iYnlPdmVybGF5LnN3aXRjaFRlYW1CdG4uY2xpY2sodGhpcy5fb25Td2l0Y2hUZWFtQnV0dG9uQ2xpY2suYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLmxvYmJ5T3ZlcmxheS5jcmVhdGVSb29tQnRuLmNsaWNrKHRoaXMuX29uQ3JlYXRlUm9vbUJ1dHRvbkNsaWNrLmJpbmQodGhpcykpO1xyXG5cclxuICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuY2FuY2VsQnRuLmNsaWNrKHRoaXMuX29uQ3JlYXRlUm9vbUNhbmNlbC5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuY3JlYXRlQnRuLmNsaWNrKHRoaXMuX29uQ3JlYXRlUm9vbS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAkKHRoaXMubG9iYnlPdmVybGF5KS5vbihvdmVybGF5cy5Mb2JieU92ZXJsYXkuRXZlbnQuRU5URVJfUk9PTSwgdGhpcy5fb25FbnRlclJvb21BdHRlbXB0LmJpbmQodGhpcykpO1xyXG5cclxuICAgICQoTmV0d29yaykub24oTmV0d29yay5FdmVudC5VUERBVEVfUk9PTVMsIHRoaXMuX29uVXBkYXRlUm9vbUxpc3QuYmluZCh0aGlzKSk7XHJcbiAgICAkKE5ldHdvcmspLm9uKE5ldHdvcmsuRXZlbnQuRU5URVJfUk9PTV9TVUNDRVNTLCB0aGlzLl9vbkVudGVyUm9vbVN1Y2Nlc3MuYmluZCh0aGlzKSk7XHJcbiAgICAkKE5ldHdvcmspLm9uKE5ldHdvcmsuRXZlbnQuRU5URVJfUk9PTV9GQUlMLCB0aGlzLl9vbkVudGVyUm9vbUZhaWwuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgdGhpcy5yb29tVXBkYXRlSW50ZXJ2YWwgPVxyXG4gICAgICAgIHNldEludGVydmFsKHRoaXMudXBkYXRlUm9vbUxpc3QuYmluZCh0aGlzKSwgTG9iYnlTY2VuZS5ST09NX1VQREFURV9GUkVRVUVOQ1kpO1xyXG5cclxuICAgIHRoaXMudXBkYXRlUm9vbUxpc3QoKTtcclxufTtcclxuXHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKExvYmJ5U2NlbmUsIHtcclxuICAgIFJPT01fVVBEQVRFX0ZSRVFVRU5DWSA6IHtcclxuICAgICAgICB2YWx1ZSA6IDUwMDBcclxuICAgIH0sXHJcblxyXG4gICAgRXZlbnQgOiB7XHJcbiAgICAgICAgdmFsdWUgOiB7XHJcbiAgICAgICAgICAgIFRPR0dMRV9SRUFEWSA6IFwidG9nZ2xlUmVhZHlcIlxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcblxyXG5Mb2JieVNjZW5lLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShTY2VuZS5wcm90b3R5cGUsIHtcclxuICAgIGRlc3Ryb3kgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9iYnlPdmVybGF5LmRvbU9iamVjdC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5kb21PYmplY3QucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuaW5wdXRGaWVsZC5vZmYoXCJrZXlwcmVzc1wiKTtcclxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLnJvb21VcGRhdGVJbnRlcnZhbCk7XHJcbiAgICAgICAgICAgICQoTmV0d29yaykub2ZmKE5ldHdvcmsuRXZlbnQuVVBEQVRFX1JPT01TKTtcclxuICAgICAgICAgICAgJChOZXR3b3JrKS5vZmYoTmV0d29yay5FdmVudC5FTlRFUl9ST09NX1NVQ0NFU1MpO1xyXG4gICAgICAgICAgICAkKE5ldHdvcmspLm9mZihOZXR3b3JrLkV2ZW50LkVOVEVSX1JPT01fRkFJTCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICB1cGRhdGVSb29tTGlzdCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgTmV0d29yay5nZXRSb29tcygpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uTGVhdmVSb29tQnV0dG9uQ2xpY2sgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBOZXR3b3JrLmxlYXZlUm9vbSh0aGlzLmN1clJvb21JZCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VyUm9vbUlkID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uUmVhZHlCdXR0b25DbGljayA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIHZhciBjbGllbnRXaWxsQmVSZWFkeSA9ICFOZXR3b3JrLmxvY2FsQ2xpZW50LmRhdGEucmVhZHk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmxvYmJ5T3ZlcmxheS5zd2l0Y2hUZWFtQnRuLnByb3AoXCJkaXNhYmxlZFwiLCBjbGllbnRXaWxsQmVSZWFkeSk7XHJcblxyXG4gICAgICAgICAgICBOZXR3b3JrLnNvY2tldC5lbWl0KCd1cGRhdGVSZWFkeScsIHtcclxuICAgICAgICAgICAgICAgIHJlYWR5IDogY2xpZW50V2lsbEJlUmVhZHlcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25DcmVhdGVSb29tQnV0dG9uQ2xpY2sgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmlucHV0RmllbGQub2ZmKFwia2V5cHJlc3NcIik7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmlucHV0RmllbGQudmFsKFwiXCIpO1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmRvbU9iamVjdC5yZW1vdmVDbGFzcyhcImZhZGUtaW5cIik7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuZG9tT2JqZWN0LnNob3coKTtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5kb21PYmplY3QuYWRkQ2xhc3MoXCJmYWRlLWluXCIpO1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmlucHV0RmllbGQuZm9jdXMoKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuaW5wdXRGaWVsZC5vbihcImtleXByZXNzXCIsIHRoaXMuX29uQ3JlYXRlUm9vbUtleVByZXNzLmJpbmQodGhpcykpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uQ3JlYXRlUm9vbUtleVByZXNzIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMTMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX29uQ3JlYXRlUm9vbSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25DcmVhdGVSb29tQ2FuY2VsIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5kb21PYmplY3QuaGlkZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uQ3JlYXRlUm9vbSA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIHZhciBuYW1lID0gdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5pbnB1dEZpZWxkLnZhbCgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKG5hbWUgIT09IFwiXCIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuZG9tT2JqZWN0LmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIE5ldHdvcmsuY3JlYXRlUm9vbShuYW1lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uU3dpdGNoVGVhbUJ1dHRvbkNsaWNrIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgTmV0d29yay5zd2l0Y2hUZWFtKHRoaXMuY3VyUm9vbUlkKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vblVwZGF0ZVJvb21MaXN0IDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUsIGRhdGEpIHtcclxuICAgICAgICAgICAgdGhpcy5sb2JieU92ZXJsYXkuc2hvd1Jvb21zKGRhdGEpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuY3VyUm9vbUlkICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9iYnlPdmVybGF5LnJlbmRlclJvb20oZGF0YVt0aGlzLmN1clJvb21JZF0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2JieU92ZXJsYXkucmVuZGVyUm9vbSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25FbnRlclJvb21BdHRlbXB0IDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUsIGRhdGEpIHtcclxuICAgICAgICAgICAgTmV0d29yay5lbnRlclJvb20oZGF0YS5pZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25FbnRlclJvb21TdWNjZXNzIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUsIGRhdGEpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJSb29tSWQgPSBkYXRhLmlkO1xyXG4gICAgICAgICAgICB0aGlzLmxvYmJ5T3ZlcmxheS5yZW5kZXJSb29tKGRhdGEpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uRW50ZXJSb29tRmFpbCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlLCBkYXRhKSB7XHJcbiAgICAgICAgICAgIGFsZXJ0KGRhdGEubXNnKTtcclxuICAgICAgICAgICAgdGhpcy5jdXJSb29tSWQgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIHRoaXMubG9iYnlPdmVybGF5LnJlbmRlclJvb20odW5kZWZpbmVkKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKTtcclxuXHJcbk9iamVjdC5mcmVlemUoTG9iYnlTY2VuZSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IExvYmJ5U2NlbmU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgTG9hZGluZ1NjZW5lID0gcmVxdWlyZSgnLi9Mb2FkaW5nU2NlbmUuanMnKTtcclxudmFyIExvYmJ5U2NlbmUgPSByZXF1aXJlKCcuL0xvYmJ5U2NlbmUuanMnKTtcclxudmFyIEdhbWVTdGFydFNjZW5lID0gcmVxdWlyZSgnLi9HYW1lU3RhcnRTY2VuZS5qcycpO1xyXG52YXIgR2FtZU92ZXJTY2VuZSA9IHJlcXVpcmUoJy4vR2FtZU92ZXJTY2VuZS5qcycpO1xyXG52YXIgR2FtZVNjZW5lID0gcmVxdWlyZSgnLi9HYW1lU2NlbmUuanMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgTG9hZGluZ1NjZW5lICAgOiBMb2FkaW5nU2NlbmUsXHJcbiAgICBMb2JieVNjZW5lICAgICA6IExvYmJ5U2NlbmUsXHJcbiAgICBHYW1lU3RhcnRTY2VuZSA6IEdhbWVTdGFydFNjZW5lLFxyXG4gICAgR2FtZU92ZXJTY2VuZSAgOiBHYW1lT3ZlclNjZW5lLFxyXG4gICAgR2FtZVNjZW5lICAgICAgOiBHYW1lU2NlbmVcclxufTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgQkdfVElMRSAgICAgICA6IFwiLi9hc3NldHMvaW1nL0JHLXRpbGUxLnBuZ1wiLFxyXG4gICAgQkxPQ0tfRlVMTCAgICA6IFwiLi9hc3NldHMvaW1nL0Jsb2NrRnVsbC5wbmdcIixcclxuICAgIEJMT0NLX0hBTEYgICAgOiBcIi4vYXNzZXRzL2ltZy9CbG9ja0hhbGYucG5nXCIsXHJcbiAgICBTSElQXzEgICAgICAgIDogXCIuL2Fzc2V0cy9pbWcvT3RoZXJTaGlwLnBuZ1wiLFxyXG4gICAgU0hJUF8yICAgICAgICA6IFwiLi9hc3NldHMvaW1nL1NoaXAucG5nXCIsXHJcbiAgICBXRUFLX0JVTExFVF8xIDogXCIuL2Fzc2V0cy9pbWcvQnVsbGV0V2Vha19hLnBuZ1wiLFxyXG4gICAgV0VBS19CVUxMRVRfMiA6IFwiLi9hc3NldHMvaW1nL0J1bGxldFdlYWtfYi5wbmdcIixcclxuICAgIFdFQUtfQlVMTEVUXzMgOiBcIi4vYXNzZXRzL2ltZy9CdWxsZXRXZWFrX2MucG5nXCIsXHJcbiAgICBXRUFLX0JVTExFVF80IDogXCIuL2Fzc2V0cy9pbWcvQnVsbGV0V2Vha19kLnBuZ1wiLFxyXG4gICAgRVhQTE9TSU9OX0FfMSA6IFwiLi9hc3NldHMvaW1nL090aGVyRXhwbG9zaW9uMS5wbmdcIixcclxuICAgIEVYUExPU0lPTl9BXzIgOiBcIi4vYXNzZXRzL2ltZy9PdGhlckV4cGxvc2lvbjIucG5nXCIsXHJcbiAgICBFWFBMT1NJT05fQV8zIDogXCIuL2Fzc2V0cy9pbWcvT3RoZXJFeHBsb3Npb24zLnBuZ1wiLFxyXG4gICAgRVhQTE9TSU9OX0JfMSA6IFwiLi9hc3NldHMvaW1nL0V4cGxvc2lvbjEucG5nXCIsXHJcbiAgICBFWFBMT1NJT05fQl8yIDogXCIuL2Fzc2V0cy9pbWcvRXhwbG9zaW9uMi5wbmdcIixcclxuICAgIEVYUExPU0lPTl9CXzMgOiBcIi4vYXNzZXRzL2ltZy9FeHBsb3Npb24zLnBuZ1wiLFxyXG4gICAgRVhQTE9TSU9OX0VORCA6IFwiLi9hc3NldHMvaW1nL0V4cGxvc2lvbkVuZC5wbmdcIixcclxuICAgIEhQX0ZVTEwgICAgICAgOiBcIi4vYXNzZXRzL2ltZy9IZWFsdGhPcmJGdWxsLnBuZ1wiLFxyXG4gICAgSFBfRU1QVFkgICAgICA6IFwiLi9hc3NldHMvaW1nL0hlYWx0aE9yYkVtcHR5LnBuZ1wiLFxyXG5cclxuICAgIC8vIFByZWxvYWRlciByZXBsYWNlcyBnZXR0ZXIgd2l0aCBhcHByb3ByaWF0ZSBkZWZpbml0aW9uXHJcbiAgICBnZXQgICAgICAgIDogZnVuY3Rpb24gKHBhdGgpIHsgfVxyXG59OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIEFzc2V0cyA9IHJlcXVpcmUoJy4vQXNzZXRzLmpzJyk7XHJcblxyXG52YXIgUHJlbG9hZGVyID0gZnVuY3Rpb24gKG9uQ29tcGxldGUpIHtcclxuICAgIC8vIFNldCB1cCBwcmVsb2FkZXJcclxuXHR0aGlzLnF1ZXVlID0gbmV3IGNyZWF0ZWpzLkxvYWRRdWV1ZShmYWxzZSk7XHJcblxyXG4gICAgLy8gUmVwbGFjZSBkZWZpbml0aW9uIG9mIEFzc2V0IGdldHRlciB0byB1c2UgdGhlIGRhdGEgZnJvbSB0aGUgcXVldWVcclxuICAgIEFzc2V0cy5nZXQgPSB0aGlzLnF1ZXVlLmdldFJlc3VsdC5iaW5kKHRoaXMucXVldWUpO1xyXG5cclxuICAgIC8vIE9uY2UgZXZlcnl0aGluZyBoYXMgYmVlbiBwcmVsb2FkZWQsIHN0YXJ0IHRoZSBhcHBsaWNhdGlvblxyXG4gICAgaWYgKG9uQ29tcGxldGUpIHtcclxuICAgICAgICB0aGlzLnF1ZXVlLm9uKFwiY29tcGxldGVcIiwgb25Db21wbGV0ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIG5lZWRUb0xvYWQgPSBbXTtcclxuXHJcbiAgICAvLyBQcmVwYXJlIHRvIGxvYWQgaW1hZ2VzXHJcbiAgICBmb3IgKHZhciBpbWcgaW4gQXNzZXRzKSB7XHJcbiAgICAgICAgdmFyIGltZ09iaiA9IHtcclxuICAgICAgICAgICAgaWQgOiBpbWcsXHJcbiAgICAgICAgICAgIHNyYyA6IEFzc2V0c1tpbWddXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBuZWVkVG9Mb2FkLnB1c2goaW1nT2JqKTtcclxuICAgIH1cclxuXHJcblx0dGhpcy5xdWV1ZS5sb2FkTWFuaWZlc3QobmVlZFRvTG9hZCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFByZWxvYWRlcjsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBBc3NldHMgPSByZXF1aXJlKCcuL0Fzc2V0cy5qcycpO1xyXG52YXIgUHJlbG9hZGVyID0gcmVxdWlyZSgnLi9QcmVsb2FkZXIuanMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgQXNzZXRzICAgIDogQXNzZXRzLFxyXG4gICAgUHJlbG9hZGVyIDogUHJlbG9hZGVyXHJcbn07Il19
