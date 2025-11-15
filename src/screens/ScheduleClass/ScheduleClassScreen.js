import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  FlatList,
  TextInput,
} from 'react-native';
import { Calendar, Clock, Users, MapPin, Edit3, Trash2, Search, Plus } from 'lucide-react-native';
import { hp, moderateScale } from '../../utils/responsive';

const ScheduledClassesScreen = ({ navigation }) => {
  const [scheduledClasses, setScheduledClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - replace with your actual API call
  const mockClasses = [
    {
      id: '1',
      course_name: 'Advanced JavaScript',
      title: 'Batch A - 2024',
      scheduled_date: '2024-01-15T10:00:00Z',
      duration: '2 hours',
      trainer_name: 'John Doe',
      status: 'scheduled',
      max_students: 25,
      enrolled_students: 18,
      location: 'Room 101',
      description: 'Deep dive into advanced JavaScript concepts',
    },
    {
      id: '2',
      course_name: 'React Native Mastery',
      title: 'Batch B - 2024',
      scheduled_date: '2024-01-16T14:00:00Z',
      duration: '3 hours',
      trainer_name: 'Jane Smith',
      status: 'completed',
      max_students: 20,
      enrolled_students: 20,
      location: 'Online - Zoom',
      description: 'Master React Native development',
    },
    {
      id: '3',
      course_name: 'UI/UX Design',
      title: 'Design Batch 1',
      scheduled_date: '2024-01-17T09:00:00Z',
      duration: '2.5 hours',
      trainer_name: 'Mike Johnson',
      status: 'scheduled',
      max_students: 15,
      enrolled_students: 12,
      location: 'Creative Lab',
      description: 'Learn modern UI/UX design principles',
    },
    {
      id: '4',
      course_name: 'Data Science',
      title: 'DS Batch 2024',
      scheduled_date: '2024-01-14T13:00:00Z',
      duration: '4 hours',
      trainer_name: 'Sarah Wilson',
      status: 'cancelled',
      max_students: 30,
      enrolled_students: 22,
      location: 'Data Lab',
      description: 'Introduction to Data Science and ML',
    },
  ];

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    // Set header options
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.navigate('ScheduleClass')}
        >
          <Plus size={moderateScale(24)} color="#6366f1" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    filterClasses();
  }, [selectedFilter, searchQuery, scheduledClasses]);

  const loadClasses = () => {
    // Simulate API call
    setScheduledClasses(mockClasses);
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API refresh
    setTimeout(() => {
      loadClasses();
      setRefreshing(false);
    }, 1000);
  };

  const filterClasses = () => {
    let filtered = scheduledClasses;

    // Apply status filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(classItem => classItem.status === selectedFilter);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(classItem =>
        classItem.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        classItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        classItem.trainer_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredClasses(filtered);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return '#10b981';
      case 'completed':
        return '#6b7280';
      case 'cancelled':
        return '#ef4444';
      case 'ongoing':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'scheduled':
        return 'Scheduled';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'ongoing':
        return 'Ongoing';
      default:
        return status;
    }
  };

  const handleEditClass = (classItem) => {
    navigation.navigate('ScheduleClass', { 
      editMode: true, 
      classData: classItem 
    });
  };

  const handleDeleteClass = (classItem) => {
    Alert.alert(
      'Delete Class',
      `Are you sure you want to delete "${classItem.course_name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // Implement delete logic
            const updatedClasses = scheduledClasses.filter(c => c.id !== classItem.id);
            setScheduledClasses(updatedClasses);
            Alert.alert('Success', 'Class deleted successfully');
          }
        },
      ]
    );
  };

  const renderClassCard = ({ item }) => (
    <View style={styles.classCard}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.courseInfo}>
          <Text style={styles.courseName}>{item.course_name}</Text>
          <Text style={styles.batchName}>{item.title}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      {/* Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Calendar size={moderateScale(16)} color="#6b7280" />
          <Text style={styles.detailText}>{formatDate(item.scheduled_date)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Clock size={moderateScale(16)} color="#6b7280" />
          <Text style={styles.detailText}>
            {formatTime(item.scheduled_date)} • {item.duration}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Users size={moderateScale(16)} color="#6b7280" />
          <Text style={styles.detailText}>
            {item.enrolled_students}/{item.max_students} students
          </Text>
        </View>

        <View style={styles.detailRow}>
          <MapPin size={moderateScale(16)} color="#6b7280" />
          <Text style={styles.detailText}>{item.location}</Text>
        </View>
      </View>

      {/* Trainer */}
      <View style={styles.trainerContainer}>
        <Text style={styles.trainerLabel}>Trainer:</Text>
        <Text style={styles.trainerName}>{item.trainer_name}</Text>
      </View>

      {/* Description */}
      {item.description && (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditClass(item)}
        >
          <Edit3 size={moderateScale(16)} color="#6366f1" />
          <Text style={[styles.actionText, { color: '#6366f1' }]}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteClass(item)}
        >
          <Trash2 size={moderateScale(16)} color="#ef4444" />
          <Text style={[styles.actionText, { color: '#ef4444' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const filters = [
    { key: 'all', label: 'All Classes' },
    { key: 'scheduled', label: 'Scheduled' },
    { key: 'ongoing', label: 'Ongoing' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <View style={styles.container}>
      {/* Search and Filter Section */}
      <View style={styles.controlsContainer}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={moderateScale(20)} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search classes..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                selectedFilter === filter.key && styles.filterButtonActive
              ]}
              onPress={() => setSelectedFilter(filter.key)}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === filter.key && styles.filterTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Classes List */}
      <FlatList
        data={filteredClasses}
        renderItem={renderClassCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6366f1']}
            tintColor="#6366f1"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No classes found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || selectedFilter !== 'all' 
                ? 'Try changing your search or filter' 
                : 'Schedule your first class to get started'
              }
            </Text>
            <TouchableOpacity 
              style={styles.scheduleButton}
              onPress={() => navigation.navigate('ScheduleClass')}
            >
              <Text style={styles.scheduleButtonText}>Schedule New Class</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerButton: {
    padding: moderateScale(8),
    marginRight: moderateScale(8),
  },
  controlsContainer: {
    backgroundColor: '#ffffff',
    padding: moderateScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(12),
    marginBottom: hp(2),
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    marginLeft: moderateScale(12),
    fontSize: moderateScale(16),
    color: '#374151',
  },
  filterScroll: {
    marginHorizontal: moderateScale(-4),
  },
  filterContent: {
    paddingHorizontal: moderateScale(4),
  },
  filterButton: {
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(8),
    borderRadius: moderateScale(20),
    backgroundColor: '#f3f4f6',
    marginHorizontal: moderateScale(4),
  },
  filterButtonActive: {
    backgroundColor: '#6366f1',
  },
  filterText: {
    fontSize: moderateScale(14),
    color: '#6b7280',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  listContent: {
    padding: moderateScale(16),
    paddingBottom: hp(4),
  },
  classCard: {
    backgroundColor: '#ffffff',
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    marginBottom: hp(1.5),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: hp(1.5),
  },
  courseInfo: {
    flex: 1,
    marginRight: moderateScale(12),
  },
  courseName: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: moderateScale(4),
  },
  batchName: {
    fontSize: moderateScale(14),
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(6),
    borderRadius: moderateScale(12),
  },
  statusText: {
    color: '#ffffff',
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  detailsContainer: {
    marginBottom: hp(1.5),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: moderateScale(8),
  },
  detailText: {
    marginLeft: moderateScale(12),
    fontSize: moderateScale(14),
    color: '#374151',
    flex: 1,
  },
  trainerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  trainerLabel: {
    fontSize: moderateScale(14),
    color: '#6b7280',
    fontWeight: '500',
    marginRight: moderateScale(8),
  },
  trainerName: {
    fontSize: moderateScale(14),
    color: '#374151',
    fontWeight: '600',
  },
  description: {
    fontSize: moderateScale(14),
    color: '#6b7280',
    lineHeight: moderateScale(20),
    marginBottom: hp(1.5),
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: moderateScale(12),
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(8),
    borderRadius: moderateScale(8),
    borderWidth: 1,
  },
  editButton: {
    borderColor: '#6366f1',
  },
  deleteButton: {
    borderColor: '#ef4444',
  },
  actionText: {
    marginLeft: moderateScale(6),
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(10),
    paddingHorizontal: moderateScale(20),
  },
  emptyText: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: moderateScale(8),
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: moderateScale(14),
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: hp(3),
  },
  scheduleButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: moderateScale(24),
    paddingVertical: moderateScale(12),
    borderRadius: moderateScale(12),
  },
  scheduleButtonText: {
    color: '#ffffff',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
});

export default ScheduledClassesScreen;