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
  Alert,
  Animated,
  Easing,
  Image
} from 'react-native';
import { TextInput, Text, Button } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalstyles } from '../../utils/globalStyles';
import Logo from '../../assets/svg/logo-white.svg';
import { hp, moderateScale, wp } from '../../utils/responsive';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DropDownPicker from 'react-native-dropdown-picker';
import LinearGradient from 'react-native-linear-gradient';
import { Signup } from '../../services/auth';
import api from '../../services/api';
import Toast from 'react-native-toast-message';

const RegisterSchema = Yup.object().shape({
  // firstName: Yup.string().required('First name is required'),
  // lastName: Yup.string().required('Last name is required'),
  userName: Yup.string().required('User name is required'),
  password: Yup.string().required('Password is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  contactNo: Yup.string().required('Contact number is required'),
  // emailOtp: Yup.string().when('emailVerified', {
  //   is: false,
  //   then: Yup.string().required('Email OTP is required'),
  // }),
  // contactOtp: Yup.string().when('contactVerified', {
  //   is: false,
  //   then: Yup.string().required('Mobile OTP is required'),
  // }),
  userType: Yup.string().required('Please select user type'),
});

const RegisterScreen = ({ navigation }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(''); // Add error state
  const [imageLoaded, setImageLoaded] = useState(true);

  const [items] = useState([
    { label: 'Student', value: 'Student' },
    { label: 'Staff', value: 'Staff' }
  ]);
  const [emailVerified, setEmailVerified] = useState(false);
  const [contactVerified, setContactVerified] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [contactOtpSent, setContactOtpSent] = useState(false);
  const [emailOtpLoading, setEmailOtpLoading] = useState(false);
  const [contactOtpLoading, setContactOtpLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoPosition = useRef(new Animated.Value(20)).current;

  const handleOutsideClick = () => {
    Keyboard.dismiss();
    setOpen(false);
  }

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

  const sendEmailOtp = async (email) => {
    try {
      setEmailOtpLoading(true);
      // Call your API to send OTP to email
      await api.post('/api/send-email-otp', { email });
      setEmailOtpSent(true);
      Toast.show({
        type: 'success',
        text1: 'OTP Sent',
        text2: 'Check your email for verification code'
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to send OTP'
      });
    } finally {
      setEmailOtpLoading(false);
    }
  };

  const verifyEmailOtp = async (otp, email) => {
    try {
      await api.post('/api/verify-email-otp', { email, otp });
      setEmailVerified(true);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Email verified successfully'
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Invalid OTP'
      });
    }
  };

  const sendContactOtp = async (contactNo) => {  // Changed parameter name from email to contactNo
    try {
      setContactOtpLoading(true);
      await api.post('/api/send-sms-otp', { contactNo }); // Changed endpoint
      setContactOtpSent(true);
      Toast.show({
        type: 'success',
        text1: 'OTP Sent',
        text2: 'Check your phone for verification code'
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to send OTP'
      });
    } finally {
      setContactOtpLoading(false);
    }
  };

  const verifyContactOtp = async (otp, contactNo) => {
    try {
      await api.post('/api/verify-sms-otp', {
        contactNo,  // Changed from email to contactNo
        otp
      });
      setContactVerified(true);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Phone number verified'
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Invalid OTP'
      });
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/pexels.jpg')}
      style={globalstyles.background}
      blurRadius={2}
    // onLoad={() => setImageLoaded(false)}
    >
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
          style={globalstyles.gradientOverlay}
        >
          <SafeAreaView style={styles.container}>
            <TouchableWithoutFeedback onPress={handleOutsideClick}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={globalstyles.keyboardAvoidingView}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
              >
                <ScrollView
                  contentContainerStyle={globalstyles.scrollContainer}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  <Animated.View
                    style={[
                      globalstyles.logoContainer,
                      { transform: [{ translateY: logoPosition }] }
                    ]}
                  >
                    <Logo width={hp('20%')} height={hp('10%')} style={globalstyles.logo} />
                    <Text style={[globalstyles.welcomeText, { fontSize: moderateScale(22) }]}>
                      Join our community today
                    </Text>
                  </Animated.View>

                  <View style={globalstyles.formWrapper}>
                    <Formik
                      initialValues={{
                        firstName: '',
                        lastName: '',
                        userName: '',
                        email: '',
                        contactNo: '',
                        userType: '',
                        contactOtp: "",
                        password: "",
                      }}
                      validationSchema={RegisterSchema}
                      onSubmit={async (values, { setSubmitting }) => {
                        try {
                          setLoading(true);
                          setSubmitError('');
                          setSubmitting(true);
                          const response = await Signup(values.userName, values.email, values.contactNo, values.userType, values.password); // Call the API
                          if (response.success) {
                            // resetToApp();
                          } else {
                            setSubmitError(response?.message);
                          }
                        } catch (error) {
                          setSubmitError(
                            error.response?.data?.message ||
                            error.message ||
                            'Login failed. Please try again.'
                          );
                          Toast.show({
                            type: 'error',
                            text1: 'Error',
                            text2: error.response?.data?.message ||
                              error.message ||
                              'Login failed. Please try again.'
                          });
                        } finally {
                          setLoading(false);
                          setSubmitting(false);
                        }
                      }}
                    >
                      {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue, setFieldTouched }) => (
                        <View style={styles.formContainer}>
                          {/* User Type Dropdown */}
                          <View style={styles.dropdownWrapper}>
                            <DropDownPicker
                              open={open}
                              value={values.userType}
                              items={items}
                              setOpen={setOpen}
                              setValue={(callback) => {
                                const newValue = callback(values.userType);
                                setFieldValue('userType', newValue);
                                setFieldTouched('userType', true, false);
                              }}
                              onChangeValue={(value) => {
                                if (value) {
                                  setFieldValue('userType', value);
                                  setFieldTouched('userType', true, false);
                                }
                              }}
                              onClose={() => {
                                setFieldTouched('userType', true, true);
                              }}
                              style={[
                                styles.dropdown,
                                open && { borderColor: '#4a90e2' },
                                touched.userType && errors.userType && { borderColor: '#ff6b6b' }
                              ]}
                              dropDownContainerStyle={styles.dropdownContainer}
                              textStyle={styles.dropdownText}
                              placeholderStyle={styles.dropdownPlaceholder}
                              arrowIconStyle={styles.dropdownArrow}
                              listMode="SCROLLVIEW"
                              placeholder="Select User Type"
                            />
                            {touched.userType && errors.userType && (
                              <Text style={globalstyles.error}>{errors.userType}</Text>
                            )}
                          </View>

                          {/* <View style={globalstyles.inputWrapper}>
                          <Text style={globalstyles.inputLabel}>First Name</Text>
                          <TextInput
                            mode="flat"
                            style={styles.input}
                            textColor='#ddd'
                            onChangeText={handleChange('firstName')}
                            onBlur={handleBlur('firstName')}
                            value={values.firstName}
                            error={touched.firstName && errors.firstName}
                            theme={{ colors: { primary: '#4a90e2', text: '#ffffff', placeholder: 'rgba(255,255,255,0.7)' } }}
                            underlineColor="transparent"
                            underlineColorAndroid="transparent"
                            left={<TextInput.Icon icon={({ color, size }) => (
                              <Ionicons name="person-circle-sharp" size={size} color="rgba(255,255,255,0.7)" />
                            )} />
                            }
                          />
                          {touched.firstName && errors.firstName && (
                            <Text style={globalstyles.error}>{errors.firstName}</Text>
                          )}
                        </View> */}

                          <View style={globalstyles.inputWrapper}>
                            <Text style={globalstyles.inputLabel}>User Name</Text>
                            <TextInput
                              mode="flat"
                              style={styles.input}
                              textColor='#ddd'
                              onChangeText={handleChange('userName')}
                              onBlur={handleBlur('userName')}
                              value={values.userName}
                              error={touched.userName && errors.userName}
                              theme={{ colors: { primary: '#4a90e2', text: '#ffffff', placeholder: 'rgba(255,255,255,0.7)' } }}
                              underlineColor="transparent"
                              underlineColorAndroid="transparent"
                              left={<TextInput.Icon icon={({ color, size }) => (
                                <Ionicons name="person-circle-sharp" size={size} color="rgba(255,255,255,0.7)" />
                              )} />
                              }
                            />
                            {touched.userName && errors.userName && (
                              <Text style={globalstyles.error}>{errors.userName}</Text>
                            )}
                          </View>

                          {/* <View style={globalstyles.inputWrapper}>
                          <Text style={globalstyles.inputLabel}>Last Name</Text>
                          <TextInput
                            mode="flat"
                            style={styles.input}
                            textColor='#ddd'
                            onChangeText={handleChange('lastName')}
                            onBlur={handleBlur('lastName')}
                            value={values.lastName}
                            error={touched.lastName && errors.lastName}
                            theme={{ colors: { primary: '#4a90e2', text: '#ffffff', placeholder: 'rgba(255,255,255,0.7)' } }}
                            underlineColor="transparent"
                            underlineColorAndroid="transparent"
                            left={<TextInput.Icon icon={({ color, size }) => (
                              <Ionicons name="person-circle-sharp" size={size} color="rgba(255,255,255,0.7)" />
                            )} />
                            }
                          />
                          {touched.lastName && errors.lastName && (
                            <Text style={globalstyles.error}>{errors.lastName}</Text>
                          )}
                        </View> */}

                          <View style={globalstyles.inputWrapper}>
                            <Text style={globalstyles.inputLabel}>Email</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <TextInput
                                mode="flat"
                                style={[styles.input, { flex: 1 }]}
                                textColor='#ddd'
                                onChangeText={handleChange('email')}
                                onBlur={handleBlur('email')}
                                value={values.email}
                                keyboardType="email-address"
                                error={touched.email && errors.email}
                                theme={{ colors: { primary: '#4a90e2', text: '#ffffff', placeholder: 'rgba(255,255,255,0.7)' } }}
                                underlineColor="transparent"
                                underlineColorAndroid="transparent"
                                left={<TextInput.Icon icon={({ color, size }) => (
                                  <Ionicons name="mail" size={size} color="rgba(255,255,255,0.7)" />
                                )} />
                                }
                              />
                              {values.email && !emailVerified && (
                                <Button
                                  mode="contained"
                                  style={styles.verifyButton}
                                  onPress={() => sendEmailOtp(values.email)}
                                  loading={emailOtpLoading}
                                  disabled={!values.email || emailOtpSent}
                                >
                                  {emailOtpSent ? 'Resend' : 'Verify'}
                                </Button>
                              )}
                            </View>
                            {emailOtpSent && !emailVerified && (
                              <View style={styles.otpContainer}>
                                <TextInput
                                  mode="flat"
                                  placeholder="Enter OTP"
                                  style={styles.otpInput}
                                  onChangeText={handleChange('emailOtp')}
                                  value={values.emailOtp}
                                />
                                <Button
                                  mode="contained"
                                  style={styles.verifyOtpButton}
                                  onPress={() => verifyEmailOtp(values.emailOtp)}
                                >
                                  Verify OTP
                                </Button>
                              </View>
                            )}
                            {touched.email && errors.email && (
                              <Text style={globalstyles.error}>{errors.email}</Text>
                            )}
                          </View>

                          <View style={globalstyles.inputWrapper}>
                            <Text style={globalstyles.inputLabel}>Contact Number</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <TextInput
                                mode="flat"
                                style={[styles.input, { flex: 1 }]}
                                textColor='#ddd'
                                onChangeText={handleChange('contactNo')}
                                onBlur={handleBlur('contactNo')}
                                value={values.contactNo}
                                keyboardType="phone-pad"
                                error={touched.contactNo && errors.contactNo}
                                theme={{ colors: { primary: '#4a90e2', text: '#ffffff', placeholder: 'rgba(255,255,255,0.7)' } }}
                                underlineColor="transparent"
                                underlineColorAndroid="transparent"
                                left={<TextInput.Icon icon={({ color, size }) => (
                                  <Ionicons name="call-sharp" size={size} color="rgba(255,255,255,0.7)" />
                                )} />
                                }
                              />
                              {values.contactNo && !contactVerified && (
                                <Button
                                  mode="contained"
                                  style={styles.verifyButton}
                                  onPress={() => sendContactOtp(values.contactNo)}
                                  loading={contactOtpLoading}
                                  disabled={!values.contactNo || contactOtpSent}
                                >
                                  {contactOtpSent ? 'Resend' : 'Verify'}
                                </Button>
                              )}
                            </View>
                            {contactOtpSent && !contactVerified && (
                              <View style={styles.otpContainer}>
                                <TextInput
                                  mode="flat"
                                  placeholder="Enter OTP"
                                  style={styles.otpInput}
                                  onChangeText={handleChange('contactOtp')}
                                  value={values.contactOtp}
                                />
                                <Button
                                  mode="contained"
                                  style={styles.verifyOtpButton}
                                  onPress={() => verifyContactOtp(values.contactOtp, values.contactNo)}
                                >
                                  Verify OTP
                                </Button>
                              </View>
                            )}
                            {touched.contactNo && errors.contactNo && (
                              <Text style={globalstyles.error}>{errors.contactNo}</Text>
                            )}
                          </View>

                          <View style={globalstyles.inputWrapper}>
                            <Text style={globalstyles.inputLabel}>Password</Text>
                            <TextInput
                              mode="flat"
                              style={styles.input}
                              textColor='#ddd'
                              onChangeText={handleChange('password')}
                              onBlur={handleBlur('password')}
                              value={values.password}
                              secureTextEntry={!showPassword} // Toggle based on state
                              error={touched.password && errors.password}
                              theme={{ colors: { primary: '#4a90e2', text: '#ffffff', placeholder: 'rgba(255,255,255,0.7)' } }}
                              underlineColor="transparent"
                              underlineColorAndroid="transparent"
                              left={<TextInput.Icon icon={({ size }) => (
                                <Ionicons name="lock-closed" size={size} color="rgba(255,255,255,0.7)" />
                              )} />
                              }
                              right={<TextInput.Icon
                                icon={({ size }) => (
                                  <Ionicons
                                    name={showPassword ? "eye-off" : "eye"}
                                    size={size}
                                    color="rgba(255,255,255,0.7)"
                                  />
                                )}
                                onPress={() => setShowPassword(!showPassword)} // Toggle state on press
                              />}
                            />
                            {touched.password && errors.password && (
                              <Text style={globalstyles.error}>{errors.password}</Text>
                            )}
                          </View>

                          <TouchableOpacity
                            style={globalstyles.forgotPassword}
                            onPress={() => navigation.navigate('ForgotPassword')}
                          >
                            <Text style={globalstyles.forgotPasswordText}>Forgot Password?</Text>
                          </TouchableOpacity>

                          <Button
                            mode="contained"
                            style={styles.button}
                            onPress={handleSubmit}
                            labelStyle={globalstyles.buttonLabel}
                            loading={loading}
                            contentStyle={globalstyles.buttonContent}
                          >
                            Register
                          </Button>

                          <View style={globalstyles.loginContainer}>
                            <Text style={globalstyles.loginText}>Already have an account?</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                              <Text style={globalstyles.loginLink}> Login</Text>
                            </TouchableOpacity>
                          </View>
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
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeText: {
    fontSize: moderateScale(22),
    color: '#ffffff',
    marginTop: hp('1.5%'),
    letterSpacing: 0.5,
    fontFamily: 'Manrope-Bold',
  },
  subtitle: {
    fontSize: moderateScale(20),
    fontFamily: 'Manrope-Regular',
    color: 'rgba(255,255,255,0.8)',
    marginTop: hp('1%'),
  },
  formWrapper: {
    marginHorizontal: wp('8%'),
    marginTop: hp('1.5%'),
  },
  formContainer: {
    flex: 1,
  },
  dropdownWrapper: {
    marginBottom: hp('1.5%'),
    zIndex: 1000,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    height: 50,
    paddingHorizontal: 15,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    backgroundColor: 'rgba(30, 39, 46, 0.95)',
    marginTop: 5,
  },
  dropdownText: {
    color: '#ffffff',
    fontSize: moderateScale(16),
    fontFamily: 'Manrope-Regular',
  },
  dropdownPlaceholder: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: moderateScale(16),
    fontFamily: 'Manrope-Regular',
  },
  dropdownArrow: {
    tintColor: '#ffffff',
  },
  inputWrapper: {
    marginBottom: hp('1.5%'),
  },
  inputLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: moderateScale(14),
    fontFamily: 'Manrope-Regular',
    marginBottom: 5,
    marginLeft: 5,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    color: '#ffffff',
    height: 50,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  button: {
    marginTop: hp('1.5%'),
    borderRadius: 8,
    height: 50,
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonContent: {
    height: '100%',
  },
  buttonLabel: {
    color: '#ffffff',
    fontSize: moderateScale(16),
    fontFamily: 'Manrope-Medium',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: hp('3%'),
  },
  loginText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: moderateScale(14),
    fontFamily: 'Manrope-Regular',
  },
  loginLink: {
    color: '#4a90e2',
    fontFamily: 'Manrope-Medium',
    fontSize: moderateScale(14),
  },

  verifyButton: {
    marginLeft: 10,
    height: 50,
    justifyContent: 'center',
    backgroundColor: '#4a90e2',
  },
  otpContainer: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
  },
  otpInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    color: '#fff',
  },
  verifyOtpButton: {
    marginLeft: 10,
    height: 50,
    justifyContent: 'center',
    backgroundColor: '#4a90e2',
  },
});

export default RegisterScreen;