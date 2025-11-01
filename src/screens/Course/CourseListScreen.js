import React, { useEffect, useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Dimensions,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCourses } from '../../services/auth';
import { useScrollDetection } from '../../hook/useScrollDetection';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { colors, globalstyles } from '../../utils/globalStyles';
import { moderateScale, hp, wp } from '../../utils/responsive';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import CustomHeader from '../../components/CustomHeader/CustomHeader';
import { setGlobalCourseId, ClearGlobalCourseId } from '../../redux/slices/authSlice';
import { store } from '../../redux/store';
import { useAppTheme } from '../../hook/useAppTheme';

const CourseListSkeleton = ({ theme }) => (
    <SkeletonPlaceholder
        borderRadius={4}
        backgroundColor={theme.skeletonBg}
        highlightColor={theme.skeletonHighlight}
    >
        <View style={styles.skeletonContainer}>
            {/* Header Skeleton */}
            <View style={styles.headerSkeleton}>
                <SkeletonPlaceholder.Item
                    width={wp('40%')}
                    height={hp('3%')}
                    marginBottom={hp('1%')}
                    backgroundColor={theme.skeletonBg}
                />
                <SkeletonPlaceholder.Item
                    width={wp('60%')}
                    height={hp('2%')}
                    backgroundColor={theme.skeletonBg}
                />
            </View>

            {/* Course Cards Skeleton - Grid layout for tablets */}
            <View style={styles.coursesGrid}>
                {[1, 2, 3, 4].map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.courseCardSkeleton,
                            width > 768 && { width: '48%', marginHorizontal: '1%' }
                        ]}
                    >
                        {/* Course Image Skeleton */}
                        <SkeletonPlaceholder.Item
                            width="100%"
                            height={hp('20%')}
                            borderRadius={moderateScale(12)}
                            backgroundColor={theme.skeletonBg}
                        />

                        {/* Course Content Skeleton */}
                        <View style={styles.courseContentSkeleton}>
                            <SkeletonPlaceholder.Item
                                width="80%"
                                height={hp('2.5%')}
                                marginBottom={hp('1%')}
                                backgroundColor={theme.skeletonBg}
                            />

                            <View style={styles.metaSkeleton}>
                                <SkeletonPlaceholder.Item
                                    width="40%"
                                    height={hp('2%')}
                                    backgroundColor={theme.skeletonBg}
                                />
                                <SkeletonPlaceholder.Item
                                    width="40%"
                                    height={hp('2%')}
                                    backgroundColor={theme.skeletonBg}
                                />
                            </View>

                            <SkeletonPlaceholder.Item
                                width="100%"
                                height={hp('4%')}
                                borderRadius={moderateScale(8)}
                                marginTop={hp('1%')}
                                backgroundColor={theme.skeletonBg}
                            />
                        </View>
                    </View>
                ))}
            </View>
        </View>
    </SkeletonPlaceholder>
);

const { width } = Dimensions.get('window');

