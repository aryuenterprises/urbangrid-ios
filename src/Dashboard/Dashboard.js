import React, { useCallback, useEffect, useState } from 'react';
import { View, FlatList, Text, Image, TouchableOpacity, StyleSheet, Dimensions, ImageBackground, RefreshControl } from 'react-native';
import { useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native';
import { getDashboard, getNotifications, getSettings, getStudentProfile, refreshStudentProfile } from '../services/auth'; // Assuming you'll add getNotifications to your auth service
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { hp, moderateScale, wp } from '../utils/responsive';
import { colors, globalstyles } from '../utils/globalStyles';
import Carousel from 'react-native-reanimated-carousel';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { CircularProgress } from 'react-native-circular-progress';
import capitalizeFirstLetter from '../utils/capitalizeFirstLetter';
import { useScrollDetection } from '../hook/useScrollDetection';
import Logo from '../assets/component/logo.js';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomHeader from '../components/CustomHeader/CustomHeader';
import { useAppTheme } from '../hook/useAppTheme';
import Toast from 'react-native-toast-message';
import { smartPreload } from "../utils/smartPreload.js"
const screenWidth = Dimensions.get('window').width;

// Dedicated Dashboard Skeleton Component using the specified approach
const DashboardSkeleton = ({ theme }) => (
  <SkeletonPlaceholder borderRadius={4} backgroundColor={theme.skeletonBg} highlightColor={theme.skeletonHighlight}>
    <View style={styles.skeletonContainer}>
      {/* Header Skeleton */}
      <SkeletonPlaceholder.Item flexDirection="row" alignItems="flex-start" marginBottom={hp('3%')}>
        <SkeletonPlaceholder.Item>
          <SkeletonPlaceholder.Item width={wp('40%')} height={hp('3%')} marginBottom={hp('1%')} />
          <SkeletonPlaceholder.Item width={wp('60%')} height={hp('2%')} />
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder.Item>

      {/* Stats Row Skeleton */}
      <SkeletonPlaceholder.Item flexDirection="row" justifyContent="space-between" marginBottom={hp('3%')}>
        {[1, 2, 3].map((_, i) => (
          <SkeletonPlaceholder.Item key={i} width={wp('28%')} height={hp('12%')} borderRadius={moderateScale(12)} />
        ))}
      </SkeletonPlaceholder.Item>

      {/* Announcement Banner Skeleton */}
      <SkeletonPlaceholder.Item width="100%" height={hp('25%')} borderRadius={moderateScale(10)} marginBottom={hp('3%')} />

      {/* Upcoming Classes Header Skeleton */}
      <SkeletonPlaceholder.Item width={wp('30%')} height={hp('2.5%')} marginBottom={hp('1%')} />

      {/* Class Cards Skeleton */}
      {[1, 2].map((_, i) => (
        <SkeletonPlaceholder.Item key={i} width="100%" height={hp('15%')} borderRadius={moderateScale(8)} marginBottom={hp('1%')} />
      ))}

      {/* Featured Courses Header Skeleton */}
      <SkeletonPlaceholder.Item width={wp('30%')} height={hp('2.5%')} marginTop={hp('2%')} marginBottom={hp('1%')} />

      {/* Course Cards Skeleton */}
      <SkeletonPlaceholder.Item flexDirection="row">
        {[1, 2, 3].map((_, i) => (
          <SkeletonPlaceholder.Item
            key={i}
            width={wp('40%')}
            height={hp('20%')}
            borderRadius={moderateScale(8)}
            marginRight={wp('3%')}
          />
        ))}
      </SkeletonPlaceholder.Item>
    </View>
  </SkeletonPlaceholder>
);

const StudentDashboard = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const { handleScroll, createAnimatedScrollView } = useScrollDetection();
  const AnimatedFlatList = createAnimatedScrollView(FlatList);
  const [notifications, setNotifications] = useState([]);
  const { studentProfile, user, token } = useSelector(state => state.auth);
  const { theme, colors: themeColors, isDark, getColor } = useAppTheme(); // Use the theme hook
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [hasMounted, setHasMounted] = useState(false);

  // Handle both initial mount and focus events
  useEffect(() => {
    if (isFocused) {
      if (!hasMounted) {
        fetchData();
        fetchNotifications();
        getStudentProfile(user?.student_id);
        setHasMounted(true);
        getSettings();
      } else {
        // Subsequent focuses - only refresh notifications and settings
        fetchNotifications();
        getStudentProfile(user?.student_id);
        getSettings();
      }
    }
  }, [isFocused, hasMounted]);

  const onRefresh = useCallback(() => {
    fetchData();
    fetchNotifications();
    getStudentProfile(user?.student_id);
    getSettings();
  }, []);

  const navigation = useNavigation();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.toggleDrawer()}
          style={{ marginLeft: 15 }}
        >
          <Icon name="menu" size={24} color="#000" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      setLoading(true);
      const response = await getDashboard();
      setData(response);
      await getSettings();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to Load data. Please try again.'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // Assuming you have an API endpoint to fetch notifications
      const response = await getNotifications(); // You'll need to implement this in your auth service
      setNotifications(response.notifications || []);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Error fetching notifications. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };


  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }} >
        <DashboardSkeleton theme={themeColors} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[globalstyles.container, { backgroundColor: themeColors.background || colors.background }]}>
      <AnimatedFlatList
        onScroll={handleScroll}
        scrollEventThrottle={16}
        data={[{}]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[themeColors.primary]}
            tintColor={themeColors.primary}
            progressBackgroundColor={themeColors.background}
          />
        }
        renderItem={() => (
          <>
            {/* Header with Welcome Message */}
            <View style={[globalstyles.sectionHeader]}>
              <CustomHeader color={themeColors} />
              <View>
                <Text style={[globalstyles.username, { color: themeColors.textPrimary }]}>Welcome back, {capitalizeFirstLetter(user?.username)}</Text>
                <Text style={[globalstyles.subheader, { color: themeColors.textPrimary }]}>Here's your learning summary</Text>
              </View>
              <View style={styles.notificationContainer}>
                <TouchableOpacity
                  style={styles.notificationIcon}
                  onPressIn={() => smartPreload('Notification')}
                  onPress={() => navigation.navigate('Notification', { data: notifications })}
                >
                  <Ionicons name="notifications" size={moderateScale(24)} color={themeColors.textPrimary} />
                  {notifications?.length > 0 && (
                    <View style={[styles.notificationBadge, { backgroundColor: themeColors.error, }]}>
                      <Text style={styles.notificationBadgeText}>
                        {notifications?.length > 99 ? '99+' : notifications?.length}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
            {data?.announcements?.length > 0 ? (
              <>
                <View style={[globalstyles.sectionHeader, {marginTop: 0}]}>
                  <Text style={[globalstyles.sectionTitle, { color: themeColors.textPrimary }]}>Announcements</Text>
                </View>
                <View style={styles.announcementContainer}>
                  <Carousel
                    loop={data.announcements.length > 1}
                    autoPlay={data.announcements.length > 1}
                    autoPlayInterval={5000}
                    width={screenWidth - 40}
                    height={hp("26%")}
                    data={data.announcements}
                    onSnapToItem={(index) => setActiveIndex(index)}
                    renderItem={({ item }) => (
                      <View>
                        <AnnouncementCard
                          title={item?.title}
                          background_pic_url={item?.background_pic_url}
                          created_at={item?.created_at}
                          content={item?.content}
                        />
                      </View>
                    )}
                    scrollAnimationDuration={1000}
                    panGestureHandlerProps={{
                      activeOffsetX: [-10, 10],
                    }}
                  />
                  {/* {data.announcements.length > 1 && (
                    <View style={styles.pagination}>
                      {data.announcements.map((_, index) => (
                        <View
                          key={index}
                          style={[
                            styles.paginationDot,
                            activeIndex === index && styles.activeDot, { backgroundColor: themeColors.primary },
                            { width: activeIndex === index ? 20 : 8, backgroundColor: activeIndex === index ? themeColors.primary : themeColors.lightGray }
                          ]}
                        />
                      ))}
                    </View>
                  )} */}
                </View>
              </>
            ) : (
              <View
                style={[styles.announcementContainer, { borderRadius: moderateScale(13), marginVertical: hp("1%"), overflow: "hidden" }]}
              >
                <ImageBackground
                  source={require("../assets/images/banner_bg.png")}
                  style={styles.announcementImage}
                  resizeMode="cover"
                >
                  <View style={styles.imageOverlay} />
                  <View style={styles.announcementContent}>
                    <Text style={[styles.announcementTitle, { color: 'white' }, { fontWeight: 'bold' }]}>
                      Welcome to the Aryu Academy Student Portal
                    </Text>
                    <Text style={[styles.announcementText, { color: 'white' }]}>
                      Your personalized dashboard for accessing course materials, class schedules, assignments, progress tracking, and academic tools.
                    </Text>
                  </View>
                </ImageBackground>
                <View style={styles.aryu_logo}>
                  <Image
                    source={require("../assets/images/logo.png")}
                    style={{
                      width: hp("15%"),
                      height: hp("10%"),
                    }}
                  />
                </View>
              </View>
            )}

            {user?.user_type === "student" &&
              <View style={styles.statsRow}>
                <StatCard
                  icon="calendar-month"
                  value={`${data?.attendance?.percentage}%`}
                  label="Attendance"
                  color={themeColors.present}
                  background={themeColors.presetStat}
                  theme={themeColors}
                  screen={"AttendanceDetailScreen"}
                />
                <StatCard
                  icon="assignment-turned-in"
                  value={`${data?.assignments?.done}/${data?.assignments?.total}`}
                  label="Tasks"
                  color={themeColors.blue}
                  background={themeColors.taskStat}
                  theme={themeColors}
                  screen={"AttendanceDetailScreen"}
                />
                <StatCard
                  icon="trending-up"
                  value={`${data?.student_progress?.progress_percent}%`}
                  label="Progress"
                  color={themeColors.warning}
                  background={themeColors.progressStat}
                  theme={themeColors}
                  screen={"AttendanceDetailScreen"}
                />
              </View>}

            {data?.upcoming_schedules?.length > 0 && (
              <View style={styles.section}>
                <View style={globalstyles.sectionHeader}>
                  <Text style={[globalstyles.sectionTitle, { color: themeColors.textPrimary }]}>Upcoming Class</Text>
                  <TouchableOpacity
                    onPressIn={() => smartPreload('Classes')}
                    onPress={() => navigation.navigate("Classes")}>
                    <Text style={globalstyles.seeAllText}>View All</Text>
                  </TouchableOpacity>
                </View>
                {data.upcoming_schedules.map((classItem, index) => (
                  <ClassCard
                    key={index}
                    course={classItem.course_name}
                    batch={classItem.title}
                    date={formatDate(classItem.scheduled_date)}
                    time={classItem.duration}
                    trainer={classItem.trainer_name}
                    status={classItem.status}
                    item={classItem}
                    color={themeColors}
                    user={user}
                  />
                ))}
              </View>
            )}

            {user?.user_type === "tutor" && data?.schedule?.length > 0 && (
              <View style={styles.section}>
                <View style={globalstyles.sectionHeader}>
                  <Text style={[globalstyles.sectionTitle, { color: themeColors.textPrimary }]}>Schedule Class</Text>
                  <TouchableOpacity
                    onPressIn={() => smartPreload('Classes')}
                    onPress={() => navigation.navigate("Classes")}>
                    <Text style={globalstyles.seeAllText}>View All</Text>
                  </TouchableOpacity>
                </View>
                {data.schedule.slice(0, 3).map((classItem, index) => (
                  <ClassCard
                    key={index}
                    course={classItem.course_name}
                    batch={classItem.title}
                    date={formatDate(classItem.scheduled_date)}
                    time={classItem.duration}
                    trainer={classItem.trainer_name}
                    status={classItem.status}
                    item={classItem}
                    color={themeColors}
                    user={user}
                  />
                ))}
              </View>
            )}

            {/* Featured Courses */}
            {data?.featured_courses && <View style={[styles.section, { marginBottom: hp("6%") }]}>
              <View style={globalstyles.sectionHeader}>
                <Text style={[globalstyles.sectionTitle, { color: themeColors.textPrimary }]}>Featured Courses</Text>
              </View>
              <FlatList
                horizontal
                data={data?.featured_courses?.slice(0, 3)}
                showsHorizontalScrollIndicator={false}
                style={{ gap: hp("5%") }}
                renderItem={({ item }) => (
                  <CourseCard
                    title={item?.course_name}
                    category={item?.course_category}
                    image={item?.course_pic_url}
                    duration={`${item?.duration} months`}
                    fee={`₹${item?.fee}`}
                    color={themeColors}
                  // onPress={() => navigation.navigate('CourseDetails', { course: item })}
                  />
                )}
                keyExtractor={(item, index) => index.toString()}
              />
            </View>}
          </>
        )}
        keyExtractor={() => "dashboard"}
      />
    </SafeAreaView>
  );
};

