"use strict";

var entities = require('../entities');

var LocalClient = function (id, data) {
    this.id = id;
    this.data = data;
    this.gameObject = new entities.Player();
};
Object.freeze(LocalClient);

module.exports = LocalClient;