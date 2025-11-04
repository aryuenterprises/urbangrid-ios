import React from 'react';
import {
  ImageBackground,
  StatusBar,
  Animated,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalstyles } from '../../utils/globalStyles';

const AuthWrapper = ({ 
  children, 
  animationEnabled = true,
  fadeAnim,
  logoPosition,
  keyboardDismiss = true 
}) => {
  const WrapperComponent = keyboardDismiss ? TouchableWithoutFeedback : React.Fragment;
  const wrapperProps = keyboardDismiss ? { onPress: Keyboard.dismiss } : {};

  return (
    <ImageBackground
      source={require('../../assets/images/8.jpg')}
      style={globalstyles.background}
      blurRadius={2}
    >
      <StatusBar barStyle="light-content" />
      <Animated.View 
        style={{ 
          flex: 1, 
          opacity: animationEnabled ? fadeAnim : 1 
        }}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
          style={globalstyles.gradientOverlay}
        >
          <SafeAreaView style={globalstyles.container}>
            <WrapperComponent {...wrapperProps}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={globalstyles.keyboardAvoidingView}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 10}
              >
                {children}
              </KeyboardAvoidingView>
            </WrapperComponent>
          </SafeAreaView>
        </LinearGradient>
      </Animated.View>
    </ImageBackground>
  );
};

export default AuthWrapper;