const StatCard = ({ icon, value, label, color, background, screen, theme }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(parseInt(value));
    }, 500);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <TouchableOpacity style={[styles.circularCard, { backgroundColor: theme.card }]}>
      <CircularProgress
        size={moderateScale(70)}
        width={moderateScale(8)}
        fill={progress}
        tintColor={color}
        backgroundColor={background}
        rotation={0}
        lineCap="round"
        backgroundWidth={moderateScale(8)}
      >
        {() => (
          <TouchableOpacity style={styles.valueContainer}>
            <Text style={[styles.circularValue, { color: theme.textPrimary }]}>{value}</Text>
          </TouchableOpacity>
        )}
      </CircularProgress>
      <View style={styles.circularTextContainer}>
        <MaterialIcons name={icon} size={moderateScale(18)} color={color} />
        <Text style={[styles.circularLabel, { color }]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
};

const ClassCard = ({ course, batch, date, time, trainer, status, item, color, user }) => {
  return (
    <View style={[globalstyles.card, { backgroundColor: color.card }]}>
      <View style={styles.classHeader}>
        <Text style={[globalstyles.textLarge, { color: color.textPrimary }]}>{course}</Text>
      </View>
      <Text style={[globalstyles.textMedium, { color: color.textSecondary }]}>{batch}</Text>
      <View style={styles.classDetails}>
        <View style={[globalstyles.flexRow, { gap: hp("0.5%") }]}>
          <Ionicons name="calendar" size={16} color={color.textSecondary} />
          <Text style={[styles.classDetailText, {
            color: color.textSecondary,
          }]}>{date}</Text>
        </View>
        <View style={[[globalstyles.flexRow, { gap: hp("0.5%") }]]}>
          <Ionicons name="time" size={16} color={color.textSecondary} />
          <Text style={[styles.classDetailText, {
            color: color.textSecondary,
          }]}>{time}</Text>
        </View>
      </View>
      <View style={[globalstyles.flexRow, { gap: hp("0.5%") }]}>
        <FontAwesome name="user" size={16} color={color.textSecondary} />
        <Text style={[styles.classDetailText, {
          color: color.textSecondary,
        }]}>{user?.user_type === "tutor" ? "Student" : "Trainer"} : {trainer}</Text>
      </View>
    </View>
  )
};

