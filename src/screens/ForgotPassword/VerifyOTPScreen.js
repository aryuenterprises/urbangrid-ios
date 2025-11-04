// screens/VerifyOTPScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ImageBackground,
    StatusBar,
    Animated,
    Easing,
} from 'react-native';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { globalstyles } from '../../utils/globalStyles';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthWrapper from '../../components/AuthWrapper/AuthWrapper';
import { useAuthAnimations } from '../../hook/useAuthAnimations';
import { hp, moderateScale } from '../../utils/responsive';
import { TextInput, Button } from 'react-native-paper';
import GradientButton from '../../components/GradientButton/gradientButton';

const VerifyOTPScreen = ({ route, navigation }) => {
    const { email } = route.params;
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const inputs = useRef([]);
    const { fadeAnim, logoPosition } = useAuthAnimations();

    const handleOtpChange = (text, index) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        // Auto-focus next input
        if (text && index < 5) {
            inputs.current[index + 1].focus();
        }

        // Auto-submit when all fields are filled
        if (index === 5 && text) {
            const fullOtp = newOtp.join('');
            if (fullOtp.length === 6) {
                handleVerifyOTP(fullOtp);
            }
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1].focus();
        }
    };

    const handleVerifyOTP = async (enteredOtp = null) => {
        const fullOtp = enteredOtp || otp.join('');

        if (fullOtp.length !== 6) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please enter the complete 6-digit OTP'
            });
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/verify-otp/`, {
                email: email,
                otp: fullOtp,
            });

            if (response.status === 200) {
                navigation.navigate('ResetPasswordScreen', { email: email });
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.message || 'Invalid OTP. Please try again.'
            });
        } finally {
            setLoading(false);
            navigation.navigate('ResetPasswordScreen', { email: email });
        }
    };

    const resendOTP = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/forgot-password`, {
                email: email,
            });

            if (response.status === 200) {
                setOtp(['', '', '', '', '', '']);
                inputs.current[0].focus();
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.message || 'Failed to resend OTP. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthWrapper fadeAnim={fadeAnim} logoPosition={logoPosition}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={globalstyles.authHeader}>
                    <Text style={globalstyles.welcomeText}>Verify OTP</Text>
                    <Text style={globalstyles.subtitle}>
                        Enter the 6-digit code sent to {email}
                    </Text>
                </View>

                <View style={globalstyles.formContainer}>
                    <View style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={ref => inputs.current[index] = ref}
                                style={styles.otpInput}
                                value={digit}
                                onChangeText={text => handleOtpChange(text, index)}
                                onKeyPress={e => handleKeyPress(e, index)}
                                keyboardType="number-pad"
                                maxLength={1}
                                textColor='#fff'
                                selectTextOnFocus
                            />
                        ))}
                    </View>

                    <GradientButton
                        colors={['#BA000C', '#5E000B']}
                        text={loading ? 'Verifying...' : 'Verify OTP'}
                        onPress={handleVerifyOTP}
                        style={[{ width: "100%" }, loading && globalstyles.buttonDisabled]}
                    />

                    <TouchableOpacity
                        style={globalstyles.backButton}
                        onPress={resendOTP}
                        disabled={loading}
                    >
                        <Text style={globalstyles.backButtonText}>
                            Didn't receive code? Resend OTP
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={globalstyles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={globalstyles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </AuthWrapper>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        padding: hp("1%"),
        justifyContent: 'center',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: hp("3%"),
        width: '100%',
    },
    otpInput: {
        width: hp("6%"),
        gap: hp("1%"),
        fontWeight: 'bold',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        overflow: "hidden",
        height: hp("6%"),
        borderRadius: hp("1%"),
        marginBottom: hp("2%"),
        fontSize: moderateScale(16),
        fontFamily: 'Manrope-Regular',
    },
});

export default VerifyOTPScreen;