# Redux Local Persist

[![Greenkeeper badge](https://badges.greenkeeper.io/Atomic-Reactor/redux-local-persist.svg)](https://greenkeeper.io/)

Redux middleware for selectively loading and saving state to localStorage.
Redux Local Persist allows you to add a `persist` property to your Redux state that will specify how the defined values are saved in localStorage.

## Applying the Middleware
```js
import todos from './reducers';
import initialState from './state';
import { load, save } from 'redux-local-persist';
import { createStore, applyMiddleware } from 'redux';


// Load the persistent state from localStorage
let state = {
    ...initialState,
    ...load({initialState: initialState})
};

const store = createStore(
  todos,
  state,
  applyMiddleware(save())
);

store.dispatch({
  type: 'ADD_TODO',
  text: 'Understand the middleware'
});
```
If the `initialState` is persisting the `text` property, it will be saved to localStorage after `store.dispatch` is executed.


## Methods

### clear({ properites:String|Array [Optional] })
Clears the Redux Local Persist values from localStorage.
```js
/**
 * Given the state:
    let initialState = {
        count: 0,
        deep: {
            nested: {
                value: 123
            }
        },
        loaded: true,
        persist: true,
    };
 */

...
import { clear } from 'redux-local-persist';

clear();                                // returns: {}
clear('deep.nested.value');             // returns: {count: 0, loaded: true}
clear(['count', 'deep.nested.value']);  // returns: {loaded: true}
```

### load({ intialState:Object })
Gets the Redux Local Persist values from localStorage. If the values have expired, the initialState value is used.

### save()
Automatically saves state changes to localStorage.



## The Persist Property

The persist property can be of type: **Boolean|Number|String|Array|Object**

### Persist as a Boolean
When set to `true`, the entire state tree for the connected component will be saved _indefinitely_.

### Persist as a Number
The entire state tree for the connected component will be saved for the specified number of _milliseconds_.
The next time the state is loaded from `window.localStorage`, the timestamp of the last save will be checked against the current time and if it's past the duration the Object Path will not be included.

### Persist as a String
Only the specified Object Path of the state tree for the connected component will be saved _indefinitely_.

Example: `deep.nested.value` would persist a state tree of:
```js
{
    deep: {
        nested: {
            value: 123
        }
    }
}
```

### Persist as an Array of Strings
Only the specified Object Paths of the state tree for the connected component will be saved _indefinitely_.

Example: `['deep.nested.value', 'count']` would persist a state tree of:
```js
{
    count: 0,
    deep: {
        nested: {
            value: 123
        }
    }
}
```

### Persist as an Object
Only the specified Object Paths of the state tree for the connected component will be saved for the specified number of _milliseconds_.

Example: `{'deep.nested.value': 10000, 'loaded': 30000}` would persist a state tree of:
```js
{
    loaded: false,
    deep: {
        nested: {
            value: 123
        }
    }
}
```

## Usage

### Simple
Persist the entire state tree indefinitely:

```js
...
let initialState = {
    count: 0,
    loaded: false,
    persist: true
};
...
```

### Simple Usage with Expiration
Persist the entire state tree for 10 seconds:

```js
...
let initialState = {
  count: 0,
  loaded: false,
  persist: 10000,
};
...
```


### Save Specific Parts of State Tree
Persist only `deep.nested.value` and `loaded` values indefinitely:

```js
...
let initialState = {
  count: 0,
  loaded: false,
  deep: {
      nested: {
          value: 123
      }
  }
  persist: ['deep.nested.value', 'loaded'],
};
...
```


### Save Specific Parts of State Tree with Expiration
Persist only the `deep.nested.value` for 10 seconds, `loaded` for 5 seconds, and `count` indefinitely:

```js
...
let initialState = {
  count: 0,
  loaded: false,
  deep: {
      nested: {
          value: 123
      }
  }
  persist: {
      'deep.nested.value': 10000,
      'loaded': 5000,
      'count': true
  },
};
...
```
