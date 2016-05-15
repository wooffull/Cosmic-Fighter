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
var FullBock = entities.FullBlock;
var Player = entities.Player;
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

    this.timeRemaining = room.timeRemaining;
    this.initialCountdown = room.countdown;
    this.countingDown = true;
    this.respawnTime = room.respawnTime;
    this.respawnTimeRemaining = this.respawnTime;

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
    this.player.customData.clientId = Network.localClient.data.id;
    this.addGameObject(this.player, 2);

    this.camera.follow(this.player);
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

            // Show the remaining duration of the game
            var timeText;
            if (this.timeRemaining > 0) {
                var minutes = Math.floor(this.timeRemaining / (1000 * 60));
                var seconds = Math.round((this.timeRemaining - minutes * 1000 * 60) / 1000);
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
            this.timeRemaining = data.timeRemaining;
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