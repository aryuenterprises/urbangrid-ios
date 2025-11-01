// components/CustomDrawer/CustomDrawerContent.js
import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    Platform,
    ScrollView,
    Linking,
    Alert,
    RefreshControl,
    Dimensions
} from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { Avatar } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';

import capitalizeFirstLetter from '../../utils/capitalizeFirstLetter';
import { hp, wp, moderateScale } from '../../utils/responsive';
import { logout, getStudentProfile, UpdateProfilePic } from '../../services/auth';
import GradientButton from '../GradientButton/gradientButton';
import { colors, globalstyles } from '../../utils/globalStyles';
import { formatDateTime } from '../../utils/formatDate';
import ImageCropPicker from 'react-native-image-crop-picker';
import { API_BASE_URL } from '@env';
import Toast from 'react-native-toast-message';
import { toggleTheme, selectIsDarkMode, } from '../../redux/slices/themeSlice';
import { useAppTheme } from '../../hook/useAppTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const { width: screenWidth } = Dimensions.get('window');

// Job portal links array
const jobPortalLinks = [
    {
        name: 'Naukri',
        link: 'https://www.naukri.com/',
        image: require('../../assets/images/Naukri.png')
    },
    {
        name: 'LinkedIn',
        link: 'https://www.linkedin.com/jobs/',
        image: require('../../assets/images/LinkedIn.png')
    },
    {
        name: 'Indeed',
        link: 'https://www.indeed.com/',
        image: require('../../assets/images/Indeed.png')
    },
    {
        name: 'Freshersworld',
        link: 'https://www.freshersworld.com/',
        image: require('../../assets/images/FreshersWorld.png')
    },
    {
        name: 'PlacementIndia',
        link: 'https://www.placementindia.com/',
        image: require('../../assets/images/PlacementIndia.png')
    },
    {
        name: 'Internshala',
        link: 'https://internshala.com/',
        image: require('../../assets/images/Internshala.png')
    },
    {
        name: 'FoundIt',
        link: 'https://www.found.it/',
        image: require('../../assets/images/FoundIt.png')
    },
    {
        name: 'TimesJobs',
        link: 'https://www.timesjobs.com/',
        image: require('../../assets/images/Timesjob.png')
    }
];

