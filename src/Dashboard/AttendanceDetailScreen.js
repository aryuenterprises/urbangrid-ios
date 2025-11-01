import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, FlatList, RefreshControl, Modal, TextInput } from 'react-native';
import { colors, globalstyles } from '../utils/globalStyles';
import { hp, moderateScale, wp } from '../utils/responsive';
import { SafeAreaView } from 'react-native-safe-area-context';
import moment from 'moment';
import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../services/api';
import ReactNativeBlobUtil from 'react-native-blob-util';
import XLSX from 'xlsx';
import DateTimePicker from '@react-native-community/datetimepicker';
import { generatePDF } from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import LottieView from 'lottie-react-native';
import Toast from 'react-native-toast-message';
import capitalizeFirstLetter from '../utils/capitalizeFirstLetter';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from 'react-native-paper';
import { useAppTheme } from '../hook/useAppTheme';
import { useScrollDetection } from '../hook/useScrollDetection';
import { useFooterVisibility } from '../hook/useFooterVisibility';
// Attendance Detail Skeleton Component
const AttendanceDetailSkeleton = () => {
  const { colors: themeColors } = useAppTheme();
  return (
    <SkeletonPlaceholder
      borderRadius={4}
      backgroundColor={themeColors.skeletonBg}
      highlightColor={themeColors.skeletonHighlight}
    >
      <View style={styles.skeletonContainer}>
        {/* Filters Section Skeleton */}
        <SkeletonPlaceholder.Item style={styles.skeletonFiltersContainer}>
          <SkeletonPlaceholder.Item
            width="100%"
            height={hp('5%')}
            borderRadius={moderateScale(8)}
            marginBottom={hp('2%')}
            backgroundColor={themeColors.skeletonBg}
          />

          <SkeletonPlaceholder.Item
            flexDirection="row"
            justifyContent="space-between"
            marginBottom={hp('2%')}
          >
            <SkeletonPlaceholder.Item
              width={wp('25%')}
              height={hp('4%')}
              borderRadius={moderateScale(8)}
              backgroundColor={themeColors.skeletonBg}
            />
            <SkeletonPlaceholder.Item
              width={wp('10%')}
              height={hp('2%')}
              alignSelf='center'
              borderRadius={moderateScale(4)}
              backgroundColor={themeColors.skeletonBg}
            />
            <SkeletonPlaceholder.Item
              width={wp('25%')}
              height={hp('4%')}
              borderRadius={moderateScale(8)}
              backgroundColor={themeColors.skeletonBg}
            />
            <SkeletonPlaceholder.Item
              width={wp('15%')}
              height={hp('4%')}
              borderRadius={moderateScale(8)}
              backgroundColor={themeColors.skeletonBg}
            />
          </SkeletonPlaceholder.Item>

          <SkeletonPlaceholder.Item
            width="100%"
            height={hp('5%')}
            borderRadius={moderateScale(8)}
            backgroundColor={themeColors.skeletonBg}
          />
        </SkeletonPlaceholder.Item>

        {/* Results Info Skeleton */}
        <SkeletonPlaceholder.Item style={styles.skeletonResultsInfo}>
          <SkeletonPlaceholder.Item
            width={wp('40%')}
            height={hp('2%')}
            borderRadius={moderateScale(4)}
            backgroundColor={themeColors.skeletonBg}
          />
          <SkeletonPlaceholder.Item
            width={wp('30%')}
            height={hp('1.5%')}
            borderRadius={moderateScale(4)}
            marginTop={hp('1%')}
            backgroundColor={themeColors.skeletonBg}
          />
        </SkeletonPlaceholder.Item>

        {/* Attendance Records Skeleton */}
        {[1, 2, 3, 4, 5, 6].map((_, index) => (
          <SkeletonPlaceholder.Item
            key={index}
            style={[
              styles.skeletonRecordItem,
              index === 0 && styles.skeletonFirstRecordItem,
              index === 5 && styles.skeletonLastRecordItem
            ]}
          >
            <SkeletonPlaceholder.Item flex={1}>
              <SkeletonPlaceholder.Item
                width={wp('50%')}
                height={hp('2%')}
                borderRadius={moderateScale(4)}
                marginBottom={hp('1%')}
                backgroundColor={themeColors.skeletonBg}
              />
              <SkeletonPlaceholder.Item
                width={wp('30%')}
                height={hp('1.5%')}
                borderRadius={moderateScale(4)}
                marginBottom={hp('1%')}
                backgroundColor={themeColors.skeletonBg}
              />
            </SkeletonPlaceholder.Item>
            <SkeletonPlaceholder.Item alignItems="flex-end">
              <SkeletonPlaceholder.Item
                width={wp('20%')}
                height={hp('2%')}
                borderRadius={moderateScale(4)}
                marginBottom={hp('0.5%')}
                backgroundColor={themeColors.skeletonBg}
              />
              <SkeletonPlaceholder.Item
                width={wp('40%')}
                height={hp('1.5%')}
                borderRadius={moderateScale(4)}
                backgroundColor={themeColors.skeletonBg}
              />
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder.Item>
        ))}
      </View>
    </SkeletonPlaceholder>
  );
};

