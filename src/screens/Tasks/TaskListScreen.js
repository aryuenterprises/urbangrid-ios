import React, { useState, useMemo, useCallback, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, RefreshControl, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Button, Card, Searchbar, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ExpandableCalendar, AgendaList, CalendarProvider } from 'react-native-calendars';
import moment from 'moment';
import { moderateScale } from '../../utils/responsive';
import FilterModal from '../../components/FilterModal/FilterModal';

const dummyTasks = [
  {
    id: 1,
    title: 'Learn React Components',
    description: 'Study functional vs class components and build 3 examples',
    subject: 'React',
    priority: 'high',
    dueDate: '2025-06-15T18:00:00',
    status: 'pending'
  },
  {
    id: 2,
    title: 'JavaScript Array Methods',
    description: 'Practice map, filter, reduce with coding exercises',
    subject: 'JavaScript',
    priority: 'medium',
    dueDate: '2025-06-16T10:00:00',
    status: 'in-progress'
  },
  {
    id: 3,
    title: 'CSS Flexbox Tutorial',
    description: 'Complete Flexbox Froggy game and build a navbar',
    subject: 'CSS',
    priority: 'low',
    dueDate: '2025-06-17T15:30:00',
    status: 'pending'
  },
  {
    id: 4,
    title: 'Build To-Do App',
    description: 'Create a simple to-do app with React Native',
    subject: 'React Native',
    priority: 'high',
    dueDate: '2025-06-15T23:59:00',
    status: 'completed'
  },
  {
    id: 5,
    title: 'Git Branching Practice',
    description: 'Create feature branches and practice merging',
    subject: 'Git',
    priority: 'high',
    dueDate: '2025-06-18T12:00:00',
    status: 'pending'
  },
  {
    id: 6,
    title: 'API Fetching Tutorial',
    description: 'Learn to fetch data from a public API',
    subject: 'JavaScript',
    priority: 'medium',
    dueDate: '2025-06-19T09:00:00',
    status: 'pending'
  },
  {
    id: 7,
    title: 'Responsive Design',
    description: 'Make a webpage responsive using media queries',
    subject: 'CSS',
    priority: 'low',
    dueDate: '2025-06-16T16:00:00',
    status: 'pending'
  },
  {
    id: 8,
    title: 'Node.js Basics',
    description: 'Set up a simple server with Express',
    subject: 'Backend',
    priority: 'medium',
    dueDate: '2025-06-20T14:00:00',
    status: 'pending'
  },
  {
    id: 9,
    title: 'Database Design',
    description: 'Learn about SQL tables and relationships',
    subject: 'Database',
    priority: 'high',
    dueDate: '2025-06-17T17:00:00',
    status: 'in-progress'
  },
  {
    id: 10,
    title: 'Debugging Techniques',
    description: 'Practice using Chrome DevTools debugger',
    subject: 'JavaScript',
    priority: 'medium',
    dueDate: '2025-06-18T13:30:00',
    status: 'pending'
  },
  {
    id: 11,
    title: 'React Hooks',
    description: 'Learn useState and useEffect with examples',
    subject: 'React',
    priority: 'high',
    dueDate: '2025-06-19T11:00:00',
    status: 'pending'
  },
  {
    id: 12,
    title: 'Algorithm Practice',
    description: 'Solve 3 problems on LeetCode',
    subject: 'Algorithms',
    priority: 'high',
    dueDate: '2025-06-16T20:00:00',
    status: 'pending'
  },
  {
    id: 13,
    title: 'UI Design Principles',
    description: 'Watch tutorial on color theory and spacing',
    subject: 'Design',
    priority: 'low',
    dueDate: '2025-06-20T09:00:00',
    status: 'pending'
  },
  {
    id: 14,
    title: 'Python Basics',
    description: 'Complete first 3 chapters of Python tutorial',
    subject: 'Python',
    priority: 'medium',
    dueDate: '2025-06-21T16:00:00',
    status: 'pending'
  },
  {
    id: 15,
    title: 'Portfolio Website',
    description: 'Start building personal portfolio site',
    subject: 'Web Development',
    priority: 'high',
    dueDate: '2025-06-22T10:00:00',
    status: 'pending'
  },
  // Overdue tasks
  {
    id: 16,
    title: 'HTML Forms Practice',
    description: 'Create a signup form with validation',
    subject: 'HTML',
    priority: 'medium',
    dueDate: '2025-06-14T09:00:00',
    status: 'pending'
  },
  {
    id: 17,
    title: 'Command Line Basics',
    description: 'Learn 10 essential terminal commands',
    subject: 'CLI',
    priority: 'low',
    dueDate: '2025-06-13T14:00:00',
    status: 'pending'
  },
  // Completed tasks
  {
    id: 18,
    title: 'Git Basics',
    description: 'Learned commit, push, pull workflow',
    subject: 'Git',
    priority: 'medium',
    dueDate: '2025-06-10T12:00:00',
    status: 'completed'
  },
  {
    id: 19,
    title: 'CSS Grid Layout',
    description: 'Completed CSS Grid garden tutorial',
    subject: 'CSS',
    priority: 'low',
    dueDate: '2025-06-11T15:00:00',
    status: 'completed'
  },
  // Tasks for today
  {
    id: 20,
    title: 'React Native Setup',
    description: 'Install and configure development environment',
    subject: 'React Native',
    priority: 'high',
    dueDate: '2025-07-17T15:00:00',
    status: 'pending'
  }
];

