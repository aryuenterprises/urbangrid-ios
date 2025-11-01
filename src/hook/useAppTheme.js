import { useSelector } from 'react-redux';
import { useTheme as usePaperTheme } from 'react-native-paper';
import { selectThemeMode, selectIsDarkMode } from '../redux/slices/themeSlice';
import { lightTheme, darkTheme } from '../theme/index'; // Adjust path if needed

export const useAppTheme = () => {
  // Get theme state from Redux
  const themeMode = useSelector(selectThemeMode);
  const isDark = useSelector(selectIsDarkMode);
  
  // Safe theme selection with fallback
  const theme = isDark ? (darkTheme || lightTheme) : (lightTheme || DefaultTheme);
  
  // Use Paper's theme hook for component-level theming
  const paperTheme = usePaperTheme();
  
  // Safe color access with better error handling
  const getColor = (colorKey) => {
    if (!theme || !theme.colors) {
      console.warn('Theme or theme.colors is undefined');
      return '#000000'; // Fallback color
    }
    
    return theme.colors.custom?.[colorKey] || 
           theme.colors[colorKey] || 
           colorKey;
  };
  
  // Helper to get status colors
  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'present': return getColor('present');
      case 'leave': return getColor('warning');
      case 'absent': return getColor('error');
      default: return getColor('textSecondary');
    }
  };

  // If theme is undefined, provide a minimal fallback
  if (!theme) {
    console.warn('Theme is undefined, using fallback theme');
    return {
      theme: DefaultTheme,
      paperTheme,
      isDark: false,
      themeMode: 'light',
      colors: {},
      getColor: (colorKey) => colorKey,
      getStatusColor,
      primaryColor: '#C40116',
      backgroundColor: '#f8f9fa',
      textColor: '#212529',
      textSecondaryColor: '#6c757d',
    };
  }
  
  return { 
    // Theme objects
    theme,
    paperTheme,
    
    // State
    isDark,
    themeMode,
    
    // Color access
    colors: theme.colors.custom || {},
    getColor,
    
    // Helpers
    getStatusColor,
    
    // Shortcuts for common colors
    primaryColor: getColor('primary'),
    backgroundColor: getColor('background'),
    textColor: getColor('textPrimary'),
    textSecondaryColor: getColor('textSecondary'),
  };
};