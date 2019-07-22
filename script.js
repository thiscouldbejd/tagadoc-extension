/* === Internal Constants === */
const _style = "user-select: none; margin-right: .25rem !important; display: inline-block; padding: 5px 5px 4px 4px; font-weight: 700; line-height: 1.1; text-align: center; white-space: nowrap; vertical-align: text-top; border-radius: .25rem;",
  _searchStyle = "display: flex;float: left !important;padding-right: .1rem !important;display: flex !important;",
  _line = "font-size: 70%;",
  _stacked = "font-size: 85%; margin-bottom: .25rem;",
  _icon = "text-decoration: none; fill: #fff;",
  _holder = "z-index: 9999; pointer-events: all; position: absolute; margin-left: 10px; margin-top: 10px; max-width: 280px",
  _class = "tagadoc",
  _searchClass = "",
  _warn = "<svg fill='#901515' height='18' viewBox='0 0 28 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M0 0h24v24H0V0z' fill='none'/><path d='M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z'/></svg>",
  _host = "educ.io",
  _parents = "tag_a_doc-parents-path";

const _search = (size, colour) => `<svg xmlns='http://www.w3.org/2000/svg' width='${size ? size : 12}' height='${size ? size : 12}' viewBox='0 0 24 24'><path style='stroke: ${colour ? colour : "#000"}; fill: ${colour ? colour : "#000"}' d='M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'/><path d='M0 0h24v24H0z' fill='none'/></svg>`;

const _edit = size => `<svg xmlns='http://www.w3.org/2000/svg' width='${size ? size : 12}' height='${size ? size : 12}' viewBox='0 0 24 24'><path d='M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z'/><path d='M0 0h24v24H0z' fill='none'/></svg>`;

const _locate = size => `<svg xmlns='http://www.w3.org/2000/svg' width='${size ? size : 12}' height='${size ? size : 12}' viewBox='0 0 24 24'><path fill="none" d="M0 0h24v24H0V0z"/><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>`;

const _getColour = (value, foregroundOnly) => {
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
  case "Locate":
    colour = "fff";
    background = "007bff";
    break;
  default:
    colour = "fff";
    background = "6c757d";
  }
  return foregroundOnly ? `#${colour}` : `color: #${colour}; background-color: #${background};`;
};
const _isCal = url => !!url.match(/:\/\/calendar.google.com/);
const _isDoc = url => !!url.match(/:\/\/docs.google.com/);
const _getId = url => url.match(/[-\w]{25,}/);
const _createAttributes = (css_Class, css_Style, title, id, label) => ({
  "id": id ? id : "",
  "class": css_Class ? css_Class : "",
  "style": css_Style ? css_Style : "",
  "title": title ? title : "",
  "aria-hidden": "false",
  "aria-disabled": "false",
  "aria-label": label ? label : ""
});
const _encodeValue = value => value.replace(/\./g, "%2E");
/* === Internal Constants === */

/* === Internal Variables === */
var _observer;
/* === Internal Variables === */

/* === Internal Functions === */
var _c = console, _w = _c.warn;
var _addTag = (container, name, value, css_Class, css_Style, url, title, id) => {
  if (container) {
    var tag = document.createElement(url ? "a" : "div"),
      attributes = _createAttributes(
        `${_class}${css_Class ? ` ${css_Class}` : ""}`,
        `${_style}${css_Style ? ` ${css_Style}` : ""} ${_getColour((name === "Review" || name === "Reviewed" || name === "Highlight" || name === "Tag" || name === "Locate") ? name : value)}`,
        title, id
      );
    if (url)(attributes.href = url) && (attributes.target = "_blank");
    Object.keys(attributes).forEach(key => tag.setAttribute(key, attributes[key]));
    value = (value === true || value === "TRUE") ? "" : ` - ${value}`;
    tag.appendChild(document.createTextNode(`${(name === "Tag" || name === "Locate") && url ? "" : name}${value}`));
    container.appendChild(tag);
    return tag;
  }
};