const CourseCard = ({ title, category, image, duration, fee, onPress, color }) => (
  <TouchableOpacity style={[globalstyles.card, styles.courseCard, { backgroundColor: color.card }]} onPress={onPress}>
    <Image source={{ uri: image }} resizeMode='stretch' style={globalstyles.popularCourseImage} />
    <View style={styles.courseInfo}>
      <Text style={[globalstyles.textLarge, { color: color.textPrimary }]} numberOfLines={1}>{title}</Text>
      <Text style={[globalstyles.textSmall, { color: color.textSecondary }]} numberOfLines={1}>{category}</Text>
      <View style={[globalstyles.flexRow, { gap: hp("0.5%") }]}>
        <Text style={[globalstyles.textSmall, { color: color.primary }]}>{duration}</Text>
        <Text style={[globalstyles.textSmall, { color: color.primary }]}>{fee}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const AnnouncementCard = ({ title, background_pic_url, created_at, content }) => {
  const { theme, colors: themeColors, isDark, getColor } = useAppTheme();

  const extractStyledContent = (html) => {
    if (!html) return { heading: null, paragraph: null };

    const h1Regex = /<h1>.*?<strong[^>]*style="[^"]*color:\s*(rgb\([^)]+\)|[^;"]+)[^>]*>(.*?)<\/strong>.*?<\/h1>/i;
    const h1Match = html.match(h1Regex);
    const heading = h1Match ? {
      text: h1Match[2].replace(/&nbsp;/g, ' ').trim(),
      color: h1Match[1],
      isBold: true
    } : null;

    const pRegex = /<p>.*?<span[^>]*style="[^"]*color:\s*(rgb\([^)]+\)|[^;"]+)[^>]*>(.*?)<\/span>.*?<\/p>/i;
    const pMatch = html.match(pRegex);
    const paragraph = pMatch ? {
      text: pMatch[2].replace(/&nbsp;/g, ' ').trim(),
      color: pMatch[1]
    } : null;

    return { heading, paragraph };
  };

  const { heading, paragraph } = extractStyledContent(content);

  return (
    <View style={styles.announcementCard}>
      {background_pic_url ? (
        <ImageBackground
          source={{ uri: background_pic_url }}
          style={styles.announcementImage}
          resizeMode="stretch"
        >
          <View style={styles.imageOverlay} />
          <View style={styles.announcementContent}>
            {heading && (
              <Text style={[
                styles.announcementTitle,
                { color: parseColor(heading.color) || 'white' },
                heading.isBold && { fontWeight: 'bold' }
              ]}>
                {heading.text}
              </Text>
            )}
            {paragraph && (
              <Text style={[
                styles.announcementText,
                { color: parseColor(paragraph.color) || 'white' }
              ]}>
                {paragraph.text}
              </Text>
            )}
          </View>
        </ImageBackground>
      ) : (
        <View style={[styles.announcementImage, styles.imagePlaceholder]}>
          <MaterialIcons name="announcement" size={hp("2%")} color={themeColors.primary} />
          <View style={styles.announcementContent}>
            {heading && (
              <Text style={[
                styles.announcementTitle,
                { color: parseColor(heading.color) },
                heading.isBold && { fontWeight: 'bold' }
              ]}>
                {heading.text}
              </Text>
            )}
            {paragraph && (
              <Text style={[
                styles.announcementText,
                { color: parseColor(paragraph.color) }
              ]}>
                {paragraph.text}
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonContainer: {
    padding: moderateScale(16),
  },
  section: {
    paddingHorizontal: hp("1%"),
  },
  announcementContainer: {
    width: screenWidth - 40,
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  courseCard: {
    marginRight: hp("2%"),
    // backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    gap: hp("1%")
  },
  courseInfo: {
    gap: hp("0.5%")
  },
  announcementCard: {
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: hp("1.5%"),
    marginHorizontal: hp("0.5%"),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  announcementImage: {
    width: '100%',
    height: hp("25%"),
    justifyContent: 'space-around',
  },
  imagePlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  announcementContent: {
    padding: hp("3%"),
  },
  announcementTitle: {
    fontSize: moderateScale(18),
    marginBottom: 5,
    fontFamily: 'Manrope-Medium',
    zIndex: 100
  },
  announcementText: {
    fontSize: moderateScale(12),
    fontFamily: 'Manrope-Regular',
    zIndex: 100
  },
  circularCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: moderateScale(12),
    borderRadius: moderateScale(12),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: wp('28%'),
    marginRight: wp('1%'),
  },
  circularValue: {
    fontSize: moderateScale(10),
    fontFamily: 'Manrope-Bold',
    color: '#333',
  },
  circularTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('1%'),
    gap: wp('0.5%'),
  },
  circularLabel: {
    fontSize: moderateScale(10),
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'Manrope-Regular',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp('2%'),
    paddingHorizontal: wp('1%'),
  },
  valueContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('0.5%'),
  },
  classDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: hp('1%'),
  },
  classDetailText: {
    fontSize: moderateScale(13),
    fontFamily: 'Manrope-Regular',
  },
  notificationContainer: {
    paddingRight: hp("1.5%")
  },
  notificationIcon: {
    padding: moderateScale(8),
    borderRadius: moderateScale(20),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    zIndex: 1000,
    borderRadius: moderateScale(10),
    minWidth: moderateScale(20),
    height: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(4),
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: moderateScale(10),
    fontFamily: 'Manrope-Bold',
  },
  aryu_logo: {
    position: 'absolute',
    zIndex: 1,
    right: moderateScale(1),
    top: 0,
    bottom: 0, // Stretch from top to bottom
    justifyContent: 'center', // Center vertically
    alignItems: 'center', // Center horizontally (optional)
    width: hp("20%"),
  },
});

export default StudentDashboard;