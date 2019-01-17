'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.clear = exports.load = exports.save = undefined;

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _objectPath = require('object-path');

var _objectPath2 = _interopRequireDefault(_objectPath);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * -----------------------------------------------------------------------------
 * Redux Local persist
 * @author Cam Tullos <cam@tullos.ninja> (http://cam.tullos.ninja)
 * @description Redux middleware for selectively loading and saving state to localStorage.
 * -----------------------------------------------------------------------------
 */

var RLP = {
    DELIMITER: '.',
    NS: 'rlp'
};

// Check if a var is an Object
var isObject = function isObject(o) {
    return o instanceof Object && o.constructor === Object;
};

var ls = typeof window !== 'undefined' ? window.localStorage : {
    getItem: function getItem() {},
    removeItem: function removeItem() {},
    setItem: function setItem() {}
};

// Save state to ls
var save = exports.save = function save() {
    return function (store) {
        return function (next) {
            return function (action) {

                next(action);

                var state = store.getState();
                var newState = {};
                var expires = {};

                _underscore2.default.keys(state).forEach(function (key) {

                    // Get the state value
                    var obj = state[key];

                    var _obj$persist = obj.persist,
                        persist = _obj$persist === undefined ? false : _obj$persist;

                    // Exit if we don't want to persist this state

                    if (persist === false) {
                        return;
                    }

                    // Save all props w/o expiration
                    if (persist === true) {
                        newState[key] = obj;
                        return;
                    }

                    // Save all props w/ expiration
                    if (typeof persist === 'number') {
                        var when = Number(persist);
                        if (when !== 0) {
                            expires[key] = (0, _moment2.default)().add(when).toISOString();
                        }
                        newState[key] = obj;
                        return;
                    }

                    // Save multiple expirations
                    if (isObject(persist)) {

                        _underscore2.default.keys(persist).forEach(function (k) {
                            var when = persist[k];
                            if (Number(when) === 0 || when === true) {
                                return;
                            }

                            expires[key + '.' + k] = (0, _moment2.default)().add(when).toISOString();
                        });

                        persist = _underscore2.default.keys(persist);
                    }

                    // Save a single prop but turn it into an array anyway
                    if (typeof persist === 'string') {
                        persist = [persist];
                    }

                    // Save multiple props w/o expiration
                    if (_underscore2.default.isArray(persist)) {

                        persist.forEach(function (item) {
                            var val = _objectPath2.default.get(obj, item);
                            _objectPath2.default.set(newState, key + '.' + item, val);
                        });

                        newState[key]['persist'] = obj['persist'];
                    }
                });

                ls.setItem(RLP.NS + '-state', JSON.stringify(newState));
                ls.setItem(RLP.NS + '-expire', JSON.stringify(expires));
            };
        };
    };
};

// Load state from ls
var load = exports.load = function load(_ref) {
    var _ref$initialState = _ref.initialState,
        initialState = _ref$initialState === undefined ? {} : _ref$initialState;


    // Get the ls state
    var state = ls.getItem(RLP.NS + '-state') || '{}';
    state = JSON.parse(state);

    // Get the ls expires
    var expires = ls.getItem(RLP.NS + '-expire') || '{}';
    expires = JSON.parse(expires);

    // Only validate if expires.length > 0
    if (_underscore2.default.keys(expires).length > 0) {
        var newState = Object.assign({}, state);

        _underscore2.default.keys(expires).forEach(function (k) {
            var exp = (0, _moment2.default)(expires[k]);
            var diff = (0, _moment2.default)().diff(exp);

            // If the value is expired -> load the initialState version
            var val = diff > 0 ? _objectPath2.default.get(initialState, k) : _objectPath2.default.get(state, k);
            _objectPath2.default.set(newState, k, val);
        });

        return newState;
    } else {
        return state;
    }
};

// Clear stored state and expires
var clear = exports.clear = function clear(keys) {

    if (!keys) {
        ls.removeItem(RLP.NS + '-state');
        ls.removeItem(RLP.NS + '-expire');

        return {};
    } else {
        var _keys = typeof _keys === 'string' ? [_keys] : _keys;
        _keys = !_underscore2.default.isArray(_keys) ? [_keys] : _keys;

        var state = ls.getItem(RLP.NS + '-state') || '{}';
        state = JSON.parse(state);

        var expires = ls.removeItem(RLP.NS + '-expire') || '{}';
        expires = JSON.parse(expires);

        _keys.forEach(function (key) {
            _objectPath2.default.del(state, key);
            delete expires[key];
        });

        ls.setItem(RLP.NS + '-state', JSON.stringify(state));
        ls.setItem(RLP.NS + '-expire', JSON.stringify(expires));

        return state;
    }
};

exports.default = {
    clear: clear,
    load: load,
    save: save
};

//# sourceMappingURL=index.js.map