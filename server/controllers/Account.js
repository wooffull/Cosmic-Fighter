var models = require('../models');

var Account = models.Account;

var loginPage = function (req, res) {
    res.render('login', { csrfToken : req.csrfToken() });
};

var signupPage = function (req, res) {
    res.render('signup', { csrfToken : req.csrfToken() });
};

var gamePage = function (req, res) {
    var account = req.session.account;

    res.render(
        'game',
        {
            csrfToken : req.csrfToken(),
            owner: account.username
        }
    );
};

var score = function (req, res) {
    if (!req.body.username || !req.body.kills || !req.body.deaths) {
        return res.status(400).json({error: "Full score data is required."});
    }

    Account.AccountModel.findByUsername(req.body.username, function (err, doc) {
		if (err || !doc) {
            return res.status(400).json({error: "An error occurred when saving score."});
		}

        var scoreData = {
            kills: req.body.kills,
            deaths: req.body.deaths,
            owner: req.session.account._id
        };

        doc.kills = doc.kills + parseInt(req.body.kills);
        doc.deaths = doc.deaths + parseInt(req.body.deaths);

        doc.save(function (err) {
            if (err) {
                return res.status(400).json({error: 'An error occurred'});
            }
        });
    });
};

var getScore = function (req, res) {
    var account = req.session.account;

    Account.AccountModel.findByUsername(account.username, function (err, doc) {
		if (err || !doc) {
            return res.status(400).json({error: "An error occurred when saving score."});
		}

        var scoreData = {
            kills: doc.kills,
            deaths: doc.deaths
        };

        res.json(scoreData);
    });
};

var logout = function (req, res) {
    req.session.destroy();
    res.redirect('/');
};

var login = function (req, res) {
    if (!req.body.username || !req.body.pass) {
        return res.status(400).json({error: "All fields are required"});
    }

    Account.AccountModel.authenticate(req.body.username, req.body.pass, function (err, account) {
        if (err || !account) {
            return res.status(401).json({error: "Incorrect username or password"});
        }

        req.session.account = account.toAPI();

        res.json({redirect: 'game'});
    });
};

var signup = function (req, res) {
    if (!req.body.username || !req.body.pass || !req.body.pass2) {
        return res.status(400).json({error: "All fields are required"});
    }

    if (req.body.pass !== req.body.pass2) {
        return res.status(400).json({error: "Passwords do not match"});
    }

    Account.AccountModel.generateHash(req.body.pass, function (salt, hash) {
        var accountData = {
            username: req.body.username,
            salt: salt,
            password: hash
        };

        var newAccount = new Account.AccountModel(accountData);

        newAccount.save(function (err) {
            if (err) {
                console.log(err);
                return res.status(400).json({error: 'An error occurred'});
            }

            req.session.account = newAccount.toAPI();

            res.json({redirect: 'game'});
        });
    });
};

module.exports.loginPage = loginPage;
module.exports.login = login;
module.exports.logout = logout;
module.exports.signupPage = signupPage;
module.exports.signup = signup;
module.exports.score = score;
module.exports.getScore = getScore;
module.exports.gamePage = gamePage;