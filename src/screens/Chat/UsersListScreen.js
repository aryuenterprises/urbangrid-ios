import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  RefreshControl,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { hp, wp, moderateScale } from '../../utils/responsive';
import { colors, globalstyles } from '../../utils/globalStyles';
import { getTrainers, MarkAsRead } from '../../services/auth';
import { Avatar } from 'react-native-paper';
import { useScrollDetection } from '../../hook/useScrollDetection';
import { format, isToday, isYesterday, isThisYear, parseISO } from 'date-fns';
import axios from 'axios';
import { API_BASE_URL } from '@env'
// import { API_BASE_URL } from 'react-native-config'
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useAppTheme } from '../../hook/useAppTheme';

const UsersListScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [trainer, setTrainer] = useState(null);
  const [room, setRoom] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { handleScroll, createAnimatedScrollView } = useScrollDetection();
  const AnimatedFlatList = createAnimatedScrollView(FlatList);
  const { studentProfile, user, token } = useSelector(state => state.auth);
  const { colors: themeColors } = useAppTheme(); // Use theme hook

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = useCallback(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const responce = await getTrainers()
      setTrainer(responce.assigned_trainers)
      setRoom(responce.chat_rooms)
      setFilteredUsers(responce.chat_rooms);
    } catch (error) {
      console.log("error", error)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(room);
    } else {
      console.log("room", room)
      const filtered = room.filter(user => 
        user?.trainer_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    console.log("first", filtered)
      setFilteredUsers(filtered);
    }
  }, [searchQuery, trainer]);

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const handleRoomClick = async (item) => {
    try {
      const response = await MarkAsRead(item.id, user)
      if (response.success) {
        await fetchData();
        navigation.navigate('ChatScreen', { item: item })
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message ||
          error.message || 'Please try again'
      });
    }
  }

  const formatDateWhatsApp = (dateString) => {
    try {
      if (dateString) {
        const messageDate = parseISO(dateString);

        if (isToday(messageDate)) {
          return format(messageDate, 'HH:mm'); // Today - show time only
        } else if (isYesterday(messageDate)) {
          return 'Yesterday'; // Yesterday
        } else if (isThisYear(messageDate)) {
          return format(messageDate, 'dd/MM'); // This year - show day/month
        } else {
          return format(messageDate, 'dd/MM/yy'); // Previous years - show day/month/year
        }
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return ''; // Return empty string if date parsing fails
    }
  };

  const renderUserItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={[styles.userItem, { backgroundColor: themeColors.card || themeColors.surface }]}
        onPress={() => handleRoomClick(item)}
      >
        {item?.trainer_profile_pic ? (
          <Avatar.Image
            source={{ uri: item?.trainer_profile_pic }}
            size={hp('6%')}
            style={styles.avatar}
          />
        ) : (
          <Avatar.Text
            size={hp('6%')}
            label={getInitials(item?.trainer_name)}
            style={[styles.avatar, { backgroundColor: themeColors.primary }]}
            labelStyle={{ color: themeColors.white }}
          />
        )}
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: themeColors.textPrimary }]}>{item?.trainer_name}</Text>
          {(item?.last_message) && (
            <Text
              style={[
                styles.lastMessage,
                { color: themeColors.textSecondary },
                // If last message is from trainer AND unread_count > 0 - highlight
                (item?.last_message?.sender_type === "trainer" && item?.unread_count > 0) && [
                  styles.unreadMessage,
                  { color: themeColors.textPrimary, fontWeight: 'bold' }
                ],
                // If last message is from student - normal text with tick
                (item?.last_message?.sender_type === "student") && styles.sentMessage
              ]}
              numberOfLines={1}
            >
              {item?.last_message?.content}
              {/* Show tick icon if message is from student */}
              {/* {item?.last_message?.sender_type === "student" && (
                <Ionicons
                  name="checkmark-done"
                  size={moderateScale(14)}
                  color={item?.last_message?.is_read ? themeColors.primary : themeColors.textSecondary}
                  style={styles.tickIcon}
                />
              )} */}
            </Text>
          )}
        </View>
        <View style={styles.rightSection}>
          <Text style={[styles.timestamp, { color: themeColors.textSecondary }]}>
            {formatDateWhatsApp(item?.last_message?.created_at)}
          </Text>
          {item?.unread_count > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: themeColors.primary }]}>
              <Text style={[styles.unreadText, { color: themeColors.white }]}>{item?.unread_count}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: themeColors.card || themeColors.surface }]}>
        <Ionicons
          name="search"
          size={moderateScale(20)}
          color={themeColors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, { color: themeColors.textPrimary }]}
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={themeColors.textSecondary}
        />
      </View>

      {/* Users List */}
      <AnimatedFlatList
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[themeColors.primary]}
            tintColor={themeColors.primary}
            progressBackgroundColor={themeColors.background}
          />
        }
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={item => item?.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={globalstyles.loginContainer}>
            <Text style={[globalstyles.buttonText, { color: themeColors.textSecondary }]}>No chats available</Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: themeColors.primary }]}
        onPress={() => navigation.navigate("TrainerList", { trainer })}
      >
        <Ionicons name="add" size={moderateScale(24)} color={themeColors.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: hp("2%"),
    backgroundColor: '#ffffff',
  },
  header: {
    padding: wp('4%'),
  },
  headerTitle: {
    fontSize: moderateScale(22),
    fontWeight: '700',
    color: '#2c3e50',
    textAlign: 'center',
    fontFamily: 'Manrope-Bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    marginHorizontal: wp('4%'),
    marginBottom: hp('2%'),
    borderRadius: moderateScale(25),
    paddingHorizontal: wp('3%'),
    height: hp('6%'),
  },
  searchIcon: {
    marginRight: wp('2%'),
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(16),
    color: '#2c3e50',
    height: '100%',
    fontFamily: 'Manrope-Regular',
  },
  listContent: {
    paddingBottom: hp('2%'),
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp('4%'),
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
    backgroundColor: '#ffffff',
  },
  avatar: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    marginRight: wp('3%'),
    alignContent: "center",
    alignItems: "center",
    justifyContent: "center"
  },
  userInfo: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: moderateScale(8),
    marginRight: wp('3%'),
    borderRadius: moderateScale(20),
    backgroundColor: colors.lightPrimary + '20',
  },
  // Floating Action Button Styles
  fab: {
    position: 'absolute',
    width: wp('14%'),
    height: wp('14%'),
    borderRadius: wp('7%'),
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    bottom: hp('3%'),
    right: wp('5%'),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: hp("8%"),
    marginRight: hp("1%")
  },
  userName: {
    fontSize: moderateScale(16),
    fontFamily: 'Manrope-Medium',
    color: '#2c3e50',
    marginBottom: hp('0.5%'),
  },
  lastMessage: {
    fontSize: moderateScale(14),
    color: '#6c757d',
    flex: 1,
    fontFamily: 'Manrope-Regular',
  },
  unreadMessage: {
    color: colors.primary, // Highlight color for unread trainer messages
    fontFamily: 'Manrope-Medium',
  },
  sentMessage: {
    color: '#6c757d', // Normal color for student messages
  },
  tickIcon: {
    marginLeft: wp('1%'),
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: hp('0.5%'),
  },
  timestamp: {
    fontSize: moderateScale(12),
    color: '#999',
    fontFamily: 'Manrope-Regular',
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: moderateScale(10),
    minWidth: wp('6%'),
    height: wp('6%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: '#ffffff',
    fontSize: moderateScale(12),
    fontFamily: 'Manrope-Medium',
  },
});

export default UsersListScreen;