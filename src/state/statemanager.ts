import State from "./state";
import onChange from "on-change";
import { deepEqual } from "./deepequal";

type Callback = (oldValue: unknown, value: unknown, parent?: unknown) => void | Promise<void>;

interface PropertyResult {
  found: boolean;
  object: any;
  parentObject: any;
  lastKey: string | null;
}

class StateManager {
  #state: State;
  #stateProxy: State;
  static #instance: StateManager;
  get state() {
    return this.#stateProxy;
  }

  #callbacks: Record<string, Callback[]> = {};

  constructor() {
    this.#state = new State()
    this.#stateProxy = onChange(
      this.#state,
      (path, value, oldValue, _applyData) => {
        if (!deepEqual(oldValue, value)) {
          this.onChange(path, oldValue, value);
        }
      },
      {
        // Adding object in the state with a name starting by a symbol will avoid to Proxy this object
        // (The Proxy API changes the class!) and prevent to listen changes on this object.
        // NOTE: deepEqual() also ignores underscores when deeply comparing objects
        ignoreUnderscores: true,
        ignoreSymbols: true,
        ignoreDetached: true
      }
    );

    // Prevent extensions of the State Object.
    Object.preventExtensions(this.#state);
  }

  static getInstance(): StateManager {
    if (!StateManager.#instance) {
      StateManager.#instance = new StateManager();
    }
    return StateManager.#instance;
  }

  private onChange(property: string, oldValue: unknown, value: unknown) {
    const path = property.trim();
    for (const key in this.#callbacks) {
      const regex = new RegExp('^' + key + '$');
      if (path.match(regex)) {
        // We find the parent object and send it in the callback
        const indexOfLastPoint = path.lastIndexOf('.');
        const parentPath = path.substring(0, indexOfLastPoint);
        const childPathFromParent = path.substring(indexOfLastPoint + 1);
        const parentObject = this.getPropertyByPath(this.state, parentPath);
        if (!parentObject.found) {
          console.warn('Parent object could not be found in the state');
        } else {
          // At this point, the "value" is not the proxy, but the initial object.
          // But we want to get the proxy and to return it, because it can be used in the calling methods
          // Otherwise, the modifications made to the object won't go through the proxy, and the events won't be fired
          value = parentObject.object[childPathFromParent];
        }

        const callbacks = this.#callbacks[key];
        for (const callback of callbacks) {
          callback(oldValue, value, parentObject.object);
        }
      }
    }
  }

  public subscribe(path: string, callback: Callback): Callback;
  public subscribe(path: RegExp, callback: Callback): Callback;
  public subscribe(path: string | RegExp, callback: Callback): Callback {
    const pathAsString = typeof path === 'string' ? path : path.source;
    if (!(pathAsString in this.#callbacks)) {
      this.#callbacks[pathAsString] = [];
    }
    this.#callbacks[pathAsString].push(callback);

    // At the application start, perhaps the value in state was initialized before the subscribe method was called
    // Therefore, if the subscribed value is not null, undefined or an empty object or array
    // We immediately call the callback.
    const obj = this.getPropertyByPath(this.state, pathAsString);
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
        const parentPath = pathAsString.substring(0, pathAsString.lastIndexOf('.'));
        const parentObject = this.getPropertyByPath(this.state, parentPath);
        callback(null, obj.object, parentObject.object);
      }
    }
    return callback;
  }

  /** Unsubscribe one or multiple trackers by their callbacks.  */
  public unsubscribe(callback: Callback): void;
  public unsubscribe(callbacks: Callback[]): void;
  public unsubscribe(callbacks: Callback | Callback[]): void {
    (Array.isArray(callbacks) ? callbacks : [callbacks]).forEach((callback) => {
      let found = false;
      for (const path in this.#callbacks) {
        const callbacks = this.#callbacks[path];
        const index = callbacks.indexOf(callback);
        if (index !== -1) {
          found = true;
          callbacks.splice(index, 1);
        }
      }
      if (!found) {
        throw Error(`Cannot unsubscribe this callback : it does not exist`);
      }
    });
  }

  /**
   * @returns the property or object, following the given path, and the
   * parent and last key to the parent object to be able to set it (see also setPropertyByPath).
   */
  public getPropertyByPath(obj: any, path: string): PropertyResult {
    let currentObj = obj;
    let parentObject = null;
    let lastKey: string | null = null;
    if (path.trim() !== '') {
      const keys = path.split('.');

      for (const key of keys) {
        if (key in currentObj) {
          parentObject = currentObj;
          lastKey = key;
          currentObj = currentObj[key];
        } else {
          return { found: false, object: null, parentObject, lastKey };
        }
      }
    }

    return { found: true, object: currentObj, parentObject, lastKey };
  }

  /**
   * Sets the value of a property specified by a given path in an object.
   * @returns true if the property was set successfully, false otherwise.
   */
  public setPropertyByPath(obj: any, path: string, value: any): boolean {
    const result = this.getPropertyByPath(obj, path);
    if (result.parentObject && result.lastKey) {
      result.parentObject[result.lastKey] = value;
      return true;
    }
    return false;
  }
}

export default StateManager;
