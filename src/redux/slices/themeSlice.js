import { createSlice } from '@reduxjs/toolkit';
import { MMKV } from 'react-native-mmkv';

// Initialize MMKV
export const storage = new MMKV();

// Helper to load theme from MMKV storage
const loadThemeFromStorage = () => {
  try {
    const savedTheme = storage.getString('theme');
    return savedTheme || 'light';
  } catch (error) {
    console.error('Error loading theme from storage:', error);
    return 'light';
  }
};

// Helper to save theme to MMKV storage
const saveThemeToStorage = (theme) => {
  try {
    storage.set('theme', theme);
  } catch (error) {
    console.error('Error saving theme to storage:', error);
    throw error;
  }
};

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    mode: loadThemeFromStorage(),
    systemThemeSupported: false,
    loading: false,
    error: null,
  },
  reducers: {
    toggleTheme: (state) => {
      const newTheme = state.mode === 'light' ? 'dark' : 'light';
      state.mode = newTheme;
      
      // Save to storage asynchronously
      try {
        saveThemeToStorage(newTheme);
      } catch (error) {
        state.error = error.message;
      }
    },
    
    setTheme: (state, action) => {
      const newTheme = action.payload;
      if (['light', 'dark'].includes(newTheme)) {
        state.mode = newTheme;
        
        // Save to storage
        try {
          saveThemeToStorage(newTheme);
        } catch (error) {
          state.error = error.message;
        }
      }
    },
    
    setThemeLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    setThemeError: (state, action) => {
      state.error = action.payload;
    },
    
    resetTheme: (state) => {
      state.mode = 'light';
      state.error = null;
      
      // Save reset to storage
      try {
        saveThemeToStorage('light');
      } catch (error) {
        state.error = error.message;
      }
    },
    
    // New action to load theme from storage (useful for app startup)
    loadTheme: (state) => {
      state.mode = loadThemeFromStorage();
    },
  },
});

// Export everything
export const { 
  toggleTheme, 
  setTheme,
  setThemeLoading,
  setThemeError,
  resetTheme,
  loadTheme
} = themeSlice.actions;

export const selectThemeMode = (state) => state.theme.mode;
export const selectIsDarkMode = (state) => state.theme.mode === 'dark';
export const selectThemeLoading = (state) => state.theme.loading;
export const selectThemeError = (state) => state.theme.error;

export default themeSlice.reducer;