var mongoose = require('mongoose');
var _ = require('underscore');

var ShipModel;

var setName = function(name){
	return _.escape(name).trim();
};

var ShipSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true,
		set: setName
	},

	bullet: {
		type: String,
		required: true,
		trim: true
	},

	owner: {
		type: mongoose.Schema.ObjectId,
		required: true,
		ref: 'Account'
	},

    level: {
        type: Number,
        min: 1,
        max: 100,
        required: true,
        default: 1
    },

	createdData: {
		type: Date,
		default: Date.now
	}
});


ShipSchema.methods.toAPI = function() {
	return {
        name: this.name,
        bullet: this.bullet,
        level: this.level
	};
};

ShipSchema.statics.findByOwner = function (ownerId, callback) {
	var search = {
		owner: mongoose.Types.ObjectId(ownerId)
	};

	return ShipModel.find(search).select("name bullet level createdData").exec(callback);
};

ShipSchema.statics.findByCreatedData = function (createdData, callback) {
    var start = new Date(createdData);
    var end   = new Date((+start) + 1000);

	var search = {
		createdData: {
            "$gte": start,
            "$lt": end
        }
	};

	return ShipModel.find(search).exec(callback);
};

ShipModel = mongoose.model('Ship', ShipSchema);

module.exports.ShipModel = ShipModel;
module.exports.ShipSchema = ShipSchema;