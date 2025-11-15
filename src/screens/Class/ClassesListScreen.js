import React, { useCallback, useEffect, useState, useRef } from 'react';
import { View, FlatList, Linking, TouchableOpacity, StyleSheet, RefreshControl, Animated, Easing } from 'react-native';
import { Button, Text, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExpandableCalendar, AgendaList, CalendarProvider } from 'react-native-calendars';
import { hp, wp, moderateScale } from '../../utils/responsive';
import { colors, globalstyles } from '../../utils/globalStyles';
import { getDashboard } from '../../services/auth';
import { useScrollDetection } from '../../hook/useScrollDetection';
import moment from 'moment'; // ADD THIS IMPORT
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import CustomHeader from '../../components/CustomHeader/CustomHeader';
import { useAppTheme } from '../../hook/useAppTheme';
import api from '../../services/api';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { API_BASE_URL } from '@env';
import { isWithinInterval, addMinutes, parseISO, isValid, parse } from 'date-fns';
const getCurrentDate = () => {
  return moment().format('YYYY-MM-DD');
};

const getMonthName = (monthIndex) => {
  return moment().month(monthIndex).format('MMMM');
};

// Dedicated Dashboard Skeleton Component using the specified approach
const ClassesListSkeleton = ({ theme }) => (
  <SkeletonPlaceholder
    borderRadius={4}
    backgroundColor={theme.skeletonBg}
    highlightColor={theme.skeletonHighlight}
  >
    <View style={styles.skeletonContainer}>
      {/* Header Skeleton */}
      <View style={styles.headerSkeleton}>
        <SkeletonPlaceholder.Item
          width={wp('60%')}
          height={hp('3%')}
          marginBottom={hp('1%')}
          backgroundColor={theme.skeletonBg}
        />
        <SkeletonPlaceholder.Item
          width={wp('80%')}
          height={hp('2%')}
          backgroundColor={theme.skeletonBg}
        />
      </View>

      {/* Calendar Skeleton */}
      <SkeletonPlaceholder.Item
        width="100%"
        height={hp('40%')}
        borderRadius={0}
        marginBottom={hp('2%')}
        backgroundColor={theme.skeletonBg}
      />

      {/* Selected Date Header Skeleton */}
      <SkeletonPlaceholder.Item
        flexDirection="row"
        justifyContent="space-between"
        paddingHorizontal={wp('4%')}
        marginBottom={hp('2%')}
      >
        <SkeletonPlaceholder.Item
          width={wp('50%')}
          height={hp('2.5%')}
          backgroundColor={theme.skeletonBg}
        />
        <SkeletonPlaceholder.Item
          width={wp('20%')}
          height={hp('2.5%')}
          backgroundColor={theme.skeletonBg}
        />
      </SkeletonPlaceholder.Item>

      {/* Class Cards Skeleton */}
      {[1, 2, 3].map((_, i) => (
        <SkeletonPlaceholder.Item
          key={i}
          width="100%"
          height={hp('20%')}
          borderRadius={moderateScale(8)}
          marginBottom={hp('2%')}
          paddingHorizontal={wp('4%')}
          backgroundColor={theme.skeletonBg}
        />
      ))}
    </View>
  </SkeletonPlaceholder>
);

