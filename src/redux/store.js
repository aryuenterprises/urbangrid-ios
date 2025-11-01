// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import { MMKV } from 'react-native-mmkv';
import authReducer from './slices/authSlice';
import footerReducer from './slices/footerSlice';
import themeReducer from './slices/themeSlice'; // Add this

// Create MMKV instance
export const storage = new MMKV({
  id: 'redux-persist-storage',
});

// MMKV storage adapter for redux-persist
const mmkvStorage = {
  setItem: (key, value) => {
    storage.set(key, value);
    return Promise.resolve(true);
  },
  getItem: (key) => {
    const value = storage.getString(key);
    return Promise.resolve(value || null);
  },
  removeItem: (key) => {
    storage.delete(key);
    return Promise.resolve();
  },
};

// Persist config
const persistConfig = {
  key: 'root',
  storage: mmkvStorage,
};

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, authReducer);

// Create store
export const store = configureStore({
  reducer: {
    footer: footerReducer,
    auth: persistedReducer,
    theme: themeReducer, // Add theme reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);