const CourseListScreen = () => {
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const { user, token } = useSelector((state) => state.auth);
    const { handleScroll, createAnimatedScrollView } = useScrollDetection();
    const AnimatedFlatList = createAnimatedScrollView(FlatList);
    const navigation = useNavigation();
    const { colors: themeColors } = useAppTheme(); // Use theme hook

    const fetchData = async () => {
        try {
            setRefreshing(true);
            setLoading(true);
            const response = await getCourses(user.student_id);
            setCourses(response.data || []);
        } catch (error) {
            console.log("error", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleNavigation = (item) => {
        console.log("item", item.course_id)
        store.dispatch(setGlobalCourseId(item.course_id));
        navigation.navigate('CourseDetailScreen')
    }

    if (loading || refreshing) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
                <CourseListSkeleton theme={themeColors} />
            </SafeAreaView>
        );
    }

    const renderCourseItem = ({ item }) => {
        return (
            <TouchableOpacity
                style={[
                    styles.courseCard,
                    { backgroundColor: themeColors.card || themeColors.surface }
                ]}
                onPress={() => handleNavigation(item)}
            >
                <View style={styles.courseImageContainer}>
                    {item.course_pic_url !== null ?
                        <Image
                            source={{ uri: item.course_pic_url }}
                            style={styles.courseImage}
                            resizeMode="cover"
                        />
                        :
                        <Image
                            source={require("../../assets/images/course.png")}
                            style={styles.courseImage}
                            resizeMode="cover"
                        />}
                    {/* <View style={[styles.categoryBadge, { backgroundColor: themeColors.primary }]}>
                        <Text style={[styles.categoryText, { color: themeColors.white }]}>{item.course_category}</Text>
                    </View> */}
                </View>

                <View style={styles.courseContent}>
                    <Text style={[styles.courseName, { color: themeColors.textPrimary }]}>
                        {item.course_name}
                    </Text>

                    <View style={styles.courseMeta}>
                        <View style={styles.metaItem}>
                            <Icon name="clock-outline" size={moderateScale(16)} color={themeColors.textSecondary} />
                            <Text style={[styles.metaText, { color: themeColors.textSecondary }]}>
                                {item.duration} month{item.duration > 1 ? 's' : ''}
                            </Text>
                        </View>

                        <View style={styles.metaItem}>
                            <Icon name="book-open-page-variant" size={moderateScale(16)} color={themeColors.textSecondary} />
                            <Text style={[styles.metaText, { color: themeColors.textSecondary }]}>
                                {item.topic?.length || 0} topics
                            </Text>
                        </View>
                    </View>

                    {/* {item.syllabus && (
                        <TouchableOpacity style={[styles.syllabusButton, { backgroundColor: themeColors.primary }]}>
                            <Icon name="file-document" size={moderateScale(16)} color={themeColors.white} />
                            <Text style={[styles.syllabusText, { color: themeColors.white }]}>View Syllabus</Text>
                        </TouchableOpacity>
                    )} */}
                </View>
            </TouchableOpacity>
        )
    };

    const renderEmptyComponent = () => (
        <View style={styles.emptyContainer}>
            <Icon name="book-education" size={moderateScale(64)} color={themeColors.textSecondary} />
            <Text style={[styles.emptyText, { color: themeColors.textPrimary }]}>No courses available</Text>
            <Text style={[styles.emptySubText, { color: themeColors.textSecondary }]}>Check back later for new courses</Text>
        </View>
    );

    return (
        <View style={[
            globalstyles.container,
            {
                paddingHorizontal: 0,
                backgroundColor: themeColors.background
            }
        ]}>
            <AnimatedFlatList
                data={courses}
                renderItem={renderCourseItem}
                keyExtractor={(item) => item.course_id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={fetchData}
                        colors={[themeColors.primary]}
                        tintColor={themeColors.primary}
                        progressBackgroundColor={themeColors.background}
                    />
                }
                ListEmptyComponent={renderEmptyComponent}
                numColumns={width > 768 ? 2 : 1} // Responsive grid for tablets
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    header: {
        padding: moderateScale(16),
        backgroundColor: '#fff',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#e2e8f0',
    },
    headerTitle: {
        fontSize: moderateScale(24),
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: moderateScale(4),
        fontFamily: 'Manrope-Regular',
    },
    headerSubtitle: {
        fontSize: moderateScale(14),
        color: '#64748b',
        fontFamily: 'Manrope-Regular',
    },
    listContent: {
        padding: moderateScale(16),
        paddingBottom: hp("6%"),
    },
    courseCard: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(12),
        marginBottom: moderateScale(16),
        marginHorizontal: width > 768 ? moderateScale(8) : 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: moderateScale(4),
        elevation: 3,
        overflow: 'hidden',
        flex: width > 768 ? 1 : undefined,
    },
    courseImageContainer: {
        position: 'relative',
        height: hp('20%'),
    },
    courseImage: {
        width: '100%',
        height: '100%',
    },
    categoryBadge: {
        position: 'absolute',
        top: moderateScale(12),
        left: moderateScale(12),
        backgroundColor: 'rgba(59, 130, 246, 0.85)',
        paddingHorizontal: moderateScale(10),
        paddingVertical: moderateScale(4),
        borderRadius: moderateScale(20),
    },
    categoryText: {
        color: '#fff',
        fontSize: moderateScale(12),
        fontFamily: 'Manrope-Medium',
    },
    courseContent: {
        padding: moderateScale(16),
    },
    courseName: {
        fontSize: moderateScale(18),
        fontFamily: 'Manrope-Bold',
        color: '#1e293b',
        marginBottom: moderateScale(12),
    },
    courseMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: moderateScale(16),
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        marginLeft: moderateScale(6),
        fontSize: moderateScale(14),
        color: '#64748b',
        fontFamily: 'Manrope-Regular',
    },
    syllabusButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        paddingVertical: moderateScale(10),
        paddingHorizontal: moderateScale(16),
        borderRadius: moderateScale(8),
    },
    syllabusText: {
        color: '#fff',
        fontFamily: 'Manrope-Medium',
        marginLeft: moderateScale(8),
        fontSize: moderateScale(14),
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: hp('10%'),
    },
    emptyText: {
        fontSize: moderateScale(18),
        fontFamily: 'Manrope-Medium',
        color: '#64748b',
        marginTop: moderateScale(16),
        marginBottom: moderateScale(8),
    },
    emptySubText: {
        fontSize: moderateScale(14),
        color: '#94a3b8',
        textAlign: 'center',
        fontFamily: 'Manrope-Regular',
    },
    loadingText: {
        marginTop: moderateScale(12),
        fontSize: moderateScale(16),
        color: '#64748b',
        fontFamily: 'Manrope-Regular',
    },

    skeletonContainer: {
        // flex: 1,
        backgroundColor: '#f8fafc',
        padding: moderateScale(16),
    },
    headerSkeleton: {
        marginBottom: moderateScale(16),
        padding: moderateScale(16),
        backgroundColor: '#fff',
        borderRadius: moderateScale(8),
    },
    coursesGrid: {
        flexDirection: width > 768 ? 'row' : 'column',
        flexWrap: width > 768 ? 'wrap' : 'nowrap',
        justifyContent: width > 768 ? 'space-between' : 'flex-start',
    },
    courseCardSkeleton: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(12),
        marginBottom: moderateScale(16),
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: moderateScale(4),
        elevation: 3,
    },
    courseContentSkeleton: {
        padding: moderateScale(16),
    },
    metaSkeleton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: moderateScale(16),
    },
});

export default CourseListScreen;