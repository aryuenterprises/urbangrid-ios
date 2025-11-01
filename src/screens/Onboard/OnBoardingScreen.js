import React, { useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import Lottie from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from '../../utils/responsive';

const EducationOnboarding = ({ setIsFirstLaunch }) => {
    const navigation = useNavigation()
    const animationRefs = useRef([]);
    const handleNext = (index) => {
        animationRefs.current[index]?.play();
    };

    const SkipButton = ({ ...props }) => (
        <TouchableOpacity style={styles.skipButton} {...props} onPress={() => navigation.navigate("Auth")}>
            <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
    );

    const DoneButton = ({ ...props }) => (
        <TouchableOpacity style={styles.doneButton} {...props} onPress={() => navigation.navigate("Auth")}>
            <Text style={styles.doneText}>Get Started</Text>
        </TouchableOpacity>
    );

    const handleDone = () => {
        setIsFirstLaunch(false); // This will trigger the navigation change in App.js
    };

    return (
        <SafeAreaView style={styles.container}>
            <Onboarding
                pages={[
                    {
                        backgroundColor: '#ffffff',
                        title: 'Interactive Learning',
                        subtitle: 'Engage with interactive course materials',
                        image: (
                            <Lottie
                                ref={(ref) => (animationRefs.current[0] = ref)}
                                source={require('../../assets/animation/Animation - 1751442220183.json')}
                                autoPlay
                                loop
                                style={styles.lottie}
                            />
                        ),
                    },
                    {
                        backgroundColor: '#DDD',
                        title: 'Track Progress',
                        subtitle: 'Monitor your academic journey',
                        image: (
                            <Lottie
                                ref={(ref) => (animationRefs.current[1] = ref)}
                                source={require('../../assets/animation/Animation - 1751450221886.json')}
                                autoPlay
                                loop
                                style={styles.lottie}
                            />
                        ),
                    },
                    {
                        backgroundColor: '#e6f7ff',
                        title: 'Get Certified',
                        subtitle: 'Earn certificates for completed courses',
                        image: (
                            <Lottie
                                ref={(ref) => (animationRefs.current[2] = ref)}
                                source={require('../../assets/animation/Animation - 1751451357500.json')}
                                autoPlay
                                loop
                                style={styles.lottie}
                                speed={1.5}
                            />
                        ),
                    },
                ]}
                onNext={handleNext}
                bottomBarHighlight={false}
                SkipButtonComponent={SkipButton}
                DoneButtonComponent={DoneButton}
                onDone={handleDone}
                onSkip={handleDone} // Changed to use handleDone for consistency
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff"
    },
    lottie: {
        width: 300,
        height: 300,
        marginBottom: 30,
    },
    skipButton: {
        padding: 20,
    },
    skipText: {
        color: '#888',
        fontSize: moderateScale(16),
        fontFamily: 'Manrope-Regular',
    },
    doneButton: {
        padding: 20,
    },
    doneText: {
        color: '#007AFF',
        fontSize: moderateScale(16),
        fontFamily: 'Manrope-Regular',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    }
});

export default EducationOnboarding;