import State from "./state";
import onChange from "on-change";

type CallbackFunction = (oldValue: unknown, value: unknown, parent?: unknown) => void | Promise<void>;

class StateManager {
  #state: State;
  #stateProxy: State;
  static #instance: StateManager;
  #callbacks: Record<string, CallbackFunction[]> = {};

  private constructor() {
    this.#state = new State()
    this.#stateProxy = onChange(
      this.#state,
      (path, value, oldValue, _applyData) => {
        if (!this.areEqual(oldValue, value)) {
          //console.debug(`${path} has changed.`);
          this.triggerCallbacks(path, oldValue, value);
        }
      },{
        ignoreKeys: ['styleFunction_', 'values_']
      });
    Object.preventExtensions(this.#state);
  }

  get state() {
    return this.#stateProxy;
  }

  static getInstance(): StateManager {
    if (!StateManager.#instance) {
      StateManager.#instance = new StateManager();
    }
    return StateManager.#instance;
  }

  private triggerCallbacks(property: string, oldValue: unknown, newValue: unknown) {
    const path = property.trim();
    for (const key in this.#callbacks) {
      const regex = new RegExp(`^${key}$`);
      if (path.match(regex)) {
        // We find the parent object and send it in the callback
        const indexOfLastPoint = path.lastIndexOf('.');
        const parentPath = path.substring(0, indexOfLastPoint);
        const childPathFromParent = path.substring(indexOfLastPoint + 1);
        const parentObject = this.getPropertyByPath(this.state, parentPath);
        if (!parentObject.found) {
          console.warn('Parent object could not be found in the state');
        } else {
          // At this point, the "newValue" is not the proxy, but the initial object.
          // But we want to get the proxy and to return it, because it can be used in the calling methods
          // Otherwise, the modifications made to the object won't go through the proxy, and the events won't be fired
          newValue = parentObject.object[childPathFromParent];
        }

        const callbacks = this.#callbacks[key];
        for (const callback of callbacks) {
          callback(oldValue, newValue, parentObject.object);
        }
      }
    }
  }

  subscribe(path: string, callback: CallbackFunction) {
    if (!(path in this.#callbacks)) {
      this.#callbacks[path] = [];
    }
    this.#callbacks[path].push(callback);
    console.debug(`Subscribing to ${path}. ${this.#callbacks[path].length} are currently subscribing ${path}.`);

    // At the application start, perhaps the value in state was initialized before the subscribe method was called
    // Therefore, if the subscribed value os not null, undefined or an empty object or array
    // We immediately call the callback.
    const obj = this.getPropertyByPath(this.state, path);
    if (obj.found) {
      if (
        obj.object === null ||
        obj.object === undefined ||
        (Array.isArray(obj.object) && obj.object.length === 0) ||
        (obj.object instanceof Object && Object.keys(obj.object).length === 0)
      ) {
        // Empty object => nothing to do
      } else {
        // Object is not null during the subscribe. => we call the callback
        const parentPath = path.substring(0, path.lastIndexOf('.'));
        const parentObject = this.getPropertyByPath(this.state, parentPath);
        callback(null, obj.object, parentObject.object);
      }
    }
  }

  unsubscribe(callback: CallbackFunction) {
    let found = false;
    for (const path in this.#callbacks) {
      const callbacks = this.#callbacks[path];
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        found = true;
        callbacks.splice(index, 1);
        console.debug(`Unsubscribing to ${path}. ${this.#callbacks[path].length} subscribtions remaining.`);
      }
    }
    if (!found) {
      throw Error(`Cannot unsubscribe this callback : it does not exist`);
    }
  }

  getPropertyByPath(obj: any, path: string) {
    let currentObj = obj;
    if (path.trim() !== '') {
      const keys = path.split('.');

      for (const key of keys) {
        if (key in currentObj) {
          currentObj = currentObj[key];
        } else {
          return { found: false, object: null };
        }
      }
    }

    return { found: true, object: currentObj };
  }

  /**
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value
   * @returns a replacer for a cyclic value
   */
  getCircularReplacer() {
    const visitedObjects = new WeakSet();

    return function (_key: string, value: any) {
      if (typeof value !== 'object' || value === null) {
        // The value is not an object
        // => We just return it
        return value;
      }

      if (visitedObjects.has(value)) {
        // We have found a circular reference.
        // => We replace it with a dummy string.
        return '[Circular]';
      }

      // Add the object to the list of visited objects
      visitedObjects.add(value);

      // Return the value
      return value;
    };
  }

  areEqual(obj1: any, obj2: any) {
    if (typeof obj1 === 'number' && typeof obj2 === 'number') {
      // Special case for numbers : check NaN
      if (Number.isNaN(obj1) && Number.isNaN(obj2)) {
        return true;
      }
      return obj1 === obj2;
    }

    if (
      typeof obj1 !== 'object' ||
      typeof obj2 !== 'object' ||
      obj1 === null ||
      obj2 === null ||
      obj1 === undefined ||
      obj2 === undefined
    ) {
      // Compare simple values
      return obj1 === obj2;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
      // Not the same number of properties
      return false;
    }

    if (JSON.stringify(obj1, this.getCircularReplacer()) !== JSON.stringify(obj2, this.getCircularReplacer())) {
      return false;
    }

    // Everything is equal
    return true;
  }
}

export default StateManager;
