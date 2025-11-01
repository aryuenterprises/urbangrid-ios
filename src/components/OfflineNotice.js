// src/components/OfflineNotice.js
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from '../utils/responsive';

export default function OfflineNotice() {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { top: insets.top }]}>
            <MaterialIcons name="wifi-off" size={24} color="white" />
            <Text style={styles.text}>No Internet Connection</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ff5252',
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: - (StatusBar.currentHeight || 0), // Extends upward
        // paddingTop: StatusBar.currentHeight || 0, // Compensates
        width: '100%',
        zIndex: 999
    },
    text: {
        color: 'white',
        marginLeft: 8,
        fontSize: moderateScale(16),
        fontFamily: 'Manrope-Regular',
    }
});