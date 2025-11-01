import {
    FlatList,
    Text,
    View,
    ActivityIndicator,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Linking,
    Alert
} from "react-native";
import { getRecordings } from "../../services/auth";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, globalstyles } from "../../utils/globalStyles";
import { useScrollDetection } from "../../hook/useScrollDetection";
import { RefreshControl } from "react-native-gesture-handler";
import { format } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { moderateScale, hp, wp } from "../../utils/responsive";
import moment from "moment";
import Toast from "react-native-toast-message";
import { useAppTheme } from "../../hook/useAppTheme";

export const RecordingScreen = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [recordings, setRecordings] = useState([]);
    const { user } = useSelector(state => state.auth);
    const { handleScroll, createAnimatedScrollView } = useScrollDetection();
    const AnimatedFlatList = createAnimatedScrollView(FlatList);
    const { theme, colors: themeColors, isDark, getColor } = useAppTheme(); // Use the theme hook

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = useCallback(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setRefreshing(true);
            const response = await getRecordings(user.student_id);
            if (response.data) {
                const sortedRecordings = response.data.sort((a, b) =>
                    new Date(b.created_date) - new Date(a.created_date)
                );
                setRecordings(sortedRecordings);
            }
        } catch (error) {
            console.log("Error fetching recordings:", error.response?.data || error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const formatDate = (dateString) => {
        try {
            // Parse the date string with moment
            const date = moment(dateString);

            // Check if the date is valid
            if (!date.isValid()) {
                return dateString;
            }

            // Format the date using moment
            return date.format('MMM DD, YYYY • hh:mm A');
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString;
        }
    };


    const handleRecordingPress = async (recordingUrl) => {
        // Check if the URL is valid
        let urlToOpen = recordingUrl;

        // Add https:// if missing
        if (!urlToOpen.startsWith('http://') && !urlToOpen.startsWith('https://')) {
            urlToOpen = 'https://' + urlToOpen;
        }

        try {
            console.log("urlToOpen", urlToOpen)
            Linking.openURL(urlToOpen);

        } catch (error) {
            console.error('Error opening URL:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.message ||
                    error.message || 'Failed to open the recording'
            });
        }
    };

    const isValidUrl = (url) => {
        try {
            new URL(url);
            return true;
        } catch (error) {
            return false;
        }
    };


    const renderRecordingItem = ({ item }) => {
        const isUrlValid = isValidUrl(item.recording);

        return (
            <TouchableOpacity
                style={[
                    styles.recordingCard,
                    !isUrlValid && styles.disabledCard,
                    { backgroundColor: themeColors.card }
                ]}
                onPress={() => {
                    if (isUrlValid) {
                        handleRecordingPress(item.recording);
                    } else {
                        Toast.show({
                            type: 'error',
                            text1: 'Invalid URL',
                            text2: 'This recording has an invalid URL'
                        });
                    }
                }}
                disabled={!isUrlValid}
                activeOpacity={isUrlValid ? 0.7 : 1}
            >
                <View style={styles.cardContentLeft}>
                    <View style={styles.cardHeader}>
                        <Text style={[styles.recordingTitle, { color: themeColors.textPrimary }]}>
                            {item.topic || 'Untitled Recording'}
                        </Text>
                    </View>

                    <Text style={[styles.recordingDate, { color: themeColors.textSecondary }]}>
                        {formatDate(item.recording)}
                    </Text>
                    <Text style={[styles.recordingDate, { color: themeColors.textSecondary }]}>
                        {formatDate(item.created_date)}
                    </Text>

                    {/* {item.recording && (
                        <Text
                            style={[
                                styles.recordingUrl,
                                !isUrlValid && styles.invalidUrl
                            ]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {isUrlValid ? "Tap to open recording" : "Invalid recording URL"}
                        </Text>
                    )} */}
                </View>
                <View style={styles.cardContentRight}>
                    {isUrlValid && (
                        <Ionicons
                            name="open-outline"
                            size={moderateScale(18)}
                            color={colors.primary}
                            style={styles.openIcon}
                        />
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <FlatList
                // onScroll={handleScroll}
                // scrollEventThrottle={16}
                data={recordings}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                        progressBackgroundColor="#ffffff"
                    />
                }
                ListHeaderComponent={
                    <View style={styles.headerContent}>
                        <Text style={[styles.subheader, { color: themeColors.textSecondary }]}>
                            {recordings.length > 0
                                ? `You have ${recordings.length} recording${recordings.length !== 1 ? 's' : ''}`
                                : 'No recordings available'
                            }
                        </Text>
                    </View>
                }
                renderItem={renderRecordingItem}
                keyExtractor={(item) => `recording-${item.id}`}
                ListEmptyComponent={
                    !loading && (
                        <View style={styles.emptyContainer}>
                            <Text style={[styles.emptyText, { color: themeColors.textGrey }]}>
                                No recordings found
                            </Text>
                        </View>
                    )
                }
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: hp("0.5%"),
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    listContent: {
        paddingBottom: hp('2%'),
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp('4%'),
        paddingTop: hp('2%'),
        paddingBottom: hp('2%'),
        backgroundColor: colors.background,
    },
    backButton: {
        padding: moderateScale(8),
        marginRight: wp('3%'),
        borderRadius: moderateScale(20),
        backgroundColor: colors.lightPrimary + '20',
    },
    headerContent: {
        flex: 1,
        paddingHorizontal: hp("3%"),
        paddingVertical: hp("1%"),
        // alignSelf: "center"
    },
    subheader: {
        fontSize: moderateScale(14),
        color: colors.gray,
        fontFamily: 'Manrope-Medium',
    },
    recordingCard: {
        display: "flex",
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: colors.white,
        marginHorizontal: wp('4%'),
        marginVertical: hp('0.5%'),
        padding: moderateScale(16),
        borderRadius: moderateScale(12),
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: moderateScale(2),
        },
        shadowOpacity: 0.1,
        shadowRadius: moderateScale(4),
        elevation: moderateScale(3),
        gap: hp("1%")
    },
    recordingTitle: {
        fontSize: moderateScale(16),
        fontFamily: 'Manrope-Medium',
        color: colors.text,
        marginBottom: hp('1%'),
    },
    recordingDate: {
        fontSize: moderateScale(12),
        color: colors.gray,
        marginBottom: hp('0.5%'),
        fontFamily: 'Manrope-Regular',
    },
    recordingUrl: {
        fontSize: moderateScale(12),
        color: colors.primary,
        fontFamily: 'Manrope-Medium',
    },
    emptyContainer: {
        alignItems: 'center',
        padding: hp('4%'),
        marginTop: hp('10%'),
    },
    emptyText: {
        fontSize: moderateScale(16),
        color: colors.gray,
        fontFamily: 'Manrope-Medium',
    },
    cardHeader: {
        marginBottom: hp('0.5%'),
    },
    cardContentLeft: {
        maxWidth: "80%",
    },
    cardContentRight: {
        maxWidth: "20%",
        justifyContent: 'center',
        alignItems: 'center',
    },
});

