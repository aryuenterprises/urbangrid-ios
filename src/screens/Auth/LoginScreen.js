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

const LoginSchema = Yup.object().shape({
  email: Yup.string().required('Email or username is required'), // Updated validation message
  password: Yup.string().required('Password is required'),
});

const LoginScreen = ({ navigation }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state
  const [submitError, setSubmitError] = useState(''); // Add error state
  const naivgation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoPosition = useRef(new Animated.Value(20)).current;

  useEffect(() => {
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
  }, []);

  return (
    <ImageBackground
      source={require('../../assets/images/8.jpg')}
      style={globalstyles.background}
      blurRadius={2}
    >
      <StatusBar barStyle={"light-content"}/>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
          style={globalstyles.gradientOverlay}
        >
          <SafeAreaView style={styles.container}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={globalstyles.keyboardAvoidingView}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 10} // Change this to 0
              >
                <ScrollView
                  contentContainerStyle={globalstyles.scrollContainer}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  <View style={[globalstyles.logoContainer, { paddingTop: hp("5%") }]}>
                    <Animated.View
                      style={[
                        { transform: [{ translateY: logoPosition }] }
                      ]}
                    >
                      {/* <Logo width={hp('20%')} height={hp('10%')} style={globalstyles.logo} /> */}
                      <Logo />
                    </Animated.View>
                    <Text style={globalstyles.welcomeText}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Sign in to continue</Text>
                  </View>

                  <View style={globalstyles.formWrapper}>
                    <Formik
                      initialValues={{ email: '', password: '' }}
                      validationSchema={LoginSchema}
                      onSubmit={async (values, { setSubmitting }) => {
                        try {
                          setLoading(true);
                          setSubmitError('');
                          setSubmitting(true);
                          const response = await login(values.email, values.password); // Call the API
                          if (response.token) {
                            resetToApp();
                          } else {
                            setSubmitError(response?.message);
                          }
                          // navigation.navigate('Home'); // Redirect after login
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
                      }}
                    >
                      {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                        <View style={styles.formContainer}>
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

                          <View style={globalstyles.inputWrapper}>
                            <Text style={globalstyles.inputLabel}>Password</Text>
                            <TextInput
                              mode="flat"
                              textColor='#ddd'
                              style={styles.input}
                              onChangeText={handleChange('password')}
                              onBlur={handleBlur('password')}
                              value={values.password}
                              secureTextEntry={!showPassword} // Toggle based on state
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

                          {/* <TouchableOpacity
                            style={globalstyles.forgotPassword}
                            onPress={() => navigation.navigate('ForgotPassword')}
                          >
                            <Text style={globalstyles.forgotPasswordText}>Forgot Password?</Text>
                          </TouchableOpacity> */}

                          <Button
                            mode="contained"
                            style={styles.button}
                            onPress={handleSubmit}
                            labelStyle={globalstyles.buttonLabel}
                            contentStyle={globalstyles.buttonContent}
                          >
                            {loading ? 'Processing...' : "Sign In"}
                          </Button>

                          {/* <View style={globalstyles.loginContainer}>
                            <Text style={globalstyles.loginText}>Don't have an account?</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                              <Text style={globalstyles.loginLink}> Register</Text>
                            </TouchableOpacity>
                          </View> */}
                        </View>
                      )}
                    </Formik>
                  </View>
                </ScrollView>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </SafeAreaView>
        </LinearGradient>
      </Animated.View>
    </ImageBackground >
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeText: {
    fontSize: moderateScale(28),
    fontFamily: 'Manrope-Regular',
    fontWeight: '700',
    color: '#ffffff',
    marginTop: hp('2%'),
    letterSpacing: 0.5,
  },
  formContainer: {
    flex: 1,
  },
  subtitle: {
    fontSize: moderateScale(16),
    fontFamily: 'Manrope-Regular',
    color: 'rgba(255,255,255,0.8)',
    marginTop: hp('1%'),
  },
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
    marginTop: hp('2%'),
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