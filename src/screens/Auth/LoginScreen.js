import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  ImageBackground,
  Animated,
  Easing,
  StatusBar,
} from 'react-native';
import { TextInput, Text, Button } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalstyles } from '../../utils/globalStyles';
import Logo from '../../assets/svg/logo-white.svg';
import { hp, moderateScale, wp } from '../../utils/responsive';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { login } from '../../services/auth';
import { resetToApp } from '../../navigation/RootNavigation';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useAuthAnimations } from '../../hook/useAuthAnimations';
import AuthWrapper from '../../components/AuthWrapper/AuthWrapper';
import GradientButton from '../../components/GradientButton/gradientButton';
import { useFormFocusAdvanced } from '../../utils/useFormFocusAdvanced';

const LoginSchema = Yup.object().shape({
  email: Yup.string().required('Email or username is required'), // Updated validation message
  password: Yup.string().required('Password is required'),
});

const LoginScreen = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state
  const [submitError, setSubmitError] = useState(''); // Add error state
  const navigation = useNavigation();
  const { fadeAnim, logoPosition } = useAuthAnimations();
  const scrollRef = useRef();
  const fieldOrder = ['email', 'password'];
  const formikSubmitRef = useRef();

  const { registerInput, focusNextInput } = useFormFocusAdvanced(
    () => {
      console.log('Auto-submitting form from keyboard...');
      if (formikSubmitRef.current) {
        formikSubmitRef.current();
      }
    },
    scrollRef
  );

    const handleLogin = async (values, { setSubmitting }) => {
    try {
      setLoading(true);
      setSubmitError('');
      setSubmitting(true);
      const response = await login(values.email, values.password);
      console.log("response", response)
      if (response.token) {
        console.log("response.token", response.token)
        resetToApp();
      } else {
        setSubmitError(response?.message);
      }
    } catch (error) {
      console.log("Login failed.")
      setSubmitError(
        error.response?.data?.message ||
        error.message ||
        'Login failed. Please try again.'
      );
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data ||
          error.message ||
          'Login failed. Please try again.'
      });
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };


  return (
    <AuthWrapper fadeAnim={fadeAnim} logoPosition={logoPosition}>
      <ScrollView
        contentContainerStyle={globalstyles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ref={scrollRef}
      >
        <View style={[globalstyles.logoContainer, { paddingTop: hp("5%") }]}>
          <Animated.View
            style={[
              { transform: [{ translateY: logoPosition }], marginBottom: hp("2%") }
            ]}
          >
            {/* <Logo width={hp('20%')} height={hp('10%')} style={globalstyles.logo} /> */}
            <Logo />
          </Animated.View>
          <Text style={globalstyles.welcomeText}>Welcome Back</Text>
          <Text style={globalstyles.subtitle}>Sign in to continue</Text>
        </View>

        <View style={globalstyles.formWrapper}>
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={LoginSchema}
            onSubmit={handleLogin}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => {
              
              // ✅ Store the submit function in ref for access in the hook
              formikSubmitRef.current = handleSubmit;

              return (
                <View style={globalstyles.keyboardAvoidingView}>
                  
                  {/* Email Input */}
                  <View style={globalstyles.inputWrapper}>
                    <Text style={globalstyles.inputLabel}>Email or Username</Text>
                    <TextInput
                      mode="flat"
                      autoFocus={true}
                      textColor='#ddd'
                      style={styles.input}
                      autoCapitalize='none'
                      onChangeText={handleChange('email')}
                      onBlur={handleBlur('email')}
                      value={values.email}
                      error={touched.email && errors.email}
                      returnKeyType="next"
                      ref={(ref) => registerInput('email', ref)}
                      onSubmitEditing={() => focusNextInput('email', fieldOrder)}
                      blurOnSubmit={false}
                      keyboardType="email-address"
                      theme={{
                        colors: {
                          primary: '#4a90e2',
                          text: '#ffffff',
                          placeholder: 'rgba(255,255,255,0.7)'
                        }
                      }}
                      underlineColor="transparent"
                      underlineColorAndroid="transparent"
                      left={
                        <TextInput.Icon
                          icon={({ size, color }) => (
                            <Ionicons name="person" size={size} color="rgba(255,255,255,0.7)" />
                          )}
                        />
                      }
                    />
                    {touched.email && errors.email && (
                      <Text style={globalstyles.error}>{errors.email}</Text>
                    )}
                  </View>

                  {/* Password Input */}
                  <View style={globalstyles.inputWrapper}>
                    <Text style={globalstyles.inputLabel}>Password</Text>
                    <TextInput
                      mode="flat"
                      textColor='#ddd'
                      style={styles.input}
                      onChangeText={handleChange('password')}
                      onBlur={handleBlur('password')}
                      value={values.password}
                      secureTextEntry={!showPassword}
                      error={touched.password && errors.password}
                      theme={{
                        colors: {
                          primary: '#4a90e2',
                          text: '#ffffff',
                          placeholder: 'rgba(255,255,255,0.7)'
                        }
                      }}
                      underlineColor="transparent"
                      underlineColorAndroid="transparent"
                      autoComplete="password"
                      returnKeyType="done"
                      ref={(ref) => registerInput('password', ref)}
                      onSubmitEditing={() => focusNextInput('password', fieldOrder)}
                      enablesReturnKeyAutomatically={true}
                      importantForAutofill="yes"
                      left={<TextInput.Icon icon={({ size }) => (
                        <Ionicons name="lock-closed" size={size} color="rgba(255,255,255,0.7)" />
                      )} />
                      }
                      right={
                        <TextInput.Icon
                          icon={({ size, color }) => (
                            <Ionicons
                              name={showPassword ? "eye-off" : "eye"}
                              size={size}
                              color="rgba(255,255,255,0.7)"
                            />
                          )}
                          onPress={() => setShowPassword(!showPassword)}
                        />
                      }
                    />
                    {touched.password && errors.password && (
                      <Text style={globalstyles.error}>{errors.password}</Text>
                    )}
                    {submitError && (
                      <Text style={globalstyles.error}>{submitError}</Text>
                    )}
                  </View>

                  <TouchableOpacity
                    style={globalstyles.forgotPassword}
                    onPress={() => navigation.navigate('ForgotPasswordScreen')}
                  >
                    <Text style={globalstyles.forgotPasswordText}>Forgot Password?</Text>
                  </TouchableOpacity>

                  <GradientButton
                    colors={['#BA000C', '#5E000B']}
                    text={loading ? 'Processing...' : "Sign In"}
                    onPress={handleSubmit}
                    style={[loading && globalstyles.buttonDisabled]}
                    labelStyle={globalstyles.buttonLabel}
                    contentStyle={globalstyles.buttonContent}
                  />
                </View>
              );
            }}
          </Formik>
        </View>
      </ScrollView>
    </AuthWrapper>
  );

};

const styles = StyleSheet.create({
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    color: '#fff',
    height: hp('6%'),
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: "hidden"
  },
  button: {
    // marginTop: hp('2%'),
    borderRadius: 8,
    height: hp('6%'),
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default LoginScreen;