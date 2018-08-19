/* === Internal Constants === */
const _style = "user-select: none; margin-left: .25rem !important; margin-right: .25rem !important; display: inline-block; padding: 4px 5px; font-weight: 700; line-height: 1;text-align: center; white-space: nowrap; vertical-align: baseline; border-radius: .25rem;",
  _line = "font-size: 75%;",
  _stacked = "font-size: 85%; margin-bottom: .25rem;",
  _icon = "text-decoration: none; fill: #fff;",
  _holder = "z-index: 9999; pointer-events: all; position: absolute; margin-left: 5px; margin-top: 10px; max-width: 280px",
  _class = "tagadoc",
  _unauth = "<svg fill='#901515' height='18' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M0 0h24v24H0V0z' fill='none'/><path d='M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z'/></svg>",
  _host = "educ.io";

const _edit = (size) => `<svg xmlns='http://www.w3.org/2000/svg' width='${size ? size : 12}' height='${size ? size : 12}' viewBox='0 0 24 24'><path d='M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z'/><path d='M0 0h24v24H0z' fill='none'/></svg>`;
const _getColour = value => {
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
  case "Tag":
    colour = "fff";
    background = "000";
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
const _createAttributes = (css_Class, css_Style, title) => ({
  "class": css_Class ? css_Class : "",
  "style": css_Style ? css_Style : "",
  "title": title ? title : "",
  "aria-hidden": "false",
  "aria-disabled": "false"
});
const _encodeValue = value => value.replace(/\./g, "%2E");
/* === Internal Constants === */

/* === Internal Variables === */
var _observer;
/* === Internal Variables === */

/* === Internal Functions === */
var _addTag = (container, name, value, css_Class, css_Style, url, title) => {
  if (container) {
    var tag = document.createElement(url ? "a" : "div"),
      attributes = _createAttributes(
        `${_class}${css_Class ? ` ${css_Class}` : ""}`,
        `${_style}${css_Style ? ` ${css_Style}` : ""} ${_getColour((name === "Review" || name === "Reviewed" || name === "Highlight" || name === "Tag") ? name : value)}`,
        title
      );
    if (url)(attributes.href = url) && (attributes.target = "_blank");
    Object.keys(attributes).forEach(key => tag.setAttribute(key, attributes[key]));
    value = (value === true || value === "TRUE") ? "" : ` - ${value}`;
    tag.appendChild(document.createTextNode(`${name === "Tag" && url ? "" : name}${value}`));
    container.appendChild(tag);
    return tag;
  }
};

var _clean = (container, css_class) => {
  var _existing = container.getElementsByClassName(css_class);
  while (_existing && _existing.length > 0) {
    _existing[0].parentNode.removeChild(_existing[0]);
  }
};

var _needsAuth = container => {

  /* === Not Logged In === */
  var warning = document.createElement("div"),
    attributes = _createAttributes(
      "tagadoc docs-icon goog-inline-block",
      false, "Please sign in to TagaDoc to view tags!"
    );

  Object.keys(attributes).forEach(key => warning.setAttribute(key, attributes[key]));
  warning.innerHTML = _unauth;
  container.appendChild(warning);

};

var _doc = id => chrome.runtime.sendMessage({
  "action": "get-doc-tags",
  "doc": id
}, response => {

  if (!response) return;
  var _container = document.getElementById("docs-titlebar-container");
  if (_container) _container = _container.getElementsByClassName("docs-title-outer");
  if (_container && _container.length > 0)(_container = _container[0]) && _clean(_container, _class);

  if (response.authenticated) {

    if (response.data) {

      if (response.data.parents && response.data.parents.length > 0) {
        var _team = (response.data.teamDriveId && response.data.parents[0] == response.data.teamDriveId) ? "team." : "",
          _suffix = (response.data.teamDriveId && response.data.parents[0] != response.data.teamDriveId) ? `.${response.data.teamDriveId}` : "",
          _url = `https://${_host}/folders/#google,load.${_team}${response.data.parents[0]}${_suffix}.filter.${response.data.id}`;
        _addTag(_container, "Tag", true, "goog-inline-block", `${_line} ${_icon}`, _url, "Edit Tags in Folders Web App").innerHTML += `<i style="padding-left: 1px;">${_edit()}</i>`;
      }
      if (response.data.properties) Object.keys(response.data.properties).forEach(key => _addTag(_container, key, response.data.properties[key], "goog-inline-block", _line));

    }

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

    if (response.data) {

      var _data = response.data,
        _container = document.createElement("div"),
        _attributes = _createAttributes(`${_class}`, `${_holder}`);
      Object.keys(_attributes).forEach((key) => _container.setAttribute(key, _attributes[key]));
      container.appendChild(_container);

      if (_data.extendedProperties && _data.extendedProperties.shared) Object.keys(_data.extendedProperties.shared).forEach((k) => _addTag(_container, k, _data.extendedProperties.shared[k], false, _stacked));

      var _url = `https://${_host}/events/#google,calendar.item.${_encodeValue(encodeURIComponent(c_id))}.${_encodeValue(encodeURIComponent(e_id))}`;
      _addTag(_container, "Tag", true, false, `${_stacked} ${_icon}`, _url, "Edit Tags in Events Web App").innerHTML += `<i style="padding-left: 1px;">${_edit(_data.extendedProperties && _data.extendedProperties.shared ? 10 : 16)}</i>`;

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
    var _config = {
        attributes: false,
        childList: true,
        subtree: true
      },
      _handle = mutants => mutants.forEach(m => {
        if (m.type == "childList" && m.addedNodes) {
          m.addedNodes.forEach(node => {
            if (node && node.querySelectorAll) {
              var _candidates = node.getAttribute("jslog") ? [node] : node.querySelectorAll("[jslog]");
              if (_candidates) _candidates.forEach(candidate => {
                var _values = candidate.getAttribute("jslog").split("; ");
                if (_values && _values.length == 3) {
                  var _value = _values[1].substring(_values[1].indexOf(":") + 1),
                    _event = _value.substring(0, _value.indexOf(",")),
                    _calendar = _value.substring(_value.indexOf(",") + 1);
                  if (_event && _calendar) _cal(_calendar, _event, candidate.closest("div[role='dialog']"));
                }
              });
            }
          });
        }
      });

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
chrome.runtime.onMessage.addListener(request => {
  if (request && request.action == "refresh") _start();
});

_start();