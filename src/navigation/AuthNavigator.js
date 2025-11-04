import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SignupScreen from '../screens/Auth/SignupScreen';
import ProfileForm from '../screens/ProfileForm/ProfileForm';
import LoginScreen from '../screens/Auth/LoginScreen'
import ForgotPasswordScreen from '../screens/ForgotPassword/ForgotPasswordScreen';
import VerifyOTPScreen from '../screens/ForgotPassword/VerifyOTPScreen';
import ResetPasswordScreen from '../screens/ForgotPassword/ResetPasswordScreen';
const Stack = createStackNavigator();

const AuthNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: "#000" },
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
    }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
    <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
    <Stack.Screen name="VerifyOTPScreen" component={VerifyOTPScreen} />
    <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
    <Stack.Screen name="ProfileForm" component={ProfileForm} />
  </Stack.Navigator>
);

export default AuthNavigator;