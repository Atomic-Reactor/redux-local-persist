'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.clear = exports.load = exports.save = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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

// Save state to localStorage
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
                            var when = Number(persist[k]);
                            if (when === 0) {
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

                localStorage.setItem(RLP.NS + '-state', JSON.stringify(newState));
                localStorage.setItem(RLP.NS + '-expire', JSON.stringify(expires));
            };
        };
    };
};

// Load state from localStorage
var load = exports.load = function load(_ref) {
    var _ref$initialState = _ref.initialState,
        initialState = _ref$initialState === undefined ? {} : _ref$initialState;


    // Get the localStorage state
    var state = localStorage.getItem(RLP.NS + '-state') || '{}';
    state = JSON.parse(state);

    // Get the localStorage expires
    var expires = localStorage.getItem(RLP.NS + '-expire') || '{}';
    expires = JSON.parse(expires);

    // Only validate if expires.length > 0
    if (_underscore2.default.keys(expires).length > 0) {
        var newState = _extends({}, state);

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
var clear = exports.clear = function clear() {
    localStorage.removeItem(RLP.NS + '-state');
    localStorage.removeItem(RLP.NS + '-expire');
};

//# sourceMappingURL=index.js.map