"use strict";

var entities = require('../entities');

var LocalClient = function (id) {
    this.id = id;
    this.gameObject = new entities.Player();
};
Object.freeze(LocalClient);

module.exports = LocalClient;