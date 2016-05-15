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
            player.setState(GameObject.STATE.DEFAULT);
            player.health = player.maxHealth;
            player.solid = true;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvZ2FtZS9zcmMvZW50aXRpZXMvQnVsbGV0LmpzIiwiY2xpZW50L2dhbWUvc3JjL2VudGl0aWVzL0NsaWVudFBsYXllci5qcyIsImNsaWVudC9nYW1lL3NyYy9lbnRpdGllcy9GdWxsQmxvY2suanMiLCJjbGllbnQvZ2FtZS9zcmMvZW50aXRpZXMvSGFsZkJsb2NrLmpzIiwiY2xpZW50L2dhbWUvc3JjL2VudGl0aWVzL1BsYXllci5qcyIsImNsaWVudC9nYW1lL3NyYy9lbnRpdGllcy9pbmRleC5qcyIsImNsaWVudC9nYW1lL3NyYy9pbmRleC5qcyIsImNsaWVudC9nYW1lL3NyYy9sZXZlbHMvTGV2ZWwxLmpzIiwiY2xpZW50L2dhbWUvc3JjL2xldmVscy9pbmRleC5qcyIsImNsaWVudC9nYW1lL3NyYy9uZXR3b3JrL0NsaWVudC5qcyIsImNsaWVudC9nYW1lL3NyYy9uZXR3b3JrL0xvY2FsQ2xpZW50LmpzIiwiY2xpZW50L2dhbWUvc3JjL25ldHdvcmsvaW5kZXguanMiLCJjbGllbnQvZ2FtZS9zcmMvb3ZlcmxheXMvQ3JlYXRlUm9vbU92ZXJsYXkuanMiLCJjbGllbnQvZ2FtZS9zcmMvb3ZlcmxheXMvR2FtZU92ZXJPdmVybGF5LmpzIiwiY2xpZW50L2dhbWUvc3JjL292ZXJsYXlzL0xvYWRpbmdPdmVybGF5LmpzIiwiY2xpZW50L2dhbWUvc3JjL292ZXJsYXlzL0xvYmJ5T3ZlcmxheS5qcyIsImNsaWVudC9nYW1lL3NyYy9vdmVybGF5cy9PdmVybGF5LmpzIiwiY2xpZW50L2dhbWUvc3JjL292ZXJsYXlzL2luZGV4LmpzIiwiY2xpZW50L2dhbWUvc3JjL3NjZW5lcy9HYW1lT3ZlclNjZW5lLmpzIiwiY2xpZW50L2dhbWUvc3JjL3NjZW5lcy9HYW1lU2NlbmUuanMiLCJjbGllbnQvZ2FtZS9zcmMvc2NlbmVzL0dhbWVTdGFydFNjZW5lLmpzIiwiY2xpZW50L2dhbWUvc3JjL3NjZW5lcy9Mb2FkaW5nU2NlbmUuanMiLCJjbGllbnQvZ2FtZS9zcmMvc2NlbmVzL0xvYmJ5U2NlbmUuanMiLCJjbGllbnQvZ2FtZS9zcmMvc2NlbmVzL2luZGV4LmpzIiwiY2xpZW50L2dhbWUvc3JjL3V0aWwvQXNzZXRzLmpzIiwiY2xpZW50L2dhbWUvc3JjL3V0aWwvUHJlbG9hZGVyLmpzIiwiY2xpZW50L2dhbWUvc3JjL3V0aWwvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMWNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDektBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyk7XHJcbnZhciBBc3NldHMgPSB1dGlsLkFzc2V0cztcclxudmFyIEdhbWVPYmplY3QgPSB3ZmwuY29yZS5lbnRpdGllcy5HYW1lT2JqZWN0O1xyXG52YXIgUGh5c2ljc09iamVjdCA9IHdmbC5jb3JlLmVudGl0aWVzLlBoeXNpY3NPYmplY3Q7XHJcbnZhciBnZW9tID0gd2ZsLmdlb207XHJcblxyXG4vKipcclxuICogUHJvamVjdGlsZXMgY3JlYXRlZCBmcm9tIGEgU2hpcFxyXG4gKi9cclxudmFyIEJ1bGxldCA9IGZ1bmN0aW9uIChkYW1hZ2UsIGNyZWF0b3IpIHtcclxuICAgIGlmIChpc05hTihkYW1hZ2UpIHx8IGRhbWFnZSA8PSAwKSB7XHJcbiAgICAgICAgZGFtYWdlID0gMTtcclxuICAgIH1cclxuXHJcbiAgICBQaHlzaWNzT2JqZWN0LmNhbGwodGhpcyk7XHJcblxyXG4gICAgdGhpcy5jcmVhdG9yID0gY3JlYXRvcjtcclxuICAgIHRoaXMuY3VzdG9tRGF0YS50ZWFtID0gY3JlYXRvci5jdXN0b21EYXRhLnRlYW07XHJcbiAgICB0aGlzLmN1c3RvbURhdGEuaWdub3JlRnJpY3Rpb24gPSB0cnVlO1xyXG5cclxuICAgIC8vIENyZWF0ZSBkZWZhdWx0IHN0YXRlXHJcbiAgICB0aGlzLmdyYXBoaWMxID0gQXNzZXRzLmdldChBc3NldHMuV0VBS19CVUxMRVRfMSk7XHJcbiAgICB0aGlzLmdyYXBoaWMyID0gQXNzZXRzLmdldChBc3NldHMuV0VBS19CVUxMRVRfMik7XHJcbiAgICB0aGlzLmdyYXBoaWMzID0gQXNzZXRzLmdldChBc3NldHMuV0VBS19CVUxMRVRfMyk7XHJcbiAgICB0aGlzLmdyYXBoaWM0ID0gQXNzZXRzLmdldChBc3NldHMuV0VBS19CVUxMRVRfNCk7XHJcbiAgICB0aGlzLmRlZmF1bHRTdGF0ZSA9IHRoaXMuY3JlYXRlU3RhdGUoKTtcclxuICAgIHRoaXMuZGVmYXVsdFN0YXRlLmFkZEZyYW1lKFxyXG4gICAgICAgIHRoaXMuY3JlYXRlRnJhbWUodGhpcy5ncmFwaGljMSwgMilcclxuICAgICk7XHJcbiAgICB0aGlzLmRlZmF1bHRTdGF0ZS5hZGRGcmFtZShcclxuICAgICAgICB0aGlzLmNyZWF0ZUZyYW1lKHRoaXMuZ3JhcGhpYzIsIDIpXHJcbiAgICApO1xyXG4gICAgdGhpcy5kZWZhdWx0U3RhdGUuYWRkRnJhbWUoXHJcbiAgICAgICAgdGhpcy5jcmVhdGVGcmFtZSh0aGlzLmdyYXBoaWMzLCAyKVxyXG4gICAgKTtcclxuICAgIHRoaXMuZGVmYXVsdFN0YXRlLmFkZEZyYW1lKFxyXG4gICAgICAgIHRoaXMuY3JlYXRlRnJhbWUodGhpcy5ncmFwaGljNCwgMilcclxuICAgICk7XHJcbiAgICB0aGlzLmFkZFN0YXRlKEdhbWVPYmplY3QuU1RBVEUuREVGQVVMVCwgdGhpcy5kZWZhdWx0U3RhdGUpO1xyXG5cclxuICAgIHRoaXMuZGFtYWdlID0gZGFtYWdlO1xyXG4gICAgdGhpcy5hZ2UgPSAwO1xyXG4gICAgdGhpcy5saWZlVGltZSA9IEJ1bGxldC5ERUZBVUxUX01BWF9MSUZFX1RJTUU7XHJcbiAgICB0aGlzLm1heFNwZWVkID0gQnVsbGV0LkRFRkFVTFRfTUFYX1NQRUVEO1xyXG4gICAgdGhpcy5zb2xpZCA9IHRydWU7XHJcbn07XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKEJ1bGxldCwge1xyXG4gICAgREVGQVVMVF9NQVhfTElGRV9USU1FIDoge1xyXG4gICAgICAgIHZhbHVlIDogNDBcclxuICAgIH0sXHJcblxyXG4gICAgREVGQVVMVF9TUEVFRCA6IHtcclxuICAgICAgICB2YWx1ZSA6IDAuNjVcclxuICAgIH0sXHJcblxyXG4gICAgREVGQVVMVF9NQVhfU1BFRUQgOiB7XHJcbiAgICAgICAgdmFsdWUgOiAwLjhcclxuICAgIH1cclxufSk7XHJcbkJ1bGxldC5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoUGh5c2ljc09iamVjdC5wcm90b3R5cGUsIHtcclxuICAgIHVwZGF0ZSA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChkdCkge1xyXG4gICAgICAgICAgICBQaHlzaWNzT2JqZWN0LnByb3RvdHlwZS51cGRhdGUuY2FsbCh0aGlzLCBkdCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmFnZSsrO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuYWdlID49IHRoaXMubGlmZVRpbWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VzdG9tRGF0YS5yZW1vdmVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgcmVzb2x2ZUNvbGxpc2lvbiA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChwaHlzT2JqLCBjb2xsaXNpb25EYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciB0ZWFtID0gdGhpcy5jdXN0b21EYXRhLnRlYW07XHJcbiAgICAgICAgICAgIHZhciBvdGhlclRlYW0gPSBwaHlzT2JqLmN1c3RvbURhdGEudGVhbTtcclxuXHJcbiAgICAgICAgICAgIGlmIChwaHlzT2JqICE9PSB0aGlzLmNyZWF0b3IgJiYgcGh5c09iai5zb2xpZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXN0b21EYXRhLnJlbW92ZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIElmIGhpdHRpbmcgc29tZXRoaW5nIHRoYXQncyBvbiBhIHRlYW0gKHBsYXllciwgYnVsbGV0LFxyXG4gICAgICAgICAgICAgICAgLy8gZXRjKS4uLlxyXG4gICAgICAgICAgICAgICAgaWYgKG90aGVyVGVhbSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlIGJ1bGxldCBoaXRzIGEgcGxheWVyIG9uIGEgZGlmZmVyZW50IHRlYW0sIGRlYWxcclxuICAgICAgICAgICAgICAgICAgICAvLyBkYW1hZ2UgdG8gdGhlbVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvdGhlclRlYW0gIT09IHRlYW0gJiYgcGh5c09iai50YWtlRGFtYWdlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBoeXNPYmoudGFrZURhbWFnZSh0aGlzLmRhbWFnZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiBraWxsZWQgdGhlIHBsYXllciwgd2UnbGwgbWFrZSB0aGUgY2FtIGZvbGxvdyB0aGlzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGJ1bGxldCdzIGNyZWF0b3JcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBoeXNPYmouaGVhbHRoIDw9IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBoeXNPYmouY3VzdG9tRGF0YS5raWxsZXIgPSB0aGlzLmNyZWF0b3I7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKTtcclxuT2JqZWN0LmZyZWV6ZShCdWxsZXQpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCdWxsZXQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcclxudmFyIEFzc2V0cyA9IHV0aWwuQXNzZXRzO1xyXG52YXIgUGxheWVyID0gcmVxdWlyZSgnLi9QbGF5ZXInKTtcclxudmFyIExpdmluZ09iamVjdCA9IHdmbC5jb3JlLmVudGl0aWVzLkxpdmluZ09iamVjdDtcclxudmFyIGdlb20gPSB3ZmwuZ2VvbTtcclxuXHJcbnZhciBDbGllbnRQbGF5ZXIgPSBmdW5jdGlvbiAodGVhbSkge1xyXG4gICAgUGxheWVyLmNhbGwodGhpcywgdGVhbSk7XHJcbn07XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKENsaWVudFBsYXllciwge1xyXG4gICAgTUlOSU1BUF9GSUxMX1NUWUxFIDoge1xyXG4gICAgICAgIHZhbHVlIDogXCIjMDZjODMzXCJcclxuICAgIH1cclxufSk7XHJcbkNsaWVudFBsYXllci5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoUGxheWVyLnByb3RvdHlwZSwge1xyXG4gICAgdXBkYXRlIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGR0KSB7XHJcbiAgICAgICAgICAgIExpdmluZ09iamVjdC5wcm90b3R5cGUudXBkYXRlLmNhbGwodGhpcywgZHQpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcclxuICAgIGRyYXdPbk1pbmltYXAgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoY3R4KSB7XHJcbiAgICAgICAgICAgIHZhciB3ID0gdGhpcy5nZXRXaWR0aCgpO1xyXG4gICAgICAgICAgICB2YXIgaCA9IHRoaXMuZ2V0SGVpZ2h0KCk7XHJcbiAgICAgICAgICAgIHZhciBvZmZzZXRYID0gTWF0aC5yb3VuZCgtdyAqIDAuNSk7XHJcbiAgICAgICAgICAgIHZhciBvZmZzZXRZID0gTWF0aC5yb3VuZCgtaCAqIDAuNSk7XHJcbiAgICAgICAgICAgIHZhciBkaXNwbGF5V2lkdGggPSBNYXRoLnJvdW5kKHcpO1xyXG4gICAgICAgICAgICB2YXIgZGlzcGxheUhlaWdodCA9IE1hdGgucm91bmQoaCk7XHJcblxyXG4gICAgICAgICAgICBjdHguc2F2ZSgpO1xyXG5cclxuICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IENsaWVudFBsYXllci5NSU5JTUFQX0ZJTExfU1RZTEU7XHJcbiAgICAgICAgICAgIGN0eC5maWxsUmVjdChvZmZzZXRYLCBvZmZzZXRZLCBkaXNwbGF5V2lkdGgsIGRpc3BsYXlIZWlnaHQpO1xyXG5cclxuICAgICAgICAgICAgY3R4LnJlc3RvcmUoKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHNob290IDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKCkgeyB9XHJcbiAgICB9LFxyXG5cclxuICAgIGp1c3RTaG90IDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKCkgeyB9XHJcbiAgICB9XHJcbn0pKTtcclxuT2JqZWN0LmZyZWV6ZShDbGllbnRQbGF5ZXIpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDbGllbnRQbGF5ZXI7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcclxudmFyIEFzc2V0cyA9IHV0aWwuQXNzZXRzO1xyXG52YXIgR2FtZU9iamVjdCA9IHdmbC5jb3JlLmVudGl0aWVzLkdhbWVPYmplY3Q7XHJcbnZhciBQaHlzaWNzT2JqZWN0ID0gd2ZsLmNvcmUuZW50aXRpZXMuUGh5c2ljc09iamVjdDtcclxuXHJcbi8qKlxyXG4gKiBBIGZ1bGwtc2l6ZWQsIHF1YWRyaWxhdGVyYWwgYmxvY2tcclxuICovXHJcbnZhciBGdWxsQmxvY2sgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBQaHlzaWNzT2JqZWN0LmNhbGwodGhpcyk7XHJcblxyXG4gICAgdGhpcy5pZCA9IEZ1bGxCbG9jay5pZDtcclxuXHJcbiAgICAvLyBDcmVhdGUgZGVmYXVsdCBzdGF0ZVxyXG4gICAgdGhpcy5kZWZhdWx0R3JhcGhpYyA9IEFzc2V0cy5nZXQoQXNzZXRzLkJMT0NLX0ZVTEwpO1xyXG4gICAgdGhpcy5kZWZhdWx0U3RhdGUgPSB0aGlzLmNyZWF0ZVN0YXRlKCk7XHJcbiAgICB0aGlzLmRlZmF1bHRTdGF0ZS5hZGRGcmFtZShcclxuICAgICAgICB0aGlzLmNyZWF0ZUZyYW1lKHRoaXMuZGVmYXVsdEdyYXBoaWMpXHJcbiAgICApO1xyXG4gICAgdGhpcy5hZGRTdGF0ZShHYW1lT2JqZWN0LlNUQVRFLkRFRkFVTFQsIHRoaXMuZGVmYXVsdFN0YXRlKTtcclxuXHJcbiAgICB0aGlzLnNvbGlkID0gdHJ1ZTtcclxuICAgIHRoaXMuZml4ZWQgPSB0cnVlO1xyXG4gICAgdGhpcy5yb3RhdGUoLU1hdGguUEkgKiAwLjUpO1xyXG59O1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhGdWxsQmxvY2ssIHtcclxuICAgIG5hbWUgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBcIkZ1bGxCbG9ja1wiXHJcbiAgICB9LFxyXG5cclxuICAgIGlkIDoge1xyXG4gICAgICAgIHZhbHVlIDogMFxyXG4gICAgfVxyXG59KTtcclxuRnVsbEJsb2NrLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShQaHlzaWNzT2JqZWN0LnByb3RvdHlwZSwge1xyXG4gICAgZHJhd09uTWluaW1hcCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChjdHgpIHtcclxuICAgICAgICAgICAgdmFyIHcgPSB0aGlzLmdldFdpZHRoKCk7XHJcbiAgICAgICAgICAgIHZhciBoID0gdGhpcy5nZXRIZWlnaHQoKTtcclxuICAgICAgICAgICAgdmFyIG9mZnNldFggPSBNYXRoLnJvdW5kKC13ICogMC41KTtcclxuICAgICAgICAgICAgdmFyIG9mZnNldFkgPSBNYXRoLnJvdW5kKC1oICogMC41KTtcclxuICAgICAgICAgICAgdmFyIGRpc3BsYXlXaWR0aCA9IE1hdGgucm91bmQodyk7XHJcbiAgICAgICAgICAgIHZhciBkaXNwbGF5SGVpZ2h0ID0gTWF0aC5yb3VuZChoKTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5zYXZlKCk7XHJcblxyXG4gICAgICAgICAgICBjdHgucm90YXRlKHRoaXMuZ2V0Um90YXRpb24oKSk7XHJcblxyXG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICAgIGN0eC5yZWN0KG9mZnNldFgsIG9mZnNldFksIGRpc3BsYXlXaWR0aCwgZGlzcGxheUhlaWdodCk7XHJcbiAgICAgICAgICAgIGN0eC5maWxsKCk7XHJcbiAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5yZXN0b3JlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSk7XHJcbk9iamVjdC5mcmVlemUoRnVsbEJsb2NrKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRnVsbEJsb2NrOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyk7XHJcbnZhciBBc3NldHMgPSB1dGlsLkFzc2V0cztcclxudmFyIEdhbWVPYmplY3QgPSB3ZmwuY29yZS5lbnRpdGllcy5HYW1lT2JqZWN0O1xyXG52YXIgUGh5c2ljc09iamVjdCA9IHdmbC5jb3JlLmVudGl0aWVzLlBoeXNpY3NPYmplY3Q7XHJcbnZhciBnZW9tID0gd2ZsLmdlb207XHJcblxyXG4vKipcclxuICogQSBmdWxsLXNpemVkLCBxdWFkcmlsYXRlcmFsIGJsb2NrXHJcbiAqL1xyXG52YXIgSGFsZkJsb2NrID0gZnVuY3Rpb24gKCkge1xyXG4gICAgUGh5c2ljc09iamVjdC5jYWxsKHRoaXMpO1xyXG5cclxuICAgIHRoaXMuaWQgPSBIYWxmQmxvY2suaWQ7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGRlZmF1bHQgc3RhdGVcclxuICAgIHRoaXMuZGVmYXVsdEdyYXBoaWMgPSBBc3NldHMuZ2V0KEFzc2V0cy5CTE9DS19IQUxGKTtcclxuXHJcbiAgICB2YXIgdyA9IHRoaXMuZGVmYXVsdEdyYXBoaWMud2lkdGg7XHJcbiAgICB2YXIgaCA9IHRoaXMuZGVmYXVsdEdyYXBoaWMuaGVpZ2h0O1xyXG4gICAgdmFyIHZlcnRzID0gW1xyXG4gICAgICAgIG5ldyBnZW9tLlZlYzIoLXcgKiAwLjUsIC1oICogMC41KSxcclxuICAgICAgICBuZXcgZ2VvbS5WZWMyKHcgKiAwLjUsIC1oICogMC41KSxcclxuICAgICAgICBuZXcgZ2VvbS5WZWMyKC13ICogMC41LCBoICogMC41KVxyXG4gICAgXTtcclxuICAgIHZhciBmcmFtZU9iaiA9IHRoaXMuY3JlYXRlRnJhbWUodGhpcy5kZWZhdWx0R3JhcGhpYywgMSwgZmFsc2UpO1xyXG4gICAgZnJhbWVPYmoudmVydGljZXMgPSB2ZXJ0cztcclxuXHJcbiAgICB0aGlzLmRlZmF1bHRTdGF0ZSA9IHRoaXMuY3JlYXRlU3RhdGUoKTtcclxuICAgIHRoaXMuZGVmYXVsdFN0YXRlLmFkZEZyYW1lKGZyYW1lT2JqKTtcclxuICAgIHRoaXMuYWRkU3RhdGUoR2FtZU9iamVjdC5TVEFURS5ERUZBVUxULCB0aGlzLmRlZmF1bHRTdGF0ZSk7XHJcblxyXG4gICAgdGhpcy5zb2xpZCA9IHRydWU7XHJcbiAgICB0aGlzLmZpeGVkID0gdHJ1ZTtcclxuICAgIHRoaXMucm90YXRlKC1NYXRoLlBJICogMC41KTtcclxufTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoSGFsZkJsb2NrLCB7XHJcbiAgICBuYW1lIDoge1xyXG4gICAgICAgIHZhbHVlIDogXCJIYWxmQmxvY2tcIlxyXG4gICAgfSxcclxuXHJcbiAgICBpZCA6IHtcclxuICAgICAgICB2YWx1ZSA6IDBcclxuICAgIH1cclxufSk7XHJcbkhhbGZCbG9jay5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoUGh5c2ljc09iamVjdC5wcm90b3R5cGUsIHtcclxuICAgIGRyYXdPbk1pbmltYXAgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoY3R4KSB7XHJcbiAgICAgICAgICAgIHZhciB3ID0gdGhpcy5nZXRXaWR0aCgpO1xyXG4gICAgICAgICAgICB2YXIgaCA9IHRoaXMuZ2V0SGVpZ2h0KCk7XHJcbiAgICAgICAgICAgIHZhciBvZmZzZXRYID0gTWF0aC5yb3VuZCgtdyAqIDAuNSk7XHJcbiAgICAgICAgICAgIHZhciBvZmZzZXRZID0gTWF0aC5yb3VuZCgtaCAqIDAuNSk7XHJcblxyXG4gICAgICAgICAgICBjdHguc2F2ZSgpO1xyXG4gICAgICAgICAgICBjdHgucm90YXRlKHRoaXMuZ2V0Um90YXRpb24oKSk7XHJcbiAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSBhcHAuUGh5c2ljc09iamVjdC5NSU5JTUFQX0ZJTExfU1RZTEU7XHJcbiAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IGFwcC5QaHlzaWNzT2JqZWN0Lk1JTklNQVBfU1RST0tFX1NUWUxFO1xyXG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICAgIGN0eC5tb3ZlVG8ob2Zmc2V0WCwgb2Zmc2V0WSk7XHJcbiAgICAgICAgICAgIGN0eC5saW5lVG8oLW9mZnNldFgsIG9mZnNldFkpO1xyXG4gICAgICAgICAgICBjdHgubGluZVRvKG9mZnNldFgsIC1vZmZzZXRZKTtcclxuICAgICAgICAgICAgY3R4LmNsb3NlUGF0aCgpO1xyXG4gICAgICAgICAgICBjdHguZmlsbCgpO1xyXG4gICAgICAgICAgICBjdHguc3Ryb2tlKCk7XHJcblxyXG4gICAgICAgICAgICBjdHgucmVzdG9yZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkpO1xyXG5PYmplY3QuZnJlZXplKEhhbGZCbG9jayk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEhhbGZCbG9jazsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xyXG52YXIgQXNzZXRzID0gdXRpbC5Bc3NldHM7XHJcbnZhciBOZXR3b3JrID0gcmVxdWlyZSgnLi4vbmV0d29yaycpO1xyXG52YXIgR2FtZU9iamVjdCA9IHdmbC5jb3JlLmVudGl0aWVzLkdhbWVPYmplY3Q7XHJcbnZhciBMaXZpbmdPYmplY3QgPSB3ZmwuY29yZS5lbnRpdGllcy5MaXZpbmdPYmplY3Q7XHJcbnZhciBnZW9tID0gd2ZsLmdlb207XHJcblxyXG52YXIgUGxheWVyID0gZnVuY3Rpb24gKHRlYW0pIHtcclxuICAgIExpdmluZ09iamVjdC5jYWxsKHRoaXMpO1xyXG5cclxuICAgIHRoaXMuY3VzdG9tRGF0YS50ZWFtID0gdGVhbTtcclxuXHJcbiAgICB2YXIgc2hpcFR5cGU7XHJcbiAgICBpZiAodGVhbSA9PT0gMCkge1xyXG4gICAgICAgIHNoaXBUeXBlID0gQXNzZXRzLlNISVBfMTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc2hpcFR5cGUgPSBBc3NldHMuU0hJUF8yO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENyZWF0ZSBkZWZhdWx0IHN0YXRlXHJcbiAgICB0aGlzLmRlZmF1bHRHcmFwaGljID0gQXNzZXRzLmdldChzaGlwVHlwZSk7XHJcblxyXG4gICAgdmFyIHcgPSB0aGlzLmRlZmF1bHRHcmFwaGljLndpZHRoO1xyXG4gICAgdmFyIGggPSB0aGlzLmRlZmF1bHRHcmFwaGljLmhlaWdodDtcclxuICAgIHZhciB2ZXJ0cyA9IFtcclxuICAgICAgICBuZXcgZ2VvbS5WZWMyKC13ICogMC41LCAtaCAqIDAuNSksXHJcbiAgICAgICAgbmV3IGdlb20uVmVjMih3ICogMC41LCAwKSxcclxuICAgICAgICBuZXcgZ2VvbS5WZWMyKC13ICogMC41LCBoICogMC41KVxyXG4gICAgXTtcclxuICAgIHZhciBmcmFtZU9iaiA9IHRoaXMuY3JlYXRlRnJhbWUodGhpcy5kZWZhdWx0R3JhcGhpYywgMSwgZmFsc2UpO1xyXG4gICAgZnJhbWVPYmoudmVydGljZXMgPSB2ZXJ0cztcclxuXHJcbiAgICB0aGlzLmRlZmF1bHRTdGF0ZSA9IHRoaXMuY3JlYXRlU3RhdGUoKTtcclxuICAgIHRoaXMuZGVmYXVsdFN0YXRlLmFkZEZyYW1lKGZyYW1lT2JqKTtcclxuICAgIHRoaXMuYWRkU3RhdGUoR2FtZU9iamVjdC5TVEFURS5ERUZBVUxULCB0aGlzLmRlZmF1bHRTdGF0ZSk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGV4cGxvc2lvbiBzdGF0ZVxyXG5cclxuICAgIGlmICh0ZWFtID09PSAwKSB7XHJcbiAgICAgICAgdGhpcy5leHBsb3Npb25HcmFwaGljMSA9IEFzc2V0cy5nZXQoQXNzZXRzLkVYUExPU0lPTl9BXzEpO1xyXG4gICAgICAgIHRoaXMuZXhwbG9zaW9uR3JhcGhpYzIgPSBBc3NldHMuZ2V0KEFzc2V0cy5FWFBMT1NJT05fQV8yKTtcclxuICAgICAgICB0aGlzLmV4cGxvc2lvbkdyYXBoaWMzID0gQXNzZXRzLmdldChBc3NldHMuRVhQTE9TSU9OX0FfMyk7XHJcbiAgICAgICAgdGhpcy5leHBsb3Npb25HcmFwaGljNCA9IEFzc2V0cy5nZXQoQXNzZXRzLkVYUExPU0lPTl9FTkQpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmV4cGxvc2lvbkdyYXBoaWMxID0gQXNzZXRzLmdldChBc3NldHMuRVhQTE9TSU9OX0JfMSk7XHJcbiAgICAgICAgdGhpcy5leHBsb3Npb25HcmFwaGljMiA9IEFzc2V0cy5nZXQoQXNzZXRzLkVYUExPU0lPTl9CXzIpO1xyXG4gICAgICAgIHRoaXMuZXhwbG9zaW9uR3JhcGhpYzMgPSBBc3NldHMuZ2V0KEFzc2V0cy5FWFBMT1NJT05fQl8zKTtcclxuICAgICAgICB0aGlzLmV4cGxvc2lvbkdyYXBoaWM0ID0gQXNzZXRzLmdldChBc3NldHMuRVhQTE9TSU9OX0VORCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5leHBsb3Npb25TdGF0ZSA9IHRoaXMuY3JlYXRlU3RhdGUoKTtcclxuXHJcbiAgICB0aGlzLmV4cGxvc2lvblN0YXRlLmFkZEZyYW1lKHRoaXMuY3JlYXRlRnJhbWUodGhpcy5leHBsb3Npb25HcmFwaGljMSwgMikpO1xyXG4gICAgdGhpcy5leHBsb3Npb25TdGF0ZS5hZGRGcmFtZSh0aGlzLmNyZWF0ZUZyYW1lKHRoaXMuZXhwbG9zaW9uR3JhcGhpYzIsIDIpKTtcclxuICAgIHRoaXMuZXhwbG9zaW9uU3RhdGUuYWRkRnJhbWUodGhpcy5jcmVhdGVGcmFtZSh0aGlzLmV4cGxvc2lvbkdyYXBoaWMzLCAyKSk7XHJcbiAgICB0aGlzLmV4cGxvc2lvblN0YXRlLmFkZEZyYW1lKHRoaXMuY3JlYXRlRnJhbWUodGhpcy5leHBsb3Npb25HcmFwaGljNCwgSW5maW5pdHkpKTtcclxuICAgIHRoaXMuYWRkU3RhdGUoUGxheWVyLlNUQVRFLkVYUExPU0lPTiwgdGhpcy5leHBsb3Npb25TdGF0ZSk7XHJcblxyXG4gICAgdGhpcy5zaG9vdFRpbWVyID0gMDtcclxuICAgIHRoaXMubWF4U2hvb3RUaW1lciA9IFBsYXllci5ERUZBVUxUX01BWF9TSE9PVF9USU1FUjtcclxuXHJcbiAgICB0aGlzLmhlYWx0aCA9IE5ldHdvcmsubG9jYWxDbGllbnQuZGF0YS5oZWFsdGg7XHJcbiAgICB0aGlzLm1heEhlYWx0aCA9IE5ldHdvcmsubG9jYWxDbGllbnQuZGF0YS5oZWFsdGg7XHJcblxyXG4gICAgdGhpcy5yb3RhdGUoLU1hdGguUEkgKiAwLjUpO1xyXG59O1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhQbGF5ZXIsIHtcclxuICAgIFRVUk5fU1BFRUQgOiB7XHJcbiAgICAgICAgdmFsdWUgOiAwLjA1XHJcbiAgICB9LFxyXG5cclxuICAgIEJSQUtFX1JBVEUgOiB7XHJcbiAgICAgICAgdmFsdWUgOiAwLjk1XHJcbiAgICB9LFxyXG5cclxuICAgIEJPT1NUX0FDQ0VMRVJBVElPTiA6IHtcclxuICAgICAgICB2YWx1ZSA6IDAuMDAwMlxyXG4gICAgfSxcclxuXHJcbiAgICBQT1NJVElPTl9VUERBVEVfRElTVEFOQ0UgOiB7XHJcbiAgICAgICAgdmFsdWUgOiAwLjVcclxuICAgIH0sXHJcblxyXG4gICAgTUlOSU1BUF9GSUxMX1NUWUxFIDoge1xyXG4gICAgICAgIHZhbHVlIDogXCIjODZjOGQzXCJcclxuICAgIH0sXHJcblxyXG4gICAgREVGQVVMVF9NQVhfU0hPT1RfVElNRVIgOiB7XHJcbiAgICAgICAgdmFsdWUgOiAyMFxyXG4gICAgfSxcclxuXHJcbiAgICBTVEFURSA6IHtcclxuICAgICAgICB2YWx1ZSA6IHtcclxuICAgICAgICAgICAgRVhQTE9TSU9OIDogXCJleHBsb3Npb25cIlxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcblBsYXllci5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoTGl2aW5nT2JqZWN0LnByb3RvdHlwZSwge1xyXG4gICAgdXBkYXRlIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGR0KSB7XHJcbiAgICAgICAgICAgIExpdmluZ09iamVjdC5wcm90b3R5cGUudXBkYXRlLmNhbGwodGhpcywgZHQpO1xyXG5cclxuICAgICAgICAgICAgLy8gVXBkYXRlIHNob290IHRpbWVyIHdoZW4ganVzdCBzaG90XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmp1c3RTaG90KCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvb3RUaW1lcisrO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNob290VGltZXIgPj0gdGhpcy5tYXhTaG9vdFRpbWVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG9vdFRpbWVyID0gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gSWYgdGhlIHBsYXllciBpcyBjb25uZWN0ZWQgdG8gdGhlIG5ldHdvcmssIHNlbmQgb3V0IHVwZGF0ZXMgdG9cclxuICAgICAgICAgICAgLy8gb3RoZXIgcGxheWVycyB3aGVuIG5lY2Vzc2FyeVxyXG4gICAgICAgICAgICBpZiAoTmV0d29yay5jb25uZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgIE5ldHdvcmsuc29ja2V0LmVtaXQoJ3VwZGF0ZU90aGVyJywge1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uICAgICA6IHRoaXMucG9zaXRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgdmVsb2NpdHkgICAgIDogdGhpcy52ZWxvY2l0eSxcclxuICAgICAgICAgICAgICAgICAgICBhY2NlbGVyYXRpb24gOiB0aGlzLmFjY2VsZXJhdGlvbixcclxuICAgICAgICAgICAgICAgICAgICByb3RhdGlvbiAgICAgOiB0aGlzLmdldFJvdGF0aW9uKClcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBkcmF3T25NaW5pbWFwIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGN0eCkge1xyXG4gICAgICAgICAgICB2YXIgdyA9IHRoaXMuZ2V0V2lkdGgoKTtcclxuICAgICAgICAgICAgdmFyIGggPSB0aGlzLmdldEhlaWdodCgpO1xyXG4gICAgICAgICAgICB2YXIgb2Zmc2V0WCA9IE1hdGgucm91bmQoLXcgKiAwLjUpO1xyXG4gICAgICAgICAgICB2YXIgb2Zmc2V0WSA9IE1hdGgucm91bmQoLWggKiAwLjUpO1xyXG4gICAgICAgICAgICB2YXIgZGlzcGxheVdpZHRoID0gTWF0aC5yb3VuZCh3KTtcclxuICAgICAgICAgICAgdmFyIGRpc3BsYXlIZWlnaHQgPSBNYXRoLnJvdW5kKGgpO1xyXG5cclxuICAgICAgICAgICAgY3R4LnNhdmUoKTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSBQbGF5ZXIuTUlOSU1BUF9GSUxMX1NUWUxFO1xyXG4gICAgICAgICAgICBjdHguZmlsbFJlY3Qob2Zmc2V0WCwgb2Zmc2V0WSwgZGlzcGxheVdpZHRoLCBkaXNwbGF5SGVpZ2h0KTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5yZXN0b3JlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBzaG9vdCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmp1c3RTaG90KCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvb3RUaW1lciA9IDE7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKE5ldHdvcmsuY29ubmVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgTmV0d29yay5zb2NrZXQuZW1pdCgnYnVsbGV0Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbiAgICAgOiB0aGlzLnBvc2l0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZWxvY2l0eSAgICAgOiB0aGlzLnZlbG9jaXR5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhY2NlbGVyYXRpb24gOiB0aGlzLmFjY2VsZXJhdGlvbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgcm90YXRpb24gICAgIDogdGhpcy5nZXRSb3RhdGlvbigpXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGp1c3RTaG90IDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gKHRoaXMuc2hvb3RUaW1lciA+IDApO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgcmVzb2x2ZUNvbGxpc2lvbiA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChwaHlzT2JqLCBjb2xsaXNpb25EYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciB0ZWFtID0gdGhpcy5jdXN0b21EYXRhLnRlYW07XHJcbiAgICAgICAgICAgIHZhciBvdGhlclRlYW0gPSBwaHlzT2JqLmN1c3RvbURhdGEudGVhbTtcclxuXHJcbiAgICAgICAgICAgIC8vIElmIGhpdHRpbmcgc29tZXRoaW5nIHRoYXQncyBub3Qgb24gdGhpcyB0ZWFtXHJcbiAgICAgICAgICAgIGlmIChvdGhlclRlYW0gPT09IHVuZGVmaW5lZCB8fCBvdGhlclRlYW0gIT09IHRlYW0gfHwgcGh5c09iai50YWtlRGFtYWdlKSB7XHJcbiAgICAgICAgICAgICAgICBMaXZpbmdPYmplY3QucHJvdG90eXBlLnJlc29sdmVDb2xsaXNpb24uY2FsbCh0aGlzLCBwaHlzT2JqLCBjb2xsaXNpb25EYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkpO1xyXG5PYmplY3QuZnJlZXplKFBsYXllcik7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllcjsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBGdWxsQmxvY2sgPSByZXF1aXJlKCcuL0Z1bGxCbG9jay5qcycpO1xyXG52YXIgSGFsZkJsb2NrID0gcmVxdWlyZSgnLi9IYWxmQmxvY2suanMnKTtcclxudmFyIFBsYXllciA9IHJlcXVpcmUoJy4vUGxheWVyLmpzJyk7XHJcbnZhciBDbGllbnRQbGF5ZXIgPSByZXF1aXJlKCcuL0NsaWVudFBsYXllci5qcycpO1xyXG52YXIgQnVsbGV0ID0gcmVxdWlyZSgnLi9CdWxsZXQuanMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgRnVsbEJsb2NrICAgIDogRnVsbEJsb2NrLFxyXG4gICAgSGFsZkJsb2NrICAgIDogSGFsZkJsb2NrLFxyXG4gICAgUGxheWVyICAgICAgIDogUGxheWVyLFxyXG4gICAgQ2xpZW50UGxheWVyIDogQ2xpZW50UGxheWVyLFxyXG4gICAgQnVsbGV0ICAgICAgIDogQnVsbGV0XHJcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgTmV0d29yayA9IHJlcXVpcmUoJy4vbmV0d29yaycpO1xyXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xyXG52YXIgQXNzZXRzID0gdXRpbC5Bc3NldHM7XHJcbnZhciBzY2VuZXMgPSByZXF1aXJlKCcuL3NjZW5lcycpO1xyXG52YXIgb3ZlcmxheXMgPSByZXF1aXJlKCcuL292ZXJsYXlzJyk7XHJcblxyXG4vLyBDcmVhdGUgZ2FtZVxyXG52YXIgY2FudmFzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNnYW1lLWNhbnZhc1wiKTtcclxudmFyIGdhbWUgICA9IHdmbC5jcmVhdGUoY2FudmFzKTtcclxuXHJcbnZhciBsb2FkaW5nU2NlbmUgPSBuZXcgc2NlbmVzLkxvYWRpbmdTY2VuZShjYW52YXMpO1xyXG5nYW1lLnNldFNjZW5lKGxvYWRpbmdTY2VuZSk7XHJcblxyXG4vLyBTdG9wIHRoZSBnYW1lIHNvIHRoYXQgY2FudmFzIHVwZGF0ZXMgZG9uJ3QgYWZmZWN0IHBlcmZvcm1hbmNlIHdpdGhcclxuLy8gb3ZlcmxheXNcclxuZ2FtZS5zdG9wKCk7XHJcblxyXG4vLyBEcmF3IGluaXRpYWwgYmxhY2sgQkcgb24gY2FudmFzXHJcbnZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG5jdHguZmlsbFN0eWxlID0gXCIjMDQwQjBDXCI7XHJcbmN0eC5maWxsUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xyXG5cclxudmFyIG9uTG9hZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICQoTmV0d29yaykub24oXHJcbiAgICAgICAgTmV0d29yay5FdmVudC5DT05ORUNULFxyXG4gICAgICAgIG9uTmV0d29ya0Nvbm5lY3RcclxuICAgICk7XHJcblxyXG4gICAgTmV0d29yay5pbml0KCk7XHJcbn07XHJcblxyXG52YXIgZ29Ub0dhbWUgPSBmdW5jdGlvbiAocm9vbSkge1xyXG4gICAgLy8gVXBkYXRlIHRoZSBnYW1lIHdpdGggdGhlIGN1cnJlbnQgdGltZSBiZWNhdXNlIHRoZSBkdCB3aWxsIGJlIGh1Z2UgbmV4dFxyXG4gICAgLy8gdXBkYXRlIHNpbmNlIHRoZSBnYW1lIHdhcyBzdG9wcGVkIHdoaWxlIGluIHRoZSBsb2JieVxyXG4gICAgZ2FtZS51cGRhdGUoRGF0ZS5ub3coKSk7XHJcblxyXG4gICAgJChnYW1lLmdldFNjZW5lKCkpLm9mZigpO1xyXG5cclxuICAgIHZhciBnYW1lU2NlbmUgPSBuZXcgc2NlbmVzLkdhbWVTY2VuZShjYW52YXMsIHJvb20pO1xyXG4gICAgZ2FtZS5zZXRTY2VuZShnYW1lU2NlbmUpO1xyXG5cclxuICAgICQoTmV0d29yaykub24oXHJcbiAgICAgICAgTmV0d29yay5FdmVudC5FTkRfR0FNRSxcclxuICAgICAgICBvbkVuZEdhbWVcclxuICAgICk7XHJcblxyXG4gICAgLy8gSWYgdGhlIHBsYXllciByZWNlaXZlcyBkYXRhIGZvciBnYW1lIG92ZXIgYmVmb3JlIHRoZXkgYWN0dWFsbHkgbG9hZCB0aGVcclxuICAgIC8vIGdhdmUgb3ZlciBzY3JlZW4sIHNraXAgaW1tZWRpYXRlbHkgdG8gdGhlIGdhbWUgb3ZlciBzY3JlZW4gKGJlY2F1c2Ugb25seVxyXG4gICAgLy8gdGhlIGhvc3Qgd291bGQgc2VuZCB0aGF0IGRhdGEpXHJcbiAgICAkKE5ldHdvcmspLm9uKFxyXG4gICAgICAgIE5ldHdvcmsuRXZlbnQuR0FNRV9PVkVSX0RBVEEsXHJcbiAgICAgICAgcm9vbSxcclxuICAgICAgICBvbkdldEdhbWVPdmVyRGF0YVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBTdGFydCB0aGUgZ2FtZSBzaW5jZSBpdCB3YXMgc3RvcHBlZCB0byBoZWxwIHBlcmZvcm1hbmNlIHdpdGggb3ZlcmxheXMgb25cclxuICAgIC8vIGEgY2FudmFzXHJcbiAgICBnYW1lLnN0YXJ0KCk7XHJcbn07XHJcblxyXG52YXIgZ29Ub0dhbWVTdGFydCA9IGZ1bmN0aW9uIChyb29tKSB7XHJcbiAgICAvLyBTdG9wIHRoZSBnYW1lIHNvIHRoYXQgY2FudmFzIHVwZGF0ZXMgZG9uJ3QgYWZmZWN0IHBlcmZvcm1hbmNlIHdpdGhcclxuICAgIC8vIG92ZXJsYXlzXHJcbiAgICBnYW1lLnN0b3AoKTtcclxuXHJcbiAgICAvLyBSZXNldCBhbGwgbGlzdGVuZXJzIG9uIHRoZSBOZXR3b3JrXHJcbiAgICAkKE5ldHdvcmspLm9mZigpO1xyXG5cclxuICAgIHZhciBnYW1lU3RhcnRTY2VuZSA9IG5ldyBzY2VuZXMuR2FtZVN0YXJ0U2NlbmUoY2FudmFzLCByb29tKTtcclxuICAgIGdhbWUuc2V0U2NlbmUoZ2FtZVN0YXJ0U2NlbmUpO1xyXG5cclxuICAgICQoZ2FtZVN0YXJ0U2NlbmUpLm9uKFxyXG4gICAgICAgIHNjZW5lcy5HYW1lU3RhcnRTY2VuZS5FdmVudC5TVEFSVF9HQU1FLFxyXG4gICAgICAgIG9uR2FtZVN0YXJ0VG9HYW1lXHJcbiAgICApO1xyXG59O1xyXG5cclxudmFyIGdvVG9Mb2JieSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIC8vIERyYXcgYmxhY2sgb3ZlciB0aGUgY2FudmFzXHJcbiAgICBjdHguZmlsbFN0eWxlID0gXCIjMDQwQjBDXCI7XHJcbiAgICBjdHguZmlsbFJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcclxuXHJcbiAgICAvLyBTdG9wIHRoZSBnYW1lIHNvIHRoYXQgY2FudmFzIHVwZGF0ZXMgZG9uJ3QgYWZmZWN0IHBlcmZvcm1hbmNlIHdpdGhcclxuICAgIC8vIG92ZXJsYXlzXHJcbiAgICBnYW1lLnN0b3AoKTtcclxuXHJcbiAgICAkKGdhbWUuZ2V0U2NlbmUoKSkub2ZmKCk7XHJcblxyXG4gICAgLy8gUmVzZXQgYWxsIGxpc3RlbmVycyBvbiB0aGUgTmV0d29ya1xyXG4gICAgJChOZXR3b3JrKS5vZmYoKTtcclxuXHJcbiAgICB2YXIgbG9iYnlTY2VuZSA9IG5ldyBzY2VuZXMuTG9iYnlTY2VuZShjYW52YXMpO1xyXG4gICAgZ2FtZS5zZXRTY2VuZShsb2JieVNjZW5lKTtcclxuXHJcbiAgICAkKE5ldHdvcmspLm9uKFxyXG4gICAgICAgIE5ldHdvcmsuRXZlbnQuU1RBUlRfR0FNRSxcclxuICAgICAgICBvblN0YXJ0R2FtZVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBUcmFuc2l0aW9uIHRoZSBwYWdlJ3MgQkcgY29sb3IgdG8gYmxhY2sgdG8gaGlkZSB0aGUgQkcgaW1hZ2Ugd2hpY2hcclxuICAgIC8vIGJlY29tZXMgZGlzdHJhY3RpbmcgZHVyaW5nIGdhbWUgcGxheVxyXG4gICAgJChcImJvZHlcIikuY3NzKHtcImJhY2tncm91bmQtY29sb3JcIjogXCIjMDcxMjEzXCJ9KTtcclxufTtcclxuXHJcbnZhciBnb1RvR2FtZU92ZXIgPSBmdW5jdGlvbiAocm9vbSkge1xyXG4gICAgLy8gU3RvcCB0aGUgZ2FtZSBzbyB0aGF0IGNhbnZhcyB1cGRhdGVzIGRvbid0IGFmZmVjdCBwZXJmb3JtYW5jZSB3aXRoXHJcbiAgICAvLyBvdmVybGF5c1xyXG4gICAgZ2FtZS5zdG9wKCk7XHJcblxyXG4gICAgLy8gUmVzZXQgYWxsIGxpc3RlbmVycyBvbiB0aGUgTmV0d29ya1xyXG4gICAgJChOZXR3b3JrKS5vZmYoKTtcclxuXHJcbiAgICB2YXIgZ2FtZU92ZXJTY2VuZSA9IG5ldyBzY2VuZXMuR2FtZU92ZXJTY2VuZShjYW52YXMsIHJvb20pO1xyXG4gICAgZ2FtZS5zZXRTY2VuZShnYW1lT3ZlclNjZW5lKTtcclxuXHJcbiAgICAkKGdhbWVPdmVyU2NlbmUpLm9uKFxyXG4gICAgICAgIHNjZW5lcy5HYW1lT3ZlclNjZW5lLkV2ZW50LlJFVFVSTl9UT19MT0JCWSxcclxuICAgICAgICBvbkdhbWVPdmVyVG9Mb2JieVxyXG4gICAgKTtcclxufTtcclxuXHJcbnZhciBvblN0YXJ0R2FtZSA9IGZ1bmN0aW9uIChlLCByb29tKSB7XHJcbiAgICBnb1RvR2FtZVN0YXJ0KHJvb20pO1xyXG59O1xyXG5cclxudmFyIG9uRW5kR2FtZSA9IGZ1bmN0aW9uIChlLCByb29tKSB7XHJcbiAgICBnb1RvR2FtZU92ZXIocm9vbSk7XHJcbn07XHJcblxyXG52YXIgb25HYW1lU3RhcnRUb0dhbWUgPSBmdW5jdGlvbiAoZSwgcm9vbSkge1xyXG4gICAgZ29Ub0dhbWUocm9vbSk7XHJcbn07XHJcblxyXG52YXIgb25HZXRHYW1lT3ZlckRhdGEgPSBmdW5jdGlvbiAoZSwgZ2FtZU92ZXJEYXRhKSB7XHJcbiAgICBnb1RvR2FtZU92ZXIoZS5kYXRhKTtcclxuICAgIGdhbWUuZ2V0U2NlbmUoKS5fb25VcGRhdGVTY29yZShnYW1lT3ZlckRhdGEpO1xyXG59O1xyXG5cclxudmFyIG9uR2FtZU92ZXJUb0xvYmJ5ID0gZnVuY3Rpb24gKGUsIHJvb20pIHtcclxuICAgIGdvVG9Mb2JieSgpO1xyXG5cclxuICAgIC8vIFRyaWdnZXIgYW4gZXZlbnQgc28gdGhlIGxvYmJ5IHNjZW5lIGtub3dzIHRvIGpvaW4gdGhlIHJvb20gaXQgd2FzIGp1c3RcclxuICAgIC8vIGluIGJlZm9yZSBwbGF5aW5nIHRoZSBnYW1lXHJcbiAgICBOZXR3b3JrLl9vbkVudGVyUm9vbVN1Y2Nlc3Mocm9vbSk7XHJcbn07XHJcblxyXG52YXIgb25OZXR3b3JrQ29ubmVjdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIGdvVG9Mb2JieSgpO1xyXG59O1xyXG5cclxudmFyIFByZWxvYWRlciA9IG5ldyB1dGlsLlByZWxvYWRlcihvbkxvYWQuYmluZCh0aGlzKSk7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgZW50aXRpZXMgPSByZXF1aXJlKCcuLi9lbnRpdGllcycpO1xyXG52YXIgRnVsbEJvY2sgPSBlbnRpdGllcy5GdWxsQmxvY2s7XHJcbnZhciBIYWxmQmxvY2sgPSBlbnRpdGllcy5IYWxmQmxvY2s7XHJcblxyXG52YXIgTGV2ZWwxID0gZnVuY3Rpb24gKHNjZW5lKSB7XHJcbiAgICB2YXIgYmxvY2tTaXplID0gMTI4O1xyXG5cclxuICAgIC8vIExpbmUgdGhlIHRvcFxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxNjsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG5ld0Jsb2NrID0gbmV3IEZ1bGxCb2NrKCk7XHJcbiAgICAgICAgbmV3QmxvY2sucG9zaXRpb24ueCA9IGJsb2NrU2l6ZSAqIGk7XHJcbiAgICAgICAgbmV3QmxvY2sucG9zaXRpb24ueSA9IDA7XHJcblxyXG4gICAgICAgIHNjZW5lLmFkZEdhbWVPYmplY3QobmV3QmxvY2spO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIExpbmUgdGhlIGJvdHRvbVxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxNjsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG5ld0Jsb2NrID0gbmV3IEZ1bGxCb2NrKCk7XHJcbiAgICAgICAgbmV3QmxvY2sucG9zaXRpb24ueCA9IGJsb2NrU2l6ZSAqIGk7XHJcbiAgICAgICAgbmV3QmxvY2sucG9zaXRpb24ueSA9IGJsb2NrU2l6ZSAqIDEwO1xyXG5cclxuICAgICAgICBzY2VuZS5hZGRHYW1lT2JqZWN0KG5ld0Jsb2NrKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBMaW5lIHRoZSBsZWZ0XHJcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IDEwOyBpKyspIHtcclxuICAgICAgICB2YXIgbmV3QmxvY2sgPSBuZXcgRnVsbEJvY2soKTtcclxuICAgICAgICBuZXdCbG9jay5wb3NpdGlvbi54ID0gMDtcclxuICAgICAgICBuZXdCbG9jay5wb3NpdGlvbi55ID0gYmxvY2tTaXplICogaTtcclxuXHJcbiAgICAgICAgc2NlbmUuYWRkR2FtZU9iamVjdChuZXdCbG9jayk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTGluZSB0aGUgcmlnaHRcclxuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgMTA7IGkrKykge1xyXG4gICAgICAgIHZhciBuZXdCbG9jayA9IG5ldyBGdWxsQm9jaygpO1xyXG4gICAgICAgIG5ld0Jsb2NrLnBvc2l0aW9uLnggPSBibG9ja1NpemUgKiAxNTtcclxuICAgICAgICBuZXdCbG9jay5wb3NpdGlvbi55ID0gYmxvY2tTaXplICogaTtcclxuXHJcbiAgICAgICAgc2NlbmUuYWRkR2FtZU9iamVjdChuZXdCbG9jayk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIG9iajtcclxuICAgIFxyXG4gICAgb2JqID0gbmV3IEZ1bGxCb2NrKCk7XHJcbiAgICBvYmoucG9zaXRpb24ueCA9IGJsb2NrU2l6ZSAqIDM7XHJcbiAgICBvYmoucG9zaXRpb24ueSA9IGJsb2NrU2l6ZSAqIDM7XHJcbiAgICBzY2VuZS5hZGRHYW1lT2JqZWN0KG9iaik7XHJcbiAgICBcclxuICAgIG9iaiA9IG5ldyBGdWxsQm9jaygpO1xyXG4gICAgb2JqLnBvc2l0aW9uLnggPSBibG9ja1NpemUgKiA0O1xyXG4gICAgb2JqLnBvc2l0aW9uLnkgPSBibG9ja1NpemUgKiA0O1xyXG4gICAgc2NlbmUuYWRkR2FtZU9iamVjdChvYmopO1xyXG4gICAgXHJcbiAgICBvYmogPSBuZXcgRnVsbEJvY2soKTtcclxuICAgIG9iai5wb3NpdGlvbi54ID0gYmxvY2tTaXplICogNztcclxuICAgIG9iai5wb3NpdGlvbi55ID0gYmxvY2tTaXplICogNDtcclxuICAgIHNjZW5lLmFkZEdhbWVPYmplY3Qob2JqKTtcclxuICAgIFxyXG4gICAgb2JqID0gbmV3IEZ1bGxCb2NrKCk7XHJcbiAgICBvYmoucG9zaXRpb24ueCA9IGJsb2NrU2l6ZSAqIDg7XHJcbiAgICBvYmoucG9zaXRpb24ueSA9IGJsb2NrU2l6ZSAqIDY7XHJcbiAgICBzY2VuZS5hZGRHYW1lT2JqZWN0KG9iaik7XHJcbiAgICBcclxuICAgIG9iaiA9IG5ldyBGdWxsQm9jaygpO1xyXG4gICAgb2JqLnBvc2l0aW9uLnggPSBibG9ja1NpemUgKiAxMTtcclxuICAgIG9iai5wb3NpdGlvbi55ID0gYmxvY2tTaXplICogNjtcclxuICAgIHNjZW5lLmFkZEdhbWVPYmplY3Qob2JqKTtcclxuICAgIFxyXG4gICAgb2JqID0gbmV3IEZ1bGxCb2NrKCk7XHJcbiAgICBvYmoucG9zaXRpb24ueCA9IGJsb2NrU2l6ZSAqIDEyO1xyXG4gICAgb2JqLnBvc2l0aW9uLnkgPSBibG9ja1NpemUgKiA3O1xyXG4gICAgc2NlbmUuYWRkR2FtZU9iamVjdChvYmopO1xyXG5cclxuICAgIG9iaiA9IG5ldyBIYWxmQmxvY2soKTtcclxuICAgIG9iai5wb3NpdGlvbi54ID0gYmxvY2tTaXplICogMTtcclxuICAgIG9iai5wb3NpdGlvbi55ID0gYmxvY2tTaXplICogNjtcclxuICAgIHNjZW5lLmFkZEdhbWVPYmplY3Qob2JqKTtcclxuXHJcbiAgICBvYmogPSBuZXcgSGFsZkJsb2NrKCk7XHJcbiAgICBvYmoucG9zaXRpb24ueCA9IGJsb2NrU2l6ZSAqIDQ7XHJcbiAgICBvYmoucG9zaXRpb24ueSA9IGJsb2NrU2l6ZSAqIDM7XHJcbiAgICBzY2VuZS5hZGRHYW1lT2JqZWN0KG9iaik7XHJcblxyXG4gICAgb2JqID0gbmV3IEhhbGZCbG9jaygpO1xyXG4gICAgb2JqLnBvc2l0aW9uLnggPSBibG9ja1NpemUgKiA0O1xyXG4gICAgb2JqLnBvc2l0aW9uLnkgPSBibG9ja1NpemUgKiA5O1xyXG4gICAgc2NlbmUuYWRkR2FtZU9iamVjdChvYmopO1xyXG5cclxuICAgIG9iaiA9IG5ldyBIYWxmQmxvY2soKTtcclxuICAgIG9iai5wb3NpdGlvbi54ID0gYmxvY2tTaXplICogODtcclxuICAgIG9iai5wb3NpdGlvbi55ID0gYmxvY2tTaXplICogNTtcclxuICAgIHNjZW5lLmFkZEdhbWVPYmplY3Qob2JqKTtcclxuXHJcbiAgICBvYmogPSBuZXcgSGFsZkJsb2NrKCk7XHJcbiAgICBvYmoucG9zaXRpb24ueCA9IGJsb2NrU2l6ZSAqIDc7XHJcbiAgICBvYmoucG9zaXRpb24ueSA9IGJsb2NrU2l6ZSAqIDU7XHJcbiAgICBvYmoucm90YXRlKE1hdGguUEkpO1xyXG4gICAgc2NlbmUuYWRkR2FtZU9iamVjdChvYmopO1xyXG5cclxuICAgIG9iaiA9IG5ldyBIYWxmQmxvY2soKTtcclxuICAgIG9iai5wb3NpdGlvbi54ID0gYmxvY2tTaXplICogMTE7XHJcbiAgICBvYmoucG9zaXRpb24ueSA9IGJsb2NrU2l6ZSAqIDE7XHJcbiAgICBvYmoucm90YXRlKE1hdGguUEkpO1xyXG4gICAgc2NlbmUuYWRkR2FtZU9iamVjdChvYmopO1xyXG5cclxuICAgIG9iaiA9IG5ldyBIYWxmQmxvY2soKTtcclxuICAgIG9iai5wb3NpdGlvbi54ID0gYmxvY2tTaXplICogMTE7XHJcbiAgICBvYmoucG9zaXRpb24ueSA9IGJsb2NrU2l6ZSAqIDc7XHJcbiAgICBvYmoucm90YXRlKE1hdGguUEkpO1xyXG4gICAgc2NlbmUuYWRkR2FtZU9iamVjdChvYmopO1xyXG5cclxuICAgIG9iaiA9IG5ldyBIYWxmQmxvY2soKTtcclxuICAgIG9iai5wb3NpdGlvbi54ID0gYmxvY2tTaXplICogMTQ7XHJcbiAgICBvYmoucG9zaXRpb24ueSA9IGJsb2NrU2l6ZSAqIDQ7XHJcbiAgICBvYmoucm90YXRlKE1hdGguUEkpO1xyXG4gICAgc2NlbmUuYWRkR2FtZU9iamVjdChvYmopO1xyXG59O1xyXG5cclxuT2JqZWN0LmZyZWV6ZShMZXZlbDEpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBMZXZlbDE7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgTGV2ZWwxID0gcmVxdWlyZShcIi4vTGV2ZWwxLmpzXCIpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBMZXZlbDEgOiBMZXZlbDFcclxufTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBlbnRpdGllcyA9IHJlcXVpcmUoJy4uL2VudGl0aWVzJyk7XHJcblxyXG52YXIgQ2xpZW50ID0gZnVuY3Rpb24gKGlkLCBkYXRhKSB7XHJcbiAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICB0aGlzLmRhdGEgPSBkYXRhO1xyXG4gICAgdGhpcy5nYW1lT2JqZWN0ID0gdW5kZWZpbmVkO1xyXG59O1xyXG5PYmplY3QuZnJlZXplKENsaWVudCk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENsaWVudDsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBlbnRpdGllcyA9IHJlcXVpcmUoJy4uL2VudGl0aWVzJyk7XHJcblxyXG52YXIgTG9jYWxDbGllbnQgPSBmdW5jdGlvbiAoaWQsIGRhdGEpIHtcclxuICAgIHRoaXMuaWQgPSBpZDtcclxuICAgIHRoaXMuZGF0YSA9IGRhdGE7XHJcbiAgICB0aGlzLmdhbWVPYmplY3QgPSB1bmRlZmluZWQ7XHJcbn07XHJcbk9iamVjdC5mcmVlemUoTG9jYWxDbGllbnQpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBMb2NhbENsaWVudDsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBOZXR3b3JrID0ge1xyXG4gICAgc29ja2V0ICAgICAgOiB1bmRlZmluZWQsXHJcbiAgICBsb2NhbENsaWVudCA6IHt9LFxyXG4gICAgY2xpZW50cyAgICAgOiB7fSxcclxuICAgIHJvb21zICAgICAgIDoge30sXHJcbiAgICBjb25uZWN0ZWQgICA6IGZhbHNlLFxyXG4gICAgaG9zdElkICAgICAgOiAtMSxcclxuXHJcbiAgICAvLyBFdmVudHMgZm9yIGV4dGVybmFsIGVudGl0aWVzIHRvIHN1YnNjcmliZSB0b1xyXG4gICAgRXZlbnQgICAgICAgOiB7XHJcbiAgICAgICAgQ09OTkVDVCAgICAgICAgICAgIDogXCJjb25uZWN0XCIsXHJcbiAgICAgICAgVVBEQVRFX1JPT01TICAgICAgIDogXCJ1cGRhdGVSb29tc1wiLFxyXG4gICAgICAgIEVOVEVSX1JPT01fU1VDQ0VTUyA6IFwiZW50ZXJSb29tU3VjY2Vzc1wiLFxyXG4gICAgICAgIEVOVEVSX1JPT01fRkFJTCAgICA6IFwiZW50ZXJSb29tRmFpbFwiLFxyXG4gICAgICAgIFBMQVkgICAgICAgICAgICAgICA6IFwicGxheVwiLFxyXG4gICAgICAgIFNUQVJUX0dBTUUgICAgICAgICA6IFwic3RhcnRHYW1lXCIsXHJcbiAgICAgICAgRU5EX0dBTUUgICAgICAgICAgIDogXCJlbmRHYW1lXCIsXHJcbiAgICAgICAgUExBWUVSX0RFQVRIICAgICAgIDogXCJwbGF5ZXJEZWF0aFwiLFxyXG4gICAgICAgIFBMQVlFUl9SRVNQQVdOICAgICA6IFwicGxheWVyUmVzcGF3blwiLFxyXG4gICAgICAgIEJVTExFVCAgICAgICAgICAgICA6IFwiYnVsbGV0XCIsXHJcbiAgICAgICAgQ0xPQ0tfVElDSyAgICAgICAgIDogXCJjbG9ja1RpY2tcIixcclxuICAgICAgICBDT1VOVERPV04gICAgICAgICAgOiBcImNvdW50ZG93blwiLFxyXG4gICAgICAgIEdBTUVfU1RBUlRfREFUQSAgICA6IFwiZ2FtZVN0YXJ0RGF0YVwiLFxyXG4gICAgICAgIEdBTUVfT1ZFUl9EQVRBICAgICA6IFwiZ2FtZU92ZXJEYXRhXCJcclxuICAgIH0sXHJcblxyXG4gICAgaW5pdCA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLnNvY2tldCA9IGlvLmNvbm5lY3QoKTtcclxuXHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ2NvbmZpcm0nLCB0aGlzLl9vbkNvbmZpcm1DbGllbnQuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ2FkZE90aGVyJywgdGhpcy5fb25BZGRPdGhlckNsaWVudC5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbigncmVtb3ZlT3RoZXInLCB0aGlzLl9vblJlbW92ZU90aGVyQ2xpZW50LmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdsb2FkUHJldmlvdXMnLCB0aGlzLl9vbkxvYWRQcmV2aW91c0NsaWVudHMuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ3VwZGF0ZU90aGVyJywgdGhpcy5fb25VcGRhdGVDbGllbnQuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ3VwZGF0ZVJvb21zJywgdGhpcy5fb25VcGRhdGVSb29tcy5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbignZW50ZXJSb29tU3VjY2VzcycsIHRoaXMuX29uRW50ZXJSb29tU3VjY2Vzcy5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbignZW50ZXJSb29tRmFpbCcsIHRoaXMuX29uRW50ZXJSb29tRmFpbC5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbigncGluZycsIHRoaXMuX29uUGluZy5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbignc2V0SG9zdCcsIHRoaXMuX29uU2V0SG9zdC5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbignc3RhcnRHYW1lJywgdGhpcy5fb25TdGFydEdhbWUuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ2VuZEdhbWUnLCB0aGlzLl9vbkVuZEdhbWUuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ3BsYXllckRlYXRoJywgdGhpcy5fb25QbGF5ZXJEZWF0aC5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbigncGxheWVyUmVzcGF3bicsIHRoaXMuX29uUGxheWVyUmVzcGF3bi5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbignYnVsbGV0JywgdGhpcy5fb25CdWxsZXQuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oJ2NvdW50ZG93bicsIHRoaXMuX29uQ291bnRkb3duLmJpbmQodGhpcykpO1xyXG4gICAgICAgIHRoaXMuc29ja2V0Lm9uKCdjbG9ja1RpY2snLCB0aGlzLl9vbkNsb2NrVGljay5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbignZ2FtZVN0YXJ0RGF0YScsIHRoaXMuX29uR2FtZVN0YXJ0RGF0YS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5vbignZ2FtZU92ZXJEYXRhJywgdGhpcy5fb25HYW1lT3ZlckRhdGEuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ2luaXQnLCB7XHJcbiAgICAgICAgICAgIHVzZXIgOiAkKFwiI3VzZXJOYW1lXCIpLmh0bWwoKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRSb29tcyA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCd1cGRhdGVSb29tcycpO1xyXG4gICAgfSxcclxuXHJcbiAgICBjcmVhdGVSb29tIDogZnVuY3Rpb24gKG5hbWUpIHtcclxuICAgICAgICB2YXIgcm9vbURhdGEgPSB7XHJcbiAgICAgICAgICAgIG5hbWUgIDogbmFtZSxcclxuICAgICAgICAgICAgZW50ZXIgOiB0cnVlXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnY3JlYXRlUm9vbScsIHJvb21EYXRhKTtcclxuICAgIH0sXHJcblxyXG4gICAgZW50ZXJSb29tIDogZnVuY3Rpb24gKHJvb21JZCkge1xyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ2VudGVyUm9vbScsIHJvb21JZCk7XHJcbiAgICB9LFxyXG5cclxuICAgIGxlYXZlUm9vbSA6IGZ1bmN0aW9uIChyb29tSWQpIHtcclxuICAgICAgICB0aGlzLnNvY2tldC5lbWl0KCdsZWF2ZVJvb20nLCByb29tSWQpO1xyXG4gICAgfSxcclxuXHJcbiAgICBzd2l0Y2hUZWFtIDogZnVuY3Rpb24gKHJvb21JZCkge1xyXG4gICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ3N3aXRjaFRlYW0nLCByb29tSWQpO1xyXG4gICAgfSxcclxuXHJcbiAgICBpc0hvc3QgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaG9zdElkID09PSB0aGlzLmxvY2FsQ2xpZW50LmlkO1xyXG4gICAgfSxcclxuXHJcbiAgICBfb25Db25maXJtQ2xpZW50IDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICB2YXIgaWQgPSBkYXRhLmlkO1xyXG4gICAgICAgIHRoaXMubG9jYWxDbGllbnQgPSBuZXcgTG9jYWxDbGllbnQoaWQsIGRhdGEpO1xyXG4gICAgICAgIHRoaXMuY2xpZW50c1tpZF0gPSB0aGlzLmxvY2FsQ2xpZW50O1xyXG5cclxuICAgICAgICB0aGlzLmNvbm5lY3RlZCA9IHRydWU7XHJcblxyXG4gICAgICAgICQodGhpcykudHJpZ2dlcihcclxuICAgICAgICAgICAgdGhpcy5FdmVudC5DT05ORUNUXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgX29uQWRkT3RoZXJDbGllbnQgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgIHZhciBpZCA9IGRhdGEuaWQ7XHJcbiAgICAgICAgdmFyIG5ld0NsaWVudCA9IG5ldyBDbGllbnQoaWQsIGRhdGEpO1xyXG5cclxuICAgICAgICB0aGlzLmNsaWVudHNbZGF0YS5pZF0gPSBuZXdDbGllbnQ7XHJcbiAgICB9LFxyXG5cclxuICAgIF9vblJlbW92ZU90aGVyQ2xpZW50IDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICB0aGlzLmNsaWVudHNbZGF0YS5pZF0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuY2xpZW50c1tkYXRhLmlkXTtcclxuICAgIH0sXHJcblxyXG4gICAgX29uTG9hZFByZXZpb3VzQ2xpZW50cyA6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhkYXRhKTtcclxuXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBpZCA9IHBhcnNlSW50KGtleXNbaV0pO1xyXG4gICAgICAgICAgICB2YXIgdXNlckRhdGEgPSBkYXRhW2lkXTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX29uQWRkT3RoZXJDbGllbnQodXNlckRhdGEpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uVXBkYXRlQ2xpZW50IDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICB2YXIgaWQgPSBkYXRhLmlkO1xyXG4gICAgICAgIHZhciBjbGllbnQgPSB0aGlzLmNsaWVudHNbaWRdO1xyXG5cclxuICAgICAgICBjbGllbnQuZGF0YSA9IGRhdGE7XHJcblxyXG4gICAgICAgIGlmIChjbGllbnQuZ2FtZU9iamVjdCkge1xyXG4gICAgICAgICAgICBjbGllbnQuZ2FtZU9iamVjdC5wb3NpdGlvbi54ID0gZGF0YS5wb3NpdGlvbi54O1xyXG4gICAgICAgICAgICBjbGllbnQuZ2FtZU9iamVjdC5wb3NpdGlvbi55ID0gZGF0YS5wb3NpdGlvbi55O1xyXG4gICAgICAgICAgICBjbGllbnQuZ2FtZU9iamVjdC52ZWxvY2l0eS54ID0gZGF0YS52ZWxvY2l0eS54O1xyXG4gICAgICAgICAgICBjbGllbnQuZ2FtZU9iamVjdC52ZWxvY2l0eS55ID0gZGF0YS52ZWxvY2l0eS55O1xyXG4gICAgICAgICAgICBjbGllbnQuZ2FtZU9iamVjdC5hY2NlbGVyYXRpb24ueCA9IGRhdGEuYWNjZWxlcmF0aW9uLng7XHJcbiAgICAgICAgICAgIGNsaWVudC5nYW1lT2JqZWN0LmFjY2VsZXJhdGlvbi55ID0gZGF0YS5hY2NlbGVyYXRpb24ueTtcclxuICAgICAgICAgICAgY2xpZW50LmdhbWVPYmplY3Quc2V0Um90YXRpb24oZGF0YS5yb3RhdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25VcGRhdGVSb29tcyA6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgdGhpcy5yb29tcyA9IGRhdGE7XHJcblxyXG4gICAgICAgICQodGhpcykudHJpZ2dlcihcclxuICAgICAgICAgICAgdGhpcy5FdmVudC5VUERBVEVfUk9PTVMsXHJcbiAgICAgICAgICAgIGRhdGFcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBfb25FbnRlclJvb21TdWNjZXNzIDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAkKHRoaXMpLnRyaWdnZXIoXHJcbiAgICAgICAgICAgIHRoaXMuRXZlbnQuRU5URVJfUk9PTV9TVUNDRVNTLFxyXG4gICAgICAgICAgICBkYXRhXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgX29uRW50ZXJSb29tRmFpbCA6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgJCh0aGlzKS50cmlnZ2VyKFxyXG4gICAgICAgICAgICB0aGlzLkV2ZW50LkVOVEVSX1JPT01fRkFJTCxcclxuICAgICAgICAgICAgZGF0YVxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIF9vblBpbmcgOiBmdW5jdGlvbiAocGluZ09iaikge1xyXG4gICAgICAgIGlmIChwaW5nT2JqKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ3JldHVyblBpbmcnLCBwaW5nT2JqKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vblNldEhvc3QgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgIHRoaXMuaG9zdElkID0gZGF0YS5pZDtcclxuICAgIH0sXHJcblxyXG4gICAgX29uU3RhcnRHYW1lIDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAkKHRoaXMpLnRyaWdnZXIoXHJcbiAgICAgICAgICAgIHRoaXMuRXZlbnQuU1RBUlRfR0FNRSxcclxuICAgICAgICAgICAgZGF0YVxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkVuZEdhbWUgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgIHZhciByb29tID0gdGhpcy5yb29tc1tkYXRhLmlkXTtcclxuXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByb29tLnBsYXllcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5jbGllbnRzW3Jvb20ucGxheWVyc1tpXV0uZGF0YS5yZWFkeSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5sb2NhbENsaWVudC5kYXRhLnJlYWR5ID0gZmFsc2U7XHJcblxyXG4gICAgICAgICQodGhpcykudHJpZ2dlcihcclxuICAgICAgICAgICAgdGhpcy5FdmVudC5FTkRfR0FNRSxcclxuICAgICAgICAgICAgZGF0YVxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIF9vblBsYXllckRlYXRoIDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAkKHRoaXMpLnRyaWdnZXIoXHJcbiAgICAgICAgICAgIHRoaXMuRXZlbnQuUExBWUVSX0RFQVRILFxyXG4gICAgICAgICAgICBkYXRhXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgX29uUGxheWVyUmVzcGF3biA6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgJCh0aGlzKS50cmlnZ2VyKFxyXG4gICAgICAgICAgICB0aGlzLkV2ZW50LlBMQVlFUl9SRVNQQVdOLFxyXG4gICAgICAgICAgICBkYXRhXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgX29uQnVsbGV0IDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAkKHRoaXMpLnRyaWdnZXIoXHJcbiAgICAgICAgICAgIHRoaXMuRXZlbnQuQlVMTEVULFxyXG4gICAgICAgICAgICBkYXRhXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgX29uQ291bnRkb3duIDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAkKHRoaXMpLnRyaWdnZXIoXHJcbiAgICAgICAgICAgIHRoaXMuRXZlbnQuQ09VTlRET1dOLFxyXG4gICAgICAgICAgICBkYXRhXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgX29uQ2xvY2tUaWNrIDogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAkKHRoaXMpLnRyaWdnZXIoXHJcbiAgICAgICAgICAgIHRoaXMuRXZlbnQuQ0xPQ0tfVElDSyxcclxuICAgICAgICAgICAgZGF0YVxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkdhbWVTdGFydERhdGEgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICQodGhpcykudHJpZ2dlcihcclxuICAgICAgICAgICAgdGhpcy5FdmVudC5HQU1FX1NUQVJUX0RBVEEsXHJcbiAgICAgICAgICAgIGRhdGFcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBfb25HYW1lT3ZlckRhdGEgOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICQodGhpcykudHJpZ2dlcihcclxuICAgICAgICAgICAgdGhpcy5FdmVudC5HQU1FX09WRVJfREFUQSxcclxuICAgICAgICAgICAgZGF0YVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE5ldHdvcms7XHJcblxyXG52YXIgQ2xpZW50ID0gcmVxdWlyZSgnLi9DbGllbnQuanMnKTtcclxudmFyIExvY2FsQ2xpZW50ID0gcmVxdWlyZSgnLi9Mb2NhbENsaWVudC5qcycpOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIE92ZXJsYXkgPSByZXF1aXJlKCcuL092ZXJsYXkuanMnKTtcclxuXHJcbnZhciBDcmVhdGVSb29tT3ZlcmxheSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIE92ZXJsYXkuY2FsbCh0aGlzKTtcclxuICAgIFxyXG4gICAgdGhpcy5pbnB1dEZpZWxkID0gJChcIjxpbnB1dD5cIik7XHJcbiAgICB0aGlzLmlucHV0RmllbGQuYXR0cih7IFwicGxhY2Vob2xkZXJcIiA6IFwiUm9vbSBOYW1lXCIgfSk7XHJcbiAgICB0aGlzLmlucHV0RmllbGQuYWRkQ2xhc3MoXCJjcmVhdGUtcm9vbS1vdmVybGF5LWlucHV0XCIpO1xyXG4gICAgXHJcbiAgICB0aGlzLmJ1dHRvbkNvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcclxuICAgIHRoaXMuYnV0dG9uQ29udGFpbmVyLmFkZENsYXNzKFwiY3JlYXRlLXJvb20tb3ZlcmxheS1idXR0b24tY29udGFpbmVyXCIpO1xyXG4gICAgXHJcbiAgICB0aGlzLmNhbmNlbEJ0biA9ICQoXCI8YnV0dG9uPlwiKTtcclxuICAgIHRoaXMuY2FuY2VsQnRuLnRleHQoXCJDYW5jZWxcIik7XHJcbiAgICB0aGlzLmJ1dHRvbkNvbnRhaW5lci5hcHBlbmQodGhpcy5jYW5jZWxCdG4pO1xyXG4gICAgXHJcbiAgICB0aGlzLmNyZWF0ZUJ0biA9ICQoXCI8YnV0dG9uPlwiKTtcclxuICAgIHRoaXMuY3JlYXRlQnRuLnRleHQoXCJDcmVhdGVcIik7XHJcbiAgICB0aGlzLmJ1dHRvbkNvbnRhaW5lci5hcHBlbmQodGhpcy5jcmVhdGVCdG4pO1xyXG5cclxuICAgIHRoaXMuZG9tT2JqZWN0LmFwcGVuZCh0aGlzLmlucHV0RmllbGQpO1xyXG4gICAgdGhpcy5kb21PYmplY3QuYXBwZW5kKHRoaXMuYnV0dG9uQ29udGFpbmVyKTtcclxuICAgIHRoaXMuZG9tT2JqZWN0LmFkZENsYXNzKFwiY3JlYXRlLXJvb20tb3ZlcmxheVwiKTtcclxufTtcclxuXHJcbkNyZWF0ZVJvb21PdmVybGF5LnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShPdmVybGF5LnByb3RvdHlwZSwge1xyXG5cclxufSkpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDcmVhdGVSb29tT3ZlcmxheTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBPdmVybGF5ID0gcmVxdWlyZSgnLi9PdmVybGF5LmpzJyk7XHJcbnZhciBOZXR3b3JrID0gcmVxdWlyZSgnLi4vbmV0d29yaycpO1xyXG5cclxudmFyIEdhbWVPdmVyT3ZlcmxheSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIE92ZXJsYXkuY2FsbCh0aGlzKTtcclxuXHJcbiAgICB0aGlzLnJlc3VsdHNMYWJlbCA9ICQoXCI8ZGl2PlwiKTtcclxuICAgIHRoaXMucmVzdWx0c0xhYmVsLmh0bWwoXCJSZXN1bHRzXCIpO1xyXG4gICAgdGhpcy5yZXN1bHRzTGFiZWwuYWRkQ2xhc3MoXCJnYW1lLW92ZXItb3ZlcmxheS1yZXN1bHRzLWxhYmVsXCIpO1xyXG5cclxuICAgIHRoaXMudGVhbUFDb250YWluZXIgPSAkKFwiPGRpdj5cIik7XHJcbiAgICB0aGlzLnRlYW1BQ29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS10ZWFtQS1jb250YWluZXJcIik7XHJcblxyXG4gICAgdGhpcy50ZWFtQkNvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcclxuICAgIHRoaXMudGVhbUJDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LXRlYW1CLWNvbnRhaW5lclwiKTtcclxuXHJcbiAgICB0aGlzLnJldHVyblRvTG9iYnlCdG4gPSAkKFwiPGJ1dHRvbj5cIik7XHJcbiAgICB0aGlzLnJldHVyblRvTG9iYnlCdG4udGV4dChcIlJldHVybiB0byBMb2JieVwiKTtcclxuICAgIHRoaXMucmV0dXJuVG9Mb2JieUJ0bi5hZGRDbGFzcyhcImdhbWUtb3Zlci1vdmVybGF5LXJldHVybi10by1sb2JieS1idXR0b25cIik7XHJcblxyXG4gICAgdGhpcy5kb21PYmplY3QuYXBwZW5kKHRoaXMucmVzdWx0c0xhYmVsKTtcclxuICAgIHRoaXMuZG9tT2JqZWN0LmFwcGVuZCh0aGlzLmxvYWRpbmdJY29uKTtcclxuICAgIHRoaXMuZG9tT2JqZWN0LmFwcGVuZCh0aGlzLnRlYW1BQ29udGFpbmVyKTtcclxuICAgIHRoaXMuZG9tT2JqZWN0LmFwcGVuZCh0aGlzLnRlYW1CQ29udGFpbmVyKTtcclxuICAgIHRoaXMuZG9tT2JqZWN0LmFwcGVuZCh0aGlzLnJldHVyblRvTG9iYnlCdG4pO1xyXG5cclxuICAgIHRoaXMuZG9tT2JqZWN0LmFkZENsYXNzKFwiZ2FtZS1vdmVyLW92ZXJsYXlcIik7XHJcbiAgICB0aGlzLmRvbU9iamVjdC5hZGRDbGFzcyhcImZhZGUtaW5cIik7XHJcblxyXG4gICAgdGhpcy5yZW5kZXJTY29yZSgpO1xyXG59O1xyXG5cclxuR2FtZU92ZXJPdmVybGF5LnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShPdmVybGF5LnByb3RvdHlwZSwge1xyXG4gICAgcmVuZGVyU2NvcmUgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAocm9vbURhdGEpIHtcclxuICAgICAgICAgICAgdGhpcy50ZWFtQUNvbnRhaW5lci5odG1sKFwiXCIpO1xyXG4gICAgICAgICAgICB0aGlzLnRlYW1CQ29udGFpbmVyLmh0bWwoXCJcIik7XHJcblxyXG4gICAgICAgICAgICB2YXIgdGVhbUFMYWJlbCA9ICQoXCI8c3Bhbj5cIik7XHJcbiAgICAgICAgICAgIHRlYW1BTGFiZWwuaHRtbChcIlJvc2UgVGVhbVwiKTtcclxuICAgICAgICAgICAgdGVhbUFMYWJlbC5hZGRDbGFzcyhcImdhbWUtb3Zlci1vdmVybGF5LXRlYW0tbGFiZWxcIik7XHJcblxyXG4gICAgICAgICAgICB2YXIgdGVhbUFLaWxsTGFiZWwgPSAkKFwiPHNwYW4+XCIpO1xyXG4gICAgICAgICAgICB0ZWFtQUtpbGxMYWJlbC5odG1sKFwiS1wiKTtcclxuICAgICAgICAgICAgdGVhbUFLaWxsTGFiZWwuYWRkQ2xhc3MoXCJnYW1lLW92ZXItb3ZlcmxheS10ZWFtLWtpbGwtbGFiZWxcIik7XHJcblxyXG4gICAgICAgICAgICB2YXIgdGVhbUFEZWF0aExhYmVsID0gJChcIjxzcGFuPlwiKTtcclxuICAgICAgICAgICAgdGVhbUFEZWF0aExhYmVsLmh0bWwoXCJEXCIpO1xyXG4gICAgICAgICAgICB0ZWFtQURlYXRoTGFiZWwuYWRkQ2xhc3MoXCJnYW1lLW92ZXItb3ZlcmxheS10ZWFtLWRlYXRoLWxhYmVsXCIpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy50ZWFtQUNvbnRhaW5lci5hcHBlbmQodGVhbUFMYWJlbCk7XHJcbiAgICAgICAgICAgIHRoaXMudGVhbUFDb250YWluZXIuYXBwZW5kKHRlYW1BS2lsbExhYmVsKTtcclxuICAgICAgICAgICAgdGhpcy50ZWFtQUNvbnRhaW5lci5hcHBlbmQodGVhbUFEZWF0aExhYmVsKTtcclxuXHJcbiAgICAgICAgICAgIHZhciB0ZWFtQkxhYmVsID0gJChcIjxzcGFuPlwiKTtcclxuICAgICAgICAgICAgdGVhbUJMYWJlbC5odG1sKFwiU2t5IFRlYW1cIik7XHJcbiAgICAgICAgICAgIHRlYW1CTGFiZWwuYWRkQ2xhc3MoXCJnYW1lLW92ZXItb3ZlcmxheS10ZWFtLWxhYmVsXCIpO1xyXG5cclxuICAgICAgICAgICAgdmFyIHRlYW1CS2lsbExhYmVsID0gJChcIjxzcGFuPlwiKTtcclxuICAgICAgICAgICAgdGVhbUJLaWxsTGFiZWwuaHRtbChcIktcIik7XHJcbiAgICAgICAgICAgIHRlYW1CS2lsbExhYmVsLmFkZENsYXNzKFwiZ2FtZS1vdmVyLW92ZXJsYXktdGVhbS1raWxsLWxhYmVsXCIpO1xyXG5cclxuICAgICAgICAgICAgdmFyIHRlYW1CRGVhdGhMYWJlbCA9ICQoXCI8c3Bhbj5cIik7XHJcbiAgICAgICAgICAgIHRlYW1CRGVhdGhMYWJlbC5odG1sKFwiRFwiKTtcclxuICAgICAgICAgICAgdGVhbUJEZWF0aExhYmVsLmFkZENsYXNzKFwiZ2FtZS1vdmVyLW92ZXJsYXktdGVhbS1kZWF0aC1sYWJlbFwiKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMudGVhbUJDb250YWluZXIuYXBwZW5kKHRlYW1CTGFiZWwpO1xyXG4gICAgICAgICAgICB0aGlzLnRlYW1CQ29udGFpbmVyLmFwcGVuZCh0ZWFtQktpbGxMYWJlbCk7XHJcbiAgICAgICAgICAgIHRoaXMudGVhbUJDb250YWluZXIuYXBwZW5kKHRlYW1CRGVhdGhMYWJlbCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXJvb21EYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdGVhbUFMb2FkaW5nQ29udGFpbmVyID0gJChcIjxkaXY+XCIpO1xyXG4gICAgICAgICAgICAgICAgdGVhbUFMb2FkaW5nQ29udGFpbmVyLmh0bWwoXCJMb2FkaW5nLi4uXCIpO1xyXG4gICAgICAgICAgICAgICAgdGVhbUFMYWJlbC5hcHBlbmQodGVhbUFMb2FkaW5nQ29udGFpbmVyKTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgdGVhbUJMb2FkaW5nQ29udGFpbmVyID0gJChcIjxkaXY+XCIpO1xyXG4gICAgICAgICAgICAgICAgdGVhbUJMb2FkaW5nQ29udGFpbmVyLmh0bWwoXCJMb2FkaW5nLi4uXCIpO1xyXG4gICAgICAgICAgICAgICAgdGVhbUJMYWJlbC5hcHBlbmQodGVhbUJMb2FkaW5nQ29udGFpbmVyKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciB0ZWFtQSA9IHJvb21EYXRhLnRlYW1BO1xyXG4gICAgICAgICAgICB2YXIgdGVhbUIgPSByb29tRGF0YS50ZWFtQjtcclxuICAgICAgICAgICAgdmFyIGxvY2FsSWQgPSBOZXR3b3JrLmxvY2FsQ2xpZW50LmlkO1xyXG5cclxuICAgICAgICAgICAgdmFyIHRlYW1BTmFtZUNvbnRhaW5lciA9ICQoXCI8c3Bhbj5cIik7XHJcbiAgICAgICAgICAgIHZhciB0ZWFtQUtpbGxzQ29udGFpbmVyID0gJChcIjxzcGFuPlwiKTtcclxuICAgICAgICAgICAgdmFyIHRlYW1BRGVhdGhzQ29udGFpbmVyID0gJChcIjxzcGFuPlwiKTtcclxuICAgICAgICAgICAgdGVhbUFOYW1lQ29udGFpbmVyLmFkZENsYXNzKFwiZ2FtZS1vdmVyLW92ZXJsYXktbmFtZS1jb250YWluZXJcIik7XHJcbiAgICAgICAgICAgIHRlYW1BS2lsbHNDb250YWluZXIuYWRkQ2xhc3MoXCJnYW1lLW92ZXItb3ZlcmxheS1raWxscy1jb250YWluZXJcIik7XHJcbiAgICAgICAgICAgIHRlYW1BRGVhdGhzQ29udGFpbmVyLmFkZENsYXNzKFwiZ2FtZS1vdmVyLW92ZXJsYXktZGVhdGhzLWNvbnRhaW5lclwiKTtcclxuXHJcbiAgICAgICAgICAgIHZhciB0ZWFtQk5hbWVDb250YWluZXIgPSAkKFwiPHNwYW4+XCIpO1xyXG4gICAgICAgICAgICB2YXIgdGVhbUJLaWxsc0NvbnRhaW5lciA9ICQoXCI8c3Bhbj5cIik7XHJcbiAgICAgICAgICAgIHZhciB0ZWFtQkRlYXRoc0NvbnRhaW5lciA9ICQoXCI8c3Bhbj5cIik7XHJcbiAgICAgICAgICAgIHRlYW1CTmFtZUNvbnRhaW5lci5hZGRDbGFzcyhcImdhbWUtb3Zlci1vdmVybGF5LW5hbWUtY29udGFpbmVyXCIpO1xyXG4gICAgICAgICAgICB0ZWFtQktpbGxzQ29udGFpbmVyLmFkZENsYXNzKFwiZ2FtZS1vdmVyLW92ZXJsYXkta2lsbHMtY29udGFpbmVyXCIpO1xyXG4gICAgICAgICAgICB0ZWFtQkRlYXRoc0NvbnRhaW5lci5hZGRDbGFzcyhcImdhbWUtb3Zlci1vdmVybGF5LWRlYXRocy1jb250YWluZXJcIik7XHJcblxyXG4gICAgICAgICAgICAvLyBBZGQgdGVhbSBBIHBsYXllcnNcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA0OyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciBsYWJlbDtcclxuICAgICAgICAgICAgICAgIHZhciBraWxscztcclxuICAgICAgICAgICAgICAgIHZhciBkZWF0aHM7XHJcbiAgICAgICAgICAgICAgICB2YXIgcGxheWVyQ29udGFpbmVyID0gJChcIjxkaXY+XCIpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGtpbGxzQ29udGFpbmVyID0gJChcIjxkaXY+XCIpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGRlYXRoc0NvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaSA8IHRlYW1BLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJQbGF5ZXIgPSB0ZWFtQVtpXTtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbCA9IGN1clBsYXllci51c2VyO1xyXG4gICAgICAgICAgICAgICAgICAgIGtpbGxzID0gY3VyUGxheWVyLmtpbGxzO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlYXRocyA9IGN1clBsYXllci5kZWF0aHM7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJQbGF5ZXIuaWQgPT09IGxvY2FsSWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGxheWVyQ29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1sb2NhbC1wbGF5ZXItY29udGFpbmVyXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWwgPSBcIi0tLS0tLVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGtpbGxzID0gXCItXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVhdGhzID0gXCItXCI7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcGxheWVyQ29udGFpbmVyLmh0bWwobGFiZWwpO1xyXG4gICAgICAgICAgICAgICAga2lsbHNDb250YWluZXIuaHRtbChraWxscyk7XHJcbiAgICAgICAgICAgICAgICBkZWF0aHNDb250YWluZXIuaHRtbChkZWF0aHMpO1xyXG4gICAgICAgICAgICAgICAgdGVhbUFOYW1lQ29udGFpbmVyLmFwcGVuZChwbGF5ZXJDb250YWluZXIpO1xyXG4gICAgICAgICAgICAgICAgdGVhbUFLaWxsc0NvbnRhaW5lci5hcHBlbmQoa2lsbHNDb250YWluZXIpO1xyXG4gICAgICAgICAgICAgICAgdGVhbUFEZWF0aHNDb250YWluZXIuYXBwZW5kKGRlYXRoc0NvbnRhaW5lcik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMudGVhbUFDb250YWluZXIuYXBwZW5kKHRlYW1BTmFtZUNvbnRhaW5lcik7XHJcbiAgICAgICAgICAgIHRoaXMudGVhbUFDb250YWluZXIuYXBwZW5kKHRlYW1BS2lsbHNDb250YWluZXIpO1xyXG4gICAgICAgICAgICB0aGlzLnRlYW1BQ29udGFpbmVyLmFwcGVuZCh0ZWFtQURlYXRoc0NvbnRhaW5lcik7XHJcblxyXG4gICAgICAgICAgICAvLyBBZGQgdGVhbSBCIHBsYXllcnNcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA0OyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciBsYWJlbDtcclxuICAgICAgICAgICAgICAgIHZhciBraWxscztcclxuICAgICAgICAgICAgICAgIHZhciBkZWF0aHM7XHJcbiAgICAgICAgICAgICAgICB2YXIgcGxheWVyQ29udGFpbmVyID0gJChcIjxkaXY+XCIpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGtpbGxzQ29udGFpbmVyID0gJChcIjxkaXY+XCIpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGRlYXRoc0NvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaSA8IHRlYW1CLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJQbGF5ZXIgPSB0ZWFtQltpXTtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbCA9IGN1clBsYXllci51c2VyO1xyXG4gICAgICAgICAgICAgICAgICAgIGtpbGxzID0gY3VyUGxheWVyLmtpbGxzO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlYXRocyA9IGN1clBsYXllci5kZWF0aHM7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJQbGF5ZXIuaWQgPT09IGxvY2FsSWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGxheWVyQ29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1sb2NhbC1wbGF5ZXItY29udGFpbmVyXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWwgPSBcIi0tLS0tLVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGtpbGxzID0gXCItXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVhdGhzID0gXCItXCI7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcGxheWVyQ29udGFpbmVyLmh0bWwobGFiZWwpO1xyXG4gICAgICAgICAgICAgICAga2lsbHNDb250YWluZXIuaHRtbChraWxscyk7XHJcbiAgICAgICAgICAgICAgICBkZWF0aHNDb250YWluZXIuaHRtbChkZWF0aHMpO1xyXG4gICAgICAgICAgICAgICAgdGVhbUJOYW1lQ29udGFpbmVyLmFwcGVuZChwbGF5ZXJDb250YWluZXIpO1xyXG4gICAgICAgICAgICAgICAgdGVhbUJLaWxsc0NvbnRhaW5lci5hcHBlbmQoa2lsbHNDb250YWluZXIpO1xyXG4gICAgICAgICAgICAgICAgdGVhbUJEZWF0aHNDb250YWluZXIuYXBwZW5kKGRlYXRoc0NvbnRhaW5lcik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMudGVhbUJDb250YWluZXIuYXBwZW5kKHRlYW1CTmFtZUNvbnRhaW5lcik7XHJcbiAgICAgICAgICAgIHRoaXMudGVhbUJDb250YWluZXIuYXBwZW5kKHRlYW1CS2lsbHNDb250YWluZXIpO1xyXG4gICAgICAgICAgICB0aGlzLnRlYW1CQ29udGFpbmVyLmFwcGVuZCh0ZWFtQkRlYXRoc0NvbnRhaW5lcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVPdmVyT3ZlcmxheTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBPdmVybGF5ID0gcmVxdWlyZSgnLi9PdmVybGF5LmpzJyk7XHJcblxyXG52YXIgTG9hZGluZ092ZXJsYXkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBPdmVybGF5LmNhbGwodGhpcyk7XHJcbiAgICBcclxuICAgIHRoaXMuZG9tT2JqZWN0LmFkZENsYXNzKFwibG9hZGluZy1vdmVybGF5LWJnXCIpO1xyXG4gICAgXHJcbiAgICB0aGlzLmxvYWRpbmdJY29uID0gJChcIjxkaXY+XCIpO1xyXG4gICAgdGhpcy5sb2FkaW5nSWNvbi5hZGRDbGFzcyhcImxvYWRpbmctb3ZlcmxheVwiKTtcclxuICAgIFxyXG4gICAgdGhpcy5kb21PYmplY3QuYXBwZW5kKHRoaXMubG9hZGluZ0ljb24pO1xyXG59O1xyXG5cclxuTG9hZGluZ092ZXJsYXkucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKE92ZXJsYXkucHJvdG90eXBlLCB7XHJcblxyXG59KSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IExvYWRpbmdPdmVybGF5OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIE92ZXJsYXkgPSByZXF1aXJlKCcuL092ZXJsYXkuanMnKTtcclxudmFyIE5ldHdvcmsgPSByZXF1aXJlKCcuLi9uZXR3b3JrJyk7XHJcblxyXG52YXIgTG9iYnlPdmVybGF5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgT3ZlcmxheS5jYWxsKHRoaXMpO1xyXG5cclxuICAgIC8vIFNldCB1cCBsZWZ0IHNpZGVcclxuICAgIHRoaXMubGVmdENvbnRhaW5lciA9ICQoXCI8c3Bhbj5cIik7XHJcbiAgICB0aGlzLmxlZnRDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LWxlZnRcIik7XHJcbiAgICB0aGlzLmxlZnRDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LW1heGltaXplZC1zaWRlXCIpO1xyXG5cclxuICAgIHRoaXMucm9vbUJ1dHRvbkNvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcclxuICAgIHRoaXMucm9vbUJ1dHRvbkNvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktYnV0dG9uLWNvbnRhaW5lclwiKTtcclxuICAgIHRoaXMubGVmdENvbnRhaW5lci5hcHBlbmQodGhpcy5yb29tQnV0dG9uQ29udGFpbmVyKTtcclxuXHJcbiAgICB0aGlzLnNlbGVjdFJvb21MYWJlbCA9ICQoXCI8ZGl2PlwiKTtcclxuICAgIHRoaXMuc2VsZWN0Um9vbUxhYmVsLmh0bWwoXCJTZWxlY3Qgb3IgY3JlYXRlIHJvb21cIik7XHJcbiAgICB0aGlzLnJvb21CdXR0b25Db250YWluZXIuYXBwZW5kKHRoaXMuc2VsZWN0Um9vbUxhYmVsKTtcclxuICAgIHRoaXMucm9vbUJ1dHRvbkNvbnRhaW5lci5hcHBlbmQoJChcIjxicj5cIikpO1xyXG5cclxuICAgIHRoaXMuY3JlYXRlUm9vbUJ0biA9ICQoXCI8YnV0dG9uPlwiKTtcclxuICAgIHRoaXMuY3JlYXRlUm9vbUJ0bi50ZXh0KFwiQ3JlYXRlIFJvb21cIik7XHJcbiAgICB0aGlzLnJvb21CdXR0b25Db250YWluZXIuYXBwZW5kKHRoaXMuY3JlYXRlUm9vbUJ0bik7XHJcblxyXG4gICAgdGhpcy5yb29tTGlzdENvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcclxuICAgIHRoaXMucm9vbUxpc3RDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LXJvb20tbGlzdFwiKTtcclxuICAgIHRoaXMucm9vbUxpc3RDb250YWluZXIuaHRtbChcIkxvYWRpbmcgcm9vbXMuLi5cIik7XHJcbiAgICB0aGlzLmxlZnRDb250YWluZXIuYXBwZW5kKHRoaXMucm9vbUxpc3RDb250YWluZXIpO1xyXG5cclxuICAgIC8vIFNldCB1cCByaWdodCBzaWRlXHJcbiAgICB0aGlzLnJpZ2h0Q29udGFpbmVyID0gJChcIjxzcGFuPlwiKTtcclxuICAgIHRoaXMucmlnaHRDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LXJpZ2h0XCIpO1xyXG4gICAgdGhpcy5yaWdodENvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktbWluaW1pemVkLXNpZGVcIik7XHJcblxyXG4gICAgdGhpcy5zZWxlY3RlZFJvb21MYWJlbCA9ICQoXCI8ZGl2PlwiKTtcclxuICAgIHRoaXMuc2VsZWN0ZWRSb29tTGFiZWwuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LXJvb20tbGFiZWwtY29udGFpbmVyXCIpO1xyXG5cclxuICAgIHRoaXMucmVuZGVyUm9vbUxhYmVsKCk7XHJcbiAgICB0aGlzLnJpZ2h0Q29udGFpbmVyLmFwcGVuZCh0aGlzLnNlbGVjdGVkUm9vbUxhYmVsKTtcclxuXHJcbiAgICB0aGlzLnN3aXRjaFRlYW1CdG4gPSAkKFwiPGJ1dHRvbj5cIik7XHJcbiAgICB0aGlzLnN3aXRjaFRlYW1CdG4udGV4dChcIlN3aXRjaCBUZWFtc1wiKTtcclxuICAgIHRoaXMuc3dpdGNoVGVhbUJ0bi5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktc3dpdGNoLXRlYW0tYnRuXCIpO1xyXG5cclxuICAgIHRoaXMudGVhbUFDb250YWluZXIgPSAkKFwiPGRpdj5cIik7XHJcbiAgICB0aGlzLnRlYW1BQ29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS10ZWFtQS1jb250YWluZXJcIik7XHJcblxyXG4gICAgdGhpcy50ZWFtQkNvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcclxuICAgIHRoaXMudGVhbUJDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LXRlYW1CLWNvbnRhaW5lclwiKTtcclxuXHJcbiAgICB0aGlzLnJlbmRlclBsYXllcnMoKTtcclxuXHJcbiAgICB0aGlzLnJpZ2h0Q29udGFpbmVyLmFwcGVuZCh0aGlzLnRlYW1BQ29udGFpbmVyKTtcclxuICAgIHRoaXMucmlnaHRDb250YWluZXIuYXBwZW5kKHRoaXMuc3dpdGNoVGVhbUJ0bik7XHJcbiAgICB0aGlzLnJpZ2h0Q29udGFpbmVyLmFwcGVuZCh0aGlzLnRlYW1CQ29udGFpbmVyKTtcclxuXHJcbiAgICB0aGlzLmxlYXZlUm9vbUJ0biA9ICQoXCI8YnV0dG9uPlwiKTtcclxuICAgIHRoaXMubGVhdmVSb29tQnRuLnRleHQoXCJMZWF2ZSBSb29tXCIpO1xyXG4gICAgdGhpcy5sZWF2ZVJvb21CdG4uYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LWxlYXZlLXJvb20tYnRuXCIpO1xyXG4gICAgdGhpcy5sZWF2ZVJvb21CdG4uaGlkZSgpO1xyXG4gICAgdGhpcy5yaWdodENvbnRhaW5lci5hcHBlbmQodGhpcy5sZWF2ZVJvb21CdG4pO1xyXG5cclxuICAgIHRoaXMucmVhZHlCdG4gPSAkKFwiPGJ1dHRvbj5cIik7XHJcbiAgICB0aGlzLnJlYWR5QnRuLnRleHQoXCJSZWFkeVwiKTtcclxuICAgIHRoaXMucmVhZHlCdG4uYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LXJlYWR5LWJ0blwiKTtcclxuICAgIHRoaXMucmVhZHlCdG4uaGlkZSgpO1xyXG4gICAgdGhpcy5yaWdodENvbnRhaW5lci5hcHBlbmQodGhpcy5yZWFkeUJ0bik7XHJcblxyXG4gICAgdGhpcy5kb21PYmplY3QuYXBwZW5kKHRoaXMubGVmdENvbnRhaW5lcik7XHJcbiAgICB0aGlzLmRvbU9iamVjdC5hcHBlbmQodGhpcy5yaWdodENvbnRhaW5lcik7XHJcbiAgICB0aGlzLmRvbU9iamVjdC5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXlcIik7XHJcbiAgICB0aGlzLmRvbU9iamVjdC5hZGRDbGFzcyhcImZhZGUtaW5cIik7XHJcbn07XHJcblxyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhMb2JieU92ZXJsYXksIHtcclxuICAgIEV2ZW50IDoge1xyXG4gICAgICAgIHZhbHVlIDoge1xyXG4gICAgICAgICAgICBFTlRFUl9ST09NIDogXCJlbnRlclJvb21cIlxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcblxyXG5Mb2JieU92ZXJsYXkucHJvdG90eXBlID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuY3JlYXRlKE92ZXJsYXkucHJvdG90eXBlLCB7XHJcbiAgICBzaG93Um9vbXMgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAocm9vbURhdGEpIHtcclxuICAgICAgICAgICAgdGhpcy5yb29tTGlzdENvbnRhaW5lci5odG1sKFwiXCIpO1xyXG5cclxuICAgICAgICAgICAgJChcIi5sb2JieS1vdmVybGF5LXJvb21cIikub2ZmKFwiY2xpY2tcIik7XHJcblxyXG4gICAgICAgICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHJvb21EYXRhKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChrZXlzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yb29tTGlzdENvbnRhaW5lci5odG1sKFwiTm8gcm9vbXMgYXZhaWxhYmxlXCIpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1clJvb20gPSByb29tRGF0YVtrZXlzW2ldXTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY3VyUm9vbUNvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKTtcclxuICAgICAgICAgICAgICAgICAgICBjdXJSb29tQ29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1yb29tXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGN1clJvb21Db250YWluZXIuaHRtbChjdXJSb29tLm5hbWUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKGN1clJvb21Db250YWluZXIpLm9uKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImNsaWNrXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1clJvb20sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX29uQ2xpY2tSb29tLmJpbmQodGhpcylcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJvb21MaXN0Q29udGFpbmVyLmFwcGVuZChjdXJSb29tQ29udGFpbmVyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgcmVuZGVyUm9vbSA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgIGlmIChkYXRhID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyUm9vbUxhYmVsKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlclBsYXllcnMoKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9vbkV4aXRSb29tKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlclJvb21MYWJlbChkYXRhLm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJQbGF5ZXJzKGRhdGEpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuX29uRW50ZXJSb29tKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHJlbmRlclJvb21MYWJlbCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChsYWJlbCkge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGxhYmVsICE9PSBcInN0cmluZ1wiIHx8IGxhYmVsID09PSBcIlwiKSB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbCA9IFwiTm8gcm9vbSBzZWxlY3RlZFwiO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsYWJlbCA9IFwiQ3VycmVudCByb29tOiBcIiArIGxhYmVsO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZFJvb21MYWJlbC5odG1sKGxhYmVsKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHJlbmRlclBsYXllcnMgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAocm9vbURhdGEpIHtcclxuICAgICAgICAgICAgdGhpcy50ZWFtQUNvbnRhaW5lci5odG1sKFwiXCIpO1xyXG4gICAgICAgICAgICB0aGlzLnRlYW1CQ29udGFpbmVyLmh0bWwoXCJcIik7XHJcbiAgICAgICAgICAgIHRoaXMuc3dpdGNoVGVhbUJ0bi5oaWRlKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAocm9vbURhdGEgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHRlYW1BID0gcm9vbURhdGEudGVhbUE7XHJcbiAgICAgICAgICAgICAgICB2YXIgdGVhbUIgPSByb29tRGF0YS50ZWFtQjtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgdGVhbUFMYWJlbCA9ICQoXCI8ZGl2PlwiKTtcclxuICAgICAgICAgICAgICAgIHRlYW1BTGFiZWwuaHRtbChcIlJvc2UgVGVhbVwiKTtcclxuICAgICAgICAgICAgICAgIHRlYW1BTGFiZWwuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LXRlYW0tbGFiZWxcIik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRlYW1BQ29udGFpbmVyLmFwcGVuZCh0ZWFtQUxhYmVsKTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgdGVhbUJMYWJlbCA9ICQoXCI8ZGl2PlwiKTtcclxuICAgICAgICAgICAgICAgIHRlYW1CTGFiZWwuaHRtbChcIlNreSBUZWFtXCIpO1xyXG4gICAgICAgICAgICAgICAgdGVhbUJMYWJlbC5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktdGVhbS1sYWJlbFwiKTtcclxuICAgICAgICAgICAgICAgIHRoaXMudGVhbUJDb250YWluZXIuYXBwZW5kKHRlYW1CTGFiZWwpO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBsb2NhbElkID0gTmV0d29yay5sb2NhbENsaWVudC5pZDtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBBZGQgdGVhbSBBIHBsYXllcnNcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxhYmVsO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwbGF5ZXJDb250YWluZXIgPSAkKFwiPGRpdj5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlYWR5ID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpIDwgdGVhbUEubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjdXJJZCA9IHRlYW1BW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY3VyUGxheWVyID0gTmV0d29yay5jbGllbnRzW2N1cklkXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVhZHkgPSBjdXJQbGF5ZXIuZGF0YS5yZWFkeTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWwgPSBjdXJQbGF5ZXIuZGF0YS51c2VyO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cklkID09PSBsb2NhbElkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXJDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LWxvY2FsLXBsYXllci1jb250YWluZXJcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZWFkeSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVhZHlCdG4uaHRtbChcIlJlYWR5XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3dpdGNoVGVhbUJ0bi5wcm9wKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlYWR5QnRuLmh0bWwoXCJDYW5jZWxcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zd2l0Y2hUZWFtQnRuLnByb3AoXCJkaXNhYmxlZFwiLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsID0gXCItLS0tLS1cIjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllckNvbnRhaW5lci5odG1sKGxhYmVsKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRlYW1BQ29udGFpbmVyLmFwcGVuZChwbGF5ZXJDb250YWluZXIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVhZHkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlYWR5Q29udGFpbmVyID0gJChcIjxzcGFuPlwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVhZHlDb250YWluZXIuaHRtbChcIlJlYWR5XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWFkeUNvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktcmVhZHktY29udGFpbmVyXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXJDb250YWluZXIuYXBwZW5kKHJlYWR5Q29udGFpbmVyKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQWRkIHRlYW0gQiBwbGF5ZXJzXHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDQ7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBsYWJlbDtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcGxheWVyQ29udGFpbmVyID0gJChcIjxkaXY+XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByZWFkeSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaSA8IHRlYW1CLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY3VySWQgPSB0ZWFtQltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGN1clBsYXllciA9IE5ldHdvcmsuY2xpZW50c1tjdXJJZF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYWR5ID0gY3VyUGxheWVyLmRhdGEucmVhZHk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsID0gY3VyUGxheWVyLmRhdGEudXNlcjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJJZCA9PT0gbG9jYWxJZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxheWVyQ29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1sb2NhbC1wbGF5ZXItY29udGFpbmVyXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcmVhZHkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlYWR5QnRuLmh0bWwoXCJSZWFkeVwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN3aXRjaFRlYW1CdG4ucHJvcChcImRpc2FibGVkXCIsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWFkeUJ0bi5odG1sKFwiQ2FuY2VsXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3dpdGNoVGVhbUJ0bi5wcm9wKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbCA9IFwiLS0tLS0tXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXJDb250YWluZXIuaHRtbChsYWJlbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50ZWFtQkNvbnRhaW5lci5hcHBlbmQocGxheWVyQ29udGFpbmVyKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlYWR5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZWFkeUNvbnRhaW5lciA9ICQoXCI8c3Bhbj5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYWR5Q29udGFpbmVyLmh0bWwoXCJSZWFkeVwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVhZHlDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LXJlYWR5LWNvbnRhaW5lclwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGxheWVyQ29udGFpbmVyLmFwcGVuZChyZWFkeUNvbnRhaW5lcik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuc3dpdGNoVGVhbUJ0bi5zaG93KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkNsaWNrUm9vbSA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gZS5kYXRhO1xyXG4gICAgICAgICAgICB2YXIgcm9vbSA9IHtcclxuICAgICAgICAgICAgICAgIG5hbWUgOiBkYXRhLm5hbWUsXHJcbiAgICAgICAgICAgICAgICBpZCAgIDogZGF0YS5pZFxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgJCh0aGlzKS50cmlnZ2VyKExvYmJ5T3ZlcmxheS5FdmVudC5FTlRFUl9ST09NLCByb29tKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkV4aXRSb29tIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLmxlYXZlUm9vbUJ0bi5oaWRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMucmVhZHlCdG4uaGlkZSgpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5sZWZ0Q29udGFpbmVyLnJlbW92ZUNsYXNzKFwibG9iYnktb3ZlcmxheS1taW5pbWl6ZWQtc2lkZVwiKTtcclxuICAgICAgICAgICAgdGhpcy5yaWdodENvbnRhaW5lci5yZW1vdmVDbGFzcyhcImxvYmJ5LW92ZXJsYXktbWF4aW1pemVkLXNpZGVcIik7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmxlZnRDb250YWluZXIuYWRkQ2xhc3MoXCJsb2JieS1vdmVybGF5LW1heGltaXplZC1zaWRlXCIpO1xyXG4gICAgICAgICAgICB0aGlzLnJpZ2h0Q29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1taW5pbWl6ZWQtc2lkZVwiKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkVudGVyUm9vbSA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5sZWF2ZVJvb21CdG4uc2hvdygpO1xyXG4gICAgICAgICAgICB0aGlzLnJlYWR5QnRuLnNob3coKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubGVmdENvbnRhaW5lci5yZW1vdmVDbGFzcyhcImxvYmJ5LW92ZXJsYXktbWF4aW1pemVkLXNpZGVcIik7XHJcbiAgICAgICAgICAgIHRoaXMucmlnaHRDb250YWluZXIucmVtb3ZlQ2xhc3MoXCJsb2JieS1vdmVybGF5LW1pbmltaXplZC1zaWRlXCIpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5sZWZ0Q29udGFpbmVyLmFkZENsYXNzKFwibG9iYnktb3ZlcmxheS1taW5pbWl6ZWQtc2lkZVwiKTtcclxuICAgICAgICAgICAgdGhpcy5yaWdodENvbnRhaW5lci5hZGRDbGFzcyhcImxvYmJ5LW92ZXJsYXktbWF4aW1pemVkLXNpZGVcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KSk7XHJcblxyXG5PYmplY3QuZnJlZXplKExvYmJ5T3ZlcmxheSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IExvYmJ5T3ZlcmxheTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBPdmVybGF5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5kb21PYmplY3QgPSAkKFwiPGRpdj5cIik7XHJcbiAgICB0aGlzLmRvbU9iamVjdC5hZGRDbGFzcyhcImNhbnZhcy1vdmVybGF5XCIpO1xyXG59O1xyXG5cclxuT3ZlcmxheS5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoT3ZlcmxheS5wcm90b3R5cGUsIHtcclxuXHJcbn0pKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gT3ZlcmxheTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBPdmVybGF5ID0gcmVxdWlyZSgnLi9PdmVybGF5LmpzJyk7XHJcbnZhciBMb2FkaW5nT3ZlcmxheSA9IHJlcXVpcmUoJy4vTG9hZGluZ092ZXJsYXkuanMnKTtcclxudmFyIENyZWF0ZVJvb21PdmVybGF5ID0gcmVxdWlyZSgnLi9DcmVhdGVSb29tT3ZlcmxheS5qcycpO1xyXG52YXIgR2FtZU92ZXJPdmVybGF5ID0gcmVxdWlyZSgnLi9HYW1lT3Zlck92ZXJsYXkuanMnKTtcclxudmFyIExvYmJ5T3ZlcmxheSA9IHJlcXVpcmUoJy4vTG9iYnlPdmVybGF5LmpzJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIE92ZXJsYXkgOiBPdmVybGF5LFxyXG4gICAgTG9hZGluZ092ZXJsYXkgOiBMb2FkaW5nT3ZlcmxheSxcclxuICAgIENyZWF0ZVJvb21PdmVybGF5IDogQ3JlYXRlUm9vbU92ZXJsYXksXHJcbiAgICBHYW1lT3Zlck92ZXJsYXkgOiBHYW1lT3Zlck92ZXJsYXksXHJcbiAgICBMb2JieU92ZXJsYXkgOiBMb2JieU92ZXJsYXlcclxufTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBTY2VuZSA9IHdmbC5kaXNwbGF5LlNjZW5lO1xyXG52YXIgb3ZlcmxheXMgPSByZXF1aXJlKCcuLi9vdmVybGF5cycpO1xyXG52YXIgTmV0d29yayA9IHJlcXVpcmUoJy4uL25ldHdvcmsnKTtcclxuXHJcbnZhciBHYW1lT3ZlclNjZW5lID0gZnVuY3Rpb24gKGNhbnZhcywgcm9vbSkge1xyXG4gICAgU2NlbmUuY2FsbCh0aGlzLCBjYW52YXMpO1xyXG5cclxuICAgIHRoaXMucm9vbSA9IHJvb207XHJcblxyXG4gICAgJChOZXR3b3JrKS5vbihOZXR3b3JrLkV2ZW50LkdBTUVfT1ZFUl9EQVRBLCB0aGlzLl9vblVwZGF0ZVNjb3JlLmJpbmQodGhpcykpO1xyXG5cclxuICAgIGlmIChOZXR3b3JrLmlzSG9zdCgpKSB7XHJcbiAgICAgICAgTmV0d29yay5zb2NrZXQuZW1pdChOZXR3b3JrLkV2ZW50LkdBTUVfT1ZFUl9EQVRBLCByb29tLmlkKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmdhbWVPdmVyT3ZlcmxheSA9IG5ldyBvdmVybGF5cy5HYW1lT3Zlck92ZXJsYXkoKTtcclxuICAgICQoY2FudmFzKS5wYXJlbnQoKS5hcHBlbmQodGhpcy5nYW1lT3Zlck92ZXJsYXkuZG9tT2JqZWN0KTtcclxuXHJcbiAgICB0aGlzLmxvYWRpbmdPdmVybGF5ID0gbmV3IG92ZXJsYXlzLkxvYWRpbmdPdmVybGF5KCk7XHJcbiAgICAkKGNhbnZhcykucGFyZW50KCkuYXBwZW5kKHRoaXMubG9hZGluZ092ZXJsYXkuZG9tT2JqZWN0KTtcclxuXHJcbiAgICB0aGlzLmdhbWVPdmVyT3ZlcmxheS5yZXR1cm5Ub0xvYmJ5QnRuLmNsaWNrKHRoaXMuX29uUmV0dXJuVG9Mb2JieS5iaW5kKHRoaXMpKTtcclxufTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoR2FtZU92ZXJTY2VuZSwge1xyXG4gICAgRXZlbnQgOiB7XHJcbiAgICAgICAgdmFsdWUgOiB7XHJcbiAgICAgICAgICAgIFJFVFVSTl9UT19MT0JCWSA6IFwicmV0dXJuVG9Mb2JieVwiXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KTtcclxuR2FtZU92ZXJTY2VuZS5wcm90b3R5cGUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5jcmVhdGUoU2NlbmUucHJvdG90eXBlLCB7XHJcbiAgICBkZXN0cm95IDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLmdhbWVPdmVyT3ZlcmxheS5kb21PYmplY3QucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIHRoaXMubG9hZGluZ092ZXJsYXkuZG9tT2JqZWN0LnJlbW92ZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uVXBkYXRlU2NvcmUgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSwgZGF0YSkge1xyXG4gICAgICAgICAgICB0aGlzLmxvYWRpbmdPdmVybGF5LmRvbU9iamVjdC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgdGhpcy5nYW1lT3Zlck92ZXJsYXkucmVuZGVyU2NvcmUoZGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25SZXR1cm5Ub0xvYmJ5IDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgJCh0aGlzKS50cmlnZ2VyKFxyXG4gICAgICAgICAgICAgICAgR2FtZU92ZXJTY2VuZS5FdmVudC5SRVRVUk5fVE9fTE9CQlksXHJcbiAgICAgICAgICAgICAgICB0aGlzLnJvb21cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKTtcclxuT2JqZWN0LmZyZWV6ZShHYW1lT3ZlclNjZW5lKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR2FtZU92ZXJTY2VuZTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xyXG52YXIgQXNzZXRzID0gdXRpbC5Bc3NldHM7XHJcbnZhciBTY2VuZSA9IHdmbC5kaXNwbGF5LlNjZW5lO1xyXG52YXIgTmV0d29yayA9IHJlcXVpcmUoJy4uL25ldHdvcmsnKTtcclxudmFyIEdhbWVPYmplY3QgPSB3ZmwuY29yZS5lbnRpdGllcy5HYW1lT2JqZWN0O1xyXG52YXIgUGh5c2ljc09iamVjdCA9IHdmbC5jb3JlLmVudGl0aWVzLlBoeXNpY3NPYmplY3Q7XHJcbnZhciBlbnRpdGllcyA9IHJlcXVpcmUoJy4uL2VudGl0aWVzJyk7XHJcbnZhciBCdWxsZXQgPSBlbnRpdGllcy5CdWxsZXQ7XHJcbnZhciBDbGllbnRQbGF5ZXIgPSBlbnRpdGllcy5DbGllbnRQbGF5ZXI7XHJcbnZhciBQbGF5ZXIgPSBlbnRpdGllcy5QbGF5ZXI7XHJcbnZhciBsZXZlbHMgPSByZXF1aXJlKCcuLi9sZXZlbHMnKTtcclxudmFyIGJhY2tncm91bmRzID0gd2ZsLmRpc3BsYXkuYmFja2dyb3VuZHM7XHJcbnZhciBnZW9tID0gd2ZsLmdlb207XHJcblxyXG52YXIgR2FtZVNjZW5lID0gZnVuY3Rpb24gKGNhbnZhcywgcm9vbSkge1xyXG4gICAgU2NlbmUuY2FsbCh0aGlzLCBjYW52YXMsIHJvb20pO1xyXG5cclxuICAgIC8vIEFkZCBvdGhlciBjbGllbnRzIHRoYXQgYXJlIGFscmVhZHkgY29ubmVjdGVkXHJcbiAgICB2YXIgcm9vbSA9IE5ldHdvcmsucm9vbXNbcm9vbS5pZF07XHJcbiAgICB2YXIgcGxheWVycyA9IHJvb20ucGxheWVycztcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBsYXllcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgaWQgPSBwbGF5ZXJzW2ldO1xyXG4gICAgICAgIHZhciBjbGllbnQgPSBOZXR3b3JrLmNsaWVudHNbaWRdO1xyXG5cclxuICAgICAgICBpZiAoY2xpZW50ICE9PSBOZXR3b3JrLmxvY2FsQ2xpZW50KSB7XHJcbiAgICAgICAgICAgIHZhciBnYW1lT2JqZWN0ID0gbmV3IENsaWVudFBsYXllcihjbGllbnQuZGF0YS50ZWFtKTtcclxuICAgICAgICAgICAgY2xpZW50LmdhbWVPYmplY3QgPSBnYW1lT2JqZWN0O1xyXG4gICAgICAgICAgICBjbGllbnQuZ2FtZU9iamVjdC5jdXN0b21EYXRhLmNsaWVudElkID0gY2xpZW50LmRhdGEuaWQ7XHJcbiAgICAgICAgICAgIGNsaWVudC5nYW1lT2JqZWN0LnBvc2l0aW9uLnggPSBjbGllbnQuZGF0YS5wb3NpdGlvbi54O1xyXG4gICAgICAgICAgICBjbGllbnQuZ2FtZU9iamVjdC5wb3NpdGlvbi55ID0gY2xpZW50LmRhdGEucG9zaXRpb24ueTtcclxuICAgICAgICAgICAgY2xpZW50LmdhbWVPYmplY3Quc2V0Um90YXRpb24oY2xpZW50LmRhdGEucm90YXRpb24pO1xyXG4gICAgICAgICAgICB0aGlzLmFkZEdhbWVPYmplY3QoZ2FtZU9iamVjdCwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgICQoTmV0d29yaykub24oXHJcbiAgICAgICAgTmV0d29yay5FdmVudC5CVUxMRVQsXHJcbiAgICAgICAgdGhpcy5vbkJ1bGxldC5iaW5kKHRoaXMpXHJcbiAgICApO1xyXG5cclxuICAgICQoTmV0d29yaykub24oXHJcbiAgICAgICAgTmV0d29yay5FdmVudC5DTE9DS19USUNLLFxyXG4gICAgICAgIHRoaXMub25DbG9ja1RpY2suYmluZCh0aGlzKVxyXG4gICAgKTtcclxuXHJcbiAgICAkKE5ldHdvcmspLm9uKFxyXG4gICAgICAgIE5ldHdvcmsuRXZlbnQuQ09VTlRET1dOLFxyXG4gICAgICAgIHRoaXMub25Db3VudGRvd24uYmluZCh0aGlzKVxyXG4gICAgKTtcclxuXHJcbiAgICAkKE5ldHdvcmspLm9uKFxyXG4gICAgICAgIE5ldHdvcmsuRXZlbnQuUExBWUVSX0RFQVRILFxyXG4gICAgICAgIHRoaXMub25QbGF5ZXJEZWF0aC5iaW5kKHRoaXMpXHJcbiAgICApO1xyXG5cclxuICAgICQoTmV0d29yaykub24oXHJcbiAgICAgICAgTmV0d29yay5FdmVudC5QTEFZRVJfUkVTUEFXTixcclxuICAgICAgICB0aGlzLm9uUGxheWVyUmVzcGF3bi5iaW5kKHRoaXMpXHJcbiAgICApO1xyXG5cclxuICAgIC8vIFRPRE86IERlc2lnbiBsZXZlbHMgYmV0dGVyXHJcbiAgICBsZXZlbHMuTGV2ZWwxKHRoaXMpO1xyXG5cclxuICAgIHRoaXMudGltZVJlbWFpbmluZyA9IHJvb20udGltZVJlbWFpbmluZztcclxuICAgIHRoaXMuaW5pdGlhbENvdW50ZG93biA9IHJvb20uY291bnRkb3duO1xyXG4gICAgdGhpcy5jb3VudGluZ0Rvd24gPSB0cnVlO1xyXG4gICAgdGhpcy5yZXNwYXduVGltZSA9IHJvb20ucmVzcGF3blRpbWU7XHJcbiAgICB0aGlzLnJlc3Bhd25UaW1lUmVtYWluaW5nID0gdGhpcy5yZXNwYXduVGltZTtcclxuXHJcbiAgICB0aGlzLmJnID0gbmV3IGJhY2tncm91bmRzLlBhcmFsbGF4QmFja2dyb3VuZChcclxuICAgICAgICBBc3NldHMuZ2V0KEFzc2V0cy5CR19USUxFKVxyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzLnBsYXllciA9IG5ldyBQbGF5ZXIoTmV0d29yay5sb2NhbENsaWVudC5kYXRhLnRlYW0pO1xyXG4gICAgdGhpcy5wbGF5ZXIucG9zaXRpb24ueCA9IE5ldHdvcmsubG9jYWxDbGllbnQuZGF0YS5wb3NpdGlvbi54O1xyXG4gICAgdGhpcy5wbGF5ZXIucG9zaXRpb24ueSA9IE5ldHdvcmsubG9jYWxDbGllbnQuZGF0YS5wb3NpdGlvbi55O1xyXG4gICAgdGhpcy5wbGF5ZXIuc2V0Um90YXRpb24oTmV0d29yay5sb2NhbENsaWVudC5kYXRhLnJvdGF0aW9uKTtcclxuXHJcbiAgICBOZXR3b3JrLmxvY2FsQ2xpZW50LmdhbWVPYmplY3QgPSB0aGlzLnBsYXllcjtcclxuICAgIHRoaXMucGxheWVyLmN1c3RvbURhdGEuY2xpZW50SWQgPSBOZXR3b3JrLmxvY2FsQ2xpZW50LmRhdGEuaWQ7XHJcbiAgICB0aGlzLmFkZEdhbWVPYmplY3QodGhpcy5wbGF5ZXIsIDIpO1xyXG5cclxuICAgIHRoaXMuY2FtZXJhLmZvbGxvdyh0aGlzLnBsYXllcik7XHJcbiAgICB0aGlzLmNhbWVyYS5wb3NpdGlvbi54ID0gdGhpcy5wbGF5ZXIucG9zaXRpb24ueDtcclxuICAgIHRoaXMuY2FtZXJhLnBvc2l0aW9uLnkgPSB0aGlzLnBsYXllci5wb3NpdGlvbi55O1xyXG59O1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhHYW1lU2NlbmUsIHtcclxuICAgIEZSSUNUSU9OIDoge1xyXG4gICAgICAgIHZhbHVlIDogMC45MjVcclxuICAgIH0sXHJcblxyXG4gICAgTUlOSU1BUCA6IHtcclxuICAgICAgICB2YWx1ZSA6IE9iamVjdC5mcmVlemUoe1xyXG4gICAgICAgICAgICBXSURUSCAgICAgIDogMTUwLFxyXG4gICAgICAgICAgICBIRUlHSFQgICAgIDogMTAwLFxyXG4gICAgICAgICAgICBTQ0FMRSAgICAgIDogMC4xLFxyXG4gICAgICAgICAgICBGSUxMX1NUWUxFIDogXCIjMTkyNDI3XCJcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG59KTtcclxuR2FtZVNjZW5lLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShTY2VuZS5wcm90b3R5cGUsIHtcclxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlcyB0aGUgc2NlbmUgYW5kIGFsbCBnYW1lIG9iamVjdHMgaW4gaXRcclxuICAgICAqL1xyXG4gICAgdXBkYXRlIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGR0KSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNvdW50aW5nRG93biA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbml0aWFsQ291bnRkb3duIC09IGR0O1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChOZXR3b3JrLmlzSG9zdCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZW5kQ291bnRkb3duKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaW5pdGlhbENvdW50ZG93biA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb3VudGluZ0Rvd24gPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIFNjZW5lLnByb3RvdHlwZS51cGRhdGUuY2FsbCh0aGlzLCBkdCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy50aW1lUmVtYWluaW5nIC09IGR0O1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIE1ha2UgdGhlIGNhbWVyYSBmb2xsb3cgdGhlIGtpbGxlciBpZiB0aGUgcGxheWVyIHdhcyBraWxsZWRcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBsYXllci5oZWFsdGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9oYW5kbGVQbGF5ZXJEZWF0aChkdCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gT3RoZXJ3aXNlLCBhbGxvdyB0aGUgcGxheWVyIHRvIG1vdmVcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faGFuZGxlSW5wdXQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hcHBseUZyaWN0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZW1vdmVEZWFkR2FtZU9iamVjdHMoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoTmV0d29yay5pc0hvc3QoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VuZENsb2NrVGljaygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBzZW5kQ291bnRkb3duIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoTmV0d29yay5jb25uZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgIE5ldHdvcmsuc29ja2V0LmVtaXQoJ2NvdW50ZG93bicsIHtcclxuICAgICAgICAgICAgICAgICAgICBjb3VudGRvd24gOiB0aGlzLmluaXRpYWxDb3VudGRvd25cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBzZW5kQ2xvY2tUaWNrIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoTmV0d29yay5jb25uZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgIE5ldHdvcmsuc29ja2V0LmVtaXQoJ2Nsb2NrVGljaycsIHtcclxuICAgICAgICAgICAgICAgICAgICB0aW1lUmVtYWluaW5nIDogdGhpcy50aW1lUmVtYWluaW5nXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgc2VuZFBsYXllckRlYXRoIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoTmV0d29yay5jb25uZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgIE5ldHdvcmsuc29ja2V0LmVtaXQoJ3BsYXllckRlYXRoJywge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlYWQgOiB0aGlzLnBsYXllci5jdXN0b21EYXRhLmNsaWVudElkLFxyXG4gICAgICAgICAgICAgICAgICAgIGtpbGxlciA6IHRoaXMucGxheWVyLmN1c3RvbURhdGEua2lsbGVyLmN1c3RvbURhdGEuY2xpZW50SWRcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIERyYXdzIHRoZSBzY2VuZSBhbmQgYWxsIGdhbWUgb2JqZWN0cyBpbiBpdFxyXG4gICAgICovXHJcbiAgICBkcmF3IDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGN0eCkge1xyXG4gICAgICAgICAgICBTY2VuZS5wcm90b3R5cGUuZHJhdy5jYWxsKHRoaXMsIGN0eCk7XHJcblxyXG4gICAgICAgICAgICBjdHguc2F2ZSgpO1xyXG5cclxuICAgICAgICAgICAgdmFyIHNjcmVlbldpZHRoICA9IGN0eC5jYW52YXMud2lkdGg7XHJcbiAgICAgICAgICAgIHZhciBzY3JlZW5IZWlnaHQgPSBjdHguY2FudmFzLmhlaWdodDtcclxuICAgICAgICAgICAgdmFyIG9mZnNldCAgICAgICA9IG5ldyBnZW9tLlZlYzIoXHJcbiAgICAgICAgICAgICAgICBzY3JlZW5XaWR0aCAgKiAwLjUsXHJcbiAgICAgICAgICAgICAgICBzY3JlZW5IZWlnaHQgKiAwLjVcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSBcIiNmZmZcIjtcclxuICAgICAgICAgICAgY3R4LmZvbnQgPSBcIjI0cHggTXVucm9cIjtcclxuXHJcbiAgICAgICAgICAgIC8vIFNob3cgdGhlIHJlbWFpbmluZyBkdXJhdGlvbiBvZiB0aGUgZ2FtZVxyXG4gICAgICAgICAgICB2YXIgdGltZVRleHQ7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnRpbWVSZW1haW5pbmcgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWludXRlcyA9IE1hdGguZmxvb3IoKHRoaXMudGltZVJlbWFpbmluZykgLyAoMTAwMCAqIDYwKSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2Vjb25kcyA9IE1hdGguZmxvb3IoKHRoaXMudGltZVJlbWFpbmluZyAtIG1pbnV0ZXMgKiAxMDAwICogNjApIC8gMTAwMCk7XHJcbiAgICAgICAgICAgICAgICB0aW1lVGV4dCA9IG1pbnV0ZXMgKyBcIjpcIjtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoc2Vjb25kcyA8IDEwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGltZVRleHQgKz0gXCIwXCI7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGltZVRleHQgKz0gc2Vjb25kcztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRpbWVUZXh0ID0gXCIwOjAwXCI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnRpbWVSZW1haW5pbmcgPCAxMDAwICogMTApIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnRpbWVSZW1haW5pbmcgJSA1MDAgPCAyNTApIHtcclxuICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2IoMjU1LCA3OSwgNzkpXCI7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMCwgMCwgMCwgMClcIjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGN0eC5mb250ID0gXCIzMHB4IE11bnJvXCI7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy50aW1lUmVtYWluaW5nIDwgMTAwMCAqIDMwKSB7XHJcbiAgICAgICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2IoMjQxLCAyMDgsIDkyKVwiO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjdHgudHJhbnNsYXRlKG9mZnNldC54LCAwKTtcclxuICAgICAgICAgICAgY3R4LnRleHRBbGlnbiA9IFwiY2VudGVyXCI7XHJcbiAgICAgICAgICAgIGN0eC50ZXh0QmFzZWxpbmUgPSBcInRvcFwiO1xyXG4gICAgICAgICAgICBjdHguZmlsbFRleHQodGltZVRleHQsIDAsIDApO1xyXG5cclxuICAgICAgICAgICAgLy8gU2hvdyB0aGUgaW5pdGlhbCBjb3VudGRvd24gYmVmb3JlIHRoZSBnYW1lXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmluaXRpYWxDb3VudGRvd24gPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY291bnRkb3duU2Vjb25kcyA9IE1hdGgucm91bmQodGhpcy5pbml0aWFsQ291bnRkb3duIC8gMTAwMCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgY291bnRkb3duVGV4dCA9IGNvdW50ZG93blNlY29uZHMudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSBcIiNmZmZcIjtcclxuXHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGNvdW50ZG93blNlY29uZHMpIHtcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDU6XHJcbiAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiKDI1NSwgNzksIDc5KVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgNDpcclxuICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2IoMjQ3LCAxNTUsIDg3KVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2IoMjQxLCAyMDgsIDkyKVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2IoMjE1LCAyMzUsIDk5KVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2IoMTMyLCAyMzEsIDEwMylcIjtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlIDA6XHJcbiAgICAgICAgICAgICAgICAgICAgY291bnRkb3duVGV4dCA9IFwiRklHSFRcIjtcclxuICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gXCIjZmZmXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgY3R4LnRyYW5zbGF0ZSgwLCBvZmZzZXQueSk7XHJcbiAgICAgICAgICAgICAgICBjdHgudGV4dEFsaWduID0gXCJjZW50ZXJcIjtcclxuICAgICAgICAgICAgICAgIGN0eC50ZXh0QmFzZWxpbmUgPSBcIm1pZGRsZVwiO1xyXG4gICAgICAgICAgICAgICAgY3R4LmZvbnQgPSBcIjk2cHggTXVucm9cIjtcclxuICAgICAgICAgICAgICAgIGN0eC5maWxsVGV4dChjb3VudGRvd25UZXh0LCAwLCAwKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY3R4LnJlc3RvcmUoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIERyYXcgSFBcclxuICAgICAgICAgICAgY3R4LnNhdmUoKTtcclxuXHJcbiAgICAgICAgICAgIGN0eC50cmFuc2xhdGUoNCwgNCk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucGxheWVyLm1heEhlYWx0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZ3JhcGhpYztcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBsYXllci5oZWFsdGggPiBpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ3JhcGhpYyA9IEFzc2V0cy5nZXQoQXNzZXRzLkhQX0ZVTEwpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBncmFwaGljID0gQXNzZXRzLmdldChBc3NldHMuSFBfRU1QVFkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoZ3JhcGhpYywgMCwgMCk7XHJcbiAgICAgICAgICAgICAgICBjdHgudHJhbnNsYXRlKDI0LCAwKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY3R4LnJlc3RvcmUoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIERyYXcgUmVzcGF3biBtZXNzYWdlIGlmIG5lY2Vzc2FyeVxyXG4gICAgICAgICAgICBpZiAodGhpcy5wbGF5ZXIuaGVhbHRoIDw9IDApIHtcclxuICAgICAgICAgICAgICAgIGN0eC5zYXZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIHJlc3Bhd25UaW1lUmVtYWluaW5nID0gTWF0aC5yb3VuZCh0aGlzLnJlc3Bhd25UaW1lUmVtYWluaW5nIC8gMTAwMCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgcmVzcGF3bk1lc3NhZ2UgPSBcIlJlc3Bhd24gaW4gXCIgKyByZXNwYXduVGltZVJlbWFpbmluZy50b1N0cmluZygpICsgXCIgc2Vjb25kc1wiO1xyXG5cclxuICAgICAgICAgICAgICAgIGN0eC50cmFuc2xhdGUob2Zmc2V0LngsIG9mZnNldC55KTtcclxuICAgICAgICAgICAgICAgIGN0eC50ZXh0QWxpZ24gPSBcImNlbnRlclwiO1xyXG4gICAgICAgICAgICAgICAgY3R4LnRleHRCYXNlbGluZSA9IFwibWlkZGxlXCI7XHJcbiAgICAgICAgICAgICAgICBjdHguZm9udCA9IFwiNDhweCBNdW5yb1wiO1xyXG4gICAgICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwiI2ZmZlwiO1xyXG4gICAgICAgICAgICAgICAgY3R4LmZpbGxUZXh0KHJlc3Bhd25NZXNzYWdlLCAwLCAwKTtcclxuXHJcbiAgICAgICAgICAgICAgICBjdHgucmVzdG9yZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBvbkNvdW50ZG93biA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlLCBkYXRhKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5pdGlhbENvdW50ZG93biA9IGRhdGEuY291bnRkb3duO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgb25DbG9ja1RpY2sgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSwgZGF0YSkge1xyXG4gICAgICAgICAgICB0aGlzLnRpbWVSZW1haW5pbmcgPSBwYXJzZUludChkYXRhLnRpbWVSZW1haW5pbmcpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgb25CdWxsZXQgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSwgZGF0YSkge1xyXG4gICAgICAgICAgICB2YXIgcm90YXRpb24gPSBQaHlzaWNzT2JqZWN0LnByb3RvdHlwZS5nZXREaXNwbGF5QW5nbGUoZGF0YS5yb3RhdGlvbik7XHJcbiAgICAgICAgICAgIHZhciBmb3J3YXJkID0gZ2VvbS5WZWMyLmZyb21BbmdsZShyb3RhdGlvbik7XHJcbiAgICAgICAgICAgIHZhciBwbGF5ZXIgPSBOZXR3b3JrLmNsaWVudHNbZGF0YS5wbGF5ZXJJZF0uZ2FtZU9iamVjdDtcclxuICAgICAgICAgICAgdmFyIGJ1bGxldCA9IG5ldyBCdWxsZXQoMSwgcGxheWVyKTtcclxuICAgICAgICAgICAgYnVsbGV0LnBvc2l0aW9uLnggPSBkYXRhLnBvc2l0aW9uLng7XHJcbiAgICAgICAgICAgIGJ1bGxldC5wb3NpdGlvbi55ID0gZGF0YS5wb3NpdGlvbi55O1xyXG4gICAgICAgICAgICBidWxsZXQudmVsb2NpdHkueCA9IGZvcndhcmQueDtcclxuICAgICAgICAgICAgYnVsbGV0LnZlbG9jaXR5LnkgPSBmb3J3YXJkLnk7XHJcbiAgICAgICAgICAgIGJ1bGxldC5yb3RhdGUocm90YXRpb24pO1xyXG4gICAgICAgICAgICBidWxsZXQudmVsb2NpdHkubXVsdGlwbHkoQnVsbGV0LkRFRkFVTFRfU1BFRUQpO1xyXG4gICAgICAgICAgICBidWxsZXQudmVsb2NpdHkueCArPSBkYXRhLnZlbG9jaXR5Lng7XHJcbiAgICAgICAgICAgIGJ1bGxldC52ZWxvY2l0eS55ICs9IGRhdGEudmVsb2NpdHkueTtcclxuXHJcbiAgICAgICAgICAgIGlmIChidWxsZXQudmVsb2NpdHkuZ2V0TWFnbml0dWRlU3F1YXJlZCgpIDwgQnVsbGV0LkRFRkFVTFRfU1BFRUQgKiBCdWxsZXQuREVGQVVMVF9TUEVFRCkge1xyXG4gICAgICAgICAgICAgICAgYnVsbGV0LnZlbG9jaXR5LnNldE1hZ25pdHVkZShCdWxsZXQuREVGQVVMVF9TUEVFRCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuYWRkR2FtZU9iamVjdChidWxsZXQsIDEpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgb25QbGF5ZXJEZWF0aCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlLCBkYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciBwbGF5ZXIgPSBOZXR3b3JrLmNsaWVudHNbZGF0YS5kZWFkXS5nYW1lT2JqZWN0O1xyXG4gICAgICAgICAgICBwbGF5ZXIuc29saWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgcGxheWVyLnNldFN0YXRlKFBsYXllci5TVEFURS5FWFBMT1NJT04pO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgb25QbGF5ZXJSZXNwYXduIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUsIGRhdGEpIHtcclxuICAgICAgICAgICAgdmFyIHBsYXllciA9IE5ldHdvcmsuY2xpZW50c1tkYXRhLnJlc3Bhd25dLmdhbWVPYmplY3Q7XHJcbiAgICAgICAgICAgIHBsYXllci5zZXRTdGF0ZShHYW1lT2JqZWN0LlNUQVRFLkRFRkFVTFQpO1xyXG4gICAgICAgICAgICBwbGF5ZXIuaGVhbHRoID0gcGxheWVyLm1heEhlYWx0aDtcclxuICAgICAgICAgICAgcGxheWVyLnNvbGlkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIC8vIElmIHRoaXMgY2xpZW50J3MgcGxheWVyIGlzIHJlc3Bhd25pbmcsIHRoZW4gbWFrZSB0aGUgY2FtZXJhXHJcbiAgICAgICAgICAgIC8vIHN0YXJ0IGZvbGxvd2luZyBpdCBhZ2FpblxyXG4gICAgICAgICAgICBpZiAocGxheWVyID09PSB0aGlzLnBsYXllcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jYW1lcmEuZm9sbG93KHBsYXllcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9oYW5kbGVJbnB1dCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHBsYXllciAgICAgICA9IHRoaXMucGxheWVyO1xyXG4gICAgICAgICAgICB2YXIga2V5Ym9hcmQgICAgID0gdGhpcy5rZXlib2FyZDtcclxuICAgICAgICAgICAgdmFyIGxlZnRQcmVzc2VkICA9IGtleWJvYXJkLmlzUHJlc3NlZChrZXlib2FyZC5MRUZUKTtcclxuICAgICAgICAgICAgdmFyIHJpZ2h0UHJlc3NlZCA9IGtleWJvYXJkLmlzUHJlc3NlZChrZXlib2FyZC5SSUdIVCk7XHJcbiAgICAgICAgICAgIHZhciB1cFByZXNzZWQgICAgPSBrZXlib2FyZC5pc1ByZXNzZWQoa2V5Ym9hcmQuVVApO1xyXG4gICAgICAgICAgICB2YXIgZG93blByZXNzZWQgID0ga2V5Ym9hcmQuaXNQcmVzc2VkKGtleWJvYXJkLkRPV04pO1xyXG4gICAgICAgICAgICB2YXIgc2hvb3RpbmcgICAgID0ga2V5Ym9hcmQuaXNQcmVzc2VkKGtleWJvYXJkLlopO1xyXG5cclxuICAgICAgICAgICAgLy8gTGVmdC8gUmlnaHQgS2V5IC0tIFBsYXllciB0dXJuc1xyXG4gICAgICAgICAgICBpZiAobGVmdFByZXNzZWQgfHwgcmlnaHRQcmVzc2VkKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcm90YXRpb24gPSAwO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChsZWZ0UHJlc3NlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJvdGF0aW9uIC09IFBsYXllci5UVVJOX1NQRUVEO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChyaWdodFByZXNzZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICByb3RhdGlvbiArPSBQbGF5ZXIuVFVSTl9TUEVFRDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIucm90YXRlKHJvdGF0aW9uKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gVXAgS2V5IC0tIFBsYXllciBnb2VzIGZvcndhcmRcclxuICAgICAgICAgICAgaWYgKHVwUHJlc3NlZCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG1vdmVtZW50Rm9yY2UgPSBnZW9tLlZlYzIuZnJvbUFuZ2xlKHBsYXllci5nZXRSb3RhdGlvbigpKTtcclxuICAgICAgICAgICAgICAgIG1vdmVtZW50Rm9yY2UubXVsdGlwbHkoXHJcbiAgICAgICAgICAgICAgICAgICAgUGxheWVyLkJPT1NUX0FDQ0VMRVJBVElPTiAqIHBsYXllci5tYXNzXHJcbiAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgIHBsYXllci5hZGRGb3JjZShtb3ZlbWVudEZvcmNlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gRG93biBLZXkgLS0gQXBwbHkgYnJha2VzIHRvIHBsYXllclxyXG4gICAgICAgICAgICBpZiAoZG93blByZXNzZWQpIHtcclxuICAgICAgICAgICAgICAgIHBsYXllci52ZWxvY2l0eS5tdWx0aXBseShQbGF5ZXIuQlJBS0VfUkFURSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChzaG9vdGluZykge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLnNob290KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9oYW5kbGVQbGF5ZXJEZWF0aCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChkdCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wbGF5ZXIuY3VzdG9tRGF0YS5raWxsZXIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VuZFBsYXllckRlYXRoKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jYW1lcmEuZm9sbG93KHRoaXMucGxheWVyLmN1c3RvbURhdGEua2lsbGVyKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllci5jdXN0b21EYXRhLmtpbGxlciA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIHRoaXMucGxheWVyLnNldFN0YXRlKFBsYXllci5TVEFURS5FWFBMT1NJT04pO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMucmVzcGF3blRpbWVSZW1haW5pbmcgPSB0aGlzLnJlc3Bhd25UaW1lO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLnJlc3Bhd25UaW1lUmVtYWluaW5nIC09IGR0O1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX2FwcGx5RnJpY3Rpb24gOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBnYW1lT2JqZWN0cyA9IHRoaXMuZ2V0R2FtZU9iamVjdHMoKTtcclxuXHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ2FtZU9iamVjdHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciBvYmogPSBnYW1lT2JqZWN0c1tpXTtcclxuICAgICAgICAgICAgICAgIGlmICghb2JqLmN1c3RvbURhdGEuaWdub3JlRnJpY3Rpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBvYmouYWNjZWxlcmF0aW9uLm11bHRpcGx5KEdhbWVTY2VuZS5GUklDVElPTik7XHJcbiAgICAgICAgICAgICAgICAgICAgb2JqLnZlbG9jaXR5Lm11bHRpcGx5KEdhbWVTY2VuZS5GUklDVElPTik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9yZW1vdmVEZWFkR2FtZU9iamVjdHMgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBnYW1lT2JqZWN0cyA9IHRoaXMuZ2V0R2FtZU9iamVjdHMoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEdvIHRocm91Z2ggYWxsIGdhbWUgb2JqZWN0cyBhbmQgcmVtb3ZlIGFueSB0aGF0IGhhdmUgYmVlblxyXG4gICAgICAgICAgICAvLyBmbGFnZ2VkIGZvciByZW1vdmFsXHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSBnYW1lT2JqZWN0cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG9iaiA9IGdhbWVPYmplY3RzW2ldO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChvYmouY3VzdG9tRGF0YS5yZW1vdmVkID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVHYW1lT2JqZWN0KG9iaik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR2FtZVNjZW5lOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIFNjZW5lID0gd2ZsLmRpc3BsYXkuU2NlbmU7XHJcbnZhciBvdmVybGF5cyA9IHJlcXVpcmUoJy4uL292ZXJsYXlzJyk7XHJcbnZhciBOZXR3b3JrID0gcmVxdWlyZSgnLi4vbmV0d29yaycpO1xyXG5cclxudmFyIEdhbWVTdGFydFNjZW5lID0gZnVuY3Rpb24gKGNhbnZhcywgcm9vbSkge1xyXG4gICAgU2NlbmUuY2FsbCh0aGlzLCBjYW52YXMpO1xyXG5cclxuICAgIHRoaXMucm9vbSA9IHJvb207XHJcblxyXG4gICAgJChOZXR3b3JrKS5vbihOZXR3b3JrLkV2ZW50LkdBTUVfU1RBUlRfREFUQSwgdGhpcy5fb25HZXRTdGFydERhdGEuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgaWYgKE5ldHdvcmsuaXNIb3N0KCkpIHtcclxuICAgICAgICBOZXR3b3JrLnNvY2tldC5lbWl0KE5ldHdvcmsuRXZlbnQuR0FNRV9TVEFSVF9EQVRBLCByb29tLmlkKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmxvYWRpbmdPdmVybGF5ID0gbmV3IG92ZXJsYXlzLkxvYWRpbmdPdmVybGF5KCk7XHJcbiAgICAkKGNhbnZhcykucGFyZW50KCkuYXBwZW5kKHRoaXMubG9hZGluZ092ZXJsYXkuZG9tT2JqZWN0KTtcclxufTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoR2FtZVN0YXJ0U2NlbmUsIHtcclxuICAgIEV2ZW50IDoge1xyXG4gICAgICAgIHZhbHVlIDoge1xyXG4gICAgICAgICAgICBTVEFSVF9HQU1FIDogXCJzdGFydEdhbWVcIlxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcbkdhbWVTdGFydFNjZW5lLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShTY2VuZS5wcm90b3R5cGUsIHtcclxuICAgIGRlc3Ryb3kgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9hZGluZ092ZXJsYXkuZG9tT2JqZWN0LnJlbW92ZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uR2V0U3RhcnREYXRhIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUsIGRhdGEpIHtcclxuICAgICAgICAgICAgdmFyIHRlYW1BID0gZGF0YS50ZWFtQTtcclxuICAgICAgICAgICAgdmFyIHRlYW1CID0gZGF0YS50ZWFtQjtcclxuXHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGVhbUEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciByZWYgPSB0ZWFtQVtpXTtcclxuICAgICAgICAgICAgICAgIE5ldHdvcmsuY2xpZW50c1tyZWYuaWRdLmRhdGEgPSByZWY7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGVhbUIubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciByZWYgPSB0ZWFtQltpXTtcclxuICAgICAgICAgICAgICAgIE5ldHdvcmsuY2xpZW50c1tyZWYuaWRdLmRhdGEgPSByZWY7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICQodGhpcykudHJpZ2dlcihcclxuICAgICAgICAgICAgICAgIEdhbWVTdGFydFNjZW5lLkV2ZW50LlNUQVJUX0dBTUUsXHJcbiAgICAgICAgICAgICAgICB0aGlzLnJvb21cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKTtcclxuT2JqZWN0LmZyZWV6ZShHYW1lU3RhcnRTY2VuZSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVTdGFydFNjZW5lOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIFNjZW5lID0gd2ZsLmRpc3BsYXkuU2NlbmU7XHJcbnZhciBvdmVybGF5cyA9IHJlcXVpcmUoJy4uL292ZXJsYXlzJyk7XHJcblxyXG52YXIgTG9hZGluZ1NjZW5lID0gZnVuY3Rpb24gKGNhbnZhcykge1xyXG4gICAgU2NlbmUuY2FsbCh0aGlzLCBjYW52YXMpO1xyXG4gICAgXHJcbiAgICB0aGlzLmxvYWRpbmdPdmVybGF5ID0gbmV3IG92ZXJsYXlzLkxvYWRpbmdPdmVybGF5KCk7XHJcbiAgICAkKGNhbnZhcykucGFyZW50KCkuYXBwZW5kKHRoaXMubG9hZGluZ092ZXJsYXkuZG9tT2JqZWN0KTtcclxufTtcclxuTG9hZGluZ1NjZW5lLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShTY2VuZS5wcm90b3R5cGUsIHtcclxuICAgIGRlc3Ryb3kgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9hZGluZ092ZXJsYXkuZG9tT2JqZWN0LnJlbW92ZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBMb2FkaW5nU2NlbmU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgU2NlbmUgPSB3ZmwuZGlzcGxheS5TY2VuZTtcclxudmFyIG92ZXJsYXlzID0gcmVxdWlyZSgnLi4vb3ZlcmxheXMnKTtcclxudmFyIE5ldHdvcmsgPSByZXF1aXJlKCcuLi9uZXR3b3JrJyk7XHJcblxyXG52YXIgTG9iYnlTY2VuZSA9IGZ1bmN0aW9uIChjYW52YXMpIHtcclxuICAgIFNjZW5lLmNhbGwodGhpcywgY2FudmFzKTtcclxuXHJcbiAgICB0aGlzLmN1clJvb21JZCA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICB0aGlzLmxvYmJ5T3ZlcmxheSA9IG5ldyBvdmVybGF5cy5Mb2JieU92ZXJsYXkoKTtcclxuICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkgPSBuZXcgb3ZlcmxheXMuQ3JlYXRlUm9vbU92ZXJsYXkoKTtcclxuICAgICQoY2FudmFzKS5wYXJlbnQoKS5hcHBlbmQodGhpcy5sb2JieU92ZXJsYXkuZG9tT2JqZWN0KTtcclxuICAgICQoY2FudmFzKS5wYXJlbnQoKS5hcHBlbmQodGhpcy5jcmVhdGVSb29tT3ZlcmxheS5kb21PYmplY3QpO1xyXG5cclxuICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuZG9tT2JqZWN0LmhpZGUoKTtcclxuXHJcbiAgICB0aGlzLmxvYmJ5T3ZlcmxheS5sZWF2ZVJvb21CdG4uY2xpY2sodGhpcy5fb25MZWF2ZVJvb21CdXR0b25DbGljay5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMubG9iYnlPdmVybGF5LnJlYWR5QnRuLmNsaWNrKHRoaXMuX29uUmVhZHlCdXR0b25DbGljay5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMubG9iYnlPdmVybGF5LnN3aXRjaFRlYW1CdG4uY2xpY2sodGhpcy5fb25Td2l0Y2hUZWFtQnV0dG9uQ2xpY2suYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLmxvYmJ5T3ZlcmxheS5jcmVhdGVSb29tQnRuLmNsaWNrKHRoaXMuX29uQ3JlYXRlUm9vbUJ1dHRvbkNsaWNrLmJpbmQodGhpcykpO1xyXG5cclxuICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuY2FuY2VsQnRuLmNsaWNrKHRoaXMuX29uQ3JlYXRlUm9vbUNhbmNlbC5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuY3JlYXRlQnRuLmNsaWNrKHRoaXMuX29uQ3JlYXRlUm9vbS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAkKHRoaXMubG9iYnlPdmVybGF5KS5vbihvdmVybGF5cy5Mb2JieU92ZXJsYXkuRXZlbnQuRU5URVJfUk9PTSwgdGhpcy5fb25FbnRlclJvb21BdHRlbXB0LmJpbmQodGhpcykpO1xyXG5cclxuICAgICQoTmV0d29yaykub24oTmV0d29yay5FdmVudC5VUERBVEVfUk9PTVMsIHRoaXMuX29uVXBkYXRlUm9vbUxpc3QuYmluZCh0aGlzKSk7XHJcbiAgICAkKE5ldHdvcmspLm9uKE5ldHdvcmsuRXZlbnQuRU5URVJfUk9PTV9TVUNDRVNTLCB0aGlzLl9vbkVudGVyUm9vbVN1Y2Nlc3MuYmluZCh0aGlzKSk7XHJcbiAgICAkKE5ldHdvcmspLm9uKE5ldHdvcmsuRXZlbnQuRU5URVJfUk9PTV9GQUlMLCB0aGlzLl9vbkVudGVyUm9vbUZhaWwuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgdGhpcy5yb29tVXBkYXRlSW50ZXJ2YWwgPVxyXG4gICAgICAgIHNldEludGVydmFsKHRoaXMudXBkYXRlUm9vbUxpc3QuYmluZCh0aGlzKSwgTG9iYnlTY2VuZS5ST09NX1VQREFURV9GUkVRVUVOQ1kpO1xyXG5cclxuICAgIHRoaXMudXBkYXRlUm9vbUxpc3QoKTtcclxufTtcclxuXHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKExvYmJ5U2NlbmUsIHtcclxuICAgIFJPT01fVVBEQVRFX0ZSRVFVRU5DWSA6IHtcclxuICAgICAgICB2YWx1ZSA6IDUwMDBcclxuICAgIH0sXHJcblxyXG4gICAgRXZlbnQgOiB7XHJcbiAgICAgICAgdmFsdWUgOiB7XHJcbiAgICAgICAgICAgIFRPR0dMRV9SRUFEWSA6IFwidG9nZ2xlUmVhZHlcIlxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcblxyXG5Mb2JieVNjZW5lLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmNyZWF0ZShTY2VuZS5wcm90b3R5cGUsIHtcclxuICAgIGRlc3Ryb3kgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9iYnlPdmVybGF5LmRvbU9iamVjdC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5kb21PYmplY3QucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuaW5wdXRGaWVsZC5vZmYoXCJrZXlwcmVzc1wiKTtcclxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLnJvb21VcGRhdGVJbnRlcnZhbCk7XHJcbiAgICAgICAgICAgICQoTmV0d29yaykub2ZmKE5ldHdvcmsuRXZlbnQuVVBEQVRFX1JPT01TKTtcclxuICAgICAgICAgICAgJChOZXR3b3JrKS5vZmYoTmV0d29yay5FdmVudC5FTlRFUl9ST09NX1NVQ0NFU1MpO1xyXG4gICAgICAgICAgICAkKE5ldHdvcmspLm9mZihOZXR3b3JrLkV2ZW50LkVOVEVSX1JPT01fRkFJTCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICB1cGRhdGVSb29tTGlzdCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgTmV0d29yay5nZXRSb29tcygpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uTGVhdmVSb29tQnV0dG9uQ2xpY2sgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBOZXR3b3JrLmxlYXZlUm9vbSh0aGlzLmN1clJvb21JZCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VyUm9vbUlkID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uUmVhZHlCdXR0b25DbGljayA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIHZhciBjbGllbnRXaWxsQmVSZWFkeSA9ICFOZXR3b3JrLmxvY2FsQ2xpZW50LmRhdGEucmVhZHk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmxvYmJ5T3ZlcmxheS5zd2l0Y2hUZWFtQnRuLnByb3AoXCJkaXNhYmxlZFwiLCBjbGllbnRXaWxsQmVSZWFkeSk7XHJcblxyXG4gICAgICAgICAgICBOZXR3b3JrLnNvY2tldC5lbWl0KCd1cGRhdGVSZWFkeScsIHtcclxuICAgICAgICAgICAgICAgIHJlYWR5IDogY2xpZW50V2lsbEJlUmVhZHlcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25DcmVhdGVSb29tQnV0dG9uQ2xpY2sgOiB7XHJcbiAgICAgICAgdmFsdWUgOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmlucHV0RmllbGQub2ZmKFwia2V5cHJlc3NcIik7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmlucHV0RmllbGQudmFsKFwiXCIpO1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmRvbU9iamVjdC5yZW1vdmVDbGFzcyhcImZhZGUtaW5cIik7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuZG9tT2JqZWN0LnNob3coKTtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5kb21PYmplY3QuYWRkQ2xhc3MoXCJmYWRlLWluXCIpO1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVJvb21PdmVybGF5LmlucHV0RmllbGQuZm9jdXMoKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuaW5wdXRGaWVsZC5vbihcImtleXByZXNzXCIsIHRoaXMuX29uQ3JlYXRlUm9vbUtleVByZXNzLmJpbmQodGhpcykpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uQ3JlYXRlUm9vbUtleVByZXNzIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMTMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX29uQ3JlYXRlUm9vbSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25DcmVhdGVSb29tQ2FuY2VsIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5kb21PYmplY3QuaGlkZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uQ3JlYXRlUm9vbSA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIHZhciBuYW1lID0gdGhpcy5jcmVhdGVSb29tT3ZlcmxheS5pbnB1dEZpZWxkLnZhbCgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKG5hbWUgIT09IFwiXCIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlUm9vbU92ZXJsYXkuZG9tT2JqZWN0LmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIE5ldHdvcmsuY3JlYXRlUm9vbShuYW1lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uU3dpdGNoVGVhbUJ1dHRvbkNsaWNrIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgTmV0d29yay5zd2l0Y2hUZWFtKHRoaXMuY3VyUm9vbUlkKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vblVwZGF0ZVJvb21MaXN0IDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUsIGRhdGEpIHtcclxuICAgICAgICAgICAgdGhpcy5sb2JieU92ZXJsYXkuc2hvd1Jvb21zKGRhdGEpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuY3VyUm9vbUlkICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9iYnlPdmVybGF5LnJlbmRlclJvb20oZGF0YVt0aGlzLmN1clJvb21JZF0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2JieU92ZXJsYXkucmVuZGVyUm9vbSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25FbnRlclJvb21BdHRlbXB0IDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUsIGRhdGEpIHtcclxuICAgICAgICAgICAgTmV0d29yay5lbnRlclJvb20oZGF0YS5pZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25FbnRlclJvb21TdWNjZXNzIDoge1xyXG4gICAgICAgIHZhbHVlIDogZnVuY3Rpb24gKGUsIGRhdGEpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJSb29tSWQgPSBkYXRhLmlkO1xyXG4gICAgICAgICAgICB0aGlzLmxvYmJ5T3ZlcmxheS5yZW5kZXJSb29tKGRhdGEpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX29uRW50ZXJSb29tRmFpbCA6IHtcclxuICAgICAgICB2YWx1ZSA6IGZ1bmN0aW9uIChlLCBkYXRhKSB7XHJcbiAgICAgICAgICAgIGFsZXJ0KGRhdGEubXNnKTtcclxuICAgICAgICAgICAgdGhpcy5jdXJSb29tSWQgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIHRoaXMubG9iYnlPdmVybGF5LnJlbmRlclJvb20odW5kZWZpbmVkKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKTtcclxuXHJcbk9iamVjdC5mcmVlemUoTG9iYnlTY2VuZSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IExvYmJ5U2NlbmU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgTG9hZGluZ1NjZW5lID0gcmVxdWlyZSgnLi9Mb2FkaW5nU2NlbmUuanMnKTtcclxudmFyIExvYmJ5U2NlbmUgPSByZXF1aXJlKCcuL0xvYmJ5U2NlbmUuanMnKTtcclxudmFyIEdhbWVTdGFydFNjZW5lID0gcmVxdWlyZSgnLi9HYW1lU3RhcnRTY2VuZS5qcycpO1xyXG52YXIgR2FtZU92ZXJTY2VuZSA9IHJlcXVpcmUoJy4vR2FtZU92ZXJTY2VuZS5qcycpO1xyXG52YXIgR2FtZVNjZW5lID0gcmVxdWlyZSgnLi9HYW1lU2NlbmUuanMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgTG9hZGluZ1NjZW5lICAgOiBMb2FkaW5nU2NlbmUsXHJcbiAgICBMb2JieVNjZW5lICAgICA6IExvYmJ5U2NlbmUsXHJcbiAgICBHYW1lU3RhcnRTY2VuZSA6IEdhbWVTdGFydFNjZW5lLFxyXG4gICAgR2FtZU92ZXJTY2VuZSAgOiBHYW1lT3ZlclNjZW5lLFxyXG4gICAgR2FtZVNjZW5lICAgICAgOiBHYW1lU2NlbmVcclxufTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgQkdfVElMRSAgICAgICA6IFwiLi9hc3NldHMvaW1nL0JHLXRpbGUxLnBuZ1wiLFxyXG4gICAgQkxPQ0tfRlVMTCAgICA6IFwiLi9hc3NldHMvaW1nL0Jsb2NrRnVsbC5wbmdcIixcclxuICAgIEJMT0NLX0hBTEYgICAgOiBcIi4vYXNzZXRzL2ltZy9CbG9ja0hhbGYucG5nXCIsXHJcbiAgICBTSElQXzEgICAgICAgIDogXCIuL2Fzc2V0cy9pbWcvT3RoZXJTaGlwLnBuZ1wiLFxyXG4gICAgU0hJUF8yICAgICAgICA6IFwiLi9hc3NldHMvaW1nL1NoaXAucG5nXCIsXHJcbiAgICBXRUFLX0JVTExFVF8xIDogXCIuL2Fzc2V0cy9pbWcvQnVsbGV0V2Vha19hLnBuZ1wiLFxyXG4gICAgV0VBS19CVUxMRVRfMiA6IFwiLi9hc3NldHMvaW1nL0J1bGxldFdlYWtfYi5wbmdcIixcclxuICAgIFdFQUtfQlVMTEVUXzMgOiBcIi4vYXNzZXRzL2ltZy9CdWxsZXRXZWFrX2MucG5nXCIsXHJcbiAgICBXRUFLX0JVTExFVF80IDogXCIuL2Fzc2V0cy9pbWcvQnVsbGV0V2Vha19kLnBuZ1wiLFxyXG4gICAgRVhQTE9TSU9OX0FfMSA6IFwiLi9hc3NldHMvaW1nL090aGVyRXhwbG9zaW9uMS5wbmdcIixcclxuICAgIEVYUExPU0lPTl9BXzIgOiBcIi4vYXNzZXRzL2ltZy9PdGhlckV4cGxvc2lvbjIucG5nXCIsXHJcbiAgICBFWFBMT1NJT05fQV8zIDogXCIuL2Fzc2V0cy9pbWcvT3RoZXJFeHBsb3Npb24zLnBuZ1wiLFxyXG4gICAgRVhQTE9TSU9OX0JfMSA6IFwiLi9hc3NldHMvaW1nL0V4cGxvc2lvbjEucG5nXCIsXHJcbiAgICBFWFBMT1NJT05fQl8yIDogXCIuL2Fzc2V0cy9pbWcvRXhwbG9zaW9uMi5wbmdcIixcclxuICAgIEVYUExPU0lPTl9CXzMgOiBcIi4vYXNzZXRzL2ltZy9FeHBsb3Npb24zLnBuZ1wiLFxyXG4gICAgRVhQTE9TSU9OX0VORCA6IFwiLi9hc3NldHMvaW1nL0V4cGxvc2lvbkVuZC5wbmdcIixcclxuICAgIEhQX0ZVTEwgICAgICAgOiBcIi4vYXNzZXRzL2ltZy9IZWFsdGhPcmJGdWxsLnBuZ1wiLFxyXG4gICAgSFBfRU1QVFkgICAgICA6IFwiLi9hc3NldHMvaW1nL0hlYWx0aE9yYkVtcHR5LnBuZ1wiLFxyXG5cclxuICAgIC8vIFByZWxvYWRlciByZXBsYWNlcyBnZXR0ZXIgd2l0aCBhcHByb3ByaWF0ZSBkZWZpbml0aW9uXHJcbiAgICBnZXQgICAgICAgIDogZnVuY3Rpb24gKHBhdGgpIHsgfVxyXG59OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIEFzc2V0cyA9IHJlcXVpcmUoJy4vQXNzZXRzLmpzJyk7XHJcblxyXG52YXIgUHJlbG9hZGVyID0gZnVuY3Rpb24gKG9uQ29tcGxldGUpIHtcclxuICAgIC8vIFNldCB1cCBwcmVsb2FkZXJcclxuXHR0aGlzLnF1ZXVlID0gbmV3IGNyZWF0ZWpzLkxvYWRRdWV1ZShmYWxzZSk7XHJcblxyXG4gICAgLy8gUmVwbGFjZSBkZWZpbml0aW9uIG9mIEFzc2V0IGdldHRlciB0byB1c2UgdGhlIGRhdGEgZnJvbSB0aGUgcXVldWVcclxuICAgIEFzc2V0cy5nZXQgPSB0aGlzLnF1ZXVlLmdldFJlc3VsdC5iaW5kKHRoaXMucXVldWUpO1xyXG5cclxuICAgIC8vIE9uY2UgZXZlcnl0aGluZyBoYXMgYmVlbiBwcmVsb2FkZWQsIHN0YXJ0IHRoZSBhcHBsaWNhdGlvblxyXG4gICAgaWYgKG9uQ29tcGxldGUpIHtcclxuICAgICAgICB0aGlzLnF1ZXVlLm9uKFwiY29tcGxldGVcIiwgb25Db21wbGV0ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIG5lZWRUb0xvYWQgPSBbXTtcclxuXHJcbiAgICAvLyBQcmVwYXJlIHRvIGxvYWQgaW1hZ2VzXHJcbiAgICBmb3IgKHZhciBpbWcgaW4gQXNzZXRzKSB7XHJcbiAgICAgICAgdmFyIGltZ09iaiA9IHtcclxuICAgICAgICAgICAgaWQgOiBpbWcsXHJcbiAgICAgICAgICAgIHNyYyA6IEFzc2V0c1tpbWddXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBuZWVkVG9Mb2FkLnB1c2goaW1nT2JqKTtcclxuICAgIH1cclxuXHJcblx0dGhpcy5xdWV1ZS5sb2FkTWFuaWZlc3QobmVlZFRvTG9hZCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFByZWxvYWRlcjsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBBc3NldHMgPSByZXF1aXJlKCcuL0Fzc2V0cy5qcycpO1xyXG52YXIgUHJlbG9hZGVyID0gcmVxdWlyZSgnLi9QcmVsb2FkZXIuanMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgQXNzZXRzICAgIDogQXNzZXRzLFxyXG4gICAgUHJlbG9hZGVyIDogUHJlbG9hZGVyXHJcbn07Il19
