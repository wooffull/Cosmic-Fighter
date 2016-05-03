var controllers = require('./controllers');
var mid = require('./middleware');

var router = function (app) {
	app.get(
        "/login",
        mid.requiresSecure,
        mid.requiresLogout,
        controllers.Account.loginPage
    );

    app.post(
        "/login",
        mid.requiresSecure,
        mid.requiresLogout,
        controllers.Account.login
    );

	app.get(
        "/signup",
        mid.requiresSecure,
        mid.requiresLogout,
        controllers.Account.signupPage
    );

	app.post(
        "/signup",
        mid.requiresSecure,
        mid.requiresLogout,
        controllers.Account.signup
    );

	app.get(
        "/logout",
        mid.requiresLogin,
        controllers.Account.logout
    );

	app.get(
        "/game",
        mid.requiresLogin,
        controllers.Account.gamePage
    );

	app.get(
        "/account",
        mid.requiresLogin,
        controllers.Account.accountPage
    );

	app.get(
        "/ship",
        mid.requiresLogin,
        controllers.Ship.shipPage
    );

	app.post(
        "/ship",
        mid.requiresLogin,
        controllers.Ship.make
    );

	app.post(
        "/remove",
        mid.requiresLogin,
        controllers.Ship.remove
    );

	app.get(
        "/",
        mid.requiresSecure,
        mid.requiresLogout,
        controllers.Account.loginPage
    );
};

module.exports = router;