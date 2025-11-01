import moment from 'moment';

// Mock database (replace with actual API calls in production)
let mockAttendanceData = [
  {
    id: '1',
    courseName: 'HTML',
    date: moment().subtract(1, 'days').set({ hour: 9, minute: 0 }).toISOString(),
    status: 'present'
  },
  {
    id: '2',
    courseName: 'CSS',
    date: moment().subtract(1, 'days').set({ hour: 11, minute: 30 }).toISOString(),
    status: 'absent'
  },
  // Add more mock data as needed
];

// Simulate network delay
const simulateNetworkDelay = async () => {
  return new Promise(resolve => setTimeout(resolve, 500));
};

export const attendanceService = {
  // Get all attendance records
  async getAttendanceRecords(userId) {
    await simulateNetworkDelay();
    return [...mockAttendanceData];
  },

  // Check in user
  async checkIn(userId, courseName = 'General Attendance') {
    await simulateNetworkDelay();
    const newRecord = {
      id: Date.now().toString(),
      courseName,
      date: moment().toISOString(),
      status: 'present'
    };
    mockAttendanceData.push(newRecord);
    return newRecord;
  },

  // Check out user
  async checkOut(userId) {
    await simulateNetworkDelay();
    // In a real app, you might update the last record instead
    return { success: true, timestamp: moment().toISOString() };
  },

  // Get today's attendance status
  async getTodayStatus(userId) {
    await simulateNetworkDelay();
    const today = moment().format('YYYY-MM-DD');
    const todayRecord = mockAttendanceData.find(record => 
      moment(record.date).format('YYYY-MM-DD') === today
    );
    
    return todayRecord || null;
  },

  // Get attendance statistics
  async getAttendanceStats(userId) {
    await simulateNetworkDelay();
    const records = [...mockAttendanceData];
    const totalDays = records.length;
    const presentDays = records.filter(r => r.status === 'present').length;
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    // Current month stats
    const currentMonthRecords = records.filter(r =>
      moment(r.date).month() === moment().month() &&
      moment(r.date).year() === moment().year()
    );
    const currentMonthPresent = currentMonthRecords.filter(r => r.status === 'present').length;
    const currentMonthPercentage = currentMonthRecords.length > 0
      ? Math.round((currentMonthPresent / currentMonthRecords.length) * 100)
      : 0;

    return {
      totalDays,
      presentDays,
      attendancePercentage,
      currentMonthPercentage,
      currentStreak: this.calculateCurrentStreak(records),
    };
  },

  // Calculate current streak
  calculateCurrentStreak(records) {
    let streak = 0;
    const today = moment().startOf('day');
    let currentDay = today.clone();

    // Sort records by date descending
    const sortedRecords = [...records].sort((a, b) =>
      moment(b.date).diff(moment(a.date))
    );

    for (const record of sortedRecords) {
      const recordDay = moment(record.date).startOf('day');
      if (recordDay.isSame(currentDay)) {
        if (record.status === 'present') {
          streak++;
          currentDay.subtract(1, 'day');
        } else {
          break;
        }
      } else if (recordDay.isBefore(currentDay)) {
        break;
      }
    }

    return streak;
  },

  // Get marked dates for calendar
  async getMarkedDates(userId) {
    await simulateNetworkDelay();
    const dates = {};
    mockAttendanceData.forEach(record => {
      const dateStr = moment(record.date).format('YYYY-MM-DD');
      dates[dateStr] = {
        marked: true,
        dotColor: record.status === 'present' ? '#2ecc71' : '#e74c3c',
      };
    });

    // Mark today if no record exists
    const today = moment().format('YYYY-MM-DD');
    if (!dates[today]) {
      dates[today] = {
        marked: true,
        dotColor: '#95a5a6',
      };
    }

    return dates;
  }
};


