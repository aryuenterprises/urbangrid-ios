import { StyleSheet, Text, View, FlatList, TouchableOpacity, RefreshControl } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import api from '../services/api'
import { API_BASE_URL } from '@env'
// import { API_BASE_URL } from 'react-native-config'
import { getNotifications } from '../services/auth'
import { useScrollDetection } from '../hook/useScrollDetection'
import { colors } from '../utils/globalStyles'
import { IconButton } from 'react-native-paper'
import { hp, moderateScale } from '../utils/responsive'
import { store } from '../redux/store'
import { setGlobalCourseId } from '../redux/slices/authSlice'
import { useAppTheme } from '../hook/useAppTheme'

const NotificationScreen = ({ route, navigation }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { handleScroll, createAnimatedScrollView } = useScrollDetection();
    const AnimatedFlatList = createAnimatedScrollView(FlatList);
    const [refreshing, setRefreshing] = useState(false);
    const { colors: themeColors } = useAppTheme();
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            // Assuming you have an API endpoint to fetch notifications
            const response = await getNotifications(); // You'll need to implement this in your auth service
            setNotifications(response.notifications || []);
        } catch (error) {
            console.log("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const onRefresh = useCallback(() => {
        fetchNotifications();
    }, []);

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Render each notification item
    const renderNotificationItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.notificationItem, !item.is_read && styles.unreadNotification, { backgroundColor: themeColors.notifiCard }]}
            onPress={() => handleNotificationPress(item)}
        >
            <View style={styles.messageContainer}>
                <Text style={[styles.messageText, !item.is_read && styles.unreadText, { color: themeColors.textPrimary }]}>
                    {item.message}
                </Text>
                <Text style={[styles.dateText, , { color: themeColors.textSecondary }]}>
                    {formatDate(item.created_at)}
                </Text>
            </View>
            {!item.is_read && <View style={styles.unreadIndicator} />}
        </TouchableOpacity>
    )

    const handleNotificationPress = async (item) => {
        try {
            const response = await api.post(`${API_BASE_URL}/api/notifications/mark_read`, {
                id: item?.id
            });
            if (response.data.success) {
                fetchNotifications()
                if (item?.message?.toLowerCase().includes("class")) {
                    navigation.navigate("Attendance")
                }
                else if (item?.message?.toLowerCase()?.includes("submission_reply")) {
                    store.dispatch(setGlobalCourseId(item.course_id));
                    navigation.navigate('Course', {
                        screen: 'TaskDetail',
                        params: { itemId: item.assignment_id }
                    });
                } 
                // else if (item?.message?.toLowerCase()?.includes("test_result")) {
                //     store.dispatch(setGlobalCourseId(item.course_id));
                //     navigation.navigate('Course', {
                //         screen: 'Assessment',
                //         params: { test_id: item.test_id, submitted: true }
                //     });
                // }
            }
        } catch (error) {
            console.error('Error fetching notifications:', error.response);
            throw error;
        }
    }

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            {notifications.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>No notifications</Text>
                </View>
            ) : (
                <AnimatedFlatList
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.primary]}
                            tintColor={colors.primary}
                            progressBackgroundColor="#ffffff"
                        />
                    }
                    data={notifications}
                    renderItem={renderNotificationItem}
                    keyExtractor={(item) => item?.id?.toString()}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    )
}

export default NotificationScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: hp("1%"),
        backgroundColor: '#f8f9fa',
    },
    headerTitle: {
        fontSize: moderateScale(20),
        fontFamily: 'Manrope-Bold',
        color: '#333',
    },
    notificationCount: {
        fontSize: moderateScale(12),
        color: '#666',
        marginTop: 4,
        fontFamily: 'Manrope-Regular',
    },
    listContainer: {
        padding: 8,
    },
    notificationItem: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: hp("1.5%"),
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    unreadNotification: {
        backgroundColor: '#f0f7ff',
        borderLeftWidth: 3,
        borderLeftColor: '#007AFF',
    },
    messageContainer: {
        flex: 1,
    },
    messageText: {
        color: '#333',
        marginBottom: 8,
        lineHeight: 20,
        fontSize: moderateScale(16),
        fontFamily: 'Manrope-Bold',
    },
    unreadText: {
        fontFamily: 'Manrope-Medium',
    },
    dateText: {
        color: '#888',
        fontSize: moderateScale(12),
        fontFamily: 'Manrope-Regular',
    },
    unreadIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#007AFF',
        marginLeft: 8,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyStateText: {
        fontSize: moderateScale(16),
        fontFamily: 'Manrope-Regular',
        color: '#888',
        textAlign: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: hp("1%"),
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        zIndex: 1,
    },
    taskIdContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    taskKey: {
        fontSize: moderateScale(16),
        fontFamily: 'Manrope-Bold',
        color: colors.primary,
    },
})