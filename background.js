/* <!-- Internal Constants --> */
const _isFolders = url => !!url.match(/:\/\/(.+.educ|educ).io\/folders/);
const _isEvents = url => !!url.match(/:\/\/(.+.educ|educ).io\/events/);
const API = "https://www.googleapis.com/";

/* <!-- Internal Functions --> */
var _refresh = () => chrome.tabs.query({
  url: ["*://docs.google.com/*", "*://calendar.google.com/*"]
}, tabs => tabs.forEach(tab => chrome.tabs.sendMessage(tab.id, {
  "action": "refresh"
})));

var _callAPI = (response, url, data, method) => {
  var _network = network();
  _network.token.get(false)
    .then(token =>
      _network.request(method ? method : "GET", url, token, data))
    .then(data => response({
      authenticated: true,
      data: data
    }))
    .catch(e => {
      if (e.status && e.status == 404) {
        setTimeout(_refresh, 20000);
        response({
          authenticated: true
        });
      } else {
        response({
          authenticated: false,
          error: e
        });
      }
    });

  return true;
};

/* <!-- Set Up Event Handlers --> */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  if (request.action == "get-doc-tags") {

    return request.doc ? _callAPI(sendResponse, `${API}drive/v3/files/${request.doc}`, {
      fields: "kind,id,name,mimeType,parents,properties,teamDriveId,capabilities(canEdit)",
      includeTeamDriveItems: true,
      supportsTeamDrives: true,
      corpora: "user,allTeamDrives"
    }) : false;

  } else if (request.action == "get-cal-tags") {

    return request.calendar && request.event ? _callAPI(sendResponse, `${API}calendar/v3/calendars/${encodeURIComponent(request.calendar)}/events/${encodeURIComponent(request.event)}`, {
      alwaysIncludeEmail: false
    }) : false;

  } else if (request.action == "get-path") {

    var _options = {
      fields: "kind,id,name,mimeType,parents,description",
      includeTeamDriveItems: true,
      supportsTeamDrives: true,
      corpora: "user,allTeamDrives",
    };
    if (request.team) _options.teamDriveId = request.team;

    var _call = (folder, paths) => {
      var _network = network(),
        _paths = paths,
        _token;
      return _network.token.get(false)
        .then(token =>
          _network.request("GET", `${API}/drive/v3/files/${folder}`, (_token = token), _options))
        .then(folder => {
          _paths.unshift(folder.name);
          return (folder.parents && folder.parents.length > 0) ?
            _call(folder.parents[0], _paths) :
            request.team ?
            _network.request("GET", `${API}/drive/v3/teamdrives/${request.team}`, _token).then(drive => {
              _paths[0] = `Team | ${drive.name}`;
              return _paths.join(" -> ");
            }) :
            _paths.join(" -> ");
        });
    };

    if (request.folders) {
      var _calls = [];
      for (var i = 0; i < request.folders.length; i++) _calls.push(_call(request.folders[i], []));
      Promise.all(_calls).then(parents => chrome.tabs.sendMessage(sender.tab.id, {
        "action": "paths",
        "paths": parents
      }));
    }

  } else if (request.action == "request-auth") {

    network().token.get(true)
      .then(() => _refresh())
      .then(() => true)
      .catch(() => false)
      .then(result => sendResponse({
        authenticated: result
      }));

  } else if (request.action == "auth-changed") {

    _refresh();

  } else if (request.action == "tags-updated") {

    _refresh();

  }

});

/* <!-- Set Up External Event Handlers (Messaging from Web-Apps) --> */
chrome.runtime.onMessageExternal.addListener((request, sender) => {
  if (sender.url && (_isFolders(sender.url) || _isEvents(sender.url))) {
    if (request.action == "update") _refresh();
  }
});

/* <!-- Set Up Install / Update Handlers --> */
var _update = manifest => {
      var _connect = tab => {
        var _port = chrome.tabs.connect(tab);
        if (_port) _port.onDisconnect.addListener(
          (tab => () => setTimeout(() => _connect(tab), 1000 * 1))(tab));
      };
      manifest.content_scripts.forEach(inject => {
        chrome.tabs.query({
          url: inject.matches
        }, tabs => tabs.forEach(tab => {
          if (inject.js) chrome.tabs.sendMessage(tab.id, {
            "action": "ping"
          }, null, reply => {
            if((chrome.runtime.lastError && 
                chrome.runtime.lastError.message == 
                	"Could not establish connection. Receiving end does not exist.")) {
                    inject.js.forEach(script => {
                      chrome.tabs.executeScript(tab.id, {
                        file: script
                      });
                    });
            } else if (reply == null) {
            	_connect(tab.id);
            }
          });
        }));
      });
    },
    _install = manifest => {
      manifest.content_scripts.forEach(inject => {
        chrome.tabs.query({
          url: inject.matches
        }, tabs => tabs.forEach(tab => {
          if (inject.js) inject.js.forEach(script => {
            chrome.tabs.executeScript(tab.id, {
              file: script
            });
          })
        }));
      });
    },
    _installed = details => {
      var _manifest = chrome.app.getDetails();
      if (details && _manifest && _manifest.content_scripts) 
        	details.reason == "install" ?
        		_install(_manifest) : details.reason == "update" ?
        		_update(_manifest) : false;
    };
chrome.runtime.onInstalled.addListener(_installed);