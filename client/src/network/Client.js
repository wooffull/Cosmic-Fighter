"use strict";

var entities = require('../entities');

var Client = function (id, data) {
    this.id = id;
    this.data = data;
    this.gameObject = new entities.ClientPlayer();
};
Object.freeze(Client);

module.exports = Client;