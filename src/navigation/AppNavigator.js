// AppTabs.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer, useNavigation } from '@react-navigation/native';

// Import your screens
import DashboardScreen from '../Dashboard/Dashboard';
import ClassesListScreen from '../screens/Class/ClassesListScreen';
import AttendanceScreen from '../screens/Attendance/AttendanceScreen';
import TaskListScreen from '../screens/Tasks/TaskListScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import SubmitAssignmentScreen from '../screens/Feedback/Feedback';
import TaskDetailsScreen from '../screens/Tasks/TaskDetailScreen';
import AttendanceDetailScreen from '../Dashboard/AttendanceDetailScreen';
import CourseListScreen from '../screens/Course/CourseListScreen';
import CourseDetailScreen from '../screens/Course/CourseDetailScreen';
import Assessment from '../screens/Assessment.js/Assessment';
import NotificationScreen from '../Dashboard/NotificationScreen';
import CustomTabBar from '../components/CustomTabBar/CustomTabBar';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomDrawerContent from '../components/CustomDrawer/CustomDrawerContent';
import { RecordingScreen } from '../screens/Record/Recordings';
import TrainerDetails from '../screens/TrainerDetails/TrainerDetails';
import PaymentProgress from '../screens/PaymentProgress/PaymentProgress';
import ChatScreen from '../screens/Chat/ChatScreen';
import UsersListScreen from '../screens/Chat/UsersListScreen';
import TrainerList from '../screens/Chat/TrainerList';
import ScheduleClassScreen from '../screens/ScheduleClass/ScheduleClassScreen';
import { Platform, TouchableOpacity } from 'react-native';
import { hp, moderateScale, wp } from '../utils/responsive';
import { useAppTheme } from '../hook/useAppTheme';
import { useSelector } from 'react-redux';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

export const navigationRef = React.createRef();

const getHeaderOptions = (navigation, title, showBackButton = false, themeColors) => ({
  headerShown: true,
  title: title,
  headerTitleAlign: 'center',
  headerLeft: () => {
    if (showBackButton) {
      return (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            marginHorizontal: wp("5%"),
            padding: Platform.OS ? moderateScale(1) : moderateScale(5),
            borderWidth: 1,
            borderColor: themeColors?.lightGray,
            borderRadius: 50,
            backgroundColor: themeColors?.background
          }}
        >
          <Icon name="arrow-left" size={24} color={themeColors?.textPrimary} />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        onPress={() => navigation.toggleDrawer()}
        style={{
          marginHorizontal: Platform.OS ? wp("2%") : wp("5%"),
          padding: Platform.OS ? moderateScale(3) : moderateScale(5),
          borderWidth: Platform.OS ? 0 : 1,
          borderColor: themeColors.lightGray,
          borderRadius: 50,
          backgroundColor: themeColors.background
        }}
      >
        <Icon name="menu" size={24} color={themeColors.textPrimary} />
      </TouchableOpacity>
    );
  },
  headerStyle: {
    backgroundColor: themeColors?.background,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitleContainerStyle: {
    padding: 0,
    margin: 0,
  },
  headerLeftContainerStyle: {
    padding: 0,
    margin: 0,
    marginLeft: 0,
  },
  headerRightContainerStyle: {
    padding: 0,
    margin: 0,
    marginRight: 0,
  },
  headerTintColor: themeColors?.textPrimary,
  headerTitleStyle: {
    fontSize: moderateScale(20),
    fontFamily: 'Manrope-Bold',
    color: themeColors?.textPrimary
  }
});

const MainDrawerNavigator = () => {
  const { colors: themeColors } = useAppTheme();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerPosition: 'left',
        drawerType: 'front',
        overlayColor: 'transparent',
        headerShown: false,
        backgroundColor: 'transparent',
        drawerStyle: {
          width: '80%',
          backgroundColor: themeColors.background,
        },
        swipeEnabled: false,
      }}
    >
      <Drawer.Screen
        name="MainTabs"
        component={AppTabs}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="home" color={color} size={size} />
          ),
          drawerLabel: "Home"
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={({ navigation }) => getHeaderOptions(navigation, 'Profile', true, themeColors)}
      />
      <Drawer.Screen
        name="Recording"
        component={RecordingScreen}
        options={({ navigation }) => getHeaderOptions(navigation, 'Recordings', true, themeColors)}
      />
      <Drawer.Screen
        name="TrainerDetails"
        component={TrainerDetails}
        options={({ navigation }) => getHeaderOptions(navigation, 'Trainer Details', true, themeColors)}
      />
      <Drawer.Screen
        name="PaymentProgress"
        component={PaymentProgress}
        options={({ navigation }) => getHeaderOptions(navigation, 'Payment Progress', true, themeColors)}
      />
      <Drawer.Screen
        name="AttendanceDetailScreen"
        component={AttendanceDetailScreen}
        options={({ navigation }) => getHeaderOptions(navigation, 'Attendance Details', true, themeColors)}
      />
    </Drawer.Navigator>
  );
};

