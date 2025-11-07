import { reactive, watch } from 'vue';

const stores = {};

function clone(value) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
}

function parsePersisted(value) {
  if (value == null) {
    return undefined;
  }
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

export function defineStore(id, options) {
  const stateFactory = options.state || (() => ({}));
  const actionNames = new Set(Object.keys(options.actions || {}));
  const getterNames = new Set(Object.keys(options.getters || {}));
  const persist = options.persist;
  const storage = persist?.storage;
  const storageKey = persist?.key || id;

  return function useStore() {
    if (stores[id]) {
      return stores[id];
    }

    let persistedState = {};
    if (storage && typeof storage.getItem === 'function') {
      try {
        persistedState = parsePersisted(storage.getItem(storageKey)) || {};
      } catch (error) {
        console.warn(`[pinia-lite] Failed to read persisted state for ${storageKey}`, error);
      }
    }

    const state = reactive({
      ...stateFactory(),
      ...persistedState,
    });

    const store = state;

    Object.entries(options.actions || {}).forEach(([name, action]) => {
      Object.defineProperty(store, name, {
        value: action.bind(store),
        enumerable: false,
      });
    });

    Object.entries(options.getters || {}).forEach(([name, getter]) => {
      Object.defineProperty(store, name, {
        get: () => getter.call(store, store),
        enumerable: true,
      });
    });

    Object.defineProperty(store, '$id', {
      value: id,
      enumerable: false,
    });

    Object.defineProperty(store, '$reset', {
      value: () => {
        const freshState = stateFactory();

        Object.keys(store).forEach((key) => {
          if (actionNames.has(key) || getterNames.has(key) || key === '$id' || key === '$reset') {
            return;
          }
          delete store[key];
        });

        Object.assign(store, freshState);
      },
      enumerable: false,
    });

    if (persist && storage && typeof storage.setItem === 'function') {
      watch(
        state,
        (value) => {
          try {
            storage.setItem(storageKey, clone(value));
          } catch (error) {
            console.warn(`[pinia-lite] Failed to persist store ${storageKey}`, error);
          }
        },
        { deep: true },
      );
    }

    stores[id] = store;
    return store;
  };
}

export function createPinia() {
  return {
    install() {
      /* no-op for compatibility */
    },
    use() {
      /* no-op */
    },
  };
}
