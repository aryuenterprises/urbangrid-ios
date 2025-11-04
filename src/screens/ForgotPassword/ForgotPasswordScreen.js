// screens/ForgotPasswordScreen.js
import React, { useEffect, useRef, useState } from 'react';
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
import { globalstyles } from '../../utils/globalStyles';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';
import { API_BASE_URL } from '@env'
import api from '../../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthWrapper from '../../components/AuthWrapper/AuthWrapper';
import { useAuthAnimations } from '../../hook/useAuthAnimations';
import GradientButton from '../../components/GradientButton/gradientButton';
import { hp, moderateScale } from '../../utils/responsive';
import { TextInput, Button } from 'react-native-paper';

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { fadeAnim, logoPosition } = useAuthAnimations();

    const handleForgotPassword = async () => {
        if (!email) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please enter your email address'
            });
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/forgot-password`, {
                email: email.toLowerCase().trim(),
            });
            if (response.status === 200) {
                navigation.navigate('VerifyOTPScreen', { email: email.toLowerCase().trim() });
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.message || 'Failed to send OTP. Please try again.'
            });
        } finally {
            setLoading(false);
            navigation.navigate('VerifyOTPScreen', { email: email.toLowerCase().trim() });

        }
    };

    return (
        <AuthWrapper fadeAnim={fadeAnim} logoPosition={logoPosition}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={globalstyles.authHeader}>
                    <Text style={globalstyles.welcomeText}>Forgot Password</Text>
                    <Text style={globalstyles.subtitle}>
                        Enter your email address to receive a verification code
                    </Text>
                </View>

                <View style={globalstyles.formContainer}>
                    <View style={globalstyles.inputWrapper}>
                        <Text style={globalstyles.inputLabel}>Email Address</Text>
                        <TextInput
                            mode="flat"
                            autoFocus={true}
                            textColor='#ddd'
                            style={[globalstyles.input, { color: "#fff" }]}
                            placeholder="Enter your email"
                            placeholderTextColor="#999"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                            theme={{
                                colors: {
                                    primary: '#4a90e2',
                                    text: '#ffffff',
                                    placeholder: 'rgba(255,255,255,0.7)'
                                }
                            }}
                            underlineColor="transparent"
                            underlineColorAndroid="transparent"
                        />
                    </View>
                    <GradientButton
                        colors={['#BA000C', '#5E000B']}
                        text={loading ? 'Sending...' : 'Send OTP'}
                        onPress={handleForgotPassword}
                        style={[loading && globalstyles.buttonDisabled]}
                    />
                    <TouchableOpacity
                        style={globalstyles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={globalstyles.backButtonText}>Back to Login</Text>
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
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
});

export default ForgotPasswordScreen;