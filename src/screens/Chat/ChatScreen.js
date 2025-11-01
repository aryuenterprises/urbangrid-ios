// screens/Chat/ChatScreen.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { format, formatDistanceToNow } from 'date-fns';
import { hp, wp, moderateScale } from '../../utils/responsive';
import { useFooterVisibility } from '../../hook/useFooterVisibility';
import { useSelector } from 'react-redux';
import { fetchMessages, MarkAsRead } from '../../services/auth';
import api from '../../services/api';
import Toast from 'react-native-toast-message';
import { useAppTheme } from '../../hook/useAppTheme';

const ChatScreen = ({ navigation, route }) => {
  const { item } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef(null);
  const ws = useRef(null);
  const { user, token } = useSelector(state => state.auth);
  useFooterVisibility();
  const tempId = Date.now().toString();
  const { colors: themeColors } = useAppTheme(); // Use the theme hook

  // Development vs Production configuration
  const isDevelopment = __DEV__;
  const WS_BASE_URL = isDevelopment
    ? 'ws://192.168.1.100:8001'  // Replace with your local IP address
    : 'wss://portal.aryuacademy.com';
  const API_BASE_URL = isDevelopment
    ? 'http://192.168.1.100:8001' // Replace with your local IP address
    : 'https://portal.aryuacademy.com';

  // Fetch initial messages from REST API
  useEffect(() => {
    if (item && item.id) {
      getMessages();
    }
  }, [item]);

  const getMessages = async () => {
    try {
      setIsLoading(true);
      const response = await fetchMessages(item.id);
      if (response.success) {
        // Format messages for our FlatList
        const formattedMessages = response.data.map(msg => ({
          id: msg.id,
          text: msg.content,
          timestamp: new Date(msg.created_at),
          senderId: msg.sender_id,
          senderType: msg.sender_type,
          isOwn: msg.sender_id === (user.user_type === 'student' ? user.registration_id : user.employee_id)
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message ||
          error.message ||
          'Failed to load messages'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!item?.id || !token) return;

    const wsUrl = `${WS_BASE_URL}/ws/chat/${item.id}/`;

    // Create WebSocket connection
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);

      // Authenticate with token
      if (token) {
        ws.current.send(JSON.stringify({
          type: 'auth',
          token: token
        }));
      }
    };

    ws.current.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);

        // Handle different message types
        if (data.type === 'chat_message') {
          const newMessage = {
            id: data.message_id || Date.now(),
            text: data.message,
            timestamp: new Date(data.timestamp || Date.now()),
            senderId: data.sender_id,
            senderType: data.sender_type,
            isOwn: data.sender_id === (user.user_type === 'student' ? user.registration_id : user.employee_id)
          };

          setMessages(prev => [...prev, newMessage]);

          // Scroll to bottom when new message arrives
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
        // Handle other message types
        else if (data.type === 'user_joined') {
          console.log('User joined:', data.user_id);
        }

      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    ws.current.onerror = (error) => {
      console.log('WebSocket error:', error);
      setIsConnected(false);
    };

    // Add reconnection logic
    const handleReconnect = () => {
      if (!isConnected) {
        setTimeout(() => {
          if (!item?.id || !token) return;
          // Reinitialize connection
          console.log('Attempting to reconnect WebSocket...');
          setIsConnected(true);
        }, 3000);
      }
    };

    ws.current.onclose = (e) => {
      console.log('WebSocket closed:', e.code, e.reason);
      setIsConnected(false);
      handleReconnect();
    };

    return () => {
      if (ws.current) {
        ws.current.close(1000, 'Component unmounted');
      }
    };
  }, [item, token, isConnected, user]);

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;

    try {
      setIsSending(true);
      const messageText = inputText.trim();

      // Create optimistic message
      const tempId = Date.now().toString();
      const optimisticMessage = {
        id: tempId,
        text: messageText,
        timestamp: new Date(),
        senderId: user.user_type === 'student' ? user.registration_id : user.employee_id,
        senderType: user.user_type,
        isOwn: true,
        isSending: true
      };

      // setMessages(prev => [...prev, optimisticMessage]);
      setInputText('');

      // Send message via REST API/euybfvh
      const response = await api.post(`/api/chat/rooms/${item.id}/euybfvh`, {
        room: item.id,
        sender_type: user.user_type,
        sender_id: user.user_type === 'student' ? user.registration_id : user.employee_id,
        content: messageText,
      });
      if (response.status || response.data.success) {
        // Refresh messages to get latest from server
        getMessages()
      } else {
        // Mark message as failed if sending failed
        setMessages(prev =>
          prev.map(msg =>
            msg.id === tempId ? { ...msg, isSending: false, failed: true } : msg
          )
        );
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to send message'
        });
      }

      // Mark messages as read when sending a new message
      try {
        await MarkAsRead(item.id, user);
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (error) {
      console.error('Error sending message:', error.response.data);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to send message'
      });
      // Mark message as failed
      // setMessages(prev =>
      //   prev.map(msg =>
      //     msg.id === tempId ? { ...msg, isSending: false, failed: true } : msg
      //   )
      // );
    } finally {
      setIsSending(false);
    }
  };

