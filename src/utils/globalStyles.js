import { StyleSheet } from 'react-native';
import { hp, moderateScale, wp } from './responsive';
import { useAppTheme } from '../hook/useAppTheme';

export const globalstyles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: hp("2%"),
        // paddingBottom: hp("6%")
    },
    alignleft: {
        textAlign: "left"
    },
    centerAlign: {
        textAlign: "center"
    },
    rightAlign: {
        textAlign: "left"
    },
    bottomAlign: {
        textAlign: "left"
    },
    header: {
        fontSize: moderateScale(24),
        fontFamily: 'Manrope-Bold',
        marginBottom: hp("1%"),
        color: '#333',
    },
    subheader: {
        fontSize: moderateScale(15),
        color: '#666',
        fontFamily: 'Manrope-Regular',
        lineHeight: moderateScale(22),
    },
    username: {
        fontSize: moderateScale(20),
        // fontFamily: 'Manrope-Bold',
        paddingVertical: hp("0.5%"),
        fontFamily: 'Manrope-Bold',
        lineHeight: moderateScale(22),
    },
    input: {
        height: hp("6%"),
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 100,
        paddingHorizontal: hp("1.5%"),
        marginBottom: hp("3%"),
        color: "#000",
        fontSize: moderateScale(16),
        fontFamily: 'Manrope-Regular',
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: '#fff',
        marginBottom: hp("3.5%"),
    },
    avatarContainer: {
        position: 'relative',
        borderColor: "#DDD",
        borderRadius: 100,
        borderWidth: 1
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    avatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraIcon: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: '#007AFF',
        width: 30,
        height: 30,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // button
    button: {
        // backgroundImage: 'linear-gradient(to right, #4c669f, #3b5998)',
        backgroundColor: '#BA000C',
        padding: hp("1%"),
        borderRadius: moderateScale(8),
        alignItems: 'center',
        marginTop: hp("1%"),
    },
    buttonText: {
        color: '#fff',
        fontSize: moderateScale(16),
        fontFamily: 'Manrope-Regular',
    },

    // auth screen
    error: {
        color: 'red',
        fontSize: moderateScale(12),
        marginVertical: hp("1%"),
        fontFamily: 'Manrope-Regular',
    },

    // overlay
    background: {
        flex: 1,
        resizeMode: 'cover',
    },
    gradientOverlay: {
        flex: 1,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: hp('5%'),
    },
    logoContainer: {
        alignItems: 'center',
        paddingTop: hp("4.5%"),
        paddingBottom: hp('1%'),
    },
    logo: {
        tintColor: '#ffffff',
    },
    welcomeText: {
        fontSize: moderateScale(28),
        fontFamily: 'Manrope-Bold',
        color: '#ffffff',
        marginTop: hp('2%'),
        letterSpacing: 0.5,
    },
    formWrapper: {
        marginHorizontal: wp('8%'),
        marginTop: hp('2%'),
    },
    inputWrapper: {
        marginBottom: hp('1.5%'),
    },
    inputLabel: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: moderateScale(14),
        marginBottom: 5,
        marginLeft: 5,
        fontFamily: 'Manrope-Regular',
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

    forgotPassword: {
        alignSelf: 'flex-end',
        marginTop: -10,
        marginBottom: 15,
    },
    forgotPasswordText: {
        color: '#4a90e2',
        fontSize: moderateScale(14),
        fontFamily: 'Manrope-Regular',
    },

    // dashboard
    card: {
        borderRadius: hp("1%"),
        padding: hp("2%"),
        marginBottom: hp("2%"),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: hp("0.5%"),
        elevation: 2,
        borderColor: "#ddd",
        borderWidth: StyleSheet.hairlineWidth,
        overflow: "hidden"
    },
    horizontalCard: {
        width: wp("50%"),
        marginRight: hp("2%"),
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp("2%"),
        marginTop: hp("2%")
    },
    screenTitle: {
        fontSize: moderateScale(22),
        fontFamily: 'Manrope-Bold',
        color: '#333',
        marginBottom: hp("2%"),
        marginTop: 8,
        paddingHorizontal: hp("2%")
    },
    sectionTitle: {
        fontSize: moderateScale(18),
        fontFamily: 'Manrope-Bold',
        color: '#333'
    },
    seeAllText: {
        fontSize: moderateScale(14),
        color: '#6C63FF',
        fontWeight: '500'
    },
    listContainer: {
        paddingBottom: hp("2%")
    },
    textSmall: {
        fontSize: moderateScale(12),
        color: '#666',
        fontFamily: 'Manrope-Regular',
    },
    textMedium: {
        fontSize: moderateScale(14),
        color: '#333',
        fontFamily: 'Manrope-Regular',
    },
    textLarge: {
        fontSize: moderateScale(18),
        fontFamily: 'Manrope-Bold',
        color: '#333'
    },
    asterisk: {
        color: 'red',
        fontSize: moderateScale(16),
        fontFamily: 'Manrope-Bold',
        marginLeft: moderateScale(4)
    },
    flexRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    flexRowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    statCard: {
        backgroundColor: '#f9f9f9',
        borderRadius: hp("1%"),
        padding: hp("2%"),
        width: wp("28%"),
        alignItems: 'center'
    },
    statNumber: {
        fontSize: moderateScale(20),
        fontFamily: 'Manrope-Bold',
        color: '#6C63FF',
        marginBottom: hp("2%")
    },
    statLabel: {
        fontSize: moderateScale(12),
        color: '#666',
        textAlign: 'center',
        fontFamily: 'Manrope-Regular',
    },
    progressBarContainer: {
        height: hp("1%"),
        backgroundColor: '#eee',
        borderRadius: hp("0.5%"),
        marginBottom: hp("2%"),
        overflow: 'hidden'
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#6C63FF',
        borderRadius: hp("0.5%")
    },
    badge: {
        position: 'absolute',
        width: hp("1.2%"),
        height: hp("1.2%"),
        borderRadius: 100,
    },
    notificationBadge: {
        backgroundColor: '#FF5252',
        top: 0,
        right: 0,
    },
    importantBadge: {
        backgroundColor: '#FF5252',
        position: "absolute",
        left: 10,
        top: 10,
        width: hp("1%"),
        height: hp("1%"),
        borderRadius: 100,
    },
    timetableDay: {
        backgroundColor: '#6C63FF',
        width: hp("5%"),
        height: hp("5%"),
        borderRadius: hp("2.5%"),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: hp("2%")
    },
    popularCourseImage: {
        width: '100%',
        height: hp("15%"),
        borderRadius: 10
    },
});

// Optional: Export design tokens (colors, spacing)
export const colors = {
    primary: '#C40116',
    secondary: '#5E000B',
    white: '#ffffff',
    link: '#2962FF',
    link2: '#0056B3',
    error: '#e74c3c',
    blue: '#3498db',
    present: '#2ecc71',
    background: '#f8f9fa',
    textPrimary: '#212529',
    textSecondary: '#6c757d',
    success: '#28a745',
    warning: '#020202ff',
    info: '#17a2b8',
    lightGray: '#e9ecef',
    darkGray: '#343a40',
    // Priority colors
    highPriority: '#C40116',  // Your primary
    mediumPriority: '#FF8F00', // Orange
    lowPriority: '#2E7D32',   // Green
    skeletonBg: '#E1E1E1',
    skeletonHighlight: '#F5F5F5',
};