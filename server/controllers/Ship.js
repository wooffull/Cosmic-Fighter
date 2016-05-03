var _ = require('underscore');
var models = require('../models');

var Ship = models.Ship;
var Account = models.Account;

var getShipPage = function (req, res) {
	Ship.ShipModel.findByOwner(req.session.account._id, function (err, docs) {
		if (err) {
			console.log(err);
			return res.status(400).json({error: 'Could not retrieve Ship'});
		}

        var account = req.session.account;

		res.render(
            'ship',
            {
                csrfToken : req.csrfToken(),
                ships: docs,
                owner: account.username
            }
        );
	});
};

var makeShip = function (req, res) {
	if (!req.body.name || !req.body.bullet) {
		return res.status(400).json({error: "Name and bullet type are required."});
	}

	var shipData = {
		name: req.body.name,
		bullet: req.body.bullet,
		owner: req.session.account._id
	};

	var newShip = new Ship.ShipModel(shipData);

	newShip.save(function (err) {
		if (err) {
			console.log(err);
			return res.status(400).json({error: 'An error occurred'});
		}

		res.json({redirect: "/ship"});
	});
};

var removeShip = function (req, res) {
	if (!req.body.createdData) {
		return res.status(400).json({error: "Could not remove Ship."});
	}

	Ship.ShipModel.findByCreatedData(req.body.createdData, function (err, docs) {
		if (err) {
			console.log(err);
			return res.status(400).json({error: 'An error occurred'});
		}

        if (docs.length > 0) {
            docs[0].remove(function (err) {
                if (err) {
                    console.log(err);
                    return res.status(400).json({error: 'An error occurred'});
                }

                res.json({redirect: "/ship"});
            });
        } else {
            console.log("Couldn't find Ship to remove");
            return res.status(400).json({error: 'An error occurred'});
        }
    });
};

module.exports.shipPage = getShipPage;
module.exports.make = makeShip;
module.exports.remove = removeShip;