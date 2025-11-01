import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    Linking,
    ActivityIndicator,
    FlatList,
    Dimensions,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
    useWindowDimensions,
    RefreshControl,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    TouchableWithoutFeedback,
    ScrollView,
    StatusBar,
} from 'react-native';
import { colors, globalstyles } from '../../utils/globalStyles';
import { hp, wp, moderateScale } from '../../utils/responsive';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { RenderHTML } from 'react-native-render-html';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';
import api from '../../services/api';
import { getAssessment, getAssignment, getSyllabus, getTopics } from '../../services/auth';
import { Card, Chip } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import { API_BASE_URL } from '@env'
// import { API_BASE_URL } from 'react-native-config'
import { useSelector } from 'react-redux';
import { getLimitedText } from '../../utils/getLimitedText';
import { SafeAreaView } from 'react-native-safe-area-context';
import capitalizeFirstLetter from '../../utils/capitalizeFirstLetter';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useAppTheme } from '../../hook/useAppTheme';
import { useScrollDetection } from '../../hook/useScrollDetection';

const getPriorityColor = (priority) => {
    switch (priority) {
        case 'high': return '#FF3B30';
        case 'medium': return '#FF9500';
        default: return '#34C759';
    }
};

// Open syllabus PDF
const FeedbackModalComponent = ({
    visible,
    onRequestClose,
    completionStatus,
    setCompletionStatus,
    rating,
    setRating,
    feedbackText,
    setFeedbackText,
    loading,
    handleFeedback,
    renderStars
}) => {
    const { colors: themeColors } = useAppTheme();

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onRequestClose}
        >
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={globalstyles.keyboardAvoidingView}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                        <View style={[styles.modalContent, { backgroundColor: themeColors.card }]}>
                            {completionStatus === null ? (
                                // First step: Completion question
                                <>
                                    <Text style={[styles.modalTitle, { color: themeColors.textPrimary }]}>Topic Completion</Text>
                                    <Text style={[styles.question, { marginBottom: hp("0.5%"), color: themeColors.textPrimary }]}>Have you completed this topic?</Text>
                                    <Text style={[styles.hint, { color: themeColors.textSecondary }]}>Please confirm only if you've fully understood and completed all the material.</Text>
                                    <View style={styles.completionOptions}>
                                        <TouchableOpacity
                                            style={[styles.optionButton, styles.yesButton, { backgroundColor: themeColors.success }]}
                                            onPress={() => setCompletionStatus(true)}
                                        >
                                            <Text style={[styles.optionText, { color: themeColors.white }]}>Yes</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.optionButton, styles.noButton, { backgroundColor: themeColors.error }]}
                                            onPress={onRequestClose}
                                        >
                                            <Text style={[styles.optionText, { color: themeColors.white }]}>No</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            ) : (
                                // Second step: Rating and feedback
                                <>
                                    <View style={styles.headerRow}>
                                        <TouchableOpacity onPress={() => setCompletionStatus(null)} style={styles.backButton}>
                                            <MaterialIcons name="arrow-back-ios" size={moderateScale(20)} color={themeColors.warning} />
                                        </TouchableOpacity>
                                        <Text style={[styles.modalTitle, { color: themeColors.textPrimary }]}>Rate this Topic</Text>
                                        <View style={{ width: 60 }} />
                                    </View>

                                    <ScrollView 
                                        style={styles.modalScrollView}
                                        contentContainerStyle={globalstyles.modalScrollContent}
                                        showsVerticalScrollIndicator={false}
                                        keyboardShouldPersistTaps="handled"
                                    >
                                        <Text style={[styles.question, { color: themeColors.textPrimary }]}>How would you rate this topic?<Text style={[globalstyles.asterisk, { color: themeColors.error }]}>*</Text></Text>
                                        {renderStars()}
                                        <Text style={[styles.ratingText, { color: themeColors.textPrimary }]}>{rating}/5</Text>

                                        <Text style={[styles.question, { color: themeColors.textPrimary }]}>Additional feedback<Text style={[globalstyles.asterisk, { color: themeColors.error }]}>*</Text></Text>
                                        <TextInput
                                            style={[
                                                styles.feedbackInput,
                                                {
                                                    backgroundColor: themeColors.background,
                                                    color: themeColors.textPrimary,
                                                    borderColor: themeColors.lightGray
                                                }
                                            ]}
                                            multiline
                                            numberOfLines={4}
                                            placeholder="Enter your notes or feedback about this topic"
                                            placeholderTextColor={themeColors.textSecondary}
                                            value={feedbackText}
                                            onChangeText={setFeedbackText}
                                            returnKeyType="done"
                                            blurOnSubmit={true}
                                        />

                                        <View style={styles.modalButtons}>
                                            <TouchableOpacity
                                                style={[styles.modalButton, styles.cancelButton, { borderColor: themeColors.lightGray, backgroundColor: "#ccc" }]}
                                                onPress={onRequestClose}
                                            >
                                                <Text style={[styles.cancelButtonText, { color: themeColors.textPrimary }]}>Cancel</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[
                                                    styles.modalButton,
                                                    styles.submitButton,
                                                    { backgroundColor: themeColors.primary },
                                                    (loading || !feedbackText.trim() || rating === 0) && { backgroundColor: themeColors.textSecondary }
                                                ]}
                                                onPress={handleFeedback}
                                                disabled={rating === 0 || !feedbackText.trim() || loading}
                                            >
                                                <Text style={[styles.submitButtonText, { color: themeColors.white }]}>
                                                    {loading ? 'Submitting...' : 'Submit Feedback'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </ScrollView>
                                </>
                            )}
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const { width } = Dimensions.get('window');