// Class Stack for Students
const ClassStack = () => {
  const { colors: themeColors } = useAppTheme();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="ClassesList"
        component={ClassesListScreen}
        options={({ navigation }) => getHeaderOptions(navigation, 'Scheduled Classes', false, themeColors)}
      />
      <Stack.Screen
        name="SubmitAssignment"
        component={SubmitAssignmentScreen}
        options={({ navigation }) => getHeaderOptions(navigation, 'Submit Feedback', true, themeColors)}
      />
    </Stack.Navigator>
  );
}

// Schedule Stack for Tutors
const ScheduleStack = () => {
  const { colors: themeColors } = useAppTheme();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="ScheduleClass"
        component={ScheduleClassScreen}
        options={({ navigation }) => getHeaderOptions(navigation, 'Schedule Class', false, themeColors)}
      />
      {/* You can add more schedule-related screens here if needed */}
    </Stack.Navigator>
  );
}

// Course Stack
const CourseStack = () => {
  const { colors: themeColors } = useAppTheme();

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="CourseListScreen"
    >
      <Stack.Screen
        name="CourseListScreen"
        component={CourseListScreen}
        options={({ navigation }) => getHeaderOptions(navigation, 'My Courses', false, themeColors)}
      />
      <Stack.Screen
        name="CourseDetailScreen"
        component={CourseDetailScreen}
        options={{
          ...getHeaderOptions(null, 'Course Details', true, themeColors),
          headerShown: false
        }}
      />
      <Stack.Screen
        name="Tasks"
        component={TaskListScreen}
        options={({ navigation }) => getHeaderOptions(navigation, 'Tasks', true, themeColors)}
      />
      <Stack.Screen
        name="TaskDetail"
        component={TaskDetailsScreen}
        options={({ navigation }) => getHeaderOptions(navigation, 'Task', true, themeColors)}
      />
      <Stack.Screen
        name="Assessment"
        component={Assessment}
        options={({ navigation }) => getHeaderOptions(navigation, 'Assessment', true, themeColors)}
      />
    </Stack.Navigator>
  );
}

// Dashboard Stack
const DashboardStack = () => {
  const { colors: themeColors } = useAppTheme();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Dashboards"
        component={DashboardScreen}
      />
      <Stack.Screen
        name="Notification"
        component={NotificationScreen}
        options={({ navigation }) => getHeaderOptions(navigation, 'Notifications', true, themeColors)}
      />
    </Stack.Navigator>
  );
}

// Attendance Stack
const AttendanceStack = () => {
  const { colors: themeColors } = useAppTheme();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={({ navigation }) => getHeaderOptions(navigation, 'Attendance', false, themeColors)}
      />
    </Stack.Navigator>
  );
}

// Chat Stack
const ChatStack = () => {
  const { colors: themeColors } = useAppTheme();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="UsersList"
        component={UsersListScreen}
        options={({ navigation }) => getHeaderOptions(navigation, 'Messages', false, themeColors)}
      />
      <Stack.Screen
        name="ChatScreen"
        component={ChatScreen}
      />
      <Stack.Screen
        name="TrainerList"
        component={TrainerList}
        options={({ navigation }) => getHeaderOptions(navigation, 'Trainers', true, themeColors)}
      />
    </Stack.Navigator>
  );
}

// Main App Tabs
const AppTabs = () => {
  const { colors: themeColors } = useAppTheme();
  const { settings, user } = useSelector(state => state.auth);
  const showAttendanceTab = settings?.data?.attendance_options !== 'automatic_attendance';
  if (!user) {
    return null; // or a loading screen
  }
  const isTutor = user?.user_type === "tutor";
  const isStudent = user?.user_type === "student";

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} theme={themeColors} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: themeColors.surface,
          borderTopColor: themeColors.lightGray,
        }
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="view-dashboard" color={color} size={size} />
          )
        }}
      />

      {user && (
        <>
          {isTutor ? (
            <Tab.Screen
              name="Schedule"
              component={ScheduleStack}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <Icon name="calendar-plus" color={color} size={size} />
                ),
                tabBarLabel: 'Schedule'
              }}
            />
          ) : (
            <Tab.Screen
              name="Classes"
              component={ClassStack}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <Icon name="book" color={color} size={size} />
                ),
                tabBarLabel: 'Classes'
              }}
            />
          )}
        </>
      )}

      {showAttendanceTab && (
        <Tab.Screen
          name="Attendance"
          component={AttendanceStack}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name="calendar-check" color={color} size={size} />
            )
          }}
        />
      )}

      <Tab.Screen
        name="Course"
        component={CourseStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="school" color={color} size={size} />
          )
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="message-text" color={color} size={size} />
          )
        }}
      />
    </Tab.Navigator>
  );
};

export default MainDrawerNavigator;