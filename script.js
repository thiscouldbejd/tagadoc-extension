/* === Internal Constants === */
const _style = "user-select: none;margin-left: .25rem !important; margin-right: .25rem !important; display: inline-block; padding: .25em .4em; font-size: 75%; font-weight: 700; line-height: 1;text-align: center; white-space: nowrap; vertical-align: baseline; border-radius: .25rem;";
const _holder = "position: fixed; margin-left: 10px; margin-top: 10px; max-width: 280px";
const _class = "tagadoc";

const _getColour = (value) => {
  var colour, background;
  switch (value) {
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

const _isCal = url => !!url.match(/:\/\/calendar.google.com/);
const _isDoc = url => !!url.match(/:\/\/docs.google.com/);
const _getId = url => url.match(/[-\w]{25,}/);

const _addTag = (container, name, value, css_class) => {
  if (container) {
    var tag = document.createElement("div"),
      attributes = {
        "class": `${_class} ${css_class}`,
        "style": `${_style} ${_getColour((name == "Review" || name == "Reviewed" || name == "Highlight") ? name : value)}`,
        "aria-hidden": "false",
        "aria-disabled": "false"
      };
    Object.keys(attributes).forEach(key => tag.setAttribute(key, attributes[key]));
    value = (value === "TRUE") ? "" : ` - ${value}`
    tag.appendChild(document.createTextNode(`${name}${value}`));
    container.appendChild(tag);
  }
};
/* === Internal Constants === */

/* === Internal Variables === */
var _observer;
/* === Internal Variables === */

/* === Internal Functions === */
var _clean = (container, css_class) => {
  var _existing = container.getElementsByClassName(css_class);
  while (_existing && _existing.length > 0) {
    _existing[0].parentNode.removeChild(_existing[0]);
  }
};

var _needsAuth = container => {
  
  /* === Not Logged In === */
  var warning = document.createElement("div"),
      attributes = {
        "class": "tagadoc docs-icon goog-inline-block",
        "aria-hidden": "false",
        "aria-disabled": "true",
        "title": "Please sign in to TagaDoc to view tags!"
      };

  Object.keys(attributes).forEach(key => warning.setAttribute(key, attributes[key]));
  warning.innerHTML = "<svg fill='#901515' height='18' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M0 0h24v24H0V0z' fill='none'/><path d='M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z'/></svg>";
  container.appendChild(warning);
  
};

var _doc = id => chrome.runtime.sendMessage({
  "action": "get-doc-tags",
  "doc": id
}, response => {
  
  if (!response) return;
  var _container = document.getElementById("docs-titlebar-container");
  if (_container) _container = _container.getElementsByClassName("docs-title-outer")[0];
  if (_container) _clean(_container, _class);

  if (response.authenticated) {

    if (response.data && response.data.properties) Object.keys(response.data.properties).forEach(key => _addTag(_container, key, response.data.properties[key], "goog-inline-block"));

  } else if (_container) {

    _needsAuth(_container);

  }
  
});

var _cal = (c_id, e_id, container) => chrome.runtime.sendMessage({
  "action": "get-cal-tags",
  "calendar": c_id,
  "event": e_id
}, response => {
  if (!response) return;
 
  if (response.authenticated) {

    _clean(container, _class);
    
    if (response.data && response.data.extendedProperties && response.data.extendedProperties.shared) {
      
      var _container = document.createElement("div"),
      attributes = {
        "class": `${_class}`,
        "style": `${_holder}`,
        "aria-hidden": "false",
        "aria-disabled": "false"
      };
      Object.keys(attributes).forEach(key => _container.setAttribute(key, attributes[key]));
    	container.appendChild(_container);
      
      Object.keys(response.data.extendedProperties.shared).forEach(key => _addTag(_container, key, response.data.extendedProperties.shared[key]));
      
      
    }
      

  } else {

    _needsAuth(container);

  }
  
});

var _start = () => {
  var _url = window.location.href;
  if (_isDoc(_url)) {
    
    var _id = _getId(window.location.href);
  	if (_id) _doc(_id);
    
  } else if (_isCal(_url)) {
    
    if (_observer) _observer.disconnect();
		var _config = {attributes: false, childList: true, subtree: true},
        _handle = mutants => {
          for (var mutation of mutants) {
              if (mutation.type == "childList") {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                  for (var node of mutation.addedNodes) {
                    if (node && node.querySelectorAll) {
                      var _candidates = node.getAttribute("jslog") ? [node] : node.querySelectorAll("[jslog]");
                      if (_candidates && _candidates.length > 0) {
                        for (var candidate of _candidates) {
													var _values = candidate.getAttribute("jslog").split("; ");
                          if (_values && _values.length == 3) {
                            var _value = _values[1].substring( _values[1].indexOf(":") + 1),
                                _event = _value.substring(0,  _value.indexOf(",")),
                                _calendar = _value.substring( _value.indexOf(",") + 1);
                          	if (_event && _calendar) _cal(_calendar, _event, candidate.closest("div[role='dialog']"));
                          }
                        }
                      }
                    }
                	}
                }
              }
          }
        };
    
		_observer = new MutationObserver(_handle);
		_observer.observe(document.body, _config);
    
  }
};
/* === Internal Functions === */

/* === Polyfills === */
if (!Element.prototype.matches)
    Element.prototype.matches = Element.prototype.msMatchesSelector || 
                                Element.prototype.webkitMatchesSelector;

if (!Element.prototype.closest)
    Element.prototype.closest = function(s) {
        var el = this;
        if (!document.documentElement.contains(el)) return null;
        do {
            if (el.matches(s)) return el;
            el = el.parentElement || el.parentNode;
        } while (el !== null && el.nodeType === 1); 
        return null;
    };
/* === Polyfills === */

/* === Handle Refresh === */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request && request.action == "refresh") _start();
});

_start();