const CustomDrawerContent = (props) => {
    const { navigation } = props;
    const { studentProfile, user, token } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const isDark = useSelector(selectIsDarkMode);
    // State from ProfileScreen
    const [showAccountDetails, setShowAccountDetails] = useState(false);
    const [showCourseDetails, setShowCourseDetails] = useState(false);
    const [showPaymentDetails, setShowPaymentDetails] = useState(false);
    const [showJobPortals, setShowJobPortals] = useState(false);
    const [loading, setLoading] = useState(false);
    const [profilePic, setProfilePic] = useState(null);
    const [data, setData] = useState({});
    const [showLegal, setShowLegal] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const { theme, colors: themeColors, getColor } = useAppTheme(); // Use the theme hook
    const insets = useSafeAreaInsets();
    useEffect(() => {
        if (user?.student_id) {
            fetchStudentProfile();
        }
    }, [user?.student_id]);

    const fetchStudentProfile = async () => {
        try {
            setLoading(true);
            const profile = await getStudentProfile(user?.student_id);
            setData(profile.data);
            setProfilePic(profile.data.profile_pic);
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load student profile'
            });
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(() => {
        fetchStudentProfile();
    }, []);

    const handleImagePick = async () => {
        try {
            const selectedImage = await ImageCropPicker.openPicker({
                width: 300,
                height: 300,
                cropping: false,
                mediaType: 'photo',
                compressImageQuality: 0.8,
            });

            const croppedImage = await ImageCropPicker.openCropper({
                path: selectedImage.path,
                width: 300,
                height: 300,
                cropping: true,
                cropperCircleOverlay: true,
                compressImageQuality: 0.8,
            });

            try {
                const response = await UpdateProfilePic(user?.student_id, croppedImage.path);
                setProfilePic(response.data.profile_pic);
            } catch (error) {
                console.log("error", error.response);
            }
        } catch (error) {
            if (error.code !== 'E_PICKER_CANCELLED') {
                console.log('Image picker error:', error);
            }
        }
    };

    const getInitials = (firstName, lastName) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
    };

    const handleLinkPress = async (url) => {
        try {
            await Linking.openURL(url);
        } catch (err) {
            console.error("Failed to open URL:", err);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to open link'
            });
        }
    };

    // Updated handler function
    const handleJobPortalPress = (portal) => {
        if (portal.link) {
            Linking.openURL(portal.link).catch(err =>
                console.error('Failed to open URL:', err)
            );
        }
    };

    const getPortalIcon = (portalName) => {
        const imageMap = {
            'Naukri': require('../../assets/images/Naukri.png'),
            'LinkedIn': require('../../assets/images/LinkedIn.png'),
            'Indeed': require('../../assets/images/Indeed.png'),
            'Freshersworld': require('../../assets/images/FreshersWorld.png'),
            'PlacementIndia': require('../../assets/images/PlacementIndia.png'),
            'Internshala': require('../../assets/images/Internshala.png'),
            'FoundIt': require('../../assets/images/FoundIt.png'),
            'TimesJobs': require('../../assets/images/Timesjob.png')
        };
        return imageMap[portalName]
    };

    // Filter batches that have assignments matching the user's student_id
    const getFilteredBatches = () => {
        if (!data?.batch) return [];

        return data.batch.filter(batch =>
            batch.course_trainer_assignments?.some(assignment =>
                assignment.student_id === user?.student_id
            )
        );
    };

    const filteredBatches = getFilteredBatches();

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background, paddingBottom: insets.bottom }]}>
            <DrawerContentScrollView
                {...props}
                contentContainerStyle={[styles.scrollContent, { backgroundColor: themeColors.background }]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
            >
                {/* Profile Header Section */}
                <TouchableOpacity
                    onPress={() => navigation.navigate("Profile")}
                    style={styles.profileHeader}
                >
                    <LinearGradient
                        colors={[colors.secondary, colors.primary]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.profileGradient}
                    >
                        <View style={styles.profileContent}>
                            <View style={styles.profileImageContainer}>
                                <TouchableOpacity>
                                    <View style={styles.profileImageRing}>
                                        {profilePic ? (
                                            <Image
                                                source={{ uri: profilePic }}
                                                style={styles.avatar}
                                            />
                                        ) : (
                                            <View style={[styles.profileImage, styles.profileImageFallback]}>
                                                <Avatar.Text
                                                    size={wp('15%')}
                                                    label={getInitials(data?.first_name, data?.last_name)}
                                                    style={styles.avatarText}
                                                />
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.profileInfo}>
                                <Text style={styles.profileName}>
                                    {capitalizeFirstLetter(user?.username)}
                                </Text>
                                <Text style={styles.profileRegId}>
                                    Reg ID - {user?.registration_id}
                                </Text>
                                <Text style={styles.profileAdmission}>
                                    Admission - {formatDateTime(data?.joining_date, { includeTime: false })}
                                </Text>
                            </View>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Theme Toggle - Placed right after profile header */}
                <TouchableOpacity
                    style={[styles.themeToggle, { backgroundColor: themeColors.card }]}
                    onPress={() => dispatch(toggleTheme())}
                >
                    <View style={styles.themeToggleContent}>
                        {/* <MaterialIcons 
                            name={isDark ? "light-mode" : "dark-mode"} 
                            size={hp("2.8%")} 
                            color={themeColors.primary} 
                        /> */}
                        <Icon
                            name={isDark ? "weather-sunny" : "weather-night"}
                            size={hp("2.5%")}
                            color={isDark ? themeColors.warning : themeColors.primary}
                        />
                        <Text style={[styles.themeToggleText, { color: themeColors.textPrimary }]}>
                            {isDark ? 'Light Mode' : 'Dark Mode'}
                        </Text>
                    </View>

                </TouchableOpacity>

                {/* Main Drawer Navigation Items */}
                <View style={styles.drawerItemsContainer}>
                    {/* <DrawerItemList {...props} /> */}

                    {/* Additional Custom Items */}
                    <TouchableOpacity
                        style={styles.drawerItem}
                        onPress={() => navigation.navigate('Recording')}
                    >
                        <MaterialIcons name="video-collection" size={hp("2.8%")} color={themeColors.textGrey} />
                        <Text style={[styles.drawerItemText, { color: themeColors.textGrey }]}>Recording</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.drawerItem}
                        onPress={() => navigation.navigate('TrainerDetails', { batch: filteredBatches })}
                    >
                        <Icon name="account-details" size={hp("2.8%")} color={themeColors.textGrey} />
                        <Text style={[styles.drawerItemText, { color: themeColors.textGrey }]}>Trainer Details</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.drawerItem}
                        onPress={() => navigation.navigate('PaymentProgress', { batch: filteredBatches })}
                    >
                        <Icon name="cash" size={hp("2.8%")} color={themeColors.textGrey} />
                        <Text style={[styles.drawerItemText, { color: themeColors.textGrey }]}>Payment Progress</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.drawerItem}
                        onPress={() => navigation.navigate('AttendanceDetailScreen', { batch: filteredBatches })}
                    >
                        <Icon name="clock" size={hp("2.8%")} color={themeColors.textGrey} />
                        <Text style={[styles.drawerItemText, { color: themeColors.textGrey }]}>Attendance Logs</Text>
                    </TouchableOpacity>
                </View>
            </DrawerContentScrollView >

            {/* Footer with Logout */}
            <View style={[styles.drawerFooter, { backgroundColor: themeColors.background }]} >
                <GradientButton
                    colors={['#BA000C', '#5E000B']}
                    text='Log out'
                    onPress={logout}
                    style={styles.logoutButton}
                />
            </View>
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flex: 1,
    },
    profileHeader: {
        marginHorizontal: wp('2%'),
        marginTop: hp('1%'),
        borderRadius: moderateScale(15),
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    profileGradient: {
        ...Platform.select({
            ios: {
                justifyContent: "center",
                height: hp('15%'),
            },
            android: {
                paddingVertical: hp('2%'),
                paddingHorizontal: wp('4%'),
            }
        })
    },
    profileContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                paddingHorizontal: wp('4%'),
            },
        })

    },
    profileImageContainer: {
        position: 'relative',
        marginRight: wp('4%'),
    },
    profileImageRing: {
        width: wp('18%'),
        height: wp('18%'),
        borderRadius: wp('18%') / 2,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: moderateScale(2),
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: wp('18%') / 2,
    },
    avatarText: {
        backgroundColor: "#fff",
    },
    profileImageFallback: {
        backgroundColor: colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: moderateScale(18),
        fontFamily: 'Manrope-Bold',
        color: colors.white,
        marginBottom: hp('0.5%'),
    },
    profileRegId: {
        fontSize: moderateScale(12),
        color: 'rgba(255,255,255,0.9)',
        marginBottom: hp('0.3%'),
        fontFamily: 'Manrope-Regular'
    },
    profileAdmission: {
        fontSize: moderateScale(12),
        color: 'rgba(255,255,255,0.9)',
        fontFamily: 'Manrope-Regular'
    },
    // Theme Toggle Styles
    themeToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: hp('1.5%'),
        paddingHorizontal: wp('5%'),
        marginVertical: hp('1%'),
        marginHorizontal: wp('2%'),
        borderRadius: moderateScale(8),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    themeToggleContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    themeToggleText: {
        fontSize: moderateScale(16),
        marginLeft: wp('4%'),
        fontFamily: 'Manrope-SemiBold',
    },
    drawerItemsContainer: {
        marginTop: hp('1%'),
    },
    drawerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: hp('1.5%'),
        paddingHorizontal: wp('5%'),
        marginVertical: hp('0.2%'),
        borderRadius: moderateScale(8),
        marginHorizontal: wp('2%'),
    },
    drawerItemText: {
        fontSize: moderateScale(16),
        marginLeft: wp('4%'),
        fontFamily: 'Manrope-Regular',
    },
    profileDetailsSection: {
        marginTop: hp('2%'),
        marginHorizontal: wp('2%'),
        padding: wp('3%'),
        backgroundColor: '#f8f9fa',
        borderRadius: moderateScale(12),
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: moderateScale(12),
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: '#dee2e6',
        borderRadius: moderateScale(8),
        marginBottom: hp('0.5%'),
    },
    sectionTitle: {
        fontSize: moderateScale(14),
        color: colors.textPrimary,
        fontFamily: 'Manrope-Bold',
    },
    sectionContent: {
        padding: moderateScale(5),
        backgroundColor: colors.white,
        borderRadius: moderateScale(8),
        marginBottom: hp('0.5%'),
    },
    jobPortalsSection: {
        backgroundColor: colors.white,
        borderRadius: moderateScale(8),
        marginBottom: hp('0.5%'),
        paddingHorizontal: moderateScale(8),
    },
    jobPortalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: hp('1.2%'),
        paddingHorizontal: moderateScale(8),
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    lastJobPortalItem: {
        borderBottomWidth: 0,
    },
    jobPortalText: {
        flex: 1,
        marginLeft: wp('3%'),
        fontSize: moderateScale(13),
        color: colors.textPrimary,
        fontFamily: 'Manrope-Regular',
    },
    jobPortalIconContainer: {
        justifyContent: "flex-end",
    },
    linkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: hp('1%'),
        paddingHorizontal: moderateScale(12),
        backgroundColor: colors.white,
        borderRadius: moderateScale(8),
        marginBottom: hp('0.5%'),
    },
    linkText: {
        flex: 1,
        marginLeft: wp('3%'),
        fontSize: moderateScale(13),
        color: colors.textPrimary,
        fontFamily: 'Manrope-Regular',
    },
    careerTextContainer: {
        justifyContent: "flex-end",
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp('1.5%'),
    },
    detailText: {
        marginLeft: wp('3%'),
        flex: 1,
    },
    detailLabel: {
        fontSize: moderateScale(12),
        color: colors.textTertiary,
        marginBottom: hp('0.2%'),
        fontFamily: 'Manrope-Regular',
    },
    detailValue: {
        fontSize: moderateScale(13),
        color: colors.textPrimary,
        fontFamily: 'Manrope-SemiBold',
    },
    drawerFooter: {
        padding: wp('4%'),
        paddingTop: hp('1%'),
        borderTopWidth: 1,
        borderTopColor: '#dee2e6',
    },
    logoutButton: {
        marginBottom: hp('1%'),
    },
    courseImage: {
        width: hp("3%"),
        height: hp("3%"),
        borderRadius: 50,
        borderColor: '#ccc',
        borderStyle: "solid",
        borderWidth: 1
    },
});

export default CustomDrawerContent;