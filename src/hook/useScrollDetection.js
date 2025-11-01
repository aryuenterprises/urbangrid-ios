// src/hook/useScrollDetection.js
import { useCallback, useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRoute } from '@react-navigation/native';
import { hideFooter, showFooter } from '../redux/slices/footerSlice';

export const useScrollDetection = () => {
  const dispatch = useDispatch();
  const route = useRoute();
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastOffsetY = useRef(0);
  const scrollTimeout = useRef(null);
  const isScrolling = useRef(false);

  // Screens where we want to hide footer completely
  const hideFooterScreens = ['TaskDetail', 'Assessment', "ChatScreen", "AttendanceDetailScreen"];

  // Check if current screen should hide footer
  const shouldHideFooter = hideFooterScreens.includes(route.name);

  useEffect(() => {
    // Immediately hide footer if this screen requires it
    if (shouldHideFooter) {
      dispatch(hideFooter());
    } else {
      dispatch(showFooter());
    }

    // Cleanup: Show footer when leaving this screen
    return () => {
      if (shouldHideFooter) {
        dispatch(showFooter());
      }
    };
  }, [shouldHideFooter, dispatch]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      listener: (event) => {
        // Don't handle scroll-based footer visibility if screen should always hide footer
        if (shouldHideFooter) return;

        const offsetY = event.nativeEvent.contentOffset.y;

        // Clear any existing timeout
        if (scrollTimeout.current) {
          clearTimeout(scrollTimeout.current);
        }

        // Set scrolling state
        if (!isScrolling.current) {
          isScrolling.current = true;
        }

        // Determine scroll direction with threshold to prevent jitter
        if (offsetY > lastOffsetY.current + 5) {
          // Scrolling down - hide footer
          dispatch(hideFooter());
        } else if (offsetY < lastOffsetY.current - 5) {
          // Scrolling up - show footer
          dispatch(showFooter());
        }

        lastOffsetY.current = offsetY;

        // Show footer again after scrolling stops
        scrollTimeout.current = setTimeout(() => {
          isScrolling.current = false;
          dispatch(showFooter());
        }, 1500);
      },
      useNativeDriver: true,
    }
  );

  // Create animated versions of scroll components
  const createAnimatedScrollView = useCallback((ScrollViewComponent) => {
    return Animated.createAnimatedComponent(ScrollViewComponent);
  }, []);

  return {
    handleScroll,
    scrollY,
    createAnimatedScrollView,
    shouldHideFooter // Return this for conditional rendering
  };
};