const CourseDetailsScreen = ({ route, navigation }) => {
    // const { course } = route.params;
    const [index, setIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [assessments, setAssessments] = useState([]);
    const [topics, setTopics] = useState([]);
    const [syllabus, setSyllabus] = useState(null);
    const [exercises, setExercises] = useState([]);
    const { studentProfile, user, token, globalCourseId } = useSelector(state => state.auth);
    const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
    const [completionStatus, setCompletionStatus] = useState(null);
    const [rating, setRating] = useState(0);
    const [result, setResult] = useState(null);
    const [feedbackText, setFeedbackText] = useState('');
    const [selectedTopicId, setSelectedTopicId] = useState(null);
    const [refreshing, setRefreshing] = useState(false); // Add refreshing state
    const [routes] = useState([
        { key: 'syllabus', title: 'Syllabus' },
        { key: 'topics', title: 'Topics' },
        { key: 'exercises', title: 'Exercise' },
        { key: 'assessments', title: 'Assessment' },
    ]);
    const { colors: themeColors } = useAppTheme();
    const { handleScroll, createAnimatedScrollView } = useScrollDetection();
    const AnimatedFlatList = createAnimatedScrollView(FlatList);
    const filteredCourse = studentProfile?.data?.course_detail.find(
        (item) => item?.course_id === globalCourseId
    );

    const fetchExercises = async (isRefreshing = false) => {
        if (!isRefreshing) setLoading(true);
        try {
            const response = await getAssignment(globalCourseId)
            setExercises(response.data);
        } catch (error) {
            console.error('Error fetching exercises:', error);
        } finally {
            if (!isRefreshing) setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const fetchData = async () => {
                if (!isActive) return;

                try {
                    if (index === 3) {
                        await fetchAssessments();
                    } else if (index === 2) {
                        await fetchExercises();
                    } else if (index === 1) {
                        await fetchTopics();
                    } else {
                        await fetchSyllabus()
                    }
                } catch (error) {
                    console.error('Error in useFocusEffect:', error);
                }
            };

            fetchData();

            return () => {
                isActive = false;
            };
        }, [index])
    );

    // Fetch assessments data (mock API call)
    const fetchAssessments = async (isRefreshing = false) => {
        if (!isRefreshing) setLoading(true);
        try {
            const response = await getAssessment(globalCourseId)
            setAssessments(response.tests);
        } catch (error) {
            console.error('Error fetching assessments:', error);
        } finally {
            if (!isRefreshing) setLoading(false);
        }
    };

    const fetchTopics = async (isRefreshing = false) => {
        if (!isRefreshing) setLoading(true);
        try {
            const response = await getTopics(globalCourseId, user.student_id)
            console.log("response", response)
            setTopics(response.all_topics);
            setResult(response.completed_topics);
        } catch (error) {
            console.error('Error fetching response:', error);
        } finally {
            if (!isRefreshing) setLoading(false);
        }
    };

    const fetchSyllabus = async (isRefreshing = false) => {
        if (!isRefreshing) setLoading(true);
        try {
            const response = await getSyllabus(globalCourseId, user.student_id)
            setSyllabus(response);
        } catch (error) {
            console.error('Error fetching response:', error);
        } finally {
            if (!isRefreshing) setLoading(false);
        }
    };
    
    // Refresh function for each tab
    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            switch (index) {
                case 0: // Topics tab
                    await fetchSyllabus();
                    break;
                case 1: // Topics tab
                    await fetchTopics();
                    break;
                case 2: // Exercises tab
                    await fetchExercises();
                    break;
                case 3: // Assessments tab
                    await fetchAssessments();
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setRefreshing(false);
        }
    };


    const handleFeedback = async () => {
        if (!completionStatus) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: "Please select completion status"
            });
            return;
        }

        if (rating === 0) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please provide a rating'
            });
            return;
        }

        if (!feedbackText.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please provide feedback'
            });
            return;
        }

        setLoading(true);
        try {
            const response = await api.post(`${API_BASE_URL}/api/courses/${globalCourseId}/topic/${user.student_id}/status`, {
                notes: feedbackText.trim(),
                ratings: rating,
                status: completionStatus,
                student: user.registration_id,
                topic: selectedTopicId
            });
            setFeedbackModalVisible(false);
            resetFeedbackForm();
            fetchTopics()
            Toast.show({
                type: 'success',
                text1: 'Submitted',
                text2: 'Thank you for your feedback!'
            });
            return response.data;
        } catch (error) {
            console.error('Error submitting feedback:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to submit feedback'
            });
        } finally {
            setLoading(false);
        }
    };

    const resetFeedbackForm = () => {
        setCompletionStatus(null);
        setRating(0);
        setFeedbackText('');
        setSelectedTopicId(null);
    };

    const openFeedbackModal = (topicId) => {
        setSelectedTopicId(topicId);
        setFeedbackModalVisible(true);
    };


    const openSyllabus = () => {
        if (syllabus?.syllabus_info && syllabus?.syllabus_info?.length > 0) {
            Linking.openURL(syllabus?.syllabus_info[0].file.url);
        }
    };

    // Render syllabus tab
    const renderSyllabus = () => (
        <AnimatedFlatList
            onScroll={handleScroll}
            scrollEventThrottle={16}
            data={filteredCourse?.syllabus_info}
            keyExtractor={(item) => item.id}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    colors={[themeColors.primary]}
                    tintColor={themeColors.primary}
                    progressBackgroundColor={themeColors.background}
                />
            }
            contentContainerStyle={styles.tabContent}
            renderItem={({ item }) => (
                <View style={[styles.syllabusCard, { backgroundColor: themeColors.card || themeColors.surface }]}>
                    <Icon name="file-document" size={moderateScale(40)} color={themeColors.primary} />
                    <Text style={[styles.syllabusTitle, { color: themeColors.textPrimary }]}>{item.title || 'Course Syllabus'}</Text>
                    <Text style={[styles.syllabusDescription, { color: themeColors.textSecondary }]}>
                        {item.description || 'View the complete syllabus for this course to see all learning objectives, topics covered, and assessment criteria.'}
                    </Text>
                    <TouchableOpacity
                        style={[styles.downloadButton, { backgroundColor: themeColors.primary }]}
                        onPress={() => openSyllabus(item)}
                    >
                        <Text style={[styles.downloadButtonText, { color: themeColors.white }]}>View Syllabus</Text>
                    </TouchableOpacity>
                </View>
            )}
            ListEmptyComponent={
                <View style={globalstyles.loginContainer}>
                    <Text style={{ color: themeColors.textSecondary }}>No syllabus available</Text>
                </View>
            }
        />
    );

    // Render stars for rating
    const renderStars = (currentRating, onRate) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <TouchableOpacity key={i} onPress={() => onRate(i)}>
                    <Text style={[
                        styles.star,
                        { color: themeColors.textSecondary },
                        i <= currentRating && [styles.starSelected]
                    ]}>
                        {i <= currentRating ? '★' : '☆'}
                    </Text>
                </TouchableOpacity>
            );
        }
        return <View style={styles.starsContainer}>{stars}</View>;
    };

    // Render topics tab
    const renderTopics = () => (
        <AnimatedFlatList
            onScroll={handleScroll}
            scrollEventThrottle={16}
            data={topics}
            keyExtractor={(item) => item.topic_id.toString()}
            contentContainerStyle={styles.tabContent}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    colors={[themeColors.primary]}
                    tintColor={themeColors.primary}
                    progressBackgroundColor={themeColors.background}
                />
            }
            renderItem={({ item, index }) => {
                // Find the completed topic data for this item
                const completedTopicData = result.find(completed => completed.topic === item.topic_id);

                return (
                    <View style={[styles.topicCard, { backgroundColor: themeColors.card || themeColors.surface }]}>
                        {/* Header with topic number, title, and rating stars */}
                        <View style={[styles.topicHeader]}>
                            <View style={[styles.topicNumber, { backgroundColor: themeColors.primary }]}>
                                <Text style={[styles.topicNumberText, { color: themeColors.white }]} lineBreakMode='tail'>{index + 1}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.topicTitle, { color: themeColors.textPrimary }]}>{item.title}</Text>
                                {item.is_completed && completedTopicData && (
                                    <View style={styles.ratingContainer}>
                                        <View style={styles.starContainer}>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Ionicons
                                                    key={star}
                                                    name={star <= completedTopicData.ratings ? "star" : "star-outline"}
                                                    size={hp("2.5%")}
                                                    color={star <= completedTopicData.ratings ? "#FFD60A" : themeColors.textSecondary}
                                                />
                                            ))}
                                        </View>
                                    </View>
                                )}
                            </View>
                        </View>

                        <View style={styles.topicContent}>
                            <RenderHTML
                                enableCSSInlineProcessing={true}
                                contentWidth={width - moderateScale(40)}
                                source={{ html: item.description }}
                                baseStyle={[styles.topicDescription, { color: themeColors.textPrimary }]}
                                tagsStyles={{
                                    p: {
                                        marginVertical: moderateScale(8),
                                        fontSize: moderateScale(16),
                                        lineHeight: moderateScale(24),
                                        fontFamily: 'Manrope-Regular',
                                        color: themeColors.textPrimary,
                                    },
                                    strong: {
                                        fontWeight: 'bold',
                                        fontFamily: 'Manrope-Bold',
                                        color: themeColors.textPrimary,
                                    },
                                    u: {
                                        textDecorationLine: 'underline',
                                        color: themeColors.textPrimary,
                                    },
                                    em: {
                                        fontStyle: 'italic',
                                        color: themeColors.textPrimary,
                                    },
                                    img: {
                                        maxWidth: '100%',
                                        height: hp(20),
                                        marginVertical: moderateScale(12)
                                    },
                                    h1: {
                                        fontSize: moderateScale(22),
                                        fontFamily: 'Manrope-Bold',
                                        marginVertical: moderateScale(16),
                                        color: themeColors.textPrimary,
                                    },
                                    h2: {
                                        fontSize: moderateScale(18),
                                        fontFamily: 'Manrope-Bold',
                                        marginVertical: moderateScale(14),
                                        color: themeColors.textPrimary,
                                    },
                                    h3: {
                                        fontSize: moderateScale(16),
                                        fontFamily: 'Manrope-Bold',
                                        marginVertical: moderateScale(12),
                                        color: themeColors.textPrimary,
                                    },
                                    ul: {
                                        marginVertical: moderateScale(8),
                                        paddingLeft: moderateScale(20),
                                        color: themeColors.textPrimary,
                                    },
                                    ol: {
                                        marginVertical: moderateScale(8),
                                        paddingLeft: moderateScale(20),
                                        color: themeColors.textPrimary,
                                    },
                                    li: {
                                        marginVertical: moderateScale(4),
                                        fontSize: moderateScale(14),
                                        fontFamily: 'Manrope-Regular',
                                        color: themeColors.textPrimary,
                                    },
                                    'ql-align-center': {
                                        textAlign: 'center',
                                        color: themeColors.textPrimary,
                                    },
                                    'ql-align-right': {
                                        textAlign: 'right',
                                        color: themeColors.textPrimary,
                                    },
                                    'ql-align-left': {
                                        textAlign: 'left',
                                        color: themeColors.textPrimary,
                                    },
                                    'ql-indent-1': {
                                        marginLeft: moderateScale(20),
                                        color: themeColors.textPrimary,
                                    },
                                    'ql-indent-2': {
                                        marginLeft: moderateScale(40),
                                        color: themeColors.textPrimary,
                                    },
                                    'ql-indent-3': {
                                        marginLeft: moderateScale(60),
                                        color: themeColors.textPrimary,
                                    },
                                }}
                                classesStyles={{
                                    'ql-align-center': {
                                        textAlign: 'center',
                                        color: themeColors.textPrimary,
                                    },
                                    'ql-align-right': {
                                        textAlign: 'right',
                                        color: themeColors.textPrimary,
                                    },
                                    'ql-align-left': {
                                        textAlign: 'left',
                                        color: themeColors.textPrimary,
                                    },
                                    'ql-indent-1': {
                                        paddingLeft: moderateScale(20),
                                        color: themeColors.textPrimary,
                                    },
                                    'ql-indent-2': {
                                        paddingLeft: moderateScale(40),
                                        color: themeColors.textPrimary,
                                    },
                                    'ql-indent-3': {
                                        paddingLeft: moderateScale(60),
                                        color: themeColors.textPrimary,
                                    },
                                }}
                                systemFonts={['System', '-apple-system', 'Roboto', 'Helvetica Neue']}
                                baseFontStyle={{
                                    fontSize: moderateScale(12),
                                    lineHeight: moderateScale(16),
                                    fontFamily: 'Manrope-Regular',
                                    color: themeColors.textPrimary,
                                }}
                                textSelectable={true}
                            />
                        </View>

                        {/* Notes and completion date at bottom */}
                        {!item.is_completed && (
                            <TouchableOpacity
                                style={[styles.feedbackButton, { backgroundColor: themeColors.primary }]}
                                onPress={() => openFeedbackModal(item.topic_id)}
                            >
                                <Text style={[styles.feedbackButtonText, { color: themeColors.white }]}>Provide Feedback</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )
            }}
            ListEmptyComponent={
                <View style={globalstyles.loginContainer}>
                    <Text style={[globalstyles.buttonText, { color: themeColors.textSecondary }]}>No topics available</Text>
                </View>
            }
        />
    );

    // Render assessments tab
    const renderAssessments = () => (
        <AnimatedFlatList
            onScroll={handleScroll}
            scrollEventThrottle={16}
            data={assessments}
            keyExtractor={(item) => item.test_id}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    colors={[themeColors.primary]}
                    tintColor={themeColors.primary}
                    progressBackgroundColor={themeColors.background}
                />
            }
            contentContainerStyle={styles.tabContent}
            renderItem={({ item }) => (
                <View style={[styles.assessmentCard, { backgroundColor: themeColors.card || themeColors.surface }]}>
                    <View style={styles.assessmentHeader}>
                        <View style={styles.assessmentTitleContainer}>
                            <Text style={[globalstyles.textLarge, { color: themeColors.textPrimary }]}>{capitalizeFirstLetter(item.test_name)}</Text>
                            <Text style={[globalstyles.textMedium, { color: themeColors.textSecondary }]}>{item.course_name}</Text>
                        </View>
                        {item.test_completion &&
                            <View style={[styles.statusBadge, { backgroundColor: themeColors.success }]}>
                                <Text style={[styles.statusText, { color: themeColors.white }]}>
                                    Submitted
                                </Text>
                            </View>
                        }
                    </View>

                    <View style={styles.assessmentDetails}>
                        <View style={styles.detailRow}>
                            <Icon name="file-document" size={moderateScale(16)} color={themeColors.textSecondary} />
                            <Text style={[styles.detailText, { color: themeColors.textSecondary }]}>
                                Questions: {item.question_count}
                            </Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Icon name="star" size={moderateScale(16)} color={themeColors.textSecondary} />
                            <Text style={[styles.detailText, { color: themeColors.textSecondary }]}>
                                Total Marks: {item.total_marks}
                            </Text>
                        </View>

                        {(item.description && !item.test_completion) && (
                            <View style={styles.descriptionContainer}>
                                <Text style={[styles.descriptionText, { color: "#000" }]}>
                                    {item.description}
                                </Text>
                            </View>
                        )}
                    </View>

                    {(item.test_completion && item.correction_done) && (
                        <TouchableOpacity
                            style={[styles.viewResultsButton, { backgroundColor: themeColors.primary }]}
                            onPress={() => navigation.navigate("Assessment", {
                                test_id: item.test_id,
                                course: filteredCourse,
                                submitted: true
                            })}
                        >
                            <Text style={[styles.viewResultsText, { color: themeColors.white }]}>View Results</Text>
                        </TouchableOpacity>
                    )}

                    {(!item.test_completion && !item.correction_done) && (
                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                { backgroundColor: themeColors.primary },
                                item.question_count === 0 && { backgroundColor: themeColors.textSecondary }
                            ]}
                            disabled={item.question_count === 0}
                            onPress={() => navigation.navigate("Assessment", { test_id: item.test_id, submitted: false })}
                        >
                            <Text style={[styles.actionButtonText, { color: themeColors.white }]}>
                                {item.question_count === 0 ? 'Not Available' : 'Start Assessment'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
            ListEmptyComponent={
                loading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color={themeColors.primary} />
                    </View>
                ) : (
                    <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>No assessments available</Text>
                )
            }
        />
    );

    // Render exercises tab
    const renderExercises = () => (
        <AnimatedFlatList
            onScroll={handleScroll}
            scrollEventThrottle={16}
            data={exercises}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.tabContent}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    colors={[themeColors.primary]}
                    tintColor={themeColors.primary}
                    progressBackgroundColor={themeColors.background}
                />
            }
            renderItem={({ item }) => {
                return (
                    <TouchableOpacity
                        style={styles.itemContainer}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate("TaskDetail", { itemId: item.id, index: index })}
                    >
                        <Card style={[styles.card, styles.taskCard, { backgroundColor: themeColors.card || themeColors.surface }]}>
                            <Card.Content>
                                <View style={[styles.flexRowBetween, styles.taskHeader]}>
                                    <Text style={[styles.textLarge, styles.taskTitle, { color: themeColors.textPrimary }]}>{item.title}</Text>
                                </View>
                                <Text
                                    style={[styles.taskDescription, styles.minimizedText, { color: themeColors.textSecondary }]}
                                    numberOfLines={2}
                                >
                                    {getLimitedText(item.description)}
                                </Text>
                                {item?.submissions?.length > 0 &&
                                    <View style={styles.dueDateContainer}>
                                        <Chip
                                            icon={() => <MaterialIcons name="comment" size={hp("2%")} color="#FFFFFF" />}
                                            style={[
                                                styles.dueDateChip,
                                                {
                                                    backgroundColor: new Date(item.dueDate) < new Date() &&
                                                        item.status !== 'completed'
                                                        ? themeColors.error
                                                        : themeColors.success
                                                }
                                            ]}
                                            textStyle={[styles.dueDateText, { color: themeColors.white }]}
                                        >
                                            Submissions: {item?.submissions?.length}
                                        </Chip>
                                    </View>}
                            </Card.Content>
                        </Card>
                    </TouchableOpacity >
                )
            }}
            ListEmptyComponent={
                loading ? (
                    <View style={styles.centerContainer} >
                        <ActivityIndicator size="large" color={themeColors.primary} />
                    </View>
                ) : (
                    <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>No exercises available</Text>
                )
            }
        />
    );

    // Map scenes to tabs
    const renderScene = ({ route }) => {
        switch (route.key) {
            case 'syllabus':
                return renderSyllabus();
            case 'topics':
                return renderTopics();
            case 'assessments':
                return renderAssessments();
            case 'exercises':
                return renderExercises();
            default:
                return null;
        }
    };

    // Custom tab bar
    const renderTabBar = props => (
        <TabBar
            {...props}
            indicatorStyle={[styles.tabIndicator, { backgroundColor: themeColors.primary }]}
            style={[styles.tabBar, { backgroundColor: themeColors.card }]}
            tabStyle={styles.tabItem}
            labelStyle={styles.tabLabel}
            activeColor={themeColors.primary}
            inactiveColor={themeColors.textSecondary}
            scrollEnabled={true}
        />
    );

    // Course header component
    const CourseHeader = () => {
        return (
            <View style={styles.courseHeader}>
                <Image
                    source={{ uri: filteredCourse?.course_pic_url }}
                    style={styles.courseImage}
                    resizeMode="cover"
                />
                <View style={[styles.courseOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
                <TouchableOpacity
                    style={styles.courseInfoContainerBackBtn}
                    onPress={() => navigation.goBack()}
                >
                    <SimpleLineIcons name="arrow-left-circle" size={moderateScale(30)} color="#fff" />
                </TouchableOpacity>
                <View style={styles.courseInfoContainer}>
                    <Text style={styles.courseCategory}>{filteredCourse?.course_category}</Text>
                    <Text style={styles.courseName}>{filteredCourse?.course_name}</Text>
                    <View style={styles.courseStats}>
                        <View style={styles.statItem}>
                            <Icon name="clock-outline" size={moderateScale(16)} color="#fff" />
                            <Text style={styles.statText}>{filteredCourse?.duration} month(s)</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Icon name="book-open-page-variant" size={moderateScale(16)} color="#fff" />
                            <Text style={styles.statText}>{filteredCourse?.topic?.length || 0} topics</Text>
                        </View>
                    </View>
                </View>
            </View>
        )
    }

    return (
        <View style={[globalstyles.container, { paddingHorizontal: 0, backgroundColor: themeColors.background }]}>
            <StatusBar barStyle={"light-content"}/>
            <CourseHeader />
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width }}
                renderTabBar={renderTabBar}
                style={styles.tabView}
            />
            <FeedbackModalComponent
                visible={feedbackModalVisible}
                onRequestClose={() => {
                    setFeedbackModalVisible(false);
                    resetFeedbackForm();
                }}
                completionStatus={completionStatus}
                setCompletionStatus={setCompletionStatus}
                rating={rating}
                setRating={setRating}
                feedbackText={feedbackText}
                setFeedbackText={setFeedbackText}
                loading={loading}
                handleFeedback={handleFeedback}
                renderStars={() => renderStars(rating, setRating)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    courseHeader: {
        height: hp('25%'),
        position: 'relative',
    },
    backButton: {
        marginLeft: wp("1%")
    },
    courseImage: {
        width: '100%',
        height: '100%',
    },
    courseOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    courseInfoContainer: {
        position: 'absolute',
        bottom: moderateScale(20),
        left: moderateScale(20),
        right: moderateScale(20),
    },
    courseInfoContainerBackBtn: {
        position: 'absolute',
        top: hp("4.5%"),
        left: moderateScale(20),
        zIndex: 10,
    },
    courseCategory: {
        color: '#fff',
        fontSize: moderateScale(14),
        fontFamily: 'Manrope-Medium',
        marginBottom: moderateScale(5),
    },
    courseName: {
        color: '#fff',
        fontSize: moderateScale(24),
        marginBottom: moderateScale(10),
        fontFamily: 'Manrope-Bold',
    },
    courseStats: {
        flexDirection: 'row',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: moderateScale(15),
    },
    statText: {
        color: '#fff',
        marginLeft: moderateScale(5),
        fontSize: moderateScale(14),
        fontFamily: 'Manrope-Regular',
    },
    tabView: {
        flex: 1,
    },
    tabBar: {
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    tabIndicator: {
        backgroundColor: colors.primary,
        height: 3,
    },
    syllabusCard: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(12),
        padding: moderateScale(20),
        alignItems: 'center',
        marginBottom: moderateScale(20),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: moderateScale(4),
        elevation: 3,
    },
    syllabusTitle: {
        fontSize: moderateScale(20),
        fontFamily: 'Manrope-Bold',
        color: '#1e293b',
        marginVertical: moderateScale(10),
    },
    syllabusDescription: {
        fontSize: moderateScale(14),
        color: '#64748b',
        textAlign: 'center',
        marginBottom: moderateScale(20),
        lineHeight: moderateScale(20),
        fontFamily: 'Manrope-Regular',
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingVertical: moderateScale(12),
        paddingHorizontal: moderateScale(20),
        borderRadius: moderateScale(8),
    },
    downloadButtonText: {
        color: '#fff',
        fontFamily: 'Manrope-Medium',
        marginLeft: moderateScale(8),
        fontSize: moderateScale(14),
    },
    assessmentCard: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(12),
        padding: moderateScale(16),
        marginBottom: moderateScale(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: moderateScale(4),
        elevation: 3,
    },
    assessmentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: moderateScale(12),
    },
    assessmentTitle: {
        fontSize: moderateScale(16),
        fontFamily: 'Manrope-Medium',
        color: '#1e293b',
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: moderateScale(10),
        paddingVertical: moderateScale(4),
        borderRadius: moderateScale(12),
        backgroundColor: colors.success,
        borderRadius: 5
    },
    statusText: {
        color: '#fff',
        fontSize: moderateScale(12),
        fontFamily: 'Manrope-Medium',
    },
    assessmentDetails: {
        marginBottom: moderateScale(16),
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: moderateScale(8),
    },
    detailText: {
        fontSize: moderateScale(14),
        color: '#666',
        marginLeft: moderateScale(8),
        fontFamily: 'Manrope-Regular',
    },
    actionButton: {
        backgroundColor: colors.primary,
        paddingVertical: moderateScale(10),
        borderRadius: moderateScale(8),
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#fff',
        fontFamily: 'Manrope-Medium',
        fontSize: moderateScale(14),
    },
    tabItem: {
        paddingVertical: hp("2%"),
    },
    tabLabel: {
        fontSize: moderateScale(12),
        fontFamily: 'Manrope-Medium',
        textTransform: 'capitalize',
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
    statusChip: {
        borderRadius: 16,
        height: hp("4%"),
        marginRight: 8,
    },
    chipText: {
        fontSize: moderateScale(12),
        fontWeight: '500',
        color: '#FFFFFF',
        fontFamily: 'Manrope-Regular',
    },
    dueDateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    dueDateChip: {
        width: '55%',
        borderRadius: 12,
        height: hp("4%"),
        flexDirection: 'row',
        paddingHorizontal: hp("0.5%"),
        backgroundColor: '#4CAF50'
    },
    dueDateText: {
        color: '#FFFFFF',
        fontSize: moderateScale(14),
        fontWeight: '500',
        textAlign: 'center',
        textAlignVertical: 'center',
        fontFamily: 'Manrope-Regular',
    },
    descriptionContainer: {
        marginTop: moderateScale(8),
        padding: moderateScale(12),
        backgroundColor: '#f8f9fa',
        borderRadius: moderateScale(8),
        borderLeftWidth: 3,
        borderLeftColor: colors.primary,
    },
    descriptionText: {
        fontSize: moderateScale(14),
        color: '#495057',
        fontStyle: 'italic',
        lineHeight: moderateScale(20),
        fontFamily: 'Manrope-Regular',
    },
    disabledButton: {
        backgroundColor: '#95a5a6',
        opacity: 0.7,
    },

    // Feedback Modal Styles
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
        width: '90%',
        maxWidth: 400,
        overflow: "hidden"
    },
    modalTitle: {
        fontSize: moderateScale(20),
        fontFamily: 'Manrope-Bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    question: {
        fontSize: moderateScale(16),
        fontFamily: 'Manrope-Medium',
        marginTop: 16,
        marginBottom: 8,
    },
    hint: {
        fontSize: moderateScale(16),
        fontFamily: 'Manrope-Medium',
        marginBottom: 4,
        marginTop: hp("0.5%"),
        color: "#ddd"
    },
    completionOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    optionButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        marginHorizontal: 4,
        alignItems: 'center',
    },
    optionText: {
        color: '#000',
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 8,
    },
    starSelected: {
        color: '#FFD700',
    },
    ratingText: {
        textAlign: 'center',
        fontSize: moderateScale(16),
        fontFamily: 'Manrope-Regular',
        marginBottom: 16,
    },
    feedbackInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        textAlignVertical: 'top',
        marginBottom: 20,
        minHeight: 100,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
    },
    submitButton: {
        backgroundColor: colors.primary,
    },
    cancelButtonText: {
        color: '#000',
    },
    submitButtonText: {
        color: '#fff',
        fontFamily: 'Manrope-Medium',
    },
    tabContent: {
        flexGrow: 1,
        padding: moderateScale(16),
        paddingBottom: hp("8%")
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: hp('20%'),
        padding: moderateScale(20),
    },
    emptyText: {
        textAlign: 'center',
        // color: '#666',
        fontSize: moderateScale(16),
        marginTop: hp('5%'),
        fontFamily: 'Manrope-Regular',
    },
    viewResultsButton: {
        backgroundColor: colors.primary,
        paddingVertical: moderateScale(11),
        paddingHorizontal: moderateScale(16),
        borderRadius: moderateScale(6),
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: hp("1%")
    },
    viewResultsText: {
        color: '#fff',
        fontSize: moderateScale(14),
        fontFamily: 'Manrope-Medium',
    },
    topicCard: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(12),
        padding: moderateScale(16),
        marginVertical: moderateScale(8),
        marginHorizontal: moderateScale(2),
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: moderateScale(4),
        elevation: 3,
    },
    topicHeader: {
        flexDirection: "row",
        // justifyContent: "center",
        gap: hp("1%"),
        marginBottom: moderateScale(12),
        // paddingHorizontal: hp("1%"),
        paddingVertical: hp("1%"),
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    topicNumber: {
        width: moderateScale(30),
        height: moderateScale(30),
        borderRadius: moderateScale(15),
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        // marginRight: moderateScale(12),
        // backgroundColor: '#3b82f6',
    },
    topicNumberText: {
        color: '#fff',
        fontSize: moderateScale(16),
        fontFamily: 'Manrope-Bold',
    },
    topicTitle: {
        flex: 1,
        fontSize: moderateScale(16),
        fontFamily: 'Manrope-Bold',
        color: '#1e293b',

    },
    ratingContainer: {
        paddingTop: hp("1%")
        // position: 'absolute',
        // bottom: hp("1%"),
        // right: hp("1%"),
        // alignItems: 'flex-end',
    },
    starContainer: {
        flexDirection: 'row',
    },
    star: {
        fontSize: moderateScale(40),
        marginHorizontal: moderateScale(1),
        color: '#ddd',
        fontFamily: 'Manrope-Regular',
    },
    filledStar: {
        color: '#fbbf24', // Amber color for filled stars
    },
    emptyStar: {
        color: '#d1d5db', // Gray color for empty stars
    },
    topicContent: {
        marginBottom: moderateScale(5),
    },
    topicDescription: {
        fontSize: moderateScale(16),
        lineHeight: moderateScale(24),
        color: '#374151',
        //    color: '#64748b',
        fontFamily: 'Manrope-Regular',
    },
    feedbackButton: {
        backgroundColor: colors.primary,
        // backgroundColor: '#3b82f6',
        paddingVertical: moderateScale(12),
        paddingHorizontal: moderateScale(24),
        borderRadius: moderateScale(8),
        alignItems: 'center',
        marginTop: moderateScale(1),
    },
    feedbackButtonText: {
        fontSize: moderateScale(16),
        color: '#fff',
        fontFamily: 'Manrope-SemiBold',
    },
});

export default CourseDetailsScreen;