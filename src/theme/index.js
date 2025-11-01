import { DefaultTheme, DarkTheme } from 'react-native-paper';

export const lightTheme = {
  colors: {
    // Paper required colors
    primary: '#C40116', // '#C40116'
    accent: '#5E000B', // '#5E000B'
    background: '#f8f9fa', // '#f8f9fa'
    surface: '#ffffff', // '#ffffff'
    text: '#212529', // '#212529'
    onSurface: '#212529', // '#212529'
    disabled: '#6c757d', // '#6c757d'
    placeholder: '#6c757d', // '#6c757d'
    backdrop: '#343a40', // '#343a40'
    notification: '#C40116', // '#C40116'
    error: '#e74c3c', // '#e74c3c'
    custom: {
      // Your existing color palette
      primary: '#C40116',
      secondary: '#5E000B',
      white: '#ffffff',
      link: "#2962FF",
      link2: '#0056B3',
      error: '#e74c3c',
      blue: '#3498db',
      present: '#2ecc71',
      success: '#28a745',
      warning: '#020202ff',
      card: '#fff',
      info: '#17a2b8',
      lightGray: '#e9ecef',
      textGrey: "#2c3e50",
      darkGray: '#343a40',
      highPriority: '#C40116',  // Your primary
      mediumPriority: '#FF8F00', // Orange
      lowPriority: '#2E7D32',   // Green
      skeletonBg: '#E1E1E1',
      skeletonHighlight: '#F5F5F5',
      textPrimary: '#212529',
      textSecondary: '#6c757d',
      background: '#f8f9fa',
      notifiCard: "#f0f7ff",
      presetStat: '#EBF9F0',
      taskStat: '#E8F4FD',
      progressStat: '#F5F5F5',
    }
  },
  roundness: 8,
};

export const darkTheme = {
  colors: {
    // Paper required colors - dark variants
    primary: '#C40116', // Keep your brand primary color
    accent: '#5E000B', // Keep your brand secondary color
    background: '#121212', // Dark background
    surface: '#1e1e1e', // Dark surface
    text: '#ffffff', // Light text on dark background
    onSurface: '#ffffff', // Light text on surfaces
    disabled: '#666666', // Dark disabled
    placeholder: '#888888', // Dark placeholder
    backdrop: '#000000', // Dark backdrop
    notification: '#C40116', // Keep your primary
    error: '#e74c3c', // Keep your error color

    // Your custom colors for dark mode
    custom: {
      // Keep your brand colors
      primary: '#C40116',
      secondary: '#5E000B',
      white: '#ffffff',
      link: "#2962FF",
      link2: '#0056B3',
      error: '#e74c3c',
      blue: "#64D2FF",
      present: "#4CD964",
      success: '#28a745',
      warning: "#FFD60A",
      info: '#17a2b8',
      card: '#1E1E1E',
      textGrey: "#f7f7f7",
      // Adjusted colors for dark mode
      lightGray: '#333333', // Darker gray for dark mode
      darkGray: '#1a1a1a', // Even darker
      highPriority: '#C40116',  // Your primary
      mediumPriority: '#FF8F00', // Orange
      lowPriority: '#2E7D32',   // Green
      skeletonBg: '#2a2a2a', // Dark skeleton
      skeletonHighlight: '#3a3a3a', // Dark skeleton highlight
      textPrimary: '#ffffff', // Light text
      textSecondary: '#aaaaaa', // Light secondary text
      background: '#121212', // Dark background
      notifiCard: '#1a2839',
      presetStat: '#0D2915',
      taskStat: '#0A1F33',
      progressStat: '#2B2B2B',
    }
  },
};

// Export theme names for easy reference
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
};

// Helper function to get theme by mode
export const getThemeByMode = (mode) => {
  return mode === THEME_MODES.DARK ? darkTheme : lightTheme;
};