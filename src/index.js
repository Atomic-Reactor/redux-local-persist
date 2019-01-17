
import moment from 'moment';
import op from 'object-path';
import _ from 'underscore';

/**
 * -----------------------------------------------------------------------------
 * Redux Local persist
 * @author Cam Tullos <cam@tullos.ninja> (http://cam.tullos.ninja)
 * @description Redux middleware for selectively loading and saving state to localStorage.
 * -----------------------------------------------------------------------------
 */

const RLP = {
    DELIMITER : '.',
    NS        : 'rlp',
};

// Check if a var is an Object
const isObject = (o) => {
    return o instanceof Object && o.constructor === Object;
};

const ls = (typeof window !== 'undefined') ? window.localStorage : {
    getItem: () => {},
    removeItem: () => {},
    setItem: () => {},
};

// Save state to ls
export const save = () => store => next => action => {

    next(action);

    let state    = store.getState();
    let newState = {};
    let expires  = {};

    _.keys(state).forEach((key) => {

        // Get the state value
        let obj = state[key];

        let { persist = false } = obj;

        // Exit if we don't want to persist this state
        if (persist === false) { return; }

        // Save all props w/o expiration
        if (persist === true) {
            newState[key] = obj;
            return;
        }

        // Save all props w/ expiration
        if (typeof persist === 'number') {
            let when = Number(persist);
            if (when !== 0) { expires[key]  = moment().add(when).toISOString(); }
            newState[key] = obj;
            return;
        }

        // Save multiple expirations
        if (isObject(persist)) {

            _.keys(persist).forEach((k) => {
                let when = persist[k];
                if (Number(when) === 0 || when === true) { return; }

                expires[`${key}.${k}`] = moment().add(when).toISOString();
            });

            persist = _.keys(persist);
        }

        // Save a single prop but turn it into an array anyway
        if (typeof persist === 'string') {
            persist = [persist];
        }

        // Save multiple props w/o expiration
        if (_.isArray(persist)) {

            persist.forEach((item) => {
                let val = op.get(obj, item);
                op.set(newState, `${key}.${item}`, val);
            });

            newState[key]['persist'] = obj['persist'];
        }
    });

    ls.setItem(`${RLP.NS}-state`, JSON.stringify(newState));
    ls.setItem(`${RLP.NS}-expire`, JSON.stringify(expires));
};


// Load state from ls
export const load = ({initialState = {}}) => {

    // Get the ls state
    let state    = ls.getItem(`${RLP.NS}-state`) || '{}';
        state    = JSON.parse(state);

    // Get the ls expires
    let expires  = ls.getItem(`${RLP.NS}-expire`) || '{}';
        expires  = JSON.parse(expires);

    // Only validate if expires.length > 0
    if (_.keys(expires).length > 0) {
        let newState = Object.assign({}, state);

        _.keys(expires).forEach((k) => {
            let exp  = moment(expires[k]);
            let diff = moment().diff(exp);

            // If the value is expired -> load the initialState version
            let val = (diff > 0) ? op.get(initialState, k) : op.get(state, k);
            op.set(newState, k, val);
        });

        return newState;

    } else {
        return state;
    }
};

// Clear stored state and expires
export const clear = (keys) => {

    if (!keys) {
        ls.removeItem(`${RLP.NS}-state`);
        ls.removeItem(`${RLP.NS}-expire`);

        return {};

    } else {
        let keys = (typeof keys === 'string') ? [keys] : keys;
            keys = (!_.isArray(keys)) ? [keys] : keys;

        let state = ls.getItem(`${RLP.NS}-state`) || '{}';
            state = JSON.parse(state);

        let expires = ls.removeItem(`${RLP.NS}-expire`) || '{}';
            expires = JSON.parse(expires);

        keys.forEach((key) => {
            op.del(state, key);
            delete expires[key];
        });

        ls.setItem(`${RLP.NS}-state`, JSON.stringify(state));
        ls.setItem(`${RLP.NS}-expire`, JSON.stringify(expires));

        return state;
    }
};

export default {
    clear,
    load,
    save,
}
