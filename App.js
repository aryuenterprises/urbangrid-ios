import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Alert, Animated, Dimensions, Platform, StatusBar, StyleSheet, View } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import Lottie from 'lottie-react-native';
import AuthNavigator from './src/navigation/AuthNavigator';
import { checkAuth, getCurrentUser, getSettings } from './src/services/auth';
import { createStackNavigator } from '@react-navigation/stack';
import OnboardingScreen from './src/screens/Onboard/OnBoardingScreen';
import { hp } from './src/utils/responsive';
import OfflineNotice from './src/components/OfflineNotice';
import useNetworkStatus from './src/hook/useNetworkStatus';
import { navigationRef } from './src/navigation/RootNavigation';
import { Provider, useSelector } from 'react-redux';
import { store } from './src/redux/store';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import MainDrawerNavigator from './src/navigation/AppNavigator';
import Storage from './src/utils/storage';
import { useAppTheme } from './src/hook/useAppTheme';

// enableScreens();
const Stack = createStackNavigator();
const { width, height } = Dimensions.get('window');

const createToastConfig = (theme) => ({
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: theme.colors.custom?.success || '#4CAF50',
        backgroundColor: theme.colors.surface,
        height: "auto",
        width: width * 0.9,
      }}
      contentContainerStyle={{ padding: hp("2%") }}
      text1Style={{
        fontSize: hp(2.2),
        fontFamily: 'Manrope-Medium',
        color: theme.colors.text
      }}
      text2Style={{
        fontSize: hp(1.8),
        color: theme.colors.text,
        fontFamily: 'Manrope-Regular',
      }}
    />
  ),

  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: theme.colors.custom?.error || '#F44336',
        backgroundColor: theme.colors.surface,
        height: "auto",
        width: width * 0.9,
      }}
      contentContainerStyle={{ padding: hp("2%") }}
      text1Style={{
        fontSize: hp(2.2),
        fontFamily: 'Manrope-Medium',
        color: theme.colors.text
      }}
      text2Style={{
        fontSize: hp(1.8),
        color: theme.colors.text,
        fontFamily: 'Manrope-Regular',
      }}
    />
  ),

  info: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: theme.colors.primary,
        backgroundColor: theme.colors.primary,
        height: hp(7),
        width: width * 0.9,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: hp(2.2),
        color: theme.colors.surface,
        fontFamily: 'Manrope-Bold',
      }}
      text2Style={{
        fontSize: hp(1.8),
        color: theme.colors.surface,
        fontFamily: 'Manrope-Regular',
      }}
    />
  ),

  custom: ({ text1, props }) => (
    <View style={[
      styles.customToast,
      {
        width: width * 0.9,
        backgroundColor: theme.colors.custom?.darkGray || '#333'
      }
    ]}>
      <Text style={[
        styles.customToastText,
        { color: theme.colors.surface }
      ]}>
        {text1}
      </Text>
    </View>
  )
});

// Themed App Component
const ThemedAppContent = () => {
  const { theme, isDark } = useAppTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const [isAnimationFinished, setAnimationFinished] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isOnline = useNetworkStatus();
  const { settings } = useSelector(state => state.auth);


  useEffect(() => {
    async function initializeApp() {
      try {
        // Check if it's first launch
        const appData = Storage.getItem('appLaunched');
        if (appData === null) {
          setIsFirstLaunch(true);
          Storage.setItem('appLaunched', 'false');
        } else {
          setIsFirstLaunch(false);
        }

        // Check authentication
        await checkAuth();

        const authData = await getCurrentUser();
        setUser(authData || null);

        await getSettings();
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Authentication Required',
          text2: 'Please log in to continue'
        });
      } finally {
        setLoading(false);
      }
    }
    initializeApp();
  }, []);


  useEffect(() => {
    // Set global status bar style based on theme
    StatusBar.setBarStyle(
      isDark ? 'light-content' : 'dark-content',
      true
    );

    // For Android - set background color if needed
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('transparent');
      StatusBar.setTranslucent(true);
    }
  }, [isDark]);

  const handleAnimationFinish = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.5,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setAnimationFinished(true);
    });
  };

  // Show splash screen until all conditions are met
  if (loading || !isAnimationFinished || isFirstLaunch === null) {
    return (
      <View style={[
        styles.splashContainer,
        { backgroundColor: theme.colors.custom?.darkGray || '#262626' }
      ]}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />
        <Animated.View
          style={[
            styles.lottieContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <Lottie
            source={require('./src/assets/animation/splash.json')}
            autoPlay
            loop={false}
            onAnimationFinish={handleAnimationFinish}
            resizeMode="contain"
            style={styles.lottie}
          />
        </Animated.View>
      </View>
    );
  }

  const getInitialRoute = () => {
    if (isFirstLaunch) return 'Onboarding';
    return user ? 'App' : 'Auth';
  };

  const toastConfig = createToastConfig(theme);

  return (
    <>
      <NavigationContainer ref={navigationRef}>
        {!isOnline && <OfflineNotice />}
        <Stack.Navigator
          initialRouteName={getInitialRoute()}
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: theme.colors.background },
            cardOverlayEnabled: true,
            cardStyleInterpolator: ({ current: { progress } }) => ({
              cardStyle: {
                opacity: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
              overlayStyle: {
                opacity: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.5],
                  extrapolate: 'clamp',
                }),
              },
            }),
          }}
        >
          <Stack.Screen name="Onboarding">
            {(props) => <OnboardingScreen {...props} setIsFirstLaunch={setIsFirstLaunch} />}
          </Stack.Screen>
          <Stack.Screen name="Auth" component={AuthNavigator} />
          <Stack.Screen name="App" component={MainDrawerNavigator} />
        </Stack.Navigator>
        <Toast
          config={toastConfig}
          topOffset={StatusBar.currentHeight + hp("5%")}
          visibilityTime={4000}
        />
      </NavigationContainer>
    </>
  );
};

// Main App Component with Providers
const App = () => {

  return (
    <Provider store={store}>
      <ThemedAppWrapper />
    </Provider>
  );
};

// Wrapper component to use the theme hook inside Redux Provider
const ThemedAppWrapper = () => {
  const { theme } = useAppTheme();

  return (
    <PaperProvider theme={theme}>
      <ThemedAppContent />
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
  },
  lottieContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: hp("20%"),
    height: hp("20%"),
  },
  customToast: {
    height: hp(8),
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  customToastText: {
    fontSize: hp(2.2),
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Manrope-Regular',
  },
});

export default App;