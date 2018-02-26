var network = () => {

    /* === Internal Constants === */
    const QUERY = (value, append) => Object.keys(value).reduce(function(str, key, i) {
        var delimiter, val;
        delimiter = (i === 0 || append) ? "?" : "&";
        key = encodeURIComponent(key);
        val = encodeURIComponent(value[key]);
        return [str, delimiter, key, "=", val].join("");
    }, "");
    /* === Internal Constants === */


    /* === Internal Functions === */
    var _request = (verb, url, token, data, contentType, responseType, mode) => new Promise((resolve, reject) => {

        verb = verb.toUpperCase();
        var _url = new URL(url);
        var _request = {
            mode: mode ? mode : "cors",
            method: verb,
            headers: {
                "Content-Type": contentType ? contentType : "application/json",
                "Authorization": `Bearer ${token}`
            },
            redirect: "follow",
            body: verb != "GET" ? !contentType || contentType == "application/json" ? JSON.stringify(data) : data : null
        };


        /* <!-- Get the URL, including appending data as the query string if required --> */
        var _target = _url.href + (data && verb == "GET" && !contentType ? QUERY(data, _url.href.indexOf("?") > 0) : ""),
            _failure = e => reject({
                url: _url.href,
                error: e
            }),
            _success = response => {

                /* <!-- Fetch Executed, but may have returned a non-200 status code --> */
                if (response.ok) {

                    if (response.status == 204) {
                        resolve(true);
                    }
                    else {
                        var _response;
                        if (!responseType || responseType == "application/json") {
                            _response = response.json();
                        }
                        else if (responseType == "text/plain") {
                            _response = response.text();
                        }
                        else if (responseType == "application/binary") {
                            _response = response.blob();
                        }
                        _response
                            .then(value => resolve(value))
                            .catch(e => reject({
                                name: "Could not process response",
                                url: response.url,
                                status: response.status,
                                statusText: response.statusText
                            }));
                    }

                } else if (response.type == "opaque" && !response.status) {
                
                    resolve(true);
                    
                } else {

                    reject({
                        name: "Fetch HTTP Error",
                        url: response.url,
                        status: response.status,
                        statusText: response.statusText
                    });
                }
            };

        fetch(_target, _request).then(_success).catch(_failure);

    });

    var _token = interactive => new Promise((resolve, reject) => {

        chrome.identity.getAuthToken({
            "interactive": interactive
        }, token => {
            !chrome.runtime.lastError && token ? resolve(token) : reject(chrome.runtime.lastError);
        });

    });

    var _remove = token => new Promise((resolve, reject) => {
        chrome.identity.removeCachedAuthToken({
            "token": token
        }, () => resolve(token));
    });

    var _revoke = token => new Promise((resolve, reject) => {
        _request("GET", `https://accounts.google.com/o/oauth2/revoke?token=${token}`, "", null, null, null, "no-cors")
            .then(data => resolve(data))
            .catch(error => reject(error));
    });
    /* === Internal Functions === */


    /* === External Visibility === */
    return {

        request: (verb, url, token, data, contentType, responseType, mode) => _request(verb, url, token, data, contentType, responseType, mode),

        token: {

            get: interactive => _token(interactive),

            remove: token => _remove(token),

            revoke: token => _revoke(token).then(() => _remove(token)),

        }

    };
    /* === External Visibility === */

}