var _addSearch = (tag, url, title, css_Class, css_Style, colour, size) => {

  var search = document.createElement("a"),
    attributes = _createAttributes(
      `${_searchClass}${css_Class ? ` ${css_Class}` : ""}`,
      `${_searchStyle}${css_Style ? ` ${css_Style}` : ""}`,
      title, "", "Search"
    );
  if (url)(attributes.href = url) && (attributes.target = "_blank");
  Object.keys(attributes).forEach(key => search.setAttribute(key, attributes[key]));

  search.innerHTML += _search(size ? size : "0.9em", colour);
  tag.appendChild(search);
  return search;

};

var _clean = (container, css_class) => {
  var _existing = container.getElementsByClassName(css_class);
  while (_existing && _existing.length > 0) {
    _existing[0].parentNode.removeChild(_existing[0]);
  }
};

var _needsAuth = container => {

  /* === Click to Auth Handler === */
  var click = document.createElement("a");
  click.setAttribute("href", "#");
  click.innerHTML = _warn;
  click.addEventListener("click", e => {
    e.preventDefault();
    chrome.runtime.sendMessage({
      "action": "request-auth"
    });
  }, true);


  /* === Not Logged In === */
  var warning = document.createElement("div"),
    attributes = _createAttributes(
      "tagadoc docs-icon goog-inline-block",
      false, "To view tags, click to sign in to TagaDoc!"
    );

  Object.keys(attributes).forEach(key => warning.setAttribute(key, attributes[key]));
  warning.appendChild(click);
  container.appendChild(warning);

};

var _run = fn => {
  try {
    fn();
  } catch (e) {
    e.message == "Extension context invalidated." && _observer ?
      _observer.disconnect() : _w(e);
  }
};

var _doc = id => _run(() => chrome.runtime.sendMessage({
  "action": "get-doc-tags",
  "doc": id
}, response => {

  if (!response) return;
  var _container = document.getElementById("docs-titlebar-container");
  if (_container) _container = _container.getElementsByClassName("docs-title-outer");
  if (_container && _container.length > 0)(_container = _container[0]) && _clean(_container, _class);

  if (response.authenticated) {

    if (response.data) {

      var _parent = "root";
      if (response.data.parents && response.data.parents.length > 0) {

        var _team = (response.data.teamDriveId && response.data.parents[0] == response.data.teamDriveId) ? "team." : "",
          _suffix = (response.data.teamDriveId && response.data.parents[0] != response.data.teamDriveId) ? `.${response.data.teamDriveId}` : "",
          _url = `https://${_host}/folders/#google,load.${_team}${response.data.parents[0]}${_suffix}`;

        _addTag(_container, "Locate", true, "goog-inline-block", `${_line} ${_icon}`, _url, "Open Parent in Folders Web App", _parents).innerHTML += `<i style="padding-left: 1px;">${_locate()}</i>`;

        if (response.data.capabilities && response.data.capabilities.canEdit === true) _addTag(_container, "Tag", true, "goog-inline-block", `${_line} ${_icon}`, `${_url}.filter.${response.data.id}`, "Edit Tags in Folders Web App").innerHTML += `<i style="padding-left: 1px;">${_edit()}</i>`;

        chrome.runtime.sendMessage({
          "action": "get-path",
          "folders": response.data.parents,
          "team": response.data.teamDriveId ? response.data.teamDriveId : false
        });

        _parent = response.data.parents[0];

      }
      if (response.data.properties) Object.keys(response.data.properties).forEach(key => {
        var _value = response.data.properties[key],
          _tag = _addTag(_container, key, _value, "goog-inline-block", _line),
          _searchUrl = `https://${_host}/folders/#google,search.properties.${key.replace(/\./g, "%2E")}.${_value.replace(/\./g, "%2E")}.${_parent}`;
        _addSearch(_tag, _searchUrl, "Find all files with the same Tag/Value", "", "", _getColour((key === "Review" || key === "Reviewed" || key === "Highlight" || key === "Tag" || key === "Locate") ? key : _value, true), "0.9em");
      });

    }

  } else if (_container) {

    _needsAuth(_container);

  }

}));

