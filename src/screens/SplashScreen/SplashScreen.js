import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Lottie from 'lottie-react-native';
export default function SplashScreen() {
    return (
        <View>
            <Lottie
                //   ref={(ref) => (animationRefs.current[0] = ref)}
                source={require('../../assets/animation/splash.json')}
                autoPlay
                loop
                style={styles.lottie}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    lottie: {
        width: 300,
        height: 300,
        marginBottom: 30,
    },
})