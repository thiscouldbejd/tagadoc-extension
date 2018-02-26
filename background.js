/* <!-- Set Up Event Handlers --> */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    
    if (request.action == "get-tags") {
        
        if (request.doc) {

            var _network = network();
            _network.token.get(false)
                .then(token =>
                    _network.request("GET", `https://www.googleapis.com/drive/v3/files/${request.doc}`, token, {
                        fields: "kind,id,name,mimeType,properties",
                        includeTeamDriveItems: true,
                        supportsTeamDrives: true,
                        corpora: "user,allTeamDrives"
                    }))
                .then(file => sendResponse({
                    authenticated: true,
                    file: file
                }))
                .catch(e => sendResponse({
                    authenticated: false,
                    error: e
                }));
    
            return true;
            
        } else {
            
            return false;
            
        }
        
    } else if (request.action == "auth-changed") {
        
        chrome.tabs.query({url: "*://docs.google.com/*"}, tabs => tabs.forEach(tab => chrome.tabs.sendMessage(tab.id, {"action": "refresh"})));
        
    }

});