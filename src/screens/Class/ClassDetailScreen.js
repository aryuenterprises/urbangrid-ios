import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Image, ScrollView } from 'react-native';
import { List, Avatar, Button, Card, Title, Paragraph, Text, Chip } from 'react-native-paper';
import api from '../../services/api';
import { colors, globalstyles } from '../../utils/globalStyles';
import { hp, moderateScale, wp } from '../../utils/responsive';
import { SafeAreaView } from 'react-native-safe-area-context';

const ClassDetailScreen = ({ navigation, route }) => {
  const [classDetails, setClassDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedCourses, setRelatedCourses] = useState([]);

  const dummyData = {
    classDetails: {
      id: 1,
      name: "Advanced Mathematics",
      description: "Master advanced mathematical concepts including calculus, linear algebra, and differential equations with our comprehensive course collection.",
      banner_image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      course_count: 4,
      student_count: 1250,
      created_at: "2023-01-15T00:00:00.000Z",
      updated_at: "2023-06-20T00:00:00.000Z"
    },
    relatedCourses: [
      {
        id: 101,
        class_id: 1,
        title: "Calculus Fundamentals",
        short_description: "Learn the basics of differential and integral calculus",
        description: "This course covers all fundamental concepts of calculus including limits, derivatives, and integrals with practical applications.",
        image: "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
        duration: 30,
        meetLink: 'https://meet.google.com/abc-xyz-123',
        price: 89.99,
        instructor: "Dr. Sarah Johnson",
        level: "Intermediate",
        created_at: "2023-02-10T00:00:00.000Z"
      },
      {
        id: 102,
        class_id: 1,
        title: "Linear Algebra Mastery",
        short_description: "Comprehensive guide to vectors, matrices and linear transformations",
        description: "Master linear algebra concepts including vector spaces, matrix operations, eigenvalues, and eigenvectors with real-world applications.",
        image: "https://images.unsplash.com/photo-1636389868477-c2b5348451a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
        duration: 25,
        meetLink: 'https://meet.google.com/abc-xyz-123',
        price: 79.99,
        instructor: "Prof. Michael Chen",
        level: "Intermediate",
        created_at: "2023-03-05T00:00:00.000Z"
      },
      {
        id: 103,
        class_id: 1,
        title: "Differential Equations",
        short_description: "Solve ordinary and partial differential equations",
        description: "Learn techniques for solving various types of differential equations with applications in physics and engineering.",
        image: "https://images.unsplash.com/photo-1624953587687-daf255b6b80a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
        duration: 35,
        meetLink: 'https://meet.google.com/abc-xyz-123',
        price: 99.99,
        instructor: "Dr. Robert Williams",
        level: "Advanced",
        created_at: "2023-04-15T00:00:00.000Z"
      },
      {
        id: 104,
        class_id: 1,
        title: "Mathematical Proofs",
        short_description: "Learn proof techniques and mathematical reasoning",
        description: "Develop your ability to construct and understand mathematical proofs across various domains of mathematics.",
        image: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
        duration: 20,
        meetLink: 'https://meet.google.com/abc-xyz-123',
        price: 69.99,
        instructor: "Prof. Emily Davis",
        level: "Beginner",
        created_at: "2023-05-20T00:00:00.000Z"
      }
    ]
  };

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        const { id } = route.params;
        const [classResponse, coursesResponse] = await Promise.all([
          api.get(`/api/classes/${id}`),
          api.get(`/api/courses?class_id=${id}`)
        ]);

        setClassDetails(classResponse.data);
        setRelatedCourses(coursesResponse.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchClassDetails();
  }, [route.params]);

  const renderCourseItem = ({ item }) => (
    <Card style={[styles.horizontalCourseCard]}>
      {item.image && (
        <Card.Cover source={{ uri: item.image }} style={styles.horizontalCourseImage} />
      )}
      <Card.Content style={styles.horizontalCourseContent}>
        <Text style={[globalstyles.textMedium, styles.courseTitle]} numberOfLines={1}>{item.title}</Text>
        <Text style={[globalstyles.textSmall, styles.courseDesc]} numberOfLines={2}>{item.short_description}</Text>

        <View style={[globalstyles.flexRow, styles.courseMeta]}>
          <Chip icon="clock" style={styles.smallChip} textStyle={styles.smallChipText}>
            {item.duration}h
          </Chip>
          <Chip icon="star" style={styles.smallChip} textStyle={styles.smallChipText}>
            {item.rating || '4.5'}
          </Chip>
        </View>

        <View style={[globalstyles.flexRowBetween, styles.priceContainer]}>
          <Text style={styles.price}>${item.price || '99.99'}</Text>
          <Button
            mode="contained"
            style={styles.enrollButton}
            labelStyle={styles.enrollButtonText}
            onPress={() => navigation.navigate('PurchaseCourse', { id: item.id })}
          >
            Enroll
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={globalstyles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={globalstyles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollViewContent} // Add this
      >
        {/* Class Header Section */}
        <Card style={[globalstyles.card, styles.classHeader]}>
          {dummyData.classDetails.banner_image && (
            <Card.Cover source={{ uri: dummyData.classDetails.banner_image }} style={styles.bannerImage} />
          )}
          <Card.Content>
            <Text style={[globalstyles.header, styles.classTitle]}>{dummyData.classDetails.name}</Text>
            <Text style={globalstyles.subheader}>{dummyData.classDetails.description}</Text>

            <View style={[globalstyles.flexRow, styles.classStats]}>
              <Chip icon="book" style={styles.chip}>
                Join now
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Related Courses Section */}
        <View style={styles.sectionHeader}>
          <Text style={globalstyles.sectionTitle}>Available Courses</Text>
        </View>

        <View style={styles.horizontalScrollContainer}>
          <FlatList
            data={dummyData.relatedCourses}
            renderItem={renderCourseItem}
            keyExtractor={item => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            ItemSeparatorComponent={() => <View style={{ width: wp('4%') }} />}
          />
        </View>

        {/* Add bottom spacing */}
        <View style={{ height: hp('5%') }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    paddingBottom: hp('0%'), // Add bottom padding to the entire content
  },
  classHeader: {
    marginBottom: hp('2%'),
  },
  bannerImage: {
    height: hp('20%'),
    borderTopLeftRadius: hp('1%'),
    borderTopRightRadius: hp('1%'),
  },
  classTitle: {
    marginTop: hp('1%'),
  },
  classStats: {
    marginTop: hp('1%'),
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: wp('2%'),
    marginBottom: hp('0.5%'),
    backgroundColor: '#f0f0f0',
  },
  sectionHeader: {
    ...globalstyles.sectionHeader,
    marginBottom: hp('1%'),
  },

  // Horizontal scroll styles
  horizontalScrollContainer: {
    height: hp('35%'),
  },
  horizontalList: {
    paddingLeft: wp('4%'),
    paddingRight: wp('4%'),
    paddingVertical: hp("1%")
  },
  horizontalCourseCard: {
    width: wp('60%'),
    // height: hp('28%'),
    borderRadius: moderateScale(8),
    elevation: 3,
  },
  horizontalCourseImage: {
    height: hp('12%'),
    borderTopLeftRadius: moderateScale(8),
    borderTopRightRadius: moderateScale(8),
  },
  horizontalCourseContent: {
    padding: moderateScale(12),
  },
  courseTitle: {
    fontFamily: 'Manrope-Bold',
    marginBottom: hp('0.5%'),
  },
  courseDesc: {
    color: colors.textSecondary,
    marginBottom: hp('1%'),
    height: hp('4%'),
  },
  courseMeta: {
    marginBottom: hp('1%'),
  },
  smallChip: {
    height: hp('3%'),
    marginRight: wp('2%'),
    backgroundColor: '#f0f0f0',
  },
  smallChipText: {
    fontSize: moderateScale(10),
    lineHeight: moderateScale(12),
    fontFamily: 'Manrope-Regular',
  },
  priceContainer: {
    alignItems: 'center',
  },
  price: {
    fontSize: moderateScale(16),
    fontFamily: 'Manrope-Bold',
    color: colors.primary,
  },
  enrollButton: {
    height: hp('4%'),
    borderRadius: moderateScale(4),
    paddingHorizontal: wp('2%'),
  },
  enrollButtonText: {
    fontSize: moderateScale(12),
    fontFamily: 'Manrope-Regular',
  },
});

export default ClassDetailScreen;