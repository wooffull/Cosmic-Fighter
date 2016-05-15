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
        "/getScore",
        mid.requiresLogin,
        controllers.Account.getScore
    );

    app.post(
        "/score",
        mid.requiresSecure,
        mid.requiresLogin,
        controllers.Account.score
    );

	app.get(
        "/",
        mid.requiresSecure,
        mid.requiresLogout,
        controllers.Account.loginPage
    );
};

module.exports = router;