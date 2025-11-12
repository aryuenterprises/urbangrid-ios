import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { hp, wp, moderateScale } from '../../utils/responsive';
import { colors } from '../../utils/globalStyles';
import { formatDateTime } from '../../utils/formatDate';
import capitalizeFirstLetter from '../../utils/capitalizeFirstLetter';
import { useScrollDetection } from '../../hook/useScrollDetection';
import { useAppTheme } from '../../hook/useAppTheme';
import Toast from 'react-native-toast-message';
import { getStudentProfile } from '../../services/auth';

const TrainerDetails = ({ route }) => {
    // const { batch } = route.params || {};
    const { user } = useSelector(state => state.auth);
    const { handleScroll, createAnimatedScrollView } = useScrollDetection();
    const AnimatedFlatList = createAnimatedScrollView(FlatList);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);
    const { colors: themeColors } = useAppTheme();
    const [data, setData] = useState({});

    const onRefresh = useCallback(() => {
        fetchData();
    }, []);

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setRefreshing(true);
            setLoading(true);
            const profile = await getStudentProfile(user?.student_id);
            console.log("getStudentProfile", profile.data.batch)
            setData(profile.data.batch);
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.message || 'Failed to load data. Please try again.'
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    if (loading) {
        <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
    }

    // if (!Array.isArray(data) || data.length === 0) {
    //     return (
    //         <View style={[styles.noDataContainer, { backgroundColor: themeColors.background }]}>
    //             <Icon name="information-outline" size={hp('4%')} color={themeColors.error} />
    //             <Text style={[styles.noDataText, { color: themeColors.textPrimary }]}>No trainer available</Text>
    //         </View>
    //     );
    // }

    const renderBatchItem = ({ item }) => (
        <View style={[styles.batchCard, { backgroundColor: themeColors.card }]}>
            {/* Batch Header */}
            <View style={styles.batchHeader}>
                <Icon name="calendar-clock" size={hp('2.5%')} color={themeColors.primary} />
                <Text style={[styles.batchName, { color: themeColors.textPrimary }]}>{capitalizeFirstLetter(item?.title)}</Text>
                <View style={[styles.dateBadge, { color: themeColors.textSecondary }]}>
                    <Text style={[styles.dateText, { color: themeColors.textSecondary }]}>
                        {formatDateTime(item?.scheduled_date, { includeTime: false })}
                    </Text>
                </View>
            </View>

            {/* Trainer Assignments */}
            {item?.course_trainer_assignments
                ?.filter(assignment => assignment.student_id === user?.student_id)
                .map((assignment, assignmentIndex) => (
                    <View key={`${assignmentIndex}-${assignment.course_id || assignmentIndex}`} style={styles.assignmentCard}>
                        <View style={styles.infoRow}>
                            <Icon name="book-open" size={hp('2.2%')} color={themeColors.primary} />
                            <View style={styles.infoContent}>
                                <Text style={[styles.infoLabel, { color: themeColors.textPrimary }]}>Course</Text>
                                <Text style={[styles.infoValue, { color: themeColors.textSecondary }]}>{assignment.course_name || 'N/A'}</Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <Icon name="account" size={hp('2.2%')} color={colors.textSecondary} />
                            <View style={styles.infoContent}>
                                <Text style={[styles.infoLabel, { color: themeColors.textPrimary }]}>Trainer</Text>
                                <Text style={[styles.infoValue, { color: themeColors.textSecondary }]}>{assignment.trainer_name || 'N/A'}</Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <Icon name="identifier" size={hp('2.2%')} color={colors.textSecondary} />
                            <View style={styles.infoContent}>
                                <Text style={[styles.infoLabel, { color: themeColors.textPrimary }]}>Trainer ID</Text>
                                <Text style={[styles.infoValue, { color: themeColors.textSecondary }]}>{assignment.employee_id || 'N/A'}</Text>
                            </View>
                        </View>

                        <View style={styles.scheduleContainer}>
                            <View style={styles.scheduleItem}>
                                <Icon name="calendar-start" size={hp('2%')} color={colors.textTertiary} />
                                <Text style={[styles.scheduleText, { color: themeColors.textSecondary }]}>
                                    Start: {formatDateTime(item?.scheduled_date, { includeTime: false })}
                                </Text>
                            </View>
                            <View style={styles.scheduleItem}>
                                <Icon name="calendar-end" size={hp('2%')} color={colors.textTertiary} />
                                <Text style={[styles.scheduleText, { color: themeColors.textSecondary }]}>
                                    End: {formatDateTime(item?.end_date, { includeTime: false })}
                                </Text>
                            </View>
                        </View>
                    </View>
                ))
            }
        </View>
    );

    return (
        <AnimatedFlatList
            style={[styles.container, { backgroundColor: themeColors.background }]}
            contentContainerStyle={[styles.contentContainer, { backgroundColor: themeColors.background }]}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            data={data}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[themeColors.primary]}
                    tintColor={themeColors.primary}
                    progressBackgroundColor="#ffffff"
                />
            }
            renderItem={renderBatchItem}
            keyExtractor={(item, index) => `batch-${item.batch_id}-${index}`}
        // ListEmptyComponent={
        //     loading ? (
        //         <View style={styles.centerContainer}>
        //             <ActivityIndicator size="large" color={themeColors.primary} />
        //         </View>
        //     ) : (
        //         <Text style={[styles.emptyText, { color: themeColors.textPrimary }]}>No assessments available</Text>
        //     )
        // }
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: moderateScale(16),
    },
    batchCard: {
        borderRadius: moderateScale(8),
        padding: moderateScale(12),
        marginBottom: hp('1.5%'),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    batchHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp('1%'),
        paddingBottom: hp('0.5%'),
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGray,
    },
    batchName: {
        flex: 1,
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: colors.textPrimary,
        marginLeft: wp('2%'),
        fontFamily: 'Manrope-SemiBold',
    },
    dateBadge: {
        backgroundColor: colors.primary + '20',
        paddingHorizontal: wp('2%'),
        paddingVertical: hp('0.3%'),
        borderRadius: moderateScale(4),
    },
    dateText: {
        fontSize: moderateScale(10),
        color: colors.primary,
        fontFamily: 'Manrope-Medium',
    },
    assignmentCard: {
        marginTop: hp('1%'),
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp('0.8%'),
    },
    infoContent: {
        marginLeft: wp('3%'),
        flex: 1,
    },
    infoLabel: {
        fontSize: moderateScale(11),
        color: colors.textTertiary,
        marginBottom: hp('0.2%'),
        fontFamily: 'Manrope-Regular',
    },
    infoValue: {
        fontSize: moderateScale(12),
        fontFamily: 'Manrope-Medium',
        color: colors.textPrimary,
    },
    scheduleContainer: {
        marginTop: hp('0.5%'),
        paddingTop: hp('0.5%'),
        borderTopWidth: 1,
        borderTopColor: colors.lightGray + '80',
    },
    scheduleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: hp('0.2%'),
    },
    scheduleText: {
        fontSize: moderateScale(11),
        color: colors.textSecondary,
        marginLeft: wp('2%'),
        fontFamily: 'Manrope-Regular',
    },
    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    noDataText: {
        fontSize: moderateScale(14),
        color: colors.textTertiary,
        marginTop: hp('1%'),
        fontFamily: 'Manrope-Regular',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: moderateScale(20),
    },
    emptyText: {
        textAlign: 'center',
        fontSize: moderateScale(14),
        color: colors.textTertiary,
        marginTop: hp('2%'),
        fontFamily: 'Manrope-Regular',
    },
});

export default TrainerDetails;