const ClassesListScreen = ({ navigation }) => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [markedDates, setMarkedDates] = useState({});
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(getMonthName(moment().month()));
  const [currentYear, setCurrentYear] = useState(moment().year()); // ADD STATE
  const { handleScroll, createAnimatedScrollView } = useScrollDetection();
  const AnimatedFlatList = createAnimatedScrollView(FlatList);
  const calendarRef = useRef(null);
  const [isCalendarReady, setIsCalendarReady] = useState(false);
  const { theme, colors: themeColors, isDark, getColor } = useAppTheme();
  const { settings, user } = useSelector(state => state.auth);
  const automatic = settings?.data?.attendance_options === 'automatic_attendance';

  useEffect(() => {
    // Set a small timeout to ensure calendar renders after initial mount
    const timer = setTimeout(() => {
      setIsCalendarReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const onMonthChange = useCallback((month) => {
    const monthIndex = parseInt(month.month, 10) - 1;
    setCurrentMonth(getMonthName(monthIndex));
    if (month.year) {
      setCurrentYear(parseInt(month.year, 10));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []));

  const onRefresh = useCallback(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (schedule.length > 0) {
      processMarkedDates();
      filterClassesByDate(selectedDate);
    }
  }, [schedule, selectedDate]);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      setLoading(true);
      const response = await getDashboard();
      setSchedule(response.schedule || []);
      setIsCalendarReady(true);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Error fetching schedules. Please try again.'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const processMarkedDates = () => {
    const marked = {};

    schedule.forEach(item => {
      if (!marked[item.scheduled_date]) {
        marked[item.scheduled_date] = {
          marked: true,
          dotColor: colors.primary,
        };
      }
    });

    // Add selected date styling
    if (marked[selectedDate]) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: colors.primary,
      };
    } else {
      marked[selectedDate] = {
        selected: true,
        selectedColor: colors.primary,
      };
    }

    setMarkedDates(marked);
  };

  const filterClassesByDate = (date) => {
    const filtered = schedule.filter(item => item.scheduled_date === date);
    setFilteredClasses(filtered);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date.dateString);
    filterClassesByDate(date.dateString);
    // fetchData()
  };

  const markAttendance = async (item) => {
    console.log("item", item)
    try {
      const actionType = 'present';
      const attendanceResponse = await api.post(`${API_BASE_URL}/api/attendance/${user.student_id}`, {
        status: actionType,
        course: item.course_id,
        student: user.student_id,
        batch: item.batch_id
      });
      console.log('attendanceResponse', attendanceResponse)
      await fetchData()
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to mark attendance'
      });
    }
  };

  const openMeetingLink = (url) => {
    let meetUrl = url.trim();
    if (!meetUrl.startsWith('https://') && !meetUrl.startsWith('http://')) {
      meetUrl = 'https://' + meetUrl;
    }

    return Linking.openURL(meetUrl);
  };

  const parseTimeString = (timeString, referenceDate = new Date()) => {
    if (!timeString) return null;

    try {
      // Parse time string like "06:25 PM"
      const parsedTime = parse(timeString, 'hh:mm a', referenceDate);

      if (!isValid(parsedTime)) {
        console.warn('Invalid time format:', timeString);
        return null;
      }

      // Combine with current date but keep the parsed time
      const combinedDate = new Date(referenceDate);
      combinedDate.setHours(parsedTime.getHours());
      combinedDate.setMinutes(parsedTime.getMinutes());
      combinedDate.setSeconds(0);
      combinedDate.setMilliseconds(0);

      return combinedDate;
    } catch (error) {
      console.warn('Error parsing time:', timeString, error);
      return null;
    }
  };

  const canJoinMeeting = (classItem) => {
    if (!classItem?.start_time) {
      console.log('No start_time provided');
      return false;
    }

    const startTime = parseTimeString(classItem.start_time);
    if (!startTime) {
      console.log('Failed to parse start time:', classItem.start_time);
      return false;
    }

    const now = new Date();
    const joinWindowStart = addMinutes(startTime, -20);
    const canJoin = isWithinInterval(now, {
      start: joinWindowStart,
      end: startTime
    });

    return canJoin;
  };

  const handleJoinMeet = useCallback(async (item) => {
    if (!item?.class_link || item.class_link === "NA" || item.class_link === "join meeting") {
      alert("No meeting link available");
      return;
    }
    try {
      if (!item.attendance_status) {
        console.log("1")
        markAttendance(item);
      }

      // Open meeting immediately
      await openMeetingLink(item.class_link);

    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Cannot open Google Meet link. Please check the link or install Google Meet app.'
      });
    }
  }, [user?.student_id, automatic]);
  const completedCount = schedule.filter(item => item.status === "completed").length;
  const ongoingClass = schedule.find(item => item.status === "ongoing");

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  const renderClassItem = ({ item, index }) => {
    console.log("item", item)
    return (
      <View style={[
        globalstyles.card,
        {
          marginBottom: hp("2%"),
          backgroundColor: themeColors.card || themeColors.surface
        }
      ]}>
        <View style={styles.dayHeader}>
          <Text style={[styles.dayText, { color: themeColors.textPrimary }]}>Class {index + 1}</Text>
          <Text style={[styles.dateText, { color: themeColors.textPrimary }]}>{formatDate(item.scheduled_date)}</Text>
          {item.status === "completed" && (
            <View style={[styles.completedBadge, { backgroundColor: themeColors.success }]}>
              <Text style={styles.statusText}>Completed</Text>
            </View>
          )}
          {item.status === "ongoing" && (
            <View style={[styles.ongoingBadge, { backgroundColor: themeColors.blue }]}>
              <Text style={styles.statusText}>Ongoing</Text>
            </View>
          )}
          {item.status === "missed" && (
            <View style={[styles.missedBadge, { backgroundColor: themeColors.error }]}>
              <Text style={styles.statusText}>Missed</Text>
            </View>
          )}
          {item.status === "cancel" && (
            <View style={[styles.missedBadge, { backgroundColor: themeColors.error }]}>
              <Text style={styles.statusText}>Cancelled</Text>
            </View>
          )}
          {item.status === "upcoming" && (
            <View style={[styles.ongoingBadge, { backgroundColor: themeColors.link }]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          )}
        </View>

        <Text style={[globalstyles.textLarge, { color: themeColors.textPrimary }]}>{item.course_name}</Text>
        <Text style={[globalstyles.textMedium, { marginTop: 8, color: themeColors.textPrimary }]}>
          Batch: {item.title}
        </Text>
        <Text style={[globalstyles.textMedium, { marginTop: 4, color: themeColors.textPrimary }]}>
          Trainer: {item.trainer_name}
        </Text>
        <Text style={[globalstyles.textMedium, { marginTop: 4, color: themeColors.textPrimary }]}>
          Time: {formatTime(item.start_time)} - {formatTime(item.end_time)}
        </Text>

        {(item.status === "ongoing" || canJoinMeeting(item)) ? item.class_link ? (
          <View style={styles.cardActions}>
            <Button
              mode="contained"
              onPress={() => handleJoinMeet(item)}
              style={[
                styles.button,
                {
                  backgroundColor: canJoinMeeting(item)
                    ? themeColors.primary
                    : themeColors.disabled
                }
              ]}
              labelStyle={globalstyles.buttonText}
              disabled={!canJoinMeeting(item)}
            >
              {canJoinMeeting(item) ? "Join" : "Join Available Soon"}
            </Button>
          </View>
        ) : (
          <Text style={[styles.notScheduledText, { color: themeColors.textSecondary }]}>
            No meeting link available
          </Text>
        ) : null}
      </View>
    );
  };

  if (loading && !isCalendarReady) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
        <ClassesListSkeleton theme={themeColors} />
      </SafeAreaView>
    );
  }

  return (
    <View style={[
      globalstyles.container,
      {
        paddingHorizontal: 0,
        backgroundColor: themeColors.background,
      }
    ]}>
      {isCalendarReady && (
        <CalendarProvider
          key={`calendar-${isDark ? 'dark' : 'light'}`}
          date={selectedDate}
          onDateChanged={setSelectedDate}
          onMonthChange={onMonthChange}
          showTodayButton
          disabledOpacity={0.6}
          theme={{
            todayButtonTextColor: themeColors.primary,
          }}
          style={{ paddingBottom: hp("4%") }}
        >
          <View style={styles.calendarContainer}>
            <ExpandableCalendar
              initialPosition={'closed'}
              onDayPress={handleDateSelect}
              markedDates={markedDates}
              allowShadow={true}
              animateScroll={{
                duration: 250,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1)
              }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[themeColors.primary]}
                  tintColor={themeColors.primary}
                  progressBackgroundColor={themeColors.background}
                />
              }
              theme={{
                calendarBackground: themeColors.card,
                selectedDayBackgroundColor: themeColors.primary,
                selectedDayTextColor: '#FFFFFF',
                todayTextColor: themeColors.primary,
                dayTextColor: themeColors.textPrimary,
                textDisabledColor: themeColors.textSecondary,
                dotColor: themeColors.primary,
                arrowColor: themeColors.primary,
                textDayHeaderFontFamily: 'Manrope-Regular',
                textSectionTitleColor: themeColors.textSecondary,
                monthTextColor: themeColors.primary,
                textMonthfontFamily: 'Manrope-Bold',
                textMonthFontSize: moderateScale(16),
                textDayHeaderFontSize: moderateScale(14),
                textDayFontSize: moderateScale(16),
                backgroundColor: themeColors.background,
                contentStyle: {
                  backgroundColor: themeColors.background,
                },
              }}
              firstDay={1}
              style={[styles.calendar, { backgroundColor: themeColors.background }]}
              hideArrows={false}
              disablePan={false}
              hideExtraDays={false}
              disableWeekScroll={false}
              animationDuration={250}
              closeOnDayPress={false}
            />

            {/* Selected Date Header */}
            <View style={[styles.selectedDateHeader, { color: themeColors.background }]}>
              <Text style={[styles.selectedDateText, { color: themeColors.textPrimary }]}>
                Classes on {formatDate(selectedDate)}
              </Text>
              <Text style={[styles.classCountText, { color: themeColors.secondary }]}>
                {filteredClasses.length} class{filteredClasses.length !== 1 ? 'es' : ''}
              </Text>
            </View>

            {/* Classes List for Selected Date */}
            <AnimatedFlatList
              data={filteredClasses}
              renderItem={renderClassItem}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              keyExtractor={(item, index) => `class-${index}-${item.scheduled_date}`}
              contentContainerStyle={styles.list}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[themeColors.primary]}
                  tintColor={themeColors.primary}
                  progressBackgroundColor={themeColors.background}
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
                    No classes scheduled for this date
                  </Text>
                </View>
              }
            />
          </View>
        </CalendarProvider>
      )}
    </View>
  );
};