const getCurrentDate = () => {
  return moment().format('YYYY-MM-DD');
};

const getMonthName = (monthIndex) => {
  return moment().month(monthIndex).format('MMMM');
};

const TaskListScreen = () => {
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const calendarRef = useRef(null);
  const rotation = useRef(new Animated.Value(0)).current;
  const [currentMonth, setCurrentMonth] = useState(getMonthName(moment().month()));
  const [currentYear, setCurrentYear] = useState(moment().year());
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    status: [],
    priority: [],
    sortBy: 'dueDate',
    sortOrder: 'asc'
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#FF3B30';
      case 'medium': return '#FF9500';
      default: return '#34C759';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#34C759';
      case 'in-progress': return '#007AFF';
      default: return '#FF9500';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      default: return 'Pending';
    }
  };

  const filteredTasks = useMemo(() => {
    let result = [...dummyTasks];

    // Apply filters
    if (activeFilters.status.length > 0) {
      result = result.filter(task => activeFilters.status.includes(task.status));
    }

    if (activeFilters.priority.length > 0) {
      result = result.filter(task => activeFilters.priority.includes(task.priority));
    }

    if (searchQuery) {
      result = result.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return result;
  }, [activeFilters.status, activeFilters.priority, searchQuery]);

  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      if (activeFilters.sortBy === 'dueDate') {
        const dateA = new Date(a.dueDate);
        const dateB = new Date(b.dueDate);
        return activeFilters.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return activeFilters.sortOrder === 'asc' ?
          priorityOrder[a.priority] - priorityOrder[b.priority] :
          priorityOrder[b.priority] - priorityOrder[a.priority];
      }
    });
  }, [filteredTasks, activeFilters.sortBy, activeFilters.sortOrder]);

  const { groupedTasks, markedDates } = useMemo(() => {
    const grouped = {};
    const marks = {};

    sortedTasks.forEach(task => {
      const date = moment(task.dueDate).format('YYYY-MM-DD');

      if (!grouped[date]) {
        grouped[date] = [];
      }

      grouped[date].push({
        ...task,
        height: 120
      });

      marks[date] = {
        marked: true,
        dotColor: getPriorityColor(task.priority)
      };
    });

    // Process visible months for empty dates
    const visibleMonths = [
      moment().subtract(1, 'month'),
      moment(),
      moment().add(1, 'month')
    ];

    visibleMonths.forEach(month => {
      const monthStart = month.clone().startOf('month');
      const monthEnd = month.clone().endOf('month');

      let day = monthStart.clone();
      while (day <= monthEnd) {
        const dateStr = day.format('YYYY-MM-DD');
        if (!marks[dateStr]) {
          marks[dateStr] = { marked: false };
        }
        day.add(1, 'day');
      }
    });

    // Highlight TODAY's date
    const today = getCurrentDate();
    marks[today] = {
      ...marks[today],
      today: true,
      todayTextColor: '#FF0000'
    };

    // Highlight SELECTED date
    marks[selectedDate] = {
      ...marks[selectedDate],
      selected: true,
      selectedColor: '#05B8AD'
    };

    return { groupedTasks: grouped, markedDates: marks };
  }, [selectedDate, activeFilters, searchQuery]);

  const toggleFilter = useCallback((type, value) => {
    setActiveFilters(prev => {
      const currentValues = [...prev[type]];
      const index = currentValues.indexOf(value);

      if (index === -1) {
        currentValues.push(value);
      } else {
        currentValues.splice(index, 1);
      }

      return {
        ...prev,
        [type]: currentValues
      };
    });
  }, []);

  const toggleSortOrder = useCallback((sortBy) => {
    setActiveFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy ?
        (prev.sortOrder === 'asc' ? 'desc' : 'asc') :
        'asc'
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setActiveFilters({
      status: [],
      priority: [],
      sortBy: 'dueDate',
      sortOrder: 'asc'
    });
  }, []);

  const SearchWithFilter = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchRow}>
        <Searchbar
          placeholder="Search tasks..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchBar, { flex: 1 }]}
          inputStyle={styles.textMedium}
          iconColor="#05B8AD"
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <MaterialIcons
            name="filter-list"
            size={24}
            color="#05B8AD"
          />
          {(activeFilters.status.length > 0 || activeFilters.priority.length > 0) && (
            <View style={styles.filterIndicator} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const onMonthChange = useCallback((month) => {
    const monthIndex = parseInt(month.month, 10) - 1;
    setCurrentMonth(getMonthName(monthIndex));
    if (month.year) {
      setCurrentYear(parseInt(month.year, 10));
    }
  }, []);

  const renderTaskItem = useCallback(({ item, index }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      activeOpacity={0.7}
      onPress={() => navigation.navigate("TaskDetail", { index: index })}
    >
      <Card style={[styles.card, styles.taskCard]}>
        <Card.Content>
          <View style={[styles.flexRowBetween, styles.taskHeader]}>
            <Text style={[styles.textLarge, styles.taskTitle]}>{item.title}</Text>
            <Chip
              style={[
                styles.priorityChip,
                { backgroundColor: getPriorityColor(item.priority) }
              ]}
              textStyle={styles.chipText}
            >
              {item.priority}
            </Chip>
          </View>

          <Text style={[styles.textMedium, styles.taskDescription]} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={[styles.flexRow, styles.taskMeta]}>
            <Chip
              icon="book"
              style={[
                styles.subjectChip,
                {
                  backgroundColor: '#5856D620',
                  borderColor: '#5856D6',
                  borderWidth: 1.5
                }
              ]}
              textStyle={{
                color: '#5856D6',
                fontSize: moderateScale(12),
                fontFamily: 'Manrope-Medium',
              }}
            >
              {item.subject}
            </Chip>

            <Chip
              icon={() => {
                let iconName;
                switch (item.status) {
                  case 'completed': iconName = "check-circle"; break;
                  case 'in-progress': iconName = "hourglass-top"; break;
                  default: iconName = "schedule";
                }
                return <MaterialIcons name={iconName} size={16} color="#FFFFFF" />;
              }}
              style={[
                styles.statusChip,
                { backgroundColor: getStatusColor(item.status) }
              ]}
              textStyle={[styles.chipText, { color: '#FFFFFF' }]}
            >
              {getStatusLabel(item.status)}
            </Chip>

            <View style={styles.dueDateContainer}>
              <Text style={styles.dueDateLabel}>Due Date:</Text>
              <Chip
                icon={() => <MaterialIcons name="access-time" size={16} color="#FFFFFF" />}
                style={[
                  styles.dueDateChip,
                  {
                    backgroundColor: new Date(item.dueDate) < new Date() && item.status !== 'completed'
                      ? '#FF3B30'
                      : '#4CAF50'
                  }
                ]}
                textStyle={styles.dueDateText}
              >
                {moment(item.dueDate).format('MMM D, h:mm A')}
              </Chip>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  ), []);

  const renderCalendarHeader = useCallback((date) => {
    return (
      <View style={styles.calendarHeader}>
        <Text style={styles.calendarHeaderText}>
          {currentMonth} {currentYear}
        </Text>
      </View>
    );
  }, [currentMonth, currentYear]);

  return (
    <SafeAreaView style={styles.container}>
      <SearchWithFilter />
      <FilterModal
        showFilters={showFilters}
        activeFilters={activeFilters}
        toggleFilter={toggleFilter}
        toggleSortOrder={toggleSortOrder}
        clearFilters={clearFilters}
        setShowFilters={setShowFilters}
        getStatusLabel={getStatusLabel}
      />

      <CalendarProvider
        date={selectedDate}
        onDateChanged={setSelectedDate}
        onMonthChange={onMonthChange}
        showTodayButton
        theme={{ todayButtonTextColor: '#05B8AD' }}
      >
        <ExpandableCalendar
          ref={calendarRef}
          renderHeader={renderCalendarHeader}
          allowShadow={true}
          animateScroll={{
            duration: 300,
            easing: Easing.inOut(Easing.ease)
          }}
          theme={{
            calendarBackground: '#FFFFFF',
            selectedDayBackgroundColor: '#05B8AD',
            selectedDayTextColor: '#FFFFFF',
            todayTextColor: '#FF0000',
            dayTextColor: '#000000',
            textDisabledColor: '#8E8E93',
            dotColor: '#05B8AD',
            arrowColor: '#05B8AD',
            textSectionTitleColor: '#8F9BB3',
            monthTextColor: '#000000',
            textMonthfontFamily: 'Manrope-Bold',
            textMonthFontSize: moderateScale(16),
            textDayHeaderFontSize: moderateScale(14),
            textDayFontSize: moderateScale(16),
            'stylesheet.calendar.header': {
              week: {
                marginTop: 0,
                marginBottom: 0,
                flexDirection: 'row',
                justifyContent: 'space-around',
                paddingHorizontal: 0,
                marginHorizontal: 0,
              },
              dayHeader: {
                marginTop: 0,
                marginBottom: 0,
                width: wp('10%'),
                textAlign: 'center',
                fontSize: moderateScale(14),
                color: '#8F9BB3',
                fontWeight: '500',
              },
            },
            'stylesheet.calendar.main': {
              week: {
                marginTop: 0,
                marginBottom: 0,
                flexDirection: 'row',
                justifyContent: 'space-around',
              },
              dayContainer: {
                flex: 1,
                alignItems: 'center',
                margin: 0,
                paddingVertical: hp("0.8%")
              },
              dayText: {
                fontSize: moderateScale(14),
                textAlign: 'center',
              },
            },
          }}
          markedDates={markedDates}
          firstDay={1}
          style={styles.calendar}
          hideArrows={false}
          disablePan={false}
          hideExtraDays={false}
        />

        <AgendaList
          sections={Object.keys(groupedTasks).map(date => ({
            title: date,
            data: groupedTasks[date]
          }))}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={5}
          updateCellsBatchingPeriod={50}
          renderItem={renderTaskItem}
          sectionStyle={styles.section}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                setTimeout(() => setRefreshing(false), 1000);
              }}
              colors={['#05B8AD']}
            />
          }
          keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
        />
      </CalendarProvider>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
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
  textLarge: {
    fontSize: moderateScale(18),
    fontWeight: '500'
  },
  textMedium: {
    fontSize: moderateScale(16),
  },
  card: {
    margin: 8,
    elevation: 2,
    backgroundColor: '#FFFFFF'
  },
  calendar: {
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    backgroundColor: '#FFFFFF',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp('4%'),
    backgroundColor: '#FFFFFF'
  },
  calendarHeaderText: {
    fontSize: hp('2%'),
    fontFamily: 'Manrope-Bold',
    color: '#05B8AD',
    marginRight: wp('2%')
  },
  searchContainer: {
    padding: wp('4%'),
    backgroundColor: '#FFFFFF'
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2%'),
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#F2F2F7',
    borderRadius: wp('2%'),
  },
  filterButton: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterIndicator: {
    position: 'absolute',
    top: wp('2%'),
    right: wp('2%'),
    width: wp('2.5%'),
    height: wp('2.5%'),
    borderRadius: wp('1.25%'),
    backgroundColor: '#FF3B30',
  },
  section: {
    backgroundColor: '#F2F2F7',
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('4%')
  },
  itemContainer: {
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1%')
  },
  taskCard: {
    borderRadius: wp('3%'),
    elevation: 2,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 4,
    borderLeftColor: '#05B8AD',
    marginVertical: hp('0.5%')
  },
  taskTitle: {
    fontFamily: 'Manrope-Bold',
    color: '#000000',
    flex: 1,
  },
  taskDescription: {
    color: '#8E8E93',
    marginVertical: hp('0.5%'),
  },
  taskMeta: {
    marginTop: hp('1%'),
    flexWrap: 'wrap',
    rowGap: hp('0.8%'),
    columnGap: wp('2%'),
  },
  priorityChip: {
    backgroundColor: '#05B8AD',
  },
  subjectChip: {
    color: '#ffffff',
    borderColor: '#ffffff'
  },
  statusChip: {
    borderRadius: 16,
    height: hp("4%"),
    marginRight: 8,
  },
  dueDateChip: {
    borderRadius: 16,
    height: hp("4%"),
    backgroundColor: '#8E8E93',
  },
  chipText: {
    fontSize: moderateScale(12),
    fontWeight: '500',
    color: '#FFFFFF',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  dueDateLabel: {
    fontSize: 14,
    color: '#616161',
    marginRight: 8,
    fontWeight: '500',
  },
  dueDateText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 4,
    marginRight: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: wp('5%'),
    borderTopRightRadius: wp('5%'),
    maxHeight: hp('70%'),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp('5%'),
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontFamily: 'Manrope-Bold',
    color: '#000000',
  },
  modalContent: {
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('2%'),
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: wp('5%'),
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  clearButton: {
    flex: 1,
    marginRight: wp('2%'),
    borderColor: '#05B8AD',
  },
  clearButtonText: {
    color: '#05B8AD',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#05B8AD',
  },
  applyButtonText: {
    color: '#FFFFFF',
  },
  filterSection: {
    marginBottom: hp('3%'),
  },
  filterSectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '500',
    color: '#000000',
    marginBottom: hp('1%'),
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp('2%'),
  },
  filterOption: {
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('4%'),
    borderRadius: wp('10%'),
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  filterOptionActive: {
    backgroundColor: '#05B8AD20',
    borderColor: '#05B8AD',
  },
  filterOptionText: {
    fontSize: moderateScale(14),
    color: '#000000',
  },
  filterOptionTextActive: {
    color: '#05B8AD',
    fontWeight: '500',
  },
  sortOptions: {
    flexDirection: 'row',
    gap: wp('4%'),
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('4%'),
    borderRadius: wp('10%'),
    backgroundColor: '#F2F2F7',
  },
  sortOptionText: {
    fontSize: moderateScale(14),
    color: '#8E8E93',
    marginLeft: wp('2%'),
  },
  sortOptionActive: {
    color: '#05B8AD',
    fontWeight: '500',
  }
});

export default TaskListScreen;