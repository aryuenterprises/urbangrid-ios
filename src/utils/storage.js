// utils/storage.js
import { MMKV } from 'react-native-mmkv';

// Create main storage instance
export const storage = new MMKV({
    id: 'app-storage',
});

export const Storage = {
    // String operations
    setItem: (key, value) => {
        storage.set(key, value);
    },
    getItem: (key) => {
        return storage.getString(key);
    },

    // Object operations (auto JSON stringify/parse)
    setObject: (key, value) => {
        storage.set(key, JSON.stringify(value));
    },
    getObject: (key) => {
        const value = storage.getString(key);
        return value ? JSON.parse(value) : null;
    },

    // Number operations
    setNumber: (key, value) => {
        storage.set(key, value);
    },
    getNumber: (key) => {
        return storage.getNumber(key);
    },

    // Boolean operations
    setBoolean: (key, value) => {
        storage.set(key, value);
    },
    getBoolean: (key) => {
        return storage.getBoolean(key);
    },

    // Remove and clear
    removeItem: (key) => {
        storage.delete(key);
    },
    clear: () => {
        storage.clearAll();
    },

    // Check if key exists
    contains: (key) => {
        return storage.contains(key);
    },

    // Get all keys
    getAllKeys: () => {
        return storage.getAllKeys();
    },
};

export default Storage;