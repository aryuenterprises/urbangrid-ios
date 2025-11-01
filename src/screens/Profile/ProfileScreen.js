import React, { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Linking, StyleSheet, Modal, Dimensions, Alert, RefreshControl, Image, Platform } from 'react-native';
import { Avatar, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { globalstyles, colors } from '../../utils/globalStyles';
import { hp, wp } from '../../utils/responsive';
import { getStudentProfile, logout, UpdateProfilePic } from '../../services/auth';
import ImageCropPicker from 'react-native-image-crop-picker';
import GradientButton from '../../components/GradientButton/gradientButton';
import capitalizeFirstLetter from '../../utils/capitalizeFirstLetter';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';
import { formatDateTime } from '../../utils/formatDate';
import { API_BASE_URL } from '@env';
import Toast from 'react-native-toast-message';
import { useAppTheme } from '../../hook/useAppTheme';

const profileData = {
  first_name: "Muthu",
  last_name: "Kumar",
  profile_pic: "https://portal.aryuacademy.com/api/media/profile_pics/AYA0725043/boy.jpg",
  dob: "2025-07-04",
  contact_no: "7904114966",
  address: "123, techpark",
  city: "trichy",
  registration_id: "AYA0725043",
  admissionDate: "25 Oct 2023",
  state: "Tamil Nadu",
  country: "IN",
  email: "johnjoelw16@gmail.com",
  status: "Active",
  mentor: "Dr. Arun Kumar",
  payment: {
    installmentNo: 3,
    dueDate: "25 Oct 2023",
    amountDue: "$1,250",
    amountPaid: "$3,750",
    balance: "$2,500",
    paymentStatus: "Partial Payment",
    paymentLink: "https://portal.aryuacademy.com/",
    invoice: "https://employee.aryutechnologies.com/dashboard"
  },
  jobPortalLinks: [
    { name: "Naukri", url: "https://www.naukri.com/mnjuser/profile" },
    { name: "LinkedIn", url: "https://linkedin.com/in/alexjohnson" },
    { name: "Indeed", url: "https://profile.indeed.com" },
    { name: "Freshersworld", url: "https://www.freshersworld.com/user/profile" },
    { name: "PlacementIndia", url: "https://www.placementindia.com/profile" },
    { name: "Internshala", url: "https://internshala.com/student/profile" },
    { name: "FoundIt", url: "https://www.foundit.in/seeker/my-profile" },
    { name: "TimesJobs", url: "https://www.timesjobs.com/candidate/profile" }
  ].filter(portal => portal.url),
  course_detail: {
    course_name: "Python",
    course_category: "BACKEND DEVELOPEMENT",
    duration: "3",
    fee: "20000.00",
  }
};

const { width: screenWidth } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [showJobPortals, setShowJobPortals] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fullScreenVisible, setFullScreenVisible] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [data, setData] = useState({});
  const [showLegal, setShowLegal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { colors: themeColors } = useAppTheme();

  useEffect(() => {
    fetchStudentProfile()
  }, [])

  const fetchStudentProfile = async () => {
    try {
      const isSimulator = Platform.OS === 'ios' && !Platform.isPad;

      if (isSimulator) {
        Alert.alert(
          'Simulator Limitation',
          'Image/video picking may not work properly on simulator. Please test on a real device.',
          [{ text: 'OK' }]
        );
        return;
      }

      setLoading(true);
      const profile = await getStudentProfile(user?.student_id);
      setData(profile.data);
      setProfilePic(profile.data.profile_pic);
    } catch (error) {
      console.error("Profile fetch error:", error);
      if (error.code === 'E_PICKER_CANCELLED') {
        Toast.show({
          type: 'info',
          text1: 'Cancelled',
          text2: 'Image selection was cancelled'
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to pick image: ' + error.message
        });
      }
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message ||
          error.message || 'Failed to load student profile'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCameraOpen = async () => {
    try {
      const cameraImage = await ImageCropPicker.openCamera({
        width: 300,
        height: 300,
        cropping: false,
        mediaType: 'photo',
        compressImageQuality: 0.8,
      });

      const croppedImage = await ImageCropPicker.openCropper({
        path: cameraImage.path,
        width: 300,
        height: 300,
        cropping: true,
        cropperCircleOverlay: true,
        compressImageQuality: 0.8,
      });

      await uploadProfilePicture(croppedImage.path);

    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.log('Camera error:', error);
      }
    }
  };

  const handleGalleryOpen = async () => {
    try {
      const selectedImage = await ImageCropPicker.openPicker({
        width: 300,
        height: 300,
        cropping: false,
        mediaType: 'photo',
        compressImageQuality: 0.8,
      });

      const croppedImage = await ImageCropPicker.openCropper({
        path: selectedImage.path,
        width: 300,
        height: 300,
        cropping: true,
        cropperCircleOverlay: true,
        compressImageQuality: 0.8,
      });

      await uploadProfilePicture(croppedImage.path);

    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.log('Gallery error:', error);
      }
    }
  };

  const uploadProfilePicture = async (imagePath) => {
    try {
      const response = await UpdateProfilePic(user?.student_id, imagePath);
      setProfilePic(response.data.profile_pic);
    } catch (error) {
      console.log("Upload error", error.response);
    }
  };

  const onRefresh = useCallback(() => {
    fetchStudentProfile();
  }, []);

  const paidAmount = parseInt(profileData?.payment.amountPaid.replace(/\D/g, ''));
  const balanceAmount = parseInt(profileData?.payment.balance.replace(/\D/g, ''));
  const totalAmount = paidAmount + balanceAmount;
  const paymentPercentage = Math.round((paidAmount / totalAmount) * 100);

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getPortalIcon = (portalName) => {
    const imageMap = {
      'Naukri': require('../../assets/images/Naukri.png'),
      'LinkedIn': require('../../assets/images/LinkedIn.png'),
      'Indeed': require('../../assets/images/Indeed.png'),
      'Freshersworld': require('../../assets/images/FreshersWorld.png'),
      'PlacementIndia': require('../../assets/images/PlacementIndia.png'),
      'Internshala': require('../../assets/images/Internshala.png'),
      'FoundIt': require('../../assets/images/FoundIt.png'),
      'TimesJobs': require('../../assets/images/Timesjob.png')
    };
    return imageMap[portalName]
  };

  const handleLinkPress = async (url) => {
    try {
      await Linking.openURL(url);
    } catch (err) {
      console.error("Failed to open URL:", err);
    }
  };

  const renderDetailItem = (icon, label, value, isLink = false, isStatus = false) => (
    <TouchableOpacity
      style={[styles.detailItem, { backgroundColor: themeColors.background }, label === "Permanent Address" && { borderBottomWidth: 0, }]}
      onPress={isLink ? () => handleLinkPress(value) : null}
      activeOpacity={isLink ? 0.6 : 1}
    >
      <View style={styles.detailContent}>
        <Icon name={icon} size={hp('2.5%')} color={colors.primary} />
        <View style={styles.detailText}>
          <Text style={[styles.detailLabel, { color: themeColors.textPrimary }]}>{label}</Text>
          <Text style={[
            styles.detailValue, { color: themeColors.textSecondary },
            isLink && { color: themeColors.primary },
            isStatus && {
              color: profileData?.payment.paymentStatus === 'Complete' ? themeColors.success : themeColors.warning,
              fontFamily: 'Manrope-Bold'
            }
          ]}>
            {value} {isLink && <Icon name="open-in-new" size={hp('1.8%')} color={colors.primary} />}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[globalstyles.container, { paddingHorizontal: 0, paddingVertical: hp("1%"), backgroundColor: themeColors.background }]}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            progressBackgroundColor="#ffffff"
          />}
        contentContainerStyle={[styles.scrollView, { backgroundColor: themeColors.background }]} showsVerticalScrollIndicator={false}>

        {/* Profile Header */}
        <View style={styles.profileHeaderOuterContainer}>
          <LinearGradient
            colors={[colors.secondary, colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileHeaderContainer}

          >
            <View style={styles.profileContent}>
              <View style={styles.profileImageContainer}>
                <TouchableOpacity onPress={() => profilePic && setFullScreenVisible(true)}>
                  <View style={styles.profileImageRing}>
                    {profilePic ? (
                      <Avatar.Image
                        source={{ uri: profilePic }}
                        size={hp('12%')}
                        style={styles.avatar}
                      />
                    ) : (
                      <View style={[styles.profileImageFallback]}>
                        <Avatar.Text
                          size={hp('12%')}
                          label={getInitials(data?.first_name, data?.last_name)}
                          style={styles.avatar}
                        />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cameraButton} onPress={() => setMediaModalVisible(true)}>
                  <Icon name="camera" size={hp('2%')} color={colors.white} />
                </TouchableOpacity>
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {capitalizeFirstLetter(user?.username)}
                </Text>
                <Text style={[globalstyles.textMedium, { color: "#fff" }]}>
                  Reg ID - {user?.registration_id}
                </Text>
                <Text style={[globalstyles.textMedium, { color: "#fff" }]}>
                  Admission - {formatDateTime(data?.joining_date, { includeTime: false })}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Combined Section Container */}
        <View style={[globalstyles.card, { backgroundColor: themeColors.card, padding: 0, }]}>
          {/* Account Details Accordion */}
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => setShowAccountDetails(!showAccountDetails)}
            activeOpacity={0.8}
          >
            <Text style={[globalstyles.sectionTitle, { color: themeColors.textPrimary }]}>Account Details</Text>
            <Icon
              name={showAccountDetails ? "chevron-up" : "chevron-down"}
              size={hp('3%')}
              color={colors.primary}
            />
          </TouchableOpacity>

          {showAccountDetails && (
            <View style={[styles.accordionContent, { backgroundColor: themeColors.background }]}>
              {renderDetailItem("email", "Email Address", data?.email)}
              {renderDetailItem("cake", "Date of Birth", formatDateTime(data?.dob, { includeTime: false }))}
              {renderDetailItem("phone", "Contact Number", data?.contact_no)}
              {renderDetailItem("map-marker", "Current Address", `${data?.current_address}, ${data?.city}, ${data?.state}, ${data?.country}`)}
              {renderDetailItem("map-marker", "Permanent Address", `${data?.permanent_address}, ${data?.city}, ${data?.state}, ${data?.country}`)}
            </View>
          )}

          <View style={[styles.divider, { backgroundColor: colors.textSecondary }]} />

          {/* Job Portal Links Accordion */}
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => setShowJobPortals(!showJobPortals)}
            activeOpacity={0.8}
          >
            <Text style={[globalstyles.sectionTitle, { color: themeColors.textPrimary }]}>Job Portal Accounts</Text>
            <Icon
              name={showJobPortals ? "chevron-up" : "chevron-down"}
              size={hp('3%')}
              color={colors.primary}
            />
          </TouchableOpacity>

          {showJobPortals && (
            <View style={[styles.accordionContent, , { backgroundColor: themeColors.background }]}>
              {profileData?.jobPortalLinks?.map((portal, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.careerItem}
                  onPress={() => handleLinkPress(portal.url)}
                  activeOpacity={0.6}
                >
                  <Image
                    source={getPortalIcon(portal.name)}
                    style={styles.courseImage}
                  />
                  <View style={styles.careerTextContainer}>
                    <Text style={[styles.careerPortalName, { color: themeColors.textPrimary }]}>{portal.name}</Text>
                  </View>
                  <Icon name="open-in-new" size={hp('2.5%')} color={colors.primary} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={[styles.divider, { backgroundColor: colors.textSecondary }]} />

          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => setShowLegal(!showLegal)}
            activeOpacity={0.8}
          >
            <Text style={[globalstyles.sectionTitle, { color: themeColors.textPrimary }]}>Legal</Text>
            <Icon
              name={showLegal ? "chevron-up" : "chevron-down"}
              size={hp('3%')}
              color={colors.primary}
            />
          </TouchableOpacity>

          {showLegal && (
            <View style={[styles.accordionContent, , { backgroundColor: themeColors.background }]}>
              <TouchableOpacity
                style={styles.careerItem}
                onPress={() => handleLinkPress(`${API_BASE_URL}/privacy-policy`)}
                activeOpacity={0.6}
              >
                <Icon name="shield-check" size={hp('3%')} color={colors.primary} />
                <View style={styles.careerTextContainer}>
                  <Text style={[styles.careerPortalName, { color: themeColors.textPrimary }]}>Privacy Policy</Text>
                </View>
                <Icon name="open-in-new" size={hp('2.5%')} color={colors.primary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.careerItem}
                onPress={() => handleLinkPress(`${API_BASE_URL}/terms-and-conditions`)}
                activeOpacity={0.6}
              >
                <Icon name="file-document" size={hp('3%')} color={colors.primary} />
                <View style={styles.careerTextContainer}>
                  <Text style={[styles.careerPortalName, { color: themeColors.textPrimary }]}>Terms & Conditions</Text>
                </View>
                <Icon name="open-in-new" size={hp('2.5%')} color={colors.primary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.careerItem}
                onPress={() => handleLinkPress(`${API_BASE_URL}/support`)}
                activeOpacity={0.6}
              >
                <MaterialIcons name="contact-support" size={hp('3.5%')} color={colors.primary} />
                <View style={styles.careerTextContainer}>
                  <Text style={[styles.careerPortalName, { color: themeColors.textPrimary }]}>Help & Support</Text>
                </View>
                <Icon name="open-in-new" size={hp('2.5%')} color={colors.primary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.careerItem}
                onPress={() => handleLinkPress(`${API_BASE_URL}/refund-policy`)}
                activeOpacity={0.6}
              >
                <Icon name="cash-refund" size={hp('3%')} color={colors.primary} />
                <View style={styles.careerTextContainer}>
                  <Text style={[styles.careerPortalName, { color: themeColors.textPrimary }]}>Refund Policy</Text>
                </View>
                <Icon name="open-in-new" size={hp('2.5%')} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={mediaModalVisible}
          onRequestClose={() => setMediaModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setMediaModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <TouchableOpacity
                style={styles.modalContent}
                activeOpacity={1}
                onPress={(e) => e.stopPropagation()}
              >
                <Text style={styles.modalTitle}>Choose Option</Text>

                <View style={styles.modalOptionsContainer}>
                  <TouchableOpacity
                    style={styles.modalOption}
                    onPress={() => {
                      setMediaModalVisible(false);
                      handleCameraOpen();
                    }}
                  >
                    <View style={styles.optionIconContainer}>
                      <Icon name="camera" size={hp('4%')} color={colors.primary} />
                    </View>
                    <Text style={styles.optionText}>Camera</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalOption}
                    onPress={() => {
                      setMediaModalVisible(false);
                      handleGalleryOpen();
                    }}
                  >
                    <View style={styles.optionIconContainer}>
                      <Icon name="image-multiple" size={hp('4%')} color={colors.primary} />
                    </View>
                    <Text style={styles.optionText}>Gallery</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Logout Button */}
      </ScrollView>
      <View style={[styles.actionsContainer, { backgroundColor: themeColors.background }]}>
        <GradientButton
          colors={['#BA000C', '#5E000B']}
          text='Log out'
          onPress={logout}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
    paddingHorizontal: hp("2%"),
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: hp('2%'),
  },
  accordionContent: {
    marginTop: hp('0.5%'),
    paddingHorizontal: hp("2%"),
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    // marginVertical: hp('1%'),
  },
  progressContainer: {
    marginTop: hp('1%'),
    marginBottom: hp('1.5%'),
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('1%'),
  },
  progressPercentage: {
    fontSize: hp('1.8%'),
    fontFamily: 'Manrope-Bold',
    color: colors.primary,
  },
  progressStatus: {
    fontSize: hp('1.6%'),
    color: colors.textTertiary,
    fontFamily: 'Manrope-Regular',
  },
  progressBar: {
    height: hp('0.8%'),
    backgroundColor: colors.lightGray,
    borderRadius: hp('0.4%'),
    overflow: 'hidden',
    marginBottom: hp('1.5%'),
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: hp('0.4%'),
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp('1.2%'),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lightGray,
  },
  detailContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    marginLeft: wp('3%'),
    flex: 1,
  },
  detailLabel: {
    color: colors.textTertiary,
    fontSize: hp('1.6%'),
    fontFamily: 'Manrope-Regular',
  },
  detailValue: {
    color: colors.textPrimary,
    fontSize: hp('1.8%'),
    marginTop: hp('0.3%'),
    fontFamily: 'Manrope-Medium',
  },
  careerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('1.5%'),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lightGray,
  },
  careerTextContainer: {
    flex: 1,
    marginLeft: wp('3%'),
  },
  careerPortalName: {
    fontSize: hp('1.8%'),
    fontFamily: 'Manrope-Medium',
    color: colors.textPrimary,
  },
  actionsContainer: {
    // marginHorizontal: wp('2%'),
    // marginBottom: hp('9%'),
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: hp("2%")
  },
  profileImageFallback: {
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeaderOuterContainer: {
    marginBottom: Platform.OS === 'ios' ? hp('2%') : hp('4%'),
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  profileHeaderContainer: {
    paddingVertical: Platform.OS === 'ios' ? 0 : hp('3%'),
    paddingHorizontal: Platform.OS === 'ios' ? 0 : wp('5%'),
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Platform.OS === 'ios' ? hp("2%") : 0,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: wp('5%'),
  },
  profileImageRing: {
    width: hp('14%'),
    height: hp('14%'),
    borderRadius: hp('14%') / 2,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: hp('0.5%'),
  },
  profileInfo: {
    flex: 1,
    gap: hp("0.5%")
  },
  profileName: {
    fontSize: hp('2.8%'),
    fontFamily: 'Manrope-Bold',
    color: colors.white,
    marginBottom: hp('0.5%'),
  },
  cameraButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    borderRadius: hp('3%') / 2,
    width: hp('3.5%'),
    height: hp('3.5%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  trainerBatchCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  trainerBatchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  trainerBatchName: {
    flex: 1,
    fontSize: hp('1.9%'),
    fontFamily: 'Manrope-Medium',
    color: colors.textPrimary,
    marginLeft: 10,
  },
  batchDateBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  batchDateText: {
    fontSize: hp('1.5%'),
    color: colors.primary,
    fontFamily: 'Manrope-Medium',
  },
  trainerAssignmentsContainer: {
    padding: 16,
  },
  trainerCard: {
    marginBottom: 12,
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  courseName: {
    fontSize: hp('1.8%'),
    fontFamily: 'Manrope-Medium',
    color: colors.textPrimary,
    marginLeft: 8,
  },
  trainerDetails: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  trainerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  trainerInfoText: {
    marginLeft: 12,
    flex: 1,
  },
  trainerLabel: {
    fontSize: hp('1.4%'),
    color: colors.textTertiary,
    marginBottom: 2,
    fontFamily: 'Manrope-Regular',
  },
  trainerName: {
    fontSize: hp('1.7%'),
    fontWeight: '500',
    color: colors.textPrimary,
    fontFamily: 'Manrope-Regular',
  },
  trainerId: {
    fontSize: hp('1.6%'),
    color: colors.textSecondary,
    fontFamily: 'Manrope-Medium',
  },
  trainerDivider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 16,
  },
  courseImage: {
    width: hp("3%"),
    height: hp("3%"),
    borderRadius: 50,
    borderColor: '#ccc',
    borderWidth: 1
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  modalContainer: {
    width: '100%',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: hp('3%'),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: hp('2.2%'),
    textAlign: 'center',
    marginBottom: hp('3%'),
    color: colors.textPrimary,
    fontFamily: 'Manrope-SemiBold',
  },
  modalOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  modalOption: {
    alignItems: 'center',
    padding: hp('2%'),
    borderRadius: 15,
    minWidth: wp('25%'),
  },
  optionIconContainer: {
    width: hp('6%'),
    height: hp('6%'),
    borderRadius: hp('3%'),
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  optionText: {
    fontSize: hp('1.8%'),
    fontFamily: 'Manrope-Medium',
    color: colors.textPrimary,
  },
});

export default ProfileScreen;