import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SignupScreen from '../screens/Auth/SignupScreen';
import ProfileForm from '../screens/ProfileForm/ProfileForm';
import LoginScreen from '../screens/Auth/LoginScreen'
const Stack = createStackNavigator();

const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
    <Stack.Screen name="ProfileForm" component={ProfileForm} />
  </Stack.Navigator>
);

export default AuthNavigator;