import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Button, Card, Text, TextInput, RadioButton, Divider } from 'react-native-paper';
import { colors, globalstyles } from '../../utils/globalStyles';
import { hp, moderateScale, wp } from '../../utils/responsive';
import { SafeAreaView } from 'react-native-safe-area-context';

const SubmitAssignmentScreen = ({ navigation, route }) => {
    const { classId } = route.params;
    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // Dummy professional questions from API
    const questions = [
        {
            id: 1,
            type: 'scale',
            question: "How would you rate the difficulty level of this class?",
            options: ["Very Easy", "Easy", "Moderate", "Difficult", "Very Difficult"]
        },
        {
            id: 2,
            type: 'radio',
            question: "Did the class meet your expectations?",
            options: ["Yes, completely", "Somewhat", "Not really", "Not at all"]
        },
        {
            id: 3,
            type: 'text',
            question: "What was the most valuable thing you learned in this class?"
        },
        {
            id: 4,
            type: 'text',
            question: "Any suggestions for improving this class?"
        },
        {
            id: 5,
            type: 'scale',
            question: "How likely are you to recommend this class to others?",
            options: ["Very Unlikely", "Unlikely", "Neutral", "Likely", "Very Likely"]
        }
    ];

    const handleAnswerChange = (questionId, value) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const handleSubmit = () => {
        setSubmitting(true);
        // Simulate API submission
        setTimeout(() => {
            setSubmitting(false);
            navigation.goBack(); // Return to classes page
        }, 1500);
    };

    const renderQuestion = ({ item }) => (
        <View style={styles.questionWrapper}>
            <Card style={[globalstyles.card, styles.card]}>
                <Card.Content>
                    <Text style={[globalstyles.textMedium, styles.questionText]}>{item.question}</Text>

                    {item.type === 'text' ? (
                        <TextInput
                            mode="outlined"
                            multiline
                            numberOfLines={4}
                            minHeight={hp('10%')}
                            value={answers[item.id] || ''}
                            onChangeText={(text) => handleAnswerChange(item.id, text)}
                            style={[styles.textInput, { height: Math.max(hp('10%'), 80) }]}
                            theme={{ roundness: 10 }}
                        />
                    ) : (
                        <RadioButton.Group
                            onValueChange={(value) => handleAnswerChange(item.id, value)}
                            value={answers[item.id] || ''}
                        >
                            {item.options.map((option, index) => (
                                <View key={index} style={styles.radioOption}>
                                    <RadioButton value={option} />
                                    <Text style={globalstyles.textMedium}>{option}</Text>
                                </View>
                            ))}
                        </RadioButton.Group>
                    )}
                </Card.Content>
            </Card>
        </View>
    );

    return (
        <SafeAreaView style={[globalstyles.container, { padding: wp('4%') }]}>
            <View style={styles.headerContainer}>
                <Text style={[globalstyles.header, styles.header]}>Class Feedback</Text>
                <Text style={[globalstyles.subheader, styles.subheaderText]}>
                    Please help us improve by answering these questions
                </Text>
            </View>

            <Divider style={styles.divider} />

            <FlatList
                data={questions}
                renderItem={renderQuestion}
                keyExtractor={item => item.id.toString()}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={
                    <Button
                        mode="contained"
                        onPress={handleSubmit}
                        style={[globalstyles.button, styles.submitButton]}
                        labelStyle={globalstyles.buttonText}
                        loading={submitting}
                        disabled={submitting}
                        contentStyle={{ height: hp('6%') }}
                    >
                        Submit Feedback
                    </Button>
                }
                contentContainerStyle={styles.listContent}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        marginBottom: hp('1%'),
    },
    questionWrapper: {
        marginBottom: hp('2%'),
    },
    card: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    header: {
        marginBottom: hp('0.5%'),
    },
    subheaderText: {
        color: colors.textSecondary,
    },
    divider: {
        marginVertical: hp('2%'),
        backgroundColor: colors.divider,
        height: 1,
    },
    questionText: {
        marginBottom: hp('2%'),
        fontFamily: 'Manrope-Medium',
        color: colors.textPrimary,
    },
    textInput: {
        backgroundColor: '#fff',
        fontSize: moderateScale(16),
        lineHeight: 22,
        fontFamily: 'Manrope-Regular',
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: hp('0.5%'),
    },
    submitButton: {
        marginTop: hp('2%'),
        borderRadius: 8,
    },
    listContent: {
        paddingBottom: hp('4%'),
    },
});

export default SubmitAssignmentScreen;