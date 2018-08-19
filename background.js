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

    return request.doc ? _callAPI(sendResponse, `https://www.googleapis.com/drive/v3/files/${request.doc}`, {
      fields: "kind,id,name,mimeType,parents,properties,teamDriveId",
      includeTeamDriveItems: true,
      supportsTeamDrives: true,
      corpora: "user,allTeamDrives"
    }) : false;

  } else if (request.action == "get-cal-tags") {

    return request.calendar && request.event ? _callAPI(sendResponse, `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(request.calendar)}/events/${encodeURIComponent(request.event)}`, {
      alwaysIncludeEmail: false
    }) : false;

  } else if (request.action == "auth-changed") {

    _refresh();

  }

});