var _cal = (c_id, e_id, container) => _run(() => chrome.runtime.sendMessage({
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

      if (_data.extendedProperties && _data.extendedProperties.shared) Object.keys(_data.extendedProperties.shared).forEach(key => {
        var _value = _data.extendedProperties.shared[key],
          _tag = _addTag(_container, key, _value, false, _stacked),
          _searchUrl = `https://${_host}/events/#google,search.properties.${key.replace(/\./g, "%2E")}.${_value.replace(/\./g, "%2E")}.${c_id.replace(/\./g, "%2E")}`;
        _addSearch(_tag, _searchUrl, "Find all events with the same Tag/Value", "", "", _getColour((key === "Review" || key === "Reviewed" || key === "Highlight" || key === "Tag" || key === "Locate") ? key : _value, true), "1em");
      });

      var _url = `https://${_host}/events/#google,load.item.${_encodeValue(encodeURIComponent(c_id))}.${_encodeValue(encodeURIComponent(e_id))}`;
      _addTag(_container, "Tag", true, false, `${_stacked} ${_icon}`, _url, "Edit Tags in Events Web App").innerHTML += `<i style="padding-left: 1px;">${_edit(_data.extendedProperties && _data.extendedProperties.shared ? 10 : 16)}</i>`;

    }

  } else {

    _needsAuth(container);

  }

}));

var _start = () => {
  var _url = window.location.href;
  if (_isDoc(_url)) {

    var _id = _getId(window.location.href);
    if (_id) _doc(_id);

  } else if (_isCal(_url)) {

    var _check = node => {
      var _candidates = node.getAttribute("jslog") ? [node] : node.querySelectorAll("[jslog]");
      if (_candidates) _candidates.forEach(candidate => {
        var _values = candidate.getAttribute("jslog").split("; ");
        if (_values && _values.length == 3) {
          var _value = _values[1].substring(_values[1].indexOf(":") + 1),
            _event, _calendar;
          if (_value.indexOf("[") === 0) {
            try {
              _value = JSON.parse(_value);
              if (_value && _value.length >= 2) {
                _event = _value[0];
                _calendar = _value[1];
              }
            } catch (e) {
              _event = _value.substring(2, _value.indexOf(",") - 1);
              _calendar = _value.substring(_value.indexOf(",") + 2);
              _calendar = _calendar.substring(0, _calendar.indexOf(",") - 1);
            }
          } else {
            _event = _value.substring(0, _value.indexOf(","));
            _calendar = _value.substring(_value.indexOf(",") + 1);
          }

          if (_event && _calendar) _cal(_calendar, _event, candidate.closest("div[role='dialog']"));
        }
      });
    };

    if (_observer) _observer.disconnect();
    var _config = {
        attributes: false,
        childList: true,
        subtree: true
      },
      _handle = mutants => mutants.forEach(m => {
        if (m.type == "childList" && m.addedNodes) {
          m.addedNodes.forEach(node => {
            if (node && node.querySelectorAll) _check(node);
          });
        }
      });

    _observer = new MutationObserver(_handle);
    _observer.observe(document.body, _config);

    var _open = document.querySelectorAll("div." + _class);
    if (_open && _open.length >= 1) {
      if (_open[0].parentElement) _check(_open[0].parentElement);
    }

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
  if (!request) return;
  if (request.action == "refresh") {
    _start();
  } else if (request.action == "paths") {
    var _path = document.getElementById(_parents);
    if (_path && request.paths) _path.title = request.paths.join(String.fromCharCode(10));
  } else if (request.action == "ping") {
    sendResponse({
      reply: "pong"
    });
  }
});

_start();