// Additional component-specific styles
const styles = StyleSheet.create({
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
    padding: hp('2%'),
  },
  courseTitle: {
    ...globalstyles.textLarge,
    fontSize: moderateScale(20),
    color: colors.primary,
    fontFamily: 'Manrope-Regular',
  },
  courseSubtitle: {
    ...globalstyles.textMedium,
    color: colors.textSecondary,
  },
  selectedDateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp('4%'),
    paddingBottom: hp('1%'),
  },
  selectedDateText: {
    ...globalstyles.textMedium,
    fontFamily: 'Manrope-Bold',
  },
  classCountText: {
    ...globalstyles.textMedium,
    color: colors.textSecondary,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1%'),
    flexWrap: 'wrap',
    color: colors.primary,
  },
  dayText: {
    ...globalstyles.textMedium,
    fontFamily: 'Manrope-Bold',
    color: colors.primary,
    marginRight: wp('2%'),
  },
  dateText: {
    ...globalstyles.textSmall,
    flex: 1,
  },
  completedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.5%'),
    borderRadius: moderateScale(10),
  },
  ongoingBadge: {
    backgroundColor: '#0CAFFF',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.5%'),
    borderRadius: moderateScale(10),
  },
  missedBadge: {
    backgroundColor: '#343a40',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.5%'),
    borderRadius: moderateScale(10),
  },
  statusText: {
    ...globalstyles.textSmall,
    color: 'white',
  },
  meetLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('2%'),
    padding: moderateScale(10),
    backgroundColor: '#f5f5f5',
    borderRadius: moderateScale(5),
  },
  meetLinkText: {
    ...globalstyles.textMedium,
    color: colors.link,
    marginLeft: wp('1%'),
  },
  notScheduledText: {
    ...globalstyles.textSmall,
    fontStyle: 'italic',
    marginTop: hp('2%'),
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp('2%'),
  },
  button: {
    flex: 1,
    marginHorizontal: wp('1%'),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp('10%'),
  },
  emptyText: {
    ...globalstyles.textMedium,
    textAlign: 'center',
    marginBottom: hp('3%'),
    color: colors.textSecondary,
  },
  currentClassBanner: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    backgroundColor: colors.primary,
    padding: hp('2%'),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentClassText: {
    ...globalstyles.textMedium,
    color: '#fff',
    flex: 1,
  },
  joinNowButton: {
    backgroundColor: '#fff',
    marginLeft: wp('2%'),
  },
  list: {
    padding: wp('4%'),
    paddingBottom: hp('4%'),
  },
  calendarContainer: {
    flex: 1,
  },
  calendar: {
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    backgroundColor: '#FFFFFF',
  },
  skeletonContainer: {
    paddingTop: hp('2%'),
  },
  headerSkeleton: {
    paddingHorizontal: wp('4%'),
    marginBottom: hp('2%'),
  },
});

export default ClassesListScreen;