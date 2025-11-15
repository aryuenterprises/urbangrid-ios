// screens/ResetPasswordScreen.js
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
    Easing
} from 'react-native';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { globalstyles } from '../../utils/globalStyles';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthWrapper from '../../components/AuthWrapper/AuthWrapper';
import { useAuthAnimations } from '../../hook/useAuthAnimations';
import { TextInput } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import GradientButton from '../../components/GradientButton/gradientButton';
import { useFormFocusAdvanced } from '../../utils/useFormFocusAdvanced';
import { smartPreload } from '../../utils/smartPreload';
import { API_BASE_URL } from '@env'

const ResetPasswordScreen = ({ route, navigation }) => {
    const { email } = route.params;
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { fadeAnim, logoPosition } = useAuthAnimations();
    const scrollRef = useRef();
    const fieldOrder = ['password', 'confirmPassword'];

    const { registerInput, focusNextInput } = useFormFocusAdvanced(
        () => handleResetPassword(),
        scrollRef
    );

    const handleResetPassword = async () => {
        const { newPassword, confirmPassword } = formData;

        if (!newPassword || !confirmPassword) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please fill in all fields'
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Passwords do not match'
            });
            return;
        }

        if (newPassword.length < 6) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Password must be at least 6 characters long'
            });
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/reset-password/`, {
                email: email,
                new_password: newPassword,
            });

            if (response.status === 200) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Password successfully changed'
                });
                smartPreload('Login')
                navigation.navigate('Login');
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.message || 'Failed to reset password. Please try again.'
            });
        } finally {
            setLoading(false);
            // smartPreload('Login')
            // navigation.navigate('Login');
        }
    };

    const updateFormData = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <AuthWrapper fadeAnim={fadeAnim} logoPosition={logoPosition}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={globalstyles.authHeader}>
                    <Text style={globalstyles.welcomeText}>Reset Password</Text>
                    <Text style={globalstyles.subtitle}>
                        Create a new password for your account
                    </Text>
                </View>

                <View style={globalstyles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={globalstyles.inputLabel}>New Password</Text>
                        <TextInput
                            mode="flat"
                            autoFocus={true}
                            textColor='#ddd'
                            style={[globalstyles.input, { color: "#fff" }]}
                            placeholder="Enter new password"
                            placeholderTextColor="#999"
                            value={formData.newPassword}
                            onChangeText={value => updateFormData('newPassword', value)}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            theme={{
                                colors: {
                                    primary: '#4a90e2',
                                    text: '#ffffff',
                                    placeholder: 'rgba(255,255,255,0.7)'
                                }
                            }}
                            underlineColor="transparent"
                            underlineColorAndroid="transparent"
                            ref={(ref) => registerInput('password', ref)}
                            onSubmitEditing={() => focusNextInput('password', fieldOrder)}
                            returnKeyType="next"
                            enablesReturnKeyAutomatically={true}
                            importantForAutofill="yes"
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
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={globalstyles.inputLabel}>Confirm Password</Text>
                        <TextInput
                            mode="flat"
                            textColor='#ddd'
                            style={[globalstyles.input, { color: "#fff" }]}
                            placeholder="Confirm new password"
                            placeholderTextColor="#999"
                            value={formData.confirmPassword}
                            onChangeText={value => updateFormData('confirmPassword', value)}
                            secureTextEntry={!showConfirmPassword}
                            autoCapitalize="none"

                            ref={(ref) => registerInput('confirmPassword', ref)}
                            onSubmitEditing={() => focusNextInput('confirmPassword', fieldOrder)}
                            returnKeyType="done"
                            enablesReturnKeyAutomatically={true}
                            importantForAutofill="yes"
                            right={
                                <TextInput.Icon
                                    icon={({ size, color }) => (
                                        <Ionicons
                                            name={showConfirmPassword ? "eye-off" : "eye"}
                                            size={size}
                                            color="rgba(255,255,255,0.7)"
                                        />
                                    )}
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                />
                            }
                        />
                    </View>

                    <GradientButton
                        colors={['#BA000C', '#5E000B']}
                        text={loading ? 'Resetting...' : 'Reset Password'}
                        onPress={handleResetPassword}
                        style={[{ width: "100%" }, loading && globalstyles.buttonDisabled]}
                    />

                </View>
            </ScrollView>
        </AuthWrapper>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
        justifyContent: 'center',
    },
    inputGroup: {
        marginBottom: 20,
    },
});

export default ResetPasswordScreen;