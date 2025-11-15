import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    FlatList,
    Platform,
    StatusBar
} from 'react-native';
import { hp, moderateScale } from '../../utils/responsive';
import { getAssessment, getResults } from '../../services/auth';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFooterVisibility } from '../../hook/useFooterVisibility';
import api from '../../services/api';
import { API_BASE_URL } from '@env'
import { useSelector } from 'react-redux';
import { navigate } from '../../navigation/RootNavigation';
import { globalstyles } from '../../utils/globalStyles';
import Toast from 'react-native-toast-message';
import { useAppTheme } from '../../hook/useAppTheme';
import { useNavigation } from '@react-navigation/native';

// Custom RadioButton component
const RadioButton = ({ selected, onPress, style }) => {
    const { colors: themeColors, isDark } = useAppTheme();

    return (
        <TouchableOpacity style={[styles.radioButton, style]} onPress={onPress}>
            {selected ? <View style={[styles.radioButtonSelected, { backgroundColor: themeColors.primary }]} /> : null}
        </TouchableOpacity>
    );
};

const Assessment = ({ route }) => {
    useFooterVisibility()
    const { test_id, submitted } = route.params || {};
    const [answers, setAnswers] = useState({});
    const [assessments, setAssessments] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [startTime, setStartTime] = useState(new Date());
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const { studentProfile, user, token, globalCourseId } = useSelector(state => state.auth);
    const { colors: themeColors, isDark } = useAppTheme();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation()

    useEffect(() => {
        checkExistingResults();
        fetchAssessments();
    }, []);

    const fetchAssessments = async () => {
        setLoading(true);
        try {
            const response = await getAssessment(globalCourseId);
            const matchedResults = response.tests.find((item) => item.test_id === test_id);
            setAssessments(matchedResults);
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.message || 'Failed to load data. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    const checkExistingResults = async () => {
        if (!submitted) return
        try {
            setLoading(true);
            const response = await getResults(test_id, user.student_id);

            if (response && response.success) {
                setResult(response);
                setHasSubmitted(true);

                // Pre-fill answers from existing results
                if (response.questions) {
                    const existingAnswers = {};
                    response.questions.forEach(question => {
                        if (question.student_answer) {
                            existingAnswers[question.question_id] = question.student_answer;
                        }
                    });
                    setAnswers(existingAnswers);
                }
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Upload Failed',
                text2: error.response?.data?.message || 'Failed to load data. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    useFooterVisibility();

    const handleAnswerChange = (questionId, answer) => {
        if (submitted) {
            Toast.show({
                type: 'error',
                text1: 'Cannot Modify',
                text2: 'You have already submitted this assessment'
            });
            return;
        }

        setAnswers(prev => {
            const newAnswers = { ...prev };

            if (answer === '') {
                delete newAnswers[questionId];
            } else {
                newAnswers[questionId] = answer;
            }

            return newAnswers;
        });
    };

    const isValidAnswer = (answer) => {
        return answer && answer.trim() !== '';
    };

    // Helper function to get validation style for written answers
    const getAnswerValidationStyle = (answer) => {
        if (!answer) return null;

        const trimmed = answer.trim();
        if (trimmed === '') {
            return {
                borderColor: themeColors.error,
                backgroundColor: themeColors.error + '10'
            };
        }

        return null;
    };

    // Function to get result for a specific question
    const getQuestionResult = (questionId) => {
        if (!result || !result.questions) return null;
        return result.questions.find(q => q.question_id === questionId);
    };

    const renderQuestion = (question, index) => {
        const questionResult = getQuestionResult(question.question_id);
        const isSubmitted = submitted && !!questionResult;

        switch (question.type) {
            case 'mcq':
                return renderMCQ(question, index, submitted, questionResult);
            case 'written':
                return renderWritten(question, index, submitted, questionResult);
            default:
                return renderDefault(question, index, submitted, questionResult);
        }
    };

    const renderMCQ = (question, index, isSubmitted, questionResult) => {
        const isCorrect = questionResult?.is_correct;
        const studentAnswer = answers[question.question_id] || questionResult?.student_answer;

        return (
            <View key={question.question_id} style={[
                styles.questionContainer,

                isSubmitted && (isCorrect ? styles.correctAnswer : styles.incorrectAnswer),
                isSubmitted && isCorrect && { borderColor: themeColors.success },
                isSubmitted && !isCorrect && { borderColor: themeColors.error },
                {
                    backgroundColor: themeColors.card,
                    borderColor: themeColors.lightGray
                },
            ]}>
                <View style={styles.questionHeader}>
                    <Text style={[styles.questionNumber, { color: themeColors.textPrimary }]}>
                        Question {index + 1}
                    </Text>
                    {isSubmitted && (
                        <View style={[
                            styles.statusIndicator,
                            isCorrect ? styles.correctIndicator : styles.incorrectIndicator,
                            isCorrect ? { backgroundColor: themeColors.success + '20' } : { backgroundColor: themeColors.error + '20' }
                        ]}>
                            <Text style={[
                                styles.statusText,
                                isCorrect ? { color: themeColors.success } : { color: themeColors.error }
                            ]}>
                                {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                            </Text>
                        </View>
                    )}
                </View>

                <Text style={[styles.questionText, { color: themeColors.textPrimary }]}>
                    {question.question}
                    <Text style={[globalstyles.asterisk, { color: themeColors.error }]}>*</Text>
                </Text>

                <View style={styles.optionsContainer}>
                    {question.options.map((option, optionIndex) => {
                        const isSelected = studentAnswer === option;
                        const isCorrectOption = isSubmitted && option === questionResult?.correct_answer;

                        return (
                            <TouchableOpacity
                                key={optionIndex}
                                style={[
                                    styles.optionRow,
                                    {
                                        backgroundColor: themeColors.background,
                                        borderColor: themeColors.lightGray
                                    },
                                    isSelected && { backgroundColor: themeColors.primary + '20' },
                                    isCorrectOption && { backgroundColor: themeColors.success + '20' },
                                    isSubmitted && styles.optionRowDisabled
                                ]}
                                onPress={() => handleAnswerChange(question.question_id, option)}
                                disabled={isSubmitted}
                            >
                                <RadioButton
                                    selected={isSelected}
                                    onPress={() => handleAnswerChange(question.question_id, option)}
                                    style={[
                                        { borderColor: themeColors.primary },
                                        isCorrectOption && { borderColor: themeColors.success },
                                        isSelected && !isCorrect && isSubmitted && { borderColor: themeColors.error }
                                    ]}
                                />
                                <Text style={[
                                    styles.optionText,
                                    { color: themeColors.textPrimary },
                                    isCorrectOption && [styles.correctOptionText, { color: themeColors.success }],
                                    isSelected && !isCorrect && isSubmitted && [styles.incorrectOptionText, { color: themeColors.error }]
                                ]}>
                                    {option}
                                    {isCorrectOption && " ✓"}
                                    {isSelected && !isCorrect && isSubmitted && " ✗"}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {submitted && questionResult?.correct_answer && (
                    <View style={[styles.correctAnswerContainer, { backgroundColor: themeColors.success + '20' }]}>
                        <Text style={[styles.correctAnswerLabel, { color: themeColors.success }]}>
                            Correct Answer:
                        </Text>
                        <Text style={[styles.correctAnswerText, { color: themeColors.success }]}>
                            {questionResult.correct_answer}
                        </Text>
                    </View>
                )}

                <Text style={[styles.marksText, { color: themeColors.textSecondary }]}>
                    Marks: {question.marks}
                    {submitted && questionResult?.marks !== undefined &&
                        ` (Awarded: ${questionResult.marks})`
                    }
                </Text>
            </View>
        );
    };

    const renderWritten = (question, index, isSubmitted, questionResult) => {
        const isCorrect = questionResult?.is_correct;
        const studentAnswer = answers[question.question_id] || questionResult?.student_answer;

        return (
            <View key={question.question_id} style={[
                styles.questionContainer,

                isSubmitted && (isCorrect ? styles.correctAnswer : styles.incorrectAnswer),
                isSubmitted && isCorrect && { borderColor: themeColors.success },
                isSubmitted && !isCorrect && { borderColor: themeColors.error },
                {
                    backgroundColor: themeColors.card,
                    borderColor: themeColors.lightGray
                },
            ]}>
                <View style={styles.questionHeader}>
                    <Text style={[styles.questionNumber, { color: themeColors.textPrimary }]}>
                        Question {index + 1}
                    </Text>
                    {isSubmitted && (
                        <View style={[
                            styles.statusIndicator,
                            isCorrect ? styles.correctIndicator : styles.incorrectIndicator,
                            isCorrect ? { backgroundColor: themeColors.success + '20' } : { backgroundColor: themeColors.error + '20' }
                        ]}>
                            <Text style={[
                                styles.statusText,
                                isCorrect ? { color: themeColors.success } : { color: themeColors.error }
                            ]}>
                                {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                            </Text>
                        </View>
                    )}
                </View>

                <Text style={[styles.questionText, { color: themeColors.textPrimary }]}>
                    {question.question}
                </Text>

                <TextInput
                    style={[
                        styles.textInput,
                        {
                            backgroundColor: themeColors.background,
                            borderColor: themeColors.lightGray,
                            color: themeColors.textPrimary
                        },
                        isSubmitted && isCorrect && {
                            borderColor: themeColors.success,
                            backgroundColor: themeColors.success + '20'
                        },
                        isSubmitted && !isCorrect && {
                            borderColor: themeColors.error,
                            backgroundColor: themeColors.error + '20'
                        },
                        !isSubmitted && getAnswerValidationStyle(studentAnswer) // Add real-time validation styling
                    ]}
                    multiline
                    numberOfLines={4}
                    placeholder="Type your answer here..."
                    placeholderTextColor={themeColors.textSecondary}
                    value={studentAnswer || ''}
                    onChangeText={(text) => handleAnswerChange(question.question_id, text)}
                    editable={!isSubmitted}
                />

                {isSubmitted && questionResult?.correct_answer && (
                    <View style={[styles.correctAnswerContainer, { backgroundColor: themeColors.success + '20' }]}>
                        <Text style={[styles.correctAnswerLabel, { color: themeColors.success }]}>
                            Correct Answer:
                        </Text>
                        <Text style={[styles.correctAnswerText, { color: themeColors.success }]}>
                            {questionResult.correct_answer}
                        </Text>
                    </View>
                )}

                <Text style={[styles.marksText, { color: themeColors.textSecondary }]}>
                    Marks: {question.marks}
                    {isSubmitted && questionResult?.marks !== undefined &&
                        ` (Awarded: ${questionResult.marks})`
                    }
                </Text>
            </View>
        );
    };

    const renderDefault = (question, index, isSubmitted, questionResult) => {

        return (
            <View key={question.question_id} style={[
                styles.questionContainer,
                {
                    backgroundColor: themeColors.card,
                    borderColor: themeColors.lightGray
                }
            ]}>
                <Text style={[styles.questionNumber, { color: themeColors.textPrimary }]}>
                    Question {index + 1}
                </Text>
                <Text style={[styles.questionText, { color: themeColors.textPrimary }]}>
                    {question.question}
                </Text>
                <Text style={[styles.unsupportedText, { color: themeColors.textSecondary }]}>
                    Unsupported question type
                </Text>
                <Text style={[styles.marksText, { color: themeColors.textSecondary }]}>
                    Marks: {question.marks}
                </Text>
            </View>
        );
    };

    const calculateProgress = () => {
        const answered = Object.keys(answers).length;
        return `${answered}/${assessments?.questions?.length || 0}`;
    };

    const handleSubmit = useCallback(async () => {
        if (submitted) {
            Toast.show({
                type: 'error',
                text1: 'Already Submitted',
                text2: 'You have already submitted this assessment'
            });
            return;
        }

        // Trim all answers and filter out empty ones
        const trimmedAnswers = {};
        Object.keys(answers).forEach(questionId => {
            const trimmedAnswer = answers[questionId]?.trim();
            if (trimmedAnswer && trimmedAnswer !== '') {
                trimmedAnswers[questionId] = trimmedAnswer;
            }
        });

        // Check if all questions have non-empty answers after trimming
        if (Object.keys(trimmedAnswers).length !== assessments?.questions?.length) {
            Toast.show({
                type: 'error',
                text1: 'Incomplete Assessment',
                text2: 'Please provide valid answers for all questions before submitting'
            });
            return;
        }

        try {
            setSubmitting(true);

            if (!user) {
                setError('User information not available');
                return;
            }

            if (!assessments) {
                setError('Assessment not found');
                return;
            }

            const totalTimeTaken = Math.floor((new Date() - startTime) / 1000);

            const answersData = assessments?.questions?.map((question) => {
                const answer = trimmedAnswers[question.question_id]; // Use trimmed answers
                return {
                    student_id: user.student_id,
                    question_id: question.question_id,
                    test_id: assessments.test_id,
                    ...(question.type === 'written' && { written_answer: answer }),
                    ...(question.type === 'mcq' && { selected_option: answer }),
                    marks: question.marks,
                    time_taken: totalTimeTaken
                };
            });

            const response = await api.post(`${API_BASE_URL}/api/answers`, answersData);
                console.log("answers response" ,response )
            if (response.data.success) {
                console.log("response.data", response.data)
                // Fetch and display results
                const resultsResponse = await getResults(test_id, user.student_id);
                setResult(resultsResponse);
                setHasSubmitted(true);

                Toast.show({
                    type: 'success',
                    text1: 'Submitted',
                    text2: 'Assessment completed successfully'
                });
                navigation.goBack()
            } else {
                setError('Failed to submit answers. Please try again.');
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Error submitting assessment'
                });
            }
        } catch (err) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Error submitting assessment'
            });
            setError('An error occurred while submitting your answers. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }, [answers, assessments, user, submitted]);
    // Loading state
    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={themeColors.primary} />
                    <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>
                        Loading assessment...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // Show results summary if submitted
    const renderResultsSummary = () => {
        if (!submitted) return null;

        return (
            <View style={[styles.resultsSummary, { backgroundColor: themeColors.primary + '20' }]}>
                <Text style={[styles.summaryTitle, { color: themeColors.primary }]}>
                    Assessment Results
                </Text>
                <View style={styles.summaryRow}>
                    <Text style={[styles.summaryText, { color: themeColors.textPrimary }]}>
                        Questions: {result?.questions?.length || 0}
                    </Text>
                    <Text style={[styles.summaryText, { color: themeColors.textPrimary }]}>
                        Correct: {result?.questions?.filter(q => q.is_correct).length || 0}/{result?.questions?.filter(q => q).length || 0}
                    </Text>
                </View>
                <Text style={[styles.summarySubtitle, { color: themeColors.textSecondary }]}>
                    You can review your answers below:
                </Text>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            {/* Header */}
            <View style={[styles.header, {
                backgroundColor: themeColors.surface,
                borderBottomColor: themeColors.lightGray
            }]}>
                <Text style={[styles.testTitle, { color: themeColors.textPrimary }]}>
                    {assessments?.test_name}
                </Text>
                <Text style={[styles.testDescription, { color: themeColors.textSecondary }]}>
                    {assessments?.description}
                </Text>

                <View style={styles.testInfo}>
                    <View style={styles.infoItem}>
                        <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>
                            Total Marks:
                        </Text>
                        <Text style={[styles.infoValue, { color: themeColors.textPrimary }]}>
                            {assessments?.total_marks}
                        </Text>
                    </View>
                    {!submitted && (
                        <View style={styles.infoItem}>
                            <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>
                                Progress:
                            </Text>
                            <Text style={[styles.infoValue, { color: themeColors.textPrimary }]}>
                                {calculateProgress()}
                            </Text>
                        </View>
                    )}
                    {submitted && (
                        <View style={styles.infoItem}>
                            <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>
                                Your Score:
                            </Text>
                            <Text style={[styles.infoValue, { color: themeColors.textPrimary }]}>
                                {result?.score}/{assessments?.total_marks}
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Results Summary */}
            {renderResultsSummary()}

            {/* Questions List */}
            <FlatList
                data={assessments?.questions}
                style={styles.questionsScrollView}
                renderItem={({ item, index }) => renderQuestion(item, index)}
            />

            {/* Submit Button (only show if not submitted) */}
            {!submitted && (
                <View style={[styles.footer, { borderTopColor: themeColors.lightGray, paddingBottom: Platform.OS === 'ios' ? insets.bottom : moderateScale(8) }]}>
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            { backgroundColor: themeColors.primary },
                            (Object.keys(answers).length !== assessments?.questions?.length || submitting) && [
                                styles.submitButtonDisabled,
                                { backgroundColor: themeColors.textSecondary }
                            ]
                        ]}
                        onPress={handleSubmit}
                        disabled={Object.keys(answers).length !== assessments?.questions?.length || submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator color={themeColors.white} />
                        ) : (
                            <Text style={[styles.submitButtonText, { color: themeColors.white }]}>
                                Submit Assessment ({calculateProgress()})
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        padding: moderateScale(16),
        backgroundColor: '#f8f9fa',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    testTitle: {
        fontSize: moderateScale(20),
        fontFamily: 'Manrope-Bold',
        color: '#333',
        marginBottom: moderateScale(4),
    },
    testDescription: {
        fontSize: moderateScale(14),
        color: '#666',
        fontFamily: 'Manrope-Regular',
        marginBottom: moderateScale(12),
    },
    testInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    infoItem: {
        flexDirection: 'row',
    },
    infoLabel: {
        fontSize: moderateScale(14),
        color: '#666',
        marginRight: moderateScale(4),
        fontFamily: 'Manrope-Regular',
    },
    infoValue: {
        fontSize: moderateScale(14),
        fontWeight: 'bold',
        color: '#333',
        fontFamily: 'Manrope-Bold',
    },
    questionsScrollView: {
        flex: 1,
        padding: moderateScale(16),
        marginBottom: hp("5%")
        // backgroundColor: "#000"
    },
    questionContainer: {
        marginBottom: moderateScale(20),
        padding: moderateScale(16),
        backgroundColor: '#fff',
        borderRadius: moderateScale(8),
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    correctAnswer: {
        borderColor: '#28a745',
        backgroundColor: '#f8fff9',
    },
    incorrectAnswer: {
        borderColor: '#dc3545',
        backgroundColor: '#fff8f8',
    },
    questionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: moderateScale(8),
    },
    statusIndicator: {
        paddingHorizontal: moderateScale(8),
        paddingVertical: moderateScale(4),
        borderRadius: moderateScale(12),
    },
    correctIndicator: {
        backgroundColor: '#d4edda',
    },
    incorrectIndicator: {
        backgroundColor: '#f8d7da',
    },
    statusText: {
        fontSize: moderateScale(12),
        fontFamily: 'Manrope-Bold',
    },
    questionNumber: {
        fontSize: moderateScale(16),
        fontFamily: 'Manrope-Bold',
        color: '#333',
        marginBottom: moderateScale(8),
    },
    questionText: {
        fontSize: moderateScale(16),
        color: '#030303ff',
        marginBottom: moderateScale(12),
        fontFamily: 'Manrope-Regular',
    },
    optionsContainer: {
        marginBottom: moderateScale(12),
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: moderateScale(8),
        padding: moderateScale(8),
        borderRadius: moderateScale(4),
    },
    optionRowDisabled: {
        opacity: 0.9,
    },
    selectedOption: {
        backgroundColor: '#e3f2fd',
    },
    correctOption: {
        backgroundColor: '#d4edda',
    },
    radioButton: {
        width: moderateScale(20),
        height: moderateScale(20),
        borderRadius: moderateScale(10),
        borderWidth: 2,
        borderColor: '#007bff',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: moderateScale(8),
    },
    correctRadioButton: {
        borderColor: '#28a745',
    },
    incorrectRadioButton: {
        borderColor: '#dc3545',
    },
    radioButtonSelected: {
        width: moderateScale(10),
        height: moderateScale(10),
        borderRadius: moderateScale(5),
        backgroundColor: '#007bff',
    },
    optionText: {
        fontSize: moderateScale(14),
        color: '#333',
        flex: 1,
        fontFamily: 'Manrope-Regular',
    },
    correctOptionText: {
        color: '#155724',
        fontFamily: 'Manrope-Regular',
    },
    incorrectOptionText: {
        color: '#721c24',
        fontFamily: 'Manrope-Regular',
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: moderateScale(4),
        padding: moderateScale(8),
        textAlignVertical: 'top',
        minHeight: moderateScale(100),
        marginBottom: moderateScale(12),
    },
    correctTextInput: {
        borderColor: '#28a745',
        backgroundColor: '#d4edda',
    },
    incorrectTextInput: {
        borderColor: '#dc3545',
        backgroundColor: '#f8d7da',
    },
    correctAnswerContainer: {
        marginTop: moderateScale(8),
        padding: moderateScale(8),
        backgroundColor: '#d4edda',
        borderRadius: moderateScale(4),
    },
    correctAnswerLabel: {
        fontSize: moderateScale(12),
        fontFamily: 'Manrope-Bold',
        color: '#155724',
        marginBottom: moderateScale(2),
    },
    correctAnswerText: {
        fontSize: moderateScale(14),
        color: '#155724',
        fontFamily: 'Manrope-Regular',
    },
    marksText: {
        fontSize: moderateScale(12),
        color: '#666',
        fontFamily: 'Manrope-Regular',
        fontStyle: 'italic',
    },
    resultsSummary: {
        padding: moderateScale(16),
        backgroundColor: '#e3f2fd',
        margin: moderateScale(16),
        borderRadius: moderateScale(8),
    },
    summaryTitle: {
        fontSize: moderateScale(18),
        fontFamily: 'Manrope-Bold',
        color: '#1976d2',
        marginBottom: moderateScale(8),
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: moderateScale(8),
    },
    summaryText: {
        fontSize: moderateScale(14),
        fontFamily: 'Manrope-Bold',
        color: '#333',
    },
    summarySubtitle: {
        fontSize: moderateScale(12),
        color: '#666',
        fontStyle: 'italic',
        fontFamily: 'Manrope-Regular',
    },
    footer: {
        padding: moderateScale(16),
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
    },
    submitButton: {
        backgroundColor: '#059669',
        padding: moderateScale(16),
        borderRadius: moderateScale(8),
        alignItems: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: '#9ca3af',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: moderateScale(16),
        fontFamily: 'Manrope-Bold',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: moderateScale(20),
    },
    loadingText: {
        marginTop: moderateScale(16),
        fontSize: moderateScale(16),
        color: '#666',
        fontFamily: 'Manrope-Regular',
    },
    errorText: {
        fontSize: moderateScale(16),
        color: '#dc3545',
        textAlign: 'center',
        fontFamily: 'Manrope-Regular',
        marginBottom: moderateScale(16),
    },
});

export default Assessment;