// Download Options Bottom Sheet
const DownloadOptionsBottomSheet = ({ bottomSheetRef, sessionCount, onExcel, onPDF }) => {
  const { colors: themeColors } = useAppTheme();

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={['40%']}
      enablePanDownToClose={true}
      backgroundStyle={[styles.bottomSheetBackground, { backgroundColor: themeColors.card }]}
      handleStyle={{ backgroundColor: themeColors.surface }}
    >
      <BottomSheetView style={[styles.bottomSheetContent, { backgroundColor: themeColors.surface }]}>
        <Text style={[styles.bottomSheetTitle, { color: themeColors.textPrimary }]}>Download Report</Text>
        <Text style={[styles.bottomSheetSubtitle, { color: themeColors.textSecondary }]}>
          Choose format for {sessionCount} records:
        </Text>

        <TouchableOpacity
          style={[styles.bottomSheetButton, { backgroundColor: themeColors.primary }]}
          onPress={onExcel}
        >
          <Text style={[styles.bottomSheetButtonText, { color: themeColors.white }]}>Excel Report</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomSheetButton, { backgroundColor: themeColors.primary }]}
          onPress={onPDF}
        >
          <Text style={[styles.bottomSheetButtonText, { color: themeColors.white }]}>PDF Report</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomSheetButton, styles.bottomSheetCancelButton, { borderColor: themeColors.lightGray }]}
          onPress={() => bottomSheetRef.current?.close()}
        >
          <Text style={[styles.bottomSheetCancelText]}>Cancel</Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheet>
  );
};

// Download Success Bottom Sheet
const DownloadSuccessBottomSheet = ({
  bottomSheetRef,
  fileType,
  fileName,
  filePath,
  onOpenFile,
  onShare,
  onClose
}) => {
  const { colors: themeColors } = useAppTheme();

  const getFileIcon = () => {
    switch (fileType) {
      case 'pdf': return '📄';
      case 'excel': return '📊';
      default: return '📁';
    }
  };

  const getFileTypeText = () => {
    switch (fileType) {
      case 'pdf': return 'PDF Report';
      case 'excel': return 'Excel Report';
      default: return 'File';
    }
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={['50%']}
      enablePanDownToClose={true}
      backgroundStyle={[styles.bottomSheetBackground, { backgroundColor: themeColors.card }]}
      handleStyle={{ backgroundColor: themeColors.surface }}
    >
      <BottomSheetView style={[styles.bottomSheetContent, { backgroundColor: themeColors.surface }]}>
        <View style={styles.successHeader}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={[styles.successTitle, { color: themeColors.textPrimary }]}>Download Complete!</Text>
          <Text style={[styles.successSubtitle, { color: themeColors.textSecondary }]}>
            Your {getFileTypeText()} has been saved successfully.
          </Text>
        </View>

        <View style={[styles.fileInfoContainer, { backgroundColor: themeColors.card, borderColor: themeColors.lightGray }]}>
          <Text style={styles.fileIcon}>{getFileIcon()}</Text>
          <View style={styles.fileDetails}>
            <Text style={[styles.fileName, { color: themeColors.textPrimary }]} numberOfLines={1}>{fileName}</Text>
            <Text style={[styles.fileType, { color: themeColors.textSecondary }]}>{getFileTypeText()}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.bottomSheetButton, styles.openFileButton, { backgroundColor: themeColors.primary }]}
          onPress={onOpenFile}
        >
          <Text style={[styles.bottomSheetButtonText, { color: themeColors.white }]}>Open File</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomSheetButton, styles.bottomSheetCancelButton, { borderColor: themeColors.lightGray }]}
          onPress={onClose}
        >
          <Text style={[styles.bottomSheetCancelText, { color: themeColors.textPrimary }]}>Close</Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheet>
  );
};

