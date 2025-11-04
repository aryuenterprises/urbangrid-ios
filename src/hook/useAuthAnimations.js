
// hooks/useAuthAnimations.js
import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

export const useAuthAnimations = (enabled = true) => {
  const fadeAnim = useRef(new Animated.Value(enabled ? 0 : 1)).current;
  const logoPosition = useRef(new Animated.Value(enabled ? 20 : 0)).current;

  useEffect(() => {
    if (!enabled) return;

    // Gentle fade-in for the whole screen
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
      easing: Easing.out(Easing.quad)
    }).start();

    // Slight upward movement for the logo
    Animated.timing(logoPosition, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
      easing: Easing.out(Easing.quad)
    }).start();
  }, [enabled, fadeAnim, logoPosition]);

  return { fadeAnim, logoPosition };
};