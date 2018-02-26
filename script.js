/* === Internal Constants === */
const _style = "user-select: none;margin-left: .25rem !important; margin-right: .25rem !important; display: inline-block; padding: .25em .4em; font-size: 75%; font-weight: 700; line-height: 1;text-align: center; white-space: nowrap; vertical-align: baseline; border-radius: .25rem;";

const _getColour = (value) => {
    var colour, background;
    switch(value) {
        case "High":
            colour = "fff";
            background = "dc3545";
            break;
        case "Medium":
            colour = "212529";
            background = "ffc107";
            break;
        case "Low":
            colour = "fff";
            background = "28a745";
            break;
        case "None":
            colour = "fff";
            background = "17a2b8";
            break;
        case "Review":
            colour = "fff";
            background = "343a40";
            break;
        case "Reviewed":
            colour = "212529";
            background = "f8f9fa";
            break;
        case "Highlight":
            colour = "000";
            background = "ffff00";
            break;
        default:
            colour = "fff";
            background = "6c757d";
    }
    return `color: #${colour}; background-color: #${background};`;
};

const _getId = url => url.match(/[-\w]{25,}/);

const _addTag = (container, name, value) => {
    if (container) {
       var tag = document.createElement("div"),
            attributes = {"class": "tagadoc goog-inline-block", "style": `${_style} ${_getColour((name == "Review" || name == "Reviewed" || name == "Highlight") ? name : value)}`, "aria-hidden" : "false", "aria-disabled" : "false"};
        Object.keys(attributes).forEach(key => tag.setAttribute(key, attributes[key]));
        value = (value === "TRUE") ? "" : ` - ${value}`
        tag.appendChild(document.createTextNode(`${name}${value}`));
        container.appendChild(tag);
    }
};
/* === Internal Constants === */

/* === Internal Functions === */
var _start = () => {
    var _id = _getId(window.location.href);
    if (_id) chrome.runtime.sendMessage({"action" : "get-tags", "doc": _id}, response => {
        if (response) {
            
            var _container = document.getElementById("docs-titlebar-container");
            if (_container) _container = _container.getElementsByClassName("docs-title-outer")[0];
            if (_container) {
                var _existing = _container.getElementsByClassName("tagadoc");
                while(_existing && _existing.length > 0){
                    _existing[0].parentNode.removeChild(_existing[0]);
                }
            }

            if (response.authenticated) {
                
                if (response.file.properties) Object.keys(response.file.properties).forEach(key => _addTag(_container, key, response.file.properties[key]));
                
            } else if (_container) {
                
                /* === Not Logged In === */
                var warning = document.createElement("div"),
                attributes = {"class": "tagadoc docs-icon goog-inline-block", "aria-hidden" : "false", "aria-disabled" : "true", "title" : "Please sign in to TagaDoc to view tags!"};
            
                Object.keys(attributes).forEach(key => warning.setAttribute(key, attributes[key]));
                warning.innerHTML = "<svg fill='#901515' height='18' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M0 0h24v24H0V0z' fill='none'/><path d='M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z'/></svg>";
                _container.appendChild(warning);
            
            }
        }
    });
};
/* === Internal Functions === */

/* === Handle Refresh === */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request && request.action == "refresh") _start();
    });

_start();