const renderMessage = ({ item }) => {
  // const { colors: themeColors } = useAppTheme();
  
  return (
    <View style={[
      styles.messageContainer,
      item.isOwn ? styles.ownMessageContainer : styles.otherMessageContainer
    ]}>
      <View style={[
        styles.messageBubble,
        item.isOwn ? 
          [styles.ownMessageBubble, { backgroundColor: themeColors.primary }] : 
          [styles.otherMessageBubble, { 
            backgroundColor: themeColors.card, 
            borderColor: themeColors.lightGray 
          }]
      ]}>
        <Text style={[
          styles.messageText,
          item.isOwn ? 
            styles.ownMessageText : 
            [styles.otherMessageText, { color: themeColors.textPrimary }]
        ]}>
          {item.text}
        </Text>
        <View style={styles.messageMeta}>
          <Text style={[
            styles.timestamp,
            item.isOwn ? 
              styles.ownTimestamp : 
              [styles.otherTimestamp, { color: themeColors.textSecondary }]
          ]}>
            {format(item.timestamp, 'h:mm a')}
          </Text>
          {item.isOwn && (
            <View style={styles.statusContainer}>
              {item.isSending ? (
                <ActivityIndicator size="small" color={themeColors.textSecondary} />
              ) : item.failed ? (
                <Ionicons name="warning" size={14} color={themeColors.error} />
              ) : (
                <Ionicons 
                  name="checkmark-done" 
                  size={14} 
                  color={themeColors.textSecondary} 
                />
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

  const renderHeader = () => {
    if (isLoading) {
      return (
        <View style={[styles.loadingContainer, { backgroundColor: themeColors.warning + '20' }]}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      );
    }
    return null;
  };

  const renderFooter = () => {
    if (!isConnected) {
      return (
        <View style={styles.connectionStatus}>
          <Text style={styles.connectionText}>
            Connecting...
          </Text>
        </View>
      );
    }
    return null;
  };

  // Render custom header with trainer details
  const renderCustomHeader = () => {
    return (
      <View style={[styles.headerContainer, {
        backgroundColor: themeColors.surface,
        borderBottomColor: themeColors.lightGray
      }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={moderateScale(24)} color={themeColors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.trainerInfo}>
          <Text style={[styles.trainerName, { color: themeColors.textPrimary }]} numberOfLines={1}>
            {item?.trainer_name || 'Trainer'}
          </Text>
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusIndicator,
              isConnected ? styles.statusOnline : styles.statusOffline,
              { backgroundColor: isConnected ? themeColors.success : themeColors.textSecondary }
            ]} />
            <Text style={[styles.statusText, { color: themeColors.textSecondary }]}>
              {isConnected ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>

        {/* <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="call-outline" size={moderateScale(22)} color="#2c3e50" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="videocam-outline" size={moderateScale(22)} color="#2c3e50" />
          </TouchableOpacity>
        </View> */}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      {renderCustomHeader()}

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 140 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.messagesList}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <View style={[
          styles.inputContainer,
          { backgroundColor: themeColors.surface, borderTopColor: themeColors.lightGray },
          !isConnected && styles.disabledInputContainer
        ]}>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: themeColors.background,
                borderColor: themeColors.lightGray,
                color: themeColors.textPrimary
              }
            ]}
            value={inputText}
            onChangeText={setInputText}
            placeholder={isConnected ? "Type a message..." : "Connecting..."}
            placeholderTextColor={themeColors.textSecondary}
            multiline
            maxLength={500}
            editable={isConnected}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || !isConnected || isSending) && styles.sendButtonDisabled
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || !isConnected || isSending}
          >
            <Ionicons
              name="send"
              size={moderateScale(24)}
              color={inputText.trim() && isConnected && !isSending ? themeColors.primary : themeColors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  // Header Styles
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(10),
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    padding: moderateScale(8),
    marginRight: moderateScale(12),
  },
  trainerInfo: {
    flex: 1,
    marginRight: moderateScale(12),
  },
  trainerName: {
    fontSize: moderateScale(18),
    fontFamily: 'Manrope-Medium',
    color: '#2c3e50',
    marginBottom: moderateScale(2),
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    marginRight: moderateScale(6),
  },
  statusOnline: {
    backgroundColor: '#4CAF50',
  },
  statusOffline: {
    backgroundColor: '#9E9E9E',
  },
  statusText: {
    fontSize: moderateScale(12),
    color: '#666',
    fontFamily: 'Manrope-Regular',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: moderateScale(8),
    marginLeft: moderateScale(8),
  },
  // Chat Styles
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(8),
  },
  messageContainer: {
    marginVertical: moderateScale(4),
    flexDirection: 'row',
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: moderateScale(12),
    borderRadius: moderateScale(18),
  },
  ownMessageBubble: {
    backgroundColor: '#007bff',
    borderBottomRightRadius: moderateScale(4),
  },
  otherMessageBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: moderateScale(4),
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageText: {
    fontSize: moderateScale(16),
    lineHeight: moderateScale(22),
    fontFamily: 'Manrope-Regular',
  },
  ownMessageText: {
    color: '#ffffff',
  },
  otherMessageText: {
    color: '#2c3e50',
  },
  messageMeta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: moderateScale(4),
  },
  timestamp: {
    fontSize: moderateScale(12),
    marginRight: moderateScale(4),
    fontFamily: 'Manrope-Regular',
  },
  ownTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTimestamp: {
    color: 'rgba(0, 0, 0, 0.5)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(8),
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#ffffff',
  },
  disabledInputContainer: {
    opacity: 0.5,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: moderateScale(20),
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(8),
    maxHeight: moderateScale(100),
    fontSize: moderateScale(16),
    marginRight: moderateScale(8),
    fontFamily: 'Manrope-Regular',
  },
  sendButton: {
    padding: moderateScale(8),
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    padding: moderateScale(20),
    alignItems: 'center',
  },
  connectionStatus: {
    padding: moderateScale(10),
    alignItems: 'center',
    backgroundColor: '#fff3cd',
  },
  connectionText: {
    color: '#856404',
    fontSize: moderateScale(12),
    fontFamily: 'Manrope-Regular',
  },
});

export default ChatScreen;