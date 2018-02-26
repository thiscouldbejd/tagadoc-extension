$(function() {

    var _network = network();
    
    var _err = e => console.error(JSON.stringify(e));
    
    var _log = (m, d) => (d ? console.log(m, d) : console.log(m)) || true;
    
    var _busy = (e, t) => e ? t ? $(e).prepend("<div class='loader'><div class='loading'><div class='spinner'></div></div></div>") && $(e).toggleClass("disabled", true) : $(e).find(".loader").remove() && $(e).toggleClass("disabled", false): false;
    
    var _reconcile = (signed_In, details) => {
        
        $(".auth").toggleClass("d-none", !signed_In) && $(".not-auth").toggleClass("d-none", !!signed_In);
        if (details && details.error) _err(details.error);
        if (details && details.message) _log(details.message);
        
        var _height = 0;
			$("#logo, #content").each(function() {
				_height += $(this).outerHeight(true);
			});
			$("html, body").css("height", _height);
			
        return (details && details.value) ? details.value : true;
        
    };

	var _getUser = token => _network.request("GET", "https://www.googleapis.com/oauth2/v1/userinfo?alt=json", token);
	
	var _handleUser = user => Promise.resolve(_log("User", user) && $("#user").text(user ? ` ${user.given_name}` : ""));
	
	var _notify = () => chrome.runtime.sendMessage({"action": "auth-changed"});
	
    /* <!-- Set Up Event Handlers --> */
    $("#btn_signIn").on("click.signin", e => {
        _log("Signing In");
        _busy(e.target, true);
        _network.token.get(true)
            .then(token => _reconcile(true, {message: `Signed In with Token: ${token}`, value: token}))
            .then(_getUser)
            .then(_handleUser)
            .then(_notify)
            .catch(error => _reconcile(false, {error: error})).then(() => _busy(e.target, false));
    });
    
    $("#btn_signOut").on("click.signout", e => {
        _log("Signing Out");
        _busy(e.target, true);
        _network.token.get(false)
            .then(_network.token.revoke)
            .then(() => _reconcile(false, {message: "Signed Out"}))
            .then(() => window.setTimeout(_notify, 10000))
            .catch(error => _reconcile(true, {error: error})).then(() => _busy(e.target, false));
    });
    
    _network.token.get(false)
        .then(token => _reconcile(true, {message : `Already signed in with Token: ${token}`, value: token}))
        .then(_getUser).then(_handleUser).catch(error => _reconcile(false, {error: error}));
    
});