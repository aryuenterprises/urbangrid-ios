import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, Animated, Easing, Dimensions, FlatList, TextInput, Platform } from 'react-native';
import { Button, Text, Card, TouchableRipple, Searchbar } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import { colors, globalstyles } from '../../utils/globalStyles';
import { wp, hp, moderateScale } from '../../utils/responsive';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import api from '../../services/api';
import { useSelector } from 'react-redux';
import CustomDropdown from '../../components/CustomDropdown';
import { navigate } from '../../navigation/RootNavigation';
import Toast from 'react-native-toast-message';
import CustomHeader from '../../components/CustomHeader/CustomHeader';
import { useFocusEffect } from '@react-navigation/core';
import { useAppTheme } from '../../hook/useAppTheme';

const AttendanceScreen = ({ route }) => {
  const [sessions, setSessions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkedOut, setCheckedOut] = useState(false);
  const [onBreak, setOnBreak] = useState(false);
  const [lastCheckInTime, setLastCheckInTime] = useState(null);
  const [lastCheckOutTime, setLastCheckOutTime] = useState(null);
  const [lastBreakInTime, setLastBreakInTime] = useState(null);
  const [lastBreakOutTime, setLastBreakOutTime] = useState(null);
  const [stats, setStats] = useState({
    totalDays: 0,
    presentDays: 0,
    attendancePercentage: 0,
    currentMonthPercentage: 0,
    currentStreak: 0
  });
  const [courses, setCourses] = useState([]);
  const [logs, setLogs] = useState(null);
  const [allLogs, setAllLogs] = useState([]); // Store all logs for filtering
  const [selectedCourse, setSelectedCourse] = useState(null);
  const rippleScale = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;
  const [rippleColor, setRippleColor] = useState(colors.present);
  const { user } = useSelector((state) => state.auth);
  const { theme, colors: themeColors, isDark, getColor } = useAppTheme(); // Use the theme hook

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterStartDate, setFilterStartDate] = useState(null);
  const [filterEndDate, setFilterEndDate] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Ref for search input
  const searchInputRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      fetchAttendanceData();
    }, []));

  const fetchAttendanceData = async () => {
    try {
      console.log("object", user.student_id)
      setRefreshing(true);
      const logsResponse = await api.get(`/api/attendance/${user.student_id}/status`);
      const allLogsData = logsResponse.data.logs || [];
      console.log("object", logsResponse)
      setSessions(allLogsData);
      setStats({
        totalDays: logsResponse.data.total_classes,
        presentDays: logsResponse.data.attended,
        attendancePercentage: logsResponse.data.attendance_percentage,
        currentMonthPercentage: logsResponse.data.attendance_percentage,
      });

      const todayResponse = await api.get(`/api/attendance/${user.student_id}`);
      console.log("object", todayResponse)
      const todayStatus = todayResponse.data || null;
      setLogs(todayStatus.data)

      setAllLogs(todayStatus.data); // Store all logs for filtering
      if (Array.isArray(todayStatus.data) && todayStatus.data.length > 0) {
        try {
          // More robust sorting that handles invalid dates
          const sortedData = [...todayStatus.data].sort((a, b) => {
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;
            return dateB - dateA; // Descending order
          });

          const mostRecentRecord = sortedData[0];
          if (mostRecentRecord) {
            updateTodayStatus(mostRecentRecord);
            setSelectedCourse(mostRecentRecord);
          }
        } catch (error) {
          console.error("Error processing attendance data:", error);
        }
      }

      const formattedCourses = todayResponse.data.batches.map(course => ({
        label: course.course_name,
        value: course.course,
        ...course
      }));
      setCourses(formattedCourses);

    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch attendance data'
      });
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  // Filter logs based on search criteria
  const getFilteredLogs = useCallback(() => {
    if (!allLogs?.length) return [];

    let filtered = [...allLogs];

    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item => {
        if (!item) return false;

        const studentName = String(item.student || '').toLowerCase();
        const courseName = String(item.course_name || '').toLowerCase();

        return studentName.includes(query) || courseName.includes(query);
      });
    }

    return filtered;
  }, [allLogs, searchQuery]);

  const updateTodayStatus = (todayStatus) => {
    if (todayStatus) {
      setCheckedIn(todayStatus.status.toLowerCase() !== 'logout');
      setCheckedOut(todayStatus.status.toLowerCase() === 'logout');
      setLastCheckInTime(todayStatus.date ? moment(todayStatus.date) : null);
      setLastCheckOutTime(todayStatus.date ? moment(todayStatus.date) : null);
      if (todayStatus.status.toLowerCase() === 'break out') {
        setOnBreak(true);
        setLastBreakInTime(moment(todayStatus.date));
      } else {
        setOnBreak(false);
        setLastBreakOutTime(moment(todayStatus.date));
      }
    } else {
      setCheckedIn(false);
      setCheckedOut(false);
      setOnBreak(false);
      setLastCheckInTime(null);
      setLastCheckOutTime(null);
      setLastBreakInTime(null);
      setLastBreakOutTime(null);
    }
  };

  const onRefresh = useCallback(() => {
    fetchAttendanceData();
  }, []);

  const handleAttendanceAction = async () => {
    if (!selectedCourse) {
      Toast.show({
        type: 'error',
        text1: 'Select Course',
        text2: 'select a course before marking attendance'
      });
      return;
    }

    // Add check for break status before allowing logout
    if (checkedIn && onBreak) {
      Toast.show({
        type: 'error',
        text1: 'Cannot Logout During Break',
        text2: 'Please end your break first before logging out'
      });
      return;
    }
    try {
      const actionType = checkedIn ? 'Logout' : 'Login';
      const response = await api.post(`/api/attendance/${user.student_id}`, {
        status: actionType,
        course: selectedCourse.course,
        student: user.student_id,
        batch: selectedCourse.batch_id
      });
      if (response.data.success) {
        if (checkedIn) {
          setCheckedIn(false);
          setCheckedOut(true);
          setOnBreak(false);
          setLastCheckOutTime(moment(response.data.date));
          triggerRippleEffect(colors.primary);
          Toast.show({
            type: 'success',
            text1: 'Logged out successfully',
            text2: `You've been logged out`
          });
        } else {
          setCheckedIn(true);
          setCheckedOut(false);
          setLastCheckInTime(moment(response.data.date));
          triggerRippleEffect(colors.present);
          Toast.show({
            type: 'success',
            text1: 'Logged in successfully',
            text2: `You've been logged`
          });
        }
        await fetchAttendanceData();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Attendance failed 132',
          text2: response.data.message || 'Please try again',
        });
      }
    } catch (error) {
      console.log("error", error.response.data)
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: checkedIn ? 'Failed to check out' : 'Failed to check in'
      });
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message ||
          (checkedIn ? 'Failed to check out' : 'Failed to check in')
      });
    }
  };

  const handleBreakAction = async () => {
    try {
      const actionType = onBreak ? 'Break in' : 'Break out';
      const response = await api.post(`/api/attendance/${user.student_id}`, {
        status: actionType,
        course: selectedCourse.course,
        student: user.student_id,
        batch: selectedCourse.batch_id
      });
      if (response.data.success) {
        if (onBreak) {
          setOnBreak(false);
          setLastBreakOutTime(moment());
          triggerRippleEffect(colors.secondary);
          Toast.show({
            type: 'success',
            text1: 'Break Ended',
            text2: 'Your break has ended'
          });
        } else {
          setOnBreak(true);
          setLastBreakInTime(moment());
          triggerRippleEffect(colors.warning);
          Toast.show({
            type: 'success',
            text1: 'Break Started',
            text2: "You've started your break"
          });
        }
        await fetchAttendanceData();
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: onBreak ? 'Failed to end break' : 'Failed to start break'
      });
      console.error(error);
    }
  };

  const triggerRippleEffect = (color) => {
    setRippleColor(color);
    rippleScale.setValue(0);
    rippleOpacity.setValue(1);

    Animated.parallel([
      Animated.timing(rippleScale, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(rippleOpacity, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    ]).start();
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'present': return colors.present;
      case 'login': return colors.present;
      case 'logout': return colors.primary;
      case 'break in': return '#FFA500';
      case 'break out': return themeColors.textPrimary;
      case 'leave': return colors.warning || '#FFA500';
      default: return colors.error;
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
  };

  const focusSearchInput = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const renderRecordItem = ({ item }) => (
    <View style={styles.recordItem}>
      <View style={styles.recordLeft}>
        <Text style={[globalstyles.textSmall, { color: themeColors.textPrimary }]}>{item?.course_name}</Text>
        <Text style={[globalstyles.textMedium, { color: themeColors.textPrimary }]}>{item?.title}</Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={[
          globalstyles.textMedium,
          {
            color: getStatusColor(item?.status, themeColors),
            fontWeight: 'bold'
          }
        ]}>
          {item?.status}
        </Text>
        <Text style={[globalstyles.textSmall, { color: themeColors.textSecondary }]}>
          {moment(item?.date).format('MMM D, YYYY h:mm A')}
        </Text>
      </View>
    </View>
  );

  const filteredLogs = getFilteredLogs();
  return (
    <View style={[
      globalstyles.container,
      {
        backgroundColor: themeColors.background,
        paddingVertical: hp("2%")
      }
    ]}>
      <Animated.View
        style={[
          styles.ripple,
          {
            backgroundColor: themeColors.primary,
            opacity: rippleOpacity,
            transform: [
              {
                scale: rippleScale.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 30]
                })
              }
            ]
          }
        ]}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[themeColors.primary]}
            tintColor={themeColors.primary}
            progressBackgroundColor={themeColors.background}
          />
        }
      >
        <Card style={[styles.currentAttendanceCard, { backgroundColor: themeColors.card }]}>
          <Card.Content style={styles.cardContent}>
            <Text style={[globalstyles.textMedium, styles.greeting, { color: themeColors.textPrimary }]}>
              Good {getTimeOfDayGreeting()}
            </Text>
            <Text style={[globalstyles.textSmall, styles.currentDate, { color: themeColors.textSecondary }]}>
              {moment().format('dddd, MMM D, YYYY')}
            </Text>

            {(checkedIn && !onBreak) ? (
              <View style={[styles.statusPill, { backgroundColor: themeColors.success }]}>
                <Text style={[styles.statusPillText, { color: themeColors.white }]}>
                  Logged in at {lastCheckInTime?.format('h:mm A')}
                </Text>
              </View>
            ) : ((onBreak && checkedIn) && (
              <View style={[styles.statusPill, { backgroundColor: themeColors.warning }]}>
                <Text style={[styles.statusPillText, { color: themeColors.white }]}>
                  On break since {lastBreakInTime?.format('h:mm A')}
                </Text>
              </View>
            ))}

            <CustomDropdown
              items={courses}
              selectedCourse={selectedCourse}
              placeholder="Select Course"
              onSelectItem={(item) => setSelectedCourse(item)}
              style={{ width: '100%', marginBottom: hp('2%'), backgroundColor: themeColors.background }}
              dropDownContainerStyle={{
                width: '100%',
                backgroundColor: themeColors.background,
                borderColor: themeColors.lightGray
              }}
              textColor={themeColors.textPrimary}
              color={themeColors}
            />

            <View style={styles.buttonsContainer}>
              {!onBreak &&
                <TouchableRipple
                  onPress={handleAttendanceAction}
                  rippleColor={themeColors.primary}
                  style={[
                    styles.attendanceButton,
                    checkedIn ? styles.checkOutButton : styles.checkInButton,
                    {
                      marginRight: checkedIn ? wp('2%') : 0,
                      backgroundColor: checkedIn ? themeColors.error : themeColors.success
                    },
                    (!selectedCourse || (onBreak)) && styles.disabledButton
                  ]}
                  borderless={true}
                  disabled={!selectedCourse || (checkedIn && onBreak)}
                >
                  <View style={styles.buttonContent}>
                    <Icon
                      name={checkedIn ? "logout" : "login"}
                      size={moderateScale(30)}
                      color={themeColors.white}
                    />
                    <Text style={styles.buttonText}>
                      {checkedIn ? "Log Out" : "Log In"}
                    </Text>
                  </View>
                </TouchableRipple>
              }

              {checkedIn && (
                <TouchableRipple
                  onPress={handleBreakAction}
                  rippleColor={themeColors.primary}
                  style={[
                    styles.breakButton,
                    {
                      backgroundColor: onBreak ? themeColors.info : themeColors.warning
                    },
                    !selectedCourse && styles.disabledButton
                  ]}
                  borderless={true}
                  disabled={!selectedCourse}
                >
                  <View style={styles.buttonContent}>
                    <Icon
                      name={onBreak ? "timer-off" : "timer"}
                      size={moderateScale(30)}
                      color={themeColors.card}
                    />
                    <Text style={[styles.buttonText, { color: themeColors.card }]}>
                      {onBreak ? "Break In" : "Break Out"}
                    </Text>
                  </View>
                </TouchableRipple>
              )}
            </View>

            {/* <Button
              mode="outlined"
              onPress={() => navigate('AttendanceDetailScreen', {
                attendancePercentage: stats.attendancePercentage,
                presentDays: stats.presentDays,
                totalDays: stats.totalDays,
                currentMonthPercentage: stats.currentMonthPercentage
              })}
              style={[
                styles.historyButton,
                {
                  borderColor: themeColors.primary,
                  backgroundColor: 'transparent'
                }
              ]}
              labelStyle={[
                styles.historyButtonLabel,
                { color: themeColors.primary }
              ]}
            >
              View Attendance Logs
            </Button> */}
          </Card.Content>
        </Card>

        <View style={[
          styles.recordsContainer,
          { backgroundColor: themeColors.card || themeColors.surface }
        ]}>
          <View style={styles.recordsHeader}>
            <Text style={[globalstyles.sectionTitle, { color: themeColors.textPrimary }]}>
              Attendance History
            </Text>
          </View>

          <View style={[styles.searchContainer, { backgroundColor: themeColors.background }]}>
            <TextInput
              ref={searchInputRef}
              placeholder="Search by name or course"
              placeholderTextColor={themeColors.textSecondary}
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={[
                styles.searchInput,
                {
                  backgroundColor: themeColors.background,
                  color: themeColors.textPrimary,
                  borderColor: themeColors.lightGray
                }
              ]}
            />
            <TouchableRipple
              onPress={focusSearchInput}
              style={styles.searchIcon}
            >
              <Icon name="magnify" size={moderateScale(24)} color={themeColors.textSecondary} />
            </TouchableRipple>
          </View>

          {filteredLogs.length > 0 ? (
            <FlatList
              data={filteredLogs}
              renderItem={renderRecordItem}
              keyExtractor={(item, index) => `${item?.date}-${index}`}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.noResultsContainer}>
              <Icon name="magnify" size={moderateScale(40)} color={themeColors.textSecondary} />
              <Text style={[styles.noResultsText, { color: themeColors.textSecondary }]}>
                No attendance records found
              </Text>
              {searchQuery && (
                <Button
                  onPress={clearFilters}
                  mode="text"
                  textColor={themeColors.primary}
                >
                  Clear Filters
                </Button>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: hp('6%'),
    paddingHorizontal: wp('1%'),
  },
  header: {
    marginTop: hp('2%'),
    marginBottom: hp('2%'),
    // textAlign: 'center',
    color: colors.textPrimary,
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentAttendanceCard: {
    marginBottom: hp('3%'),
    borderRadius: moderateScale(16),
    padding: hp('2%'),
    backgroundColor: colors.white,
  },
  cardContent: {
    alignItems: 'center',
  },
  greeting: {
    textAlign: 'center',
    marginBottom: hp('0.5%'),
    color: colors.primary,
  },
  currentDate: {
    textAlign: 'center',
    marginBottom: hp('2%'),
    color: colors.textSecondary,
  },
  statusPill: {
    paddingHorizontal: moderateScale(12),
    paddingVertical: hp("2%"),
    borderRadius: moderateScale(20),
    alignSelf: 'center',
    marginBottom: hp('2%'),
    alignItems: 'center',
  },
  presentPill: {
    backgroundColor: 'rgba(46, 204, 113, 0.2)',
  },
  nonePill: {
    backgroundColor: 'rgba(149, 165, 166, 0.2)',
  },
  statusPillText: {
    fontSize: moderateScale(14),
    fontFamily: 'Manrope-Medium',
  },
  presentPillText: {
    color: colors.present,
  },
  breakPillText: {
    color: colors.warning,
    // marginTop: hp('1%'),
  },
  nonePillText: {
    color: colors.textSecondary,
  },
  progressSection: {
    marginVertical: hp('1%'),
    width: '100%',
  },
  progressTitle: {
    fontSize: moderateScale(16),
    fontFamily: 'Manrope-Medium',
    color: colors.textPrimary,
    marginBottom: hp('1%'),
  },
  progressBarContainer: {
    height: hp('2%'),
    width: '100%',
    backgroundColor: '#E9ECEF',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: hp('0.5%'),
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressPercentage: {
    position: 'absolute',
    right: wp('2%'),
    fontSize: moderateScale(12),
    color: colors.white,
    fontFamily: 'Manrope-Bold',
  },
  progressSubtitle: {
    fontSize: moderateScale(12),
    color: colors.textSecondary,
    alignSelf: 'flex-end',
    fontFamily: 'Manrope-Regular',
  },
  buttonsContainer: {
    marginVertical: hp('2%'),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attendanceButton: {
    width: hp("15%"),
    height: hp("15%"),
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  breakButton: {
    width: hp("15%"),
    height: hp("15%"),
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    marginLeft: wp('2%'),
  },
  checkInButton: {
    backgroundColor: colors.present,
  },
  checkOutButton: {
    backgroundColor: colors.primary,
  },
  breakInButton: {
    backgroundColor: colors.warning,
  },
  breakOutButton: {
    backgroundColor: colors.secondary,
  },
  buttonContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: moderateScale(16),
    fontFamily: 'Manrope-Medium',
    marginTop: hp('1%'),
  },
  historyButton: {
    marginTop: hp('1%'),
    borderColor: colors.primary,
  },
  historyButtonLabel: {
    color: colors.primary,
  },
  ripple: {
    position: 'absolute',
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
    zIndex: -1,
    top: hp("50%"),
    left: wp("50%")
  },
  disabledButton: {
    opacity: 0.5,
  },
  recordsContainer: {
    padding: hp('2%'),
    paddingBottom: hp('4%'),
    borderRadius: 15
  },
  recordsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: hp('1.5%'),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recordLeft: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('2%'),
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: moderateScale(8),
    backgroundColor: colors.white,
    paddingHorizontal: wp('3%'),
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(14),
    paddingVertical: hp('1.5%'),
    fontFamily: 'Manrope-Regular',
  },
  searchIcon: {
    padding: wp('2%'),
  },
  filterContainer: {
    backgroundColor: colors.white,
    padding: hp('2%'),
    borderRadius: moderateScale(8),
    marginBottom: hp('2%'),
    elevation: 2,
  },
  filterTitle: {
    fontSize: moderateScale(16),
    fontFamily: 'Manrope-Medium',
    marginBottom: hp('1%'),
    color: colors.textPrimary,
  },
  statusFilterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: hp('2%'),
  },
  statusFilterPill: {
    paddingHorizontal: moderateScale(12),
    paddingVertical: hp('0.5%'),
    borderRadius: moderateScale(20),
    backgroundColor: '#f0f0f0',
    marginRight: wp('2%'),
    marginBottom: hp('1%'),
  },
  statusFilterPillActive: {
    backgroundColor: colors.primary,
  },
  statusFilterText: {
    fontSize: moderateScale(12),
    color: colors.textSecondary,
    fontFamily: 'Manrope-Regular',
  },
  statusFilterTextActive: {
    color: colors.white,
    fontFamily: 'Manrope-Medium',
  },
  dateFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: moderateScale(8),
    padding: hp('1%'),
    alignItems: 'center',
  },
  dateSeparator: {
    marginHorizontal: wp('2%'),
    color: colors.textSecondary,
  },
  clearFiltersButton: {
    alignSelf: 'flex-end',
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: hp('2%'),
  },
  noResultsText: {
    fontSize: moderateScale(16),
    fontFamily: 'Manrope-Regular',
    color: colors.textSecondary,
    marginTop: hp('1%'),
    marginBottom: hp('2%'),
  },
});

const getTimeOfDayGreeting = () => {
  const hour = moment().hour();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
};

export default AttendanceScreen;