const AttendanceDetailScreen = ({ route }) => {
  const { month, attendancePercentage, presentDays, totalDays, currentMonthPercentage } = route.params || {};
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { handleScroll, createAnimatedScrollView } = useScrollDetection();
  const AnimatedFlatList = createAnimatedScrollView(FlatList);
  const [fromDate, setFromDate] = useState(null); // Start with null to show all data
  const [toDate, setToDate] = useState(null); // Start with null to show all data
  const [loading, setLoading] = useState(true);
  const [fromDateObj, setFromDateObj] = useState(null);
  const [toDateObj, setToDateObj] = useState(null);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [stats, setStats] = useState({
    totalDays: totalDays || 0,
    presentDays: presentDays || 0,
    attendancePercentage: attendancePercentage || 0,
    currentMonthPercentage: currentMonthPercentage || 0,
  });
  const [dateFilterApplied, setDateFilterApplied] = useState(false); // Track if date filter is active
  const downloadOptionsBottomSheetRef = useRef(null);
  const downloadSuccessBottomSheetRef = useRef(null);
  const { user, token } = useSelector((state) => state.auth);
  const [showModal, setShowModal] = useState(false);
  const [downloadResult, setDownloadResult] = useState({
    fileType: '',
    fileName: '',
    filePath: ''
  });
  const { colors: themeColors } = useAppTheme();
  useFooterVisibility()

  useEffect(() => {
    fetchAttendanceData();

    // Cleanup function - runs when component unmounts
    return () => {
      downloadOptionsBottomSheetRef.current?.close();
      downloadSuccessBottomSheetRef.current?.close();
    };
  }, []);

  useEffect(() => {
    filterSessions();
  }, [sessions, searchQuery, fromDate, toDate]);

  const onRefresh = useCallback(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      setRefreshing(true);
      setLoading(true);
      const response = await api.get(`/api/attendance/${user.student_id}/full_logs`);
      const allLogs = response.data.data || [];
      setSessions(allLogs);
      calculateStats(allLogs);
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch attendance data'
      });
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const calculateStats = (logs) => {
    if (!logs || logs.length === 0) {
      setStats({
        totalDays: 0,
        presentDays: 0,
        attendancePercentage: 0,
        currentMonthPercentage: 0,
      });
      return;
    }

    const presentCount = logs.filter(log => log.status?.toLowerCase() === 'present').length;
    const totalCount = logs.length;
    const percentage = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : 0;

    setStats({
      totalDays: totalCount,
      presentDays: presentCount,
      attendancePercentage: percentage,
      currentMonthPercentage: percentage,
    });
  };

  const filterSessions = () => {
    let filtered = [...sessions];

    if (fromDate && toDate) {
      filtered = filtered.filter(session => {
        const sessionDate = moment(session.date).format('YYYY-MM-DD');
        return sessionDate >= fromDate && sessionDate <= toDate;
      });
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(session =>
        session.course_name?.toLowerCase().includes(query) ||
        session.title?.toLowerCase().includes(query) ||
        session.status?.toLowerCase().includes(query) ||
        moment(session.date).format('MMM D, YYYY HH:mm:ss').toLowerCase().includes(query)
      );
    }

    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    setFilteredSessions(filtered);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'present': return colors.present;
      case 'leave': return colors.warning || '#FFA500';
      default: return colors.error;
    }
  };

  const handleFromDateConfirm = (event, selectedDate) => {
    setShowFromDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      const newFromDate = moment(selectedDate).format('YYYY-MM-DD');
      setFromDate(newFromDate);
      setFromDateObj(selectedDate);
      // Set date filter as applied
      setDateFilterApplied(true);

      if (toDateObj && moment(selectedDate).isAfter(moment(toDateObj))) {
        setToDate(newFromDate);
        setToDateObj(selectedDate);
      }
    } else {
      // User cancelled
      setShowFromDatePicker(false);
    }
  };

  const handleToDateConfirm = (event, selectedDate) => {
    setShowToDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      const newToDate = moment(selectedDate).format('YYYY-MM-DD');
      setToDate(newToDate);
      setToDateObj(selectedDate);
      // Set date filter as applied
      setDateFilterApplied(true);

      if (fromDateObj && moment(selectedDate).isBefore(moment(fromDateObj))) {
        setFromDate(newToDate);
        setFromDateObj(selectedDate);
      }
    } else {
      // User cancelled
      setShowToDatePicker(false);
    }
  };

  const handleFromDateCancel = () => {
    setShowFromDatePicker(false);
  };

  const handleToDateCancel = () => {
    setShowToDatePicker(false);
  };

  const resetDateFilters = () => {
    // Reset to show all data
    setFromDate(null);
    setToDate(null);
    setFromDateObj(null);
    setToDateObj(null);
    setDateFilterApplied(false);
  };

  const openFile = async (filePath, mimeType) => {
    try {
      const exists = await ReactNativeBlobUtil.fs.exists(filePath);
      if (exists) {
        ReactNativeBlobUtil.android.actionViewIntent(filePath, mimeType);
        downloadSuccessBottomSheetRef.current?.close();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'File not found'
        });
      }
    } catch (error) {
      console.error('Error opening file:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to open file'
      });
    }
  };

  // const shareFile = async (filePath) => {
  //   try {
  //     const exists = await ReactNativeBlobUtil.fs.exists(filePath);
  //     if (exists) {
  //       ReactNativeBlobUtil.fs.shareFile(filePath);
  //     } else {
  // Toast.show({
  //   type: 'error',
  //   text1: 'Error',
  //   text2: 'File not found'
  // });
  //     }
  //   } catch (error) {
  //     console.error('Error sharing file:', error);
  //   type: 'error',
  //   text1: 'Error',
  //   text2: 'Failed to share file'
  // });
  //   }
  // };

  const showDownloadSuccess = (fileType, fileName, filePath) => {
    setDownloadResult({
      fileType,
      fileName,
      filePath
    });
    downloadSuccessBottomSheetRef.current?.expand();
  };

  const downloadPDF = async () => {
    try {
      if (filteredSessions.length === 0) {
        Toast.show({
          type: 'error',
          text1: 'No Data',
          text2: 'There is no data to download'
        });
        return;
      }

      downloadOptionsBottomSheetRef.current?.close();
      setShowModal(true);

      const timestamp = new Date().getTime();
      const fileName = `attendance_report_${timestamp}.pdf`;
      const downloadsPath = getDownloadsPath();
      const destinationPath = `${downloadsPath}/${fileName}`;

      //       <div class="summary-grid">
      //   <div class="summary-item"><div>Total Days</div><div class="summary-value">${stats.totalDays}</div></div>
      //   <div class="summary-item"><div>Present Days</div><div class="summary-value present">${stats.presentDays}</div></div>
      //   <div class="summary-item"><div>Absent Days</div><div class="summary-value absent">${stats.totalDays - stats.presentDays}</div></div>
      //   <div class="summary-item"><div>Attendance %</div><div class="summary-value percentage ${stats.attendancePercentage >= 75 ? 'present' : stats.attendancePercentage >= 50 ? 'leave' : 'absent'}">${stats.attendancePercentage}%</div></div>
      // </div>

      const options = {
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Helvetica', 'Arial', sans-serif; margin: 0; padding: 20px; color: #333; font-size: 12px; line-height: 1.4; }
            .header { text-align: center; margin-bottom: 25px; border-bottom: 3px solid #2c3e50; padding-bottom: 15px; }
            .main-title { font-size: 22px; font-weight: bold; color: #2c3e50; margin-bottom: 5px; }
            .subtitle { font-size: 14px; color: #7f8c8d; margin: 3px 0; }
            .student-info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #3498db; }
            .info-row { display: flex; margin: 5px 0; }
            .info-label { font-weight: bold; color: #2c3e50; padding-right: 10px; }
            .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 20px 0; background: #ecf0f1; padding: 15px; border-radius: 5px; }
            .summary-item { text-align: center; padding: 10px; }
            .summary-value { font-size: 18px; font-weight: bold; margin: 5px 0; }
            .present { color: #27ae60; } .absent { color: #e74c3c; } .leave { color: #f39c12; }
            .percentage { font-size: 24px; font-weight: bold; }
            .table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 10px; }
            .table th { background-color: #34495e; color: white; padding: 8px; text-align: left; font-weight: bold; border: 1px solid #2c3e50; }
            .table td { padding: 6px; border: 1px solid #bdc3c7; }
            .table tr:nth-child(even) { background-color: #f8f9fa; }
            .status-present { color: #27ae60; font-weight: bold; }
            .status-absent { color: #e74c3c; font-weight: bold; }
            .status-leave { color: #f39c12; font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; font-size: 9px; color: #95a5a6; border-top: 1px solid #bdc3c7; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="main-title">ATTENDANCE REPORT</div>
            <div class="subtitle">Academic Management System</div>
            <div class="subtitle">Generated on: ${moment().format('MMMM D, YYYY')}</div>
          </div>
          <div class="student-info">
            <div class="info-row">
              <span class="info-label">Student Name:</span>
              <span>${capitalizeFirstLetter(user?.username) || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Student ID:</span>
              <span>${user?.student_id || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Report Period:</span>
              <span>${fromDate && toDate ?
            `${moment(fromDate).format('MMM D, YYYY')} to ${moment(toDate).format('MMM D, YYYY')}` :
            'All Available Data'
          }</span>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr><th>Date</th><th>Course</th><th>Batch</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${filteredSessions.map((session, index) => {
            const statusClass = `status-${session.status?.toLowerCase() || 'absent'}`;
            return `<tr>
                  <td>${moment(session.date).format('MMM D, YYYY hh:mm A')}</td>
                  <td>${session.course_name || 'N/A'}</td>
                  <td>${session.title || 'N/A'}</td>
                  <td class="${statusClass}">${session.status || 'N/A'}</td>
                </tr>`;
          }).join('')}
            </tbody>
          </table>
          <div class="footer">
            <div>This report was automatically generated by the Academy Management System</div>
            <div>Page 1 of 1 • Valid as of ${moment().format('MMM D, YYYY hh:mm A')}</div>
          </div>
        </body>
        </html>
        `,
        fileName: fileName,
        directory: "Documents",
        base64: false,
        width: 595,
        height: 842,
        padding: { top: 30, right: 20, bottom: 30, left: 20 }
      };

      const pdf = await generatePDF(options);
      await RNFS.copyFile(pdf.filePath, destinationPath);

      showDownloadSuccess('pdf', fileName, destinationPath);
      return destinationPath;

    } catch (error) {
      console.error('PDF generation failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to generate PDF.'
      });
    } finally {
      setShowModal(false);
    }
  };

  const getDownloadsPath = () => {
    if (Platform.OS === 'ios') {
      return RNFS.DocumentDirectoryPath;
    }
    return RNFS.DownloadDirectoryPath || RNFS.DocumentDirectoryPath;
  };

  const downloadExcel = async () => {
    try {
      if (filteredSessions.length === 0) {
        Toast.show({
          type: 'error',
          text1: 'No Data',
          text2: 'There is no data to download'
        });
        return;
      }

      downloadOptionsBottomSheetRef.current?.close();
      setShowModal(true);

      const worksheetData = [
        ['Date', 'Time', 'Course', 'Batch', 'Status']
      ];

      filteredSessions.forEach(session => {
        worksheetData.push([
          moment(session.date).format('DD-MM-YYYY'),
          moment(session.date).format('hh:mm:ss A'),
          session.course_name || 'N/A',
          session.title || 'N/A',
          session.status || 'N/A'
        ]);
      });

      worksheetData.push([]);
      // worksheetData.push(['SUMMARY', '', '', '', '', '']);
      // worksheetData.push(['Total Records', filteredSessions.length, '', '', '', '']);
      // worksheetData.push(['Present Days', stats.presentDays, '', '', '', '']);
      // worksheetData.push(['Attendance Percentage', `${stats.attendancePercentage}%`, '', '', '', '']);
      // worksheetData.push(['Period', 
      //   fromDate && toDate ? 
      //     `${moment(fromDate).format('MMM D, YYYY')} to ${moment(toDate).format('MMM D, YYYY')}` : 
      //     'All Available Data', 
      //   '', '', '', ''
      // ]);
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');

      const wbout = XLSX.write(workbook, { type: 'binary', bookType: 'xlsx' });
      const base64 = btoa(wbout);

      const fileName = `attendance_${moment().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`;
      const filePath = `/storage/emulated/0/Download/${fileName}`;

      await ReactNativeBlobUtil.fs.writeFile(filePath, base64, 'base64');

      showDownloadSuccess('excel', fileName, filePath);
      return filePath;

    } catch (error) {
      console.error('Excel download error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to download Excel file'
      });
    } finally {
      setShowModal(false);
    }
  };

  const showDownloadOptions = () => {
    if (filteredSessions.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'No Data',
        text2: 'There is no data to download'
      });
      return;
    }
    downloadOptionsBottomSheetRef.current?.expand();
  };

  if (loading) {
    return (
      <SafeAreaView style={[globalstyles.container, { backgroundColor: themeColors.background }]}>
        <AttendanceDetailSkeleton />
      </SafeAreaView>
    );
  }

  const renderRecordItem = ({ item, index }) => (
    <View style={[
      styles.recordItem,
      { backgroundColor: themeColors.card || themeColors.surface },
      index === 0 && styles.firstRecordItem,
      index === filteredSessions.length - 1 && styles.lastRecordItem
    ]}>
      <View style={styles.recordLeft}>
        <Text style={[globalstyles.textMedium, { color: themeColors.textPrimary }]}>{item?.course_name || 'N/A'}</Text>
        <Text style={[globalstyles.textSmall, { color: themeColors.textSecondary }]}>{item?.title || 'N/A'}</Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={[
          globalstyles.textMedium,
          {
            color: getStatusColor(item?.status, themeColors),
            fontWeight: 'bold'
          }
        ]}>
          {item?.status || 'N/A'}
        </Text>
        <Text style={[globalstyles.textSmall, { color: themeColors.textSecondary }]}>
          {moment(item?.date).format('MMM D, YYYY hh:mm:ss a')}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[globalstyles.container, { backgroundColor: themeColors.background }]}>
      {/* Filters Section */}
      <View style={[styles.filtersContainer, { backgroundColor: themeColors.card }]}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: themeColors.background,
              color: themeColors.textPrimary,
              borderColor: themeColors.lightGray
            }
          ]}
          placeholder="Search by course, batch, status..."
          placeholderTextColor={themeColors.textSecondary}
          value={searchQuery}
          onChangeText={handleSearch}
        />

        <View style={styles.dateFilters}>
          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: themeColors.background, borderColor: themeColors.lightGray }]}
            onPress={() => setShowFromDatePicker(true)}
          >
            <Text style={[globalstyles.textSmall, { color: themeColors.textPrimary }]}>
              {dateFilterApplied ? `From: ${moment(fromDate).format('MMM D, YYYY')}` : 'Select Start Date'}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.dateSeparator, { color: themeColors.textSecondary }]}>to</Text>

          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: themeColors.background, borderColor: themeColors.lightGray }]}
            onPress={() => setShowToDatePicker(true)}
          >
            <Text style={[globalstyles.textSmall, { color: themeColors.textPrimary }]}>
              {toDate ? `To: ${moment(toDate).format('MMM D, YYYY')}` : 'Select End Date'}
            </Text>
          </TouchableOpacity>

          {dateFilterApplied && (
            <TouchableOpacity
              style={[styles.resetDateButton, { backgroundColor: themeColors.error }]}
              onPress={resetDateFilters}
            >
              <Text style={[styles.resetDateButtonText, { color: themeColors.white }]}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.downloadButton,
            { backgroundColor: themeColors.primary },
            loading && { backgroundColor: themeColors.textSecondary }
          ]}
          onPress={showDownloadOptions}
          disabled={loading}
        >
          <Text style={[styles.downloadButtonText, { color: themeColors.white }]}>Download Report</Text>
        </TouchableOpacity>
      </View>

      {/* Results Count */}
      <View style={[styles.resultsInfo, { backgroundColor: themeColors.card }]}>
        <Text style={[globalstyles.textMedium, { color: themeColors.textPrimary }]}>
          Showing {filteredSessions.length} of {sessions.length} records
        </Text>
        {searchQuery.trim() !== '' && (
          <Text style={[globalstyles.textSmall, { color: themeColors.textSecondary }]}>
            Search: "{searchQuery}"
          </Text>
        )}
      </View>

      {/* Attendance List */}
      <AnimatedFlatList
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: hp("5%") }}
        data={filteredSessions}
        renderItem={renderRecordItem}
        keyExtractor={(item, index) => `attendance-${item.date}-${index}-${item.status}`}
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
          <View style={styles.emptyState}>
            <Text style={[globalstyles.textMedium, { color: themeColors.textPrimary }]}>
              {sessions.length === 0 ? 'No attendance records found' : 'No records match your filters'}
            </Text>
            <Text style={[globalstyles.textSmall, { textAlign: 'center', marginTop: 10, color: themeColors.textSecondary }]}>
              {sessions.length === 0
                ? 'Pull down to refresh'
                : 'Try adjusting your search or date range'}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Download Options Bottom Sheet */}
      <DownloadOptionsBottomSheet
        bottomSheetRef={downloadOptionsBottomSheetRef}
        sessionCount={filteredSessions.length}
        onExcel={downloadExcel}
        onPDF={downloadPDF}
      />

      {/* Download Success Bottom Sheet */}
      <DownloadSuccessBottomSheet
        bottomSheetRef={downloadSuccessBottomSheetRef}
        fileType={downloadResult.fileType}
        fileName={downloadResult.fileName}
        filePath={downloadResult.filePath}
        onOpenFile={() => openFile(
          downloadResult.filePath,
          downloadResult.fileType === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )}
        onClose={() => downloadSuccessBottomSheetRef.current?.close()}
      />

      {/* Loading Modal */}
      <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
        <View style={[styles.trendyOverlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
          <LottieView
            source={require('../assets/animation/loader.json')}
            autoPlay
            loop
            style={styles.lottieAnimation}
          />
        </View>
      </Modal>

      {/* Date Pickers */}
      {showFromDatePicker && (
        <DateTimePicker
          value={fromDateObj || new Date()}
          mode="date"
          maximumDate={toDateObj || new Date()}
          onChange={handleFromDateConfirm}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        />
      )}

      {showToDatePicker && (
        <DateTimePicker
          value={toDateObj || new Date()}
          mode="date"
          minimumDate={fromDateObj}
          maximumDate={new Date()}
          onChange={handleToDateConfirm}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        />
      )}
    </View>
  );
};

// Updated Styles
const styles = StyleSheet.create({
  filtersContainer: {
    padding: hp('2%'),
    backgroundColor: colors.white,
    margin: hp('1%'),
    borderRadius: moderateScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: moderateScale(8),
    padding: hp('1.5%'),
    marginBottom: hp('1.5%'),
    fontSize: moderateScale(14),
    fontFamily: 'Manrope-Regular',
    backgroundColor: '#fafafa',
  },
  dateFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp('2%'),
  },
  dateButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: moderateScale(8),
    padding: hp('1.5%'),
    alignItems: 'center',
    backgroundColor: '#fafafa',
    marginHorizontal: wp('1%'),
  },
  resetDateButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: moderateScale(8),
    padding: hp('1.5%'),
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginLeft: wp('2%'),
  },
  resetDateButtonText: {
    color: colors.primary,
    fontSize: moderateScale(12),
    fontWeight: 'bold',
  },
  dateSeparator: {
    marginHorizontal: wp('1%'),
    color: colors.textSecondary,
    fontSize: moderateScale(14),
    fontFamily: 'Manrope-Regular',
  },
  downloadButton: {
    backgroundColor: colors.primary,
    padding: hp('1.8%'),
    borderRadius: moderateScale(8),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  downloadButtonText: {
    color: 'white',
    fontFamily: 'Manrope-Bold',
    fontSize: moderateScale(16),
  },
  resultsInfo: {
    padding: hp('1.5%'),
    paddingHorizontal: hp('2%'),
    backgroundColor: '#f1f3f4',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: hp('2%'),
    backgroundColor: colors.white,
    marginHorizontal: hp('1.5%'),
    marginVertical: hp('0.5%'),
    borderRadius: moderateScale(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  firstRecordItem: {
    marginTop: hp('1%'),
  },
  lastRecordItem: {
    marginBottom: hp('2%'),
  },
  recordLeft: {
    flex: 1,
  },
  emptyState: {
    padding: hp('8%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Skeleton Styles
  skeletonContainer: {
    padding: hp('1%'),
  },
  skeletonFiltersContainer: {
    padding: hp('2%'),
    backgroundColor: colors.white,
    margin: hp('1%'),
    borderRadius: moderateScale(12),
  },
  skeletonResultsInfo: {
    padding: hp('1.5%'),
    paddingHorizontal: hp('2%'),
    backgroundColor: '#f1f3f4',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  skeletonRecordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: hp('2%'),
    backgroundColor: colors.white,
    marginHorizontal: hp('1.5%'),
    marginVertical: hp('0.5%'),
    borderRadius: moderateScale(8),
  },
  // Bottom Sheet Styles
  bottomSheetBackground: {
    backgroundColor: colors.white,
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
  },
  bottomSheetContent: {
    flex: 1,
    padding: hp('3%'),
  },
  bottomSheetTitle: {
    fontSize: moderateScale(20),
    fontFamily: 'Manrope-Bold',
    textAlign: 'center',
    marginBottom: hp('1%'),
    color: colors.textPrimary,
  },
  bottomSheetSubtitle: {
    fontSize: moderateScale(14),
    textAlign: 'center',
    marginBottom: hp('3%'),
    color: colors.textSecondary,
    fontFamily: 'Manrope-Regular',
  },
  bottomSheetButton: {
    backgroundColor: colors.primary,
    padding: hp('2%'),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    marginBottom: hp('2%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  bottomSheetButtonText: {
    color: 'white',
    fontSize: moderateScale(16),
    fontFamily: 'Manrope-Bold',
  },
  bottomSheetCancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.textSecondary,
  },
  bottomSheetCancelText: {
    color: colors.textSecondary,
    fontSize: moderateScale(16),
    fontFamily: 'Manrope-Bold',
  },
  // Success Bottom Sheet Styles
  successHeader: {
    alignItems: 'center',
    marginBottom: hp('3%'),
  },
  successIcon: {
    fontSize: moderateScale(40),
    marginBottom: hp('1%'),
    fontFamily: 'Manrope-Regular',
  },
  successTitle: {
    fontSize: moderateScale(22),
    fontFamily: 'Manrope-Bold',
    color: colors.textPrimary,
    marginBottom: hp('1%'),
  },
  successSubtitle: {
    fontSize: moderateScale(14),
    color: colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'Manrope-Regular',
  },
  fileInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: hp('2%'),
    borderRadius: moderateScale(12),
    marginBottom: hp('3%'),
  },
  fileIcon: {
    fontSize: moderateScale(24),
    marginRight: hp('2%'),
    fontFamily: 'Manrope-Regular',
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: moderateScale(14),
    fontFamily: 'Manrope-Bold',
    color: colors.textPrimary,
    marginBottom: hp('0.5%'),
  },
  fileType: {
    fontSize: moderateScale(12),
    color: colors.textSecondary,
    fontFamily: 'Manrope-Regular',
  },
  openFileButton: {
    backgroundColor: colors.primary,
  },
  shareButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  shareButtonText: {
    color: colors.primary,
    fontSize: moderateScale(16),
    fontFamily: 'Manrope-Bold',
  },
  // Download Modal Styles
  trendyOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(20),
  },
  lottieAnimation: {
    width: hp("30%"),
    height: hp("30%"),
  },
});

export default AttendanceDetailScreen;