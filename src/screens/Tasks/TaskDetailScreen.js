import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Linking,
    Alert,
    ActivityIndicator,
    Modal,
    TouchableWithoutFeedback,
    Animated,
    Dimensions,
    Easing,
    Platform,
    Keyboard,
    FlatList,
    StatusBar,
} from 'react-native';
import { Avatar, Button, Card, Chip, Divider, IconButton } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import EmojiSelector, { Categories } from 'react-native-emoji-selector';
import { hp, moderateScale, wp } from '../../utils/responsive';
import { colors } from '../../utils/globalStyles';
import { RichEditor } from 'react-native-pell-rich-editor';
import TextEditor from '../../components/TextEditor';
import { SafeAreaView } from 'react-native-safe-area-context';
import { pick, types } from '@react-native-documents/picker';
import ImagePicker from 'react-native-image-crop-picker';
import { Video } from 'react-native-video';
import { DeleteComment, getAssessment, getAssignment, getSingleAssignment } from '../../services/auth';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFooterVisibility } from '../../hook/useFooterVisibility';
import api from '../../services/api';
import { API_BASE_URL } from '@env'
import { useSelector } from 'react-redux';
import RenderHTML from 'react-native-render-html';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import Toast from 'react-native-toast-message';
import { useAppTheme } from '../../hook/useAppTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const TaskDetailsSkeleton = () => (
    <SkeletonPlaceholder borderRadius={4} backgroundColor="#f0f0f0" highlightColor="#e0e0e0">
        <View style={styles.skeletonContainer}>
            <SkeletonPlaceholder.Item flexDirection="row" alignItems="center" padding={16} marginBottom={20}>
                <SkeletonPlaceholder.Item width={40} height={40} borderRadius={20} marginRight={10} />
                <SkeletonPlaceholder.Item>
                    <SkeletonPlaceholder.Item width={120} height={20} marginBottom={5} />
                    <SkeletonPlaceholder.Item width={80} height={15} />
                </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder.Item>

            <SkeletonPlaceholder.Item marginHorizontal={16} marginBottom={20}>
                <SkeletonPlaceholder.Item width="100%" height={150} borderRadius={12} marginBottom={10} />
                <SkeletonPlaceholder.Item width="80%" height={20} marginBottom={8} />
                <SkeletonPlaceholder.Item width="90%" height={20} marginBottom={8} />
                <SkeletonPlaceholder.Item width="70%" height={20} marginBottom={8} />
                <SkeletonPlaceholder.Item width="60%" height={20} />
            </SkeletonPlaceholder.Item>

            <SkeletonPlaceholder.Item marginHorizontal={16}>
                <SkeletonPlaceholder.Item width={120} height={20} marginBottom={15} />
                {[1, 2, 3].map((_, i) => (
                    <SkeletonPlaceholder.Item key={i} marginBottom={15}>
                        <SkeletonPlaceholder.Item flexDirection="row" alignItems="center" marginBottom={10}>
                            <SkeletonPlaceholder.Item width={35} height={35} borderRadius={17.5} marginRight={10} />
                            <SkeletonPlaceholder.Item>
                                <SkeletonPlaceholder.Item width={100} height={16} marginBottom={5} />
                                <SkeletonPlaceholder.Item width={80} height={12} />
                            </SkeletonPlaceholder.Item>
                        </SkeletonPlaceholder.Item>
                        <SkeletonPlaceholder.Item marginLeft={45}>
                            <SkeletonPlaceholder.Item width="90%" height={16} marginBottom={5} />
                            <SkeletonPlaceholder.Item width="70%" height={16} marginBottom={10} />
                            <SkeletonPlaceholder.Item width={80} height={25} borderRadius={5} />
                        </SkeletonPlaceholder.Item>
                    </SkeletonPlaceholder.Item>
                ))}
            </SkeletonPlaceholder.Item>
        </View>
    </SkeletonPlaceholder>
);

const TaskDetailsScreen = ({ route, navigation }) => {
    useFooterVisibility();
    const { itemId, index } = route.params || {};
    const [description, setDescription] = useState('');
    const [title, setTitle] = useState('');
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const richTextEditor = useRef(null);
    const [commentText, setCommentText] = useState('');
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [activeEmojiPicker, setActiveEmojiPicker] = useState(null);
    const [emojiPickerPosition, setEmojiPickerPosition] = useState({ x: 0, y: 0 });
    const emojiScale = useRef(new Animated.Value(0)).current;
    const [attachments, setAttachments] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [comments, setComments] = useState([]);
    const [data, setData] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const { colors: themeColors, isDark } = useAppTheme();
    const { studentProfile, user, token } = useSelector(state => state.auth);
    const insets = useSafeAreaInsets();
    // Keyboard handling state
    const scrollViewRef = useRef();
    const commentInputRef = useRef();
    const inputContainerRef = useRef();
    const translateY = useRef(new Animated.Value(0)).current;
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [inputContainerHeight, setInputContainerHeight] = useState(0);

    useEffect(() => {
        fetchExercises();

        // Keyboard listeners
        const keyboardWillShow = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
                const { height } = e.endCoordinates;
                setKeyboardHeight(height);
                const translation = -height + insets.bottom
                Animated.timing(translateY, {
                    toValue: Platform.OS === 'ios' ? translation : translateY._offset,
                    duration: 250,
                    useNativeDriver: true,
                }).start();

                // Auto-scroll to bottom when keyboard appears
                setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 100);
            }
        );

        const keyboardWillHide = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setKeyboardHeight(0);
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }).start();
            }
        );

        return () => {
            keyboardWillShow.remove();
            keyboardWillHide.remove();
        };
    }, []);

    // Measure input container height
    const onInputContainerLayout = (event) => {
        const { height } = event.nativeEvent.layout;
        setInputContainerHeight(height);
    };

    const getFileType = (url) => {
        if (!url) return 'unknown';
        const extension = url.split('.').pop().toLowerCase();

        if (['pdf'].includes(extension)) return 'pdf';
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image';
        if (['mp4', 'mov', 'avi', 'webm'].includes(extension)) return 'video';

        return 'file';
    };

    const fetchExercises = async () => {
        setLoading(true);
        try {
            const response = await getSingleAssignment(itemId);
            setComments(response.submissions || []);
            setData(response);
            setDescription(response.description || '');
            setTitle(response.title || '');
        } catch (error) {
            console.error('Error fetching exercises:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load task details'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleHtmlChange = (html) => {
        if (html === '<div><br></div>' || html === '<div></div>') {
            setCommentText('');
        } else {
            setCommentText(html);
        }
    };

    const handleAddAttachment = async (type, linkData = null) => {
        try {
            const isSimulator = Platform.OS === 'ios' && !Platform.isPad;

            if (isSimulator && type !== 'link') {
                Alert.alert(
                    'Simulator Limitation',
                    'Image/video picking may not work properly on simulator. Please test on a real device.',
                    [{ text: 'OK' }]
                );
                return;
            }

            if (type === 'link') {
                setAttachments(prev => [...prev, linkData]);
            } else if (type === 'image') {
                const image = await ImagePicker.openPicker({
                    mediaType: 'photo',
                    cropping: false,
                    compressImageQuality: 0.8,
                    forceJpg: true, // Add this
                    includeExif: true,
                    waitAnimationEnd: false
                }).catch(error => {
                    console.log('ImagePicker Error:', error);
                    throw error;
                });

                console.log('Selected image:', image);
                if (image) {
                    setAttachments(prev => [...prev, {
                        id: Date.now(),
                        type: 'image',
                        url: image.path,
                        name: image.filename || `image_${Date.now()}.jpg`
                    }]);
                }
            } else if (type === 'video') {
                const video = await ImagePicker.openPicker({
                    mediaType: 'video'
                });

                setAttachments(prev => [...prev, {
                    id: Date.now(),
                    type: 'video',
                    url: video.path,
                    name: video.filename || `video_${Date.now()}.mp4`
                }]);
            } else if (type === 'file') {
                try {
                    const res = await pick({
                        mode: 'open',
                        requestLongTermAccess: true,
                        type: [types.allFiles],
                    });
                    setAttachments(prev => [...prev, {
                        id: Date.now(),
                        type: 'file',
                        url: res[0].uri,
                        name: res[0].name
                    }]);
                } catch (err) {
                    console.error("DocumentPicker error:", err);
                }
            }
        } catch (error) {
            console.log('Attachment error:', error);
            // Check for specific error types
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
        }
    };

    const handleRemoveAttachment = (id) => {
        setAttachments(attachments.filter(att => att.id !== id));
    };

    const handleDownloadFile = useCallback(async (url) => {
        if (!url || url === "NA" || url === "join meeting") {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'No file available'
            });
            return;
        }

        console.log("Original URL:", url);

        // Fix 1: Ensure URL is properly formatted
        let formattedUrl = url;

        // If it's a relative URL, make it absolute
        if (url.startsWith('/')) {
            formattedUrl = `${API_BASE_URL}${url}`;
        }

        // If it doesn't have http/https, add it
        if (!url.startsWith('http')) {
            formattedUrl = `https://${url}`;
        }

        try {
            // Fix 2: Check if URL can be opened
            const supported = await Linking.canOpenURL(formattedUrl);
            console.log("Can open URL:", supported, formattedUrl);

            if (supported) {
                await Linking.openURL(formattedUrl);
            } else {
                await handleAlternativeFileOpening(formattedUrl, url);
            }
        } catch (error) {
            console.error('Error opening URL:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Cannot open this file'
            });
        }
    }, []);

    const handleAlternativeFileOpening = async (formattedUrl, originalUrl) => {
        const fileType = getFileType(originalUrl);

        // For specific file types, try different approaches
        switch (fileType) {
            case 'pdf':
                // Try with Google Docs viewer
                const googleDocsUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(formattedUrl)}`;
                try {
                    const supported = await Linking.canOpenURL(googleDocsUrl);
                    if (supported) {
                        await Linking.openURL(googleDocsUrl);
                        return;
                    }
                } catch (e) {
                    console.log('Google Docs fallback failed:', e);
                }
                break;

            case 'image':
                // Images should generally open in browser
                try {
                    await Linking.openURL(formattedUrl);
                    return;
                } catch (e) {
                    console.log('Direct image open failed:', e);
                }
                break;
        }

        // Final fallback - show download option
        Alert.alert(
            'File Download',
            'This file cannot be opened directly. Would you like to download it?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Download',
                    onPress: () => handleFileDownload(formattedUrl, originalUrl)
                }
            ]
        );
    };

    const handleFileDownload = async (url, originalUrl) => {
        try {
            // For React Native, you might need a download manager
            // Here's a basic implementation using Linking
            const downloadUrl = url;
            await Linking.openURL(downloadUrl);

            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'File download started'
            });
        } catch (error) {
            console.error('Download error:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to download file'
            });
        }
    };

    const handleAddComment = async () => {
        if (!commentText.trim() && attachments.length === 0) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please add a comment or attachment'
            });
            return;
        }

        setIsSubmitting(true);

        const mimeTypes = {
            // Images
            png: 'image/png',
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            gif: 'image/gif',
            webp: 'image/webp',
            svg: 'image/svg+xml',
            bmp: 'image/bmp',
            ico: 'image/x-icon',

            // Videos
            mp4: 'video/mp4',
            mov: 'video/quicktime',
            mkv: 'video/x-matroska',
            avi: 'video/x-msvideo',
            m4v: 'video/x-m4v',
            webm: 'video/webm',
            '3gp': 'video/3gpp',

            // Audio (if needed)
            mp3: 'audio/mpeg',
            wav: 'audio/wav',
            m4a: 'audio/mp4',
        };

        try {
            const formData = new FormData();
            formData.append('assignment', data?.id || '');
            formData.append('registration_id', user?.registration_id || '');
            formData.append('text', commentText);

            if (attachments && attachments.length > 0) {
                const attachment = attachments[0];

                // Get file extension properly
                let ext = '';
                if (attachment.name) {
                    ext = attachment.name.split('.').pop().toLowerCase();
                } else if (attachment.url) {
                    // Extract from URL, remove query parameters if any
                    const urlWithoutParams = attachment.url.split('?')[0];
                    ext = urlWithoutParams.split('.').pop().toLowerCase();
                }

                const mimeType = mimeTypes[ext] || 'application/octet-stream';

                // Prepare file URI for React Native
                let fileUri = attachment.url;

                // For iOS, ensure proper file URI format
                if (Platform.OS === 'ios') {
                    // Sometimes we need to handle file:// prefix
                    if (!fileUri.startsWith('file://') && !fileUri.startsWith('http')) {
                        fileUri = 'file://' + fileUri;
                    }
                }

                // For Android, ensure proper file URI
                if (Platform.OS === 'android') {
                    // Android often uses content:// URIs which need special handling
                    if (fileUri.startsWith('content://')) {
                        // You might need react-native-document-picker or similar for content URIs
                        console.log('Content URI detected - may need special handling');
                    }
                }

                console.log("File details:", {
                    uri: fileUri,
                    type: mimeType,
                    name: attachment.name || `upload_${Date.now()}.${ext}`,
                    ext: ext
                });

                // Append file to FormData - React Native specific format
                formData.append('file', {
                    uri: fileUri,
                    type: mimeType,
                    name: attachment.name || `upload_${Date.now()}.${ext}`
                });
            }

            console.log("FormData prepared for upload");

            const response = await api.post(`${API_BASE_URL}/api/submissions`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    // Add any authentication headers if needed
                    // 'Authorization': `Bearer ${userToken}`,
                },
                // Add timeout for large files
                timeout: 30000, // 30 seconds
            });

            if (response.data.success) {
                await fetchExercises();
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Submission added successfully'
                });
            }

            Keyboard.dismiss();
            translateY.setValue(0);

            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);

        } catch (error) {
            console.error('Error adding submission:', error);
            console.log('Full error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                headers: error.response?.headers
            });

            Toast.show({
                type: 'error',
                text1: 'Upload Failed',
                text2: error.response?.data?.message || 'Failed to upload file. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
            setCommentText('');
            setAttachments([]);
        }
    };

    const handleAddReaction = (commentId, emoji, isReply = false, replyId = null) => {
        // Implementation for adding reactions
        setShowEmojiPicker(false);
        setActiveEmojiPicker(null);
    };

    const toggleEmojiPicker = async (commentId, event, isReply = false, replyId = null) => {
        try {
            if (activeEmojiPicker === commentId) {
                setActiveEmojiPicker(null);
                setShowEmojiPicker(false);
                return;
            }

            const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
            const centerPosition = {
                x: (screenWidth - wp('80%')) / 2,
                y: (screenHeight - hp('30%')) / 2,
            };

            setEmojiPickerPosition(centerPosition);
            setActiveEmojiPicker(commentId);
            setShowEmojiPicker(true);
            animateEmoji();
        } catch (error) {
            console.error('Error in toggleEmojiPicker:', error);
            setShowEmojiPicker(false);
            setActiveEmojiPicker(null);
        }
    };

    const animateEmoji = () => {
        emojiScale.setValue(0);
        Animated.timing(emojiScale, {
            toValue: 1,
            duration: 300,
            easing: Easing.elastic(1),
            useNativeDriver: true
        }).start();
    };

    const [deletingComment, setDeletingComment] = useState(null);
    const [isdeleting, setDeleting] = useState(false);

    const handleDeleteComment = (commentId) => {
        setDeletingComment({ commentId });
        setDeleting(true);
    };

    const handleCommentDelete = async () => {
        try {
            const response = await DeleteComment(user?.registration_id, deletingComment?.commentId);
            if (response.success) {
                setComments(comments.filter(comment => comment?.id !== deletingComment?.commentId));
                setDeletingComment(null);
                setDeleting(false);
                fetchExercises();
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Comment deleted successfully'
                });
            }
        } catch (error) {
            console.log("error", error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to delete comment'
            });
        }
    };

    const renderAttachments = (fileUrl) => {
        if (!fileUrl) return null;

        const fileType = getFileType(fileUrl);
        return (
            <TouchableOpacity
                style={[styles.attachmentContainer, {
                    backgroundColor: themeColors.background,
                    borderColor: themeColors.lightGray
                }]}
                onPress={() => {
                    handleDownloadFile(fileUrl);
                    setSelectedFile({ uri: fileUrl, type: fileType });
                    setModalVisible(true);
                }}
            >
                <View style={styles.attachmentIcon}>
                    {fileType === 'pdf' && <Ionicons name="document-text" size={24} color={themeColors.error} />}
                    {fileType === 'image' && <Ionicons name="image" size={24} color={themeColors.primary} />}
                    {fileType === 'video' && <Ionicons name="videocam" size={24} color={themeColors.info} />}
                    {fileType === 'file' && <Ionicons name="document" size={24} color={themeColors.textSecondary} />}
                </View>
                <Text style={[styles.attachmentName, { color: themeColors.textPrimary }]} numberOfLines={1}>
                    {fileUrl.split('/').pop()}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderReactions = (reactions, commentId, isReply = false, replyId = null) => {
        if (!reactions || reactions?.length === 0) return null;

        return (
            <View style={[styles.reactionsContainer, isReply && styles.replyReactionsContainer]}>
                {reactions.map((reaction, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.reactionPill, {
                            backgroundColor: themeColors.card,
                            borderColor: themeColors.lightGray
                        }]}
                        onPress={() => handleAddReaction(commentId, reaction.emoji, isReply, replyId)}
                    >
                        <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                        <Text style={[styles.reactionCount, { color: themeColors.textSecondary }]}>
                            {reaction.count}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    const renderReplies = (replies, commentId) => {
        if (!replies || replies.length === 0) return null;

        return (
            <View style={styles.repliesContainer}>
                <View style={styles.repliesDivider}>
                    <View style={[styles.repliesLine, { backgroundColor: themeColors.lightGray }]} />
                    <Text style={[styles.repliesLabel, { color: themeColors.textSecondary }]}>
                        Replies ({replies.length})
                    </Text>
                    <View style={[styles.repliesLine, { backgroundColor: themeColors.lightGray }]} />
                </View>
                {replies.map(reply => (
                    <View key={reply.id} style={[styles.replyCard, {
                        backgroundColor: themeColors.card,
                        borderLeftColor: themeColors.primary
                    }]}>
                        <View style={styles.replyHeader}>
                            <View style={styles.replyAuthor}>
                                <Image
                                    source={{ uri: reply?.trainer?.profile_pic || 'https://randomuser.me/api/portraits/men/1.jpg' }}
                                    style={styles.replyAvatar}
                                />
                                <View style={styles.replyAuthorInfo}>
                                    <Text style={[styles.replyAuthorName, { color: themeColors.primary }]}>
                                        {reply?.trainer?.full_name || 'Trainer'}
                                    </Text>
                                    <Text style={[styles.replyTimestamp, { color: themeColors.textSecondary }]}>
                                        {moment(reply.date).fromNow()}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.replyContent}>
                            {reply.content ? (
                                <RichEditor
                                    initialContentHTML={reply.content}
                                    disabled={true}
                                    style={[styles.replyEditor, { color: themeColors.textPrimary }]}
                                />
                            ) : (
                                <Text style={[styles.replyText, { color: themeColors.textPrimary }]}>
                                    {reply.text}
                                </Text>
                            )}
                            {renderReactions(reply.reactions, reply.id, true, commentId)}
                        </View>
                    </View>
                ))}
            </View>
        );
    };

    const getInitials = (firstName, lastName) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
    };

    // Fixed RenderHTML source prop issue
    const renderTaskDescription = () => {
        if (!description) {
            return (
                <Text style={[styles.descriptionText, { color: themeColors.textSecondary }]}>
                    No description available
                </Text>
            );
        }

        console.log("description", description);

        // Check if the HTML is double-encoded (contains &lt; and &gt;)
        const isDoubleEncoded = description.includes('&lt;') && description.includes('&gt;');

        // Decode the HTML if it's double-encoded
        const processedHtml = isDoubleEncoded
            ? description
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&')
                .replace(/&quot;/g, '"')
            : description;

        return (
            <RenderHTML
                source={{ html: processedHtml }}
                contentWidth={width - moderateScale(40)}
                baseStyle={[
                    styles.topicDescription,
                    {
                        color: themeColors.textPrimary,
                        fontSize: moderateScale(16),
                        lineHeight: moderateScale(24),
                    }
                ]}
                tagsStyles={{
                    // Base text styles that apply to all text
                    body: {
                        fontSize: moderateScale(16),
                        lineHeight: moderateScale(24),
                        color: themeColors.textPrimary,
                    },
                    // Paragraph styles
                    p: {
                        fontSize: moderateScale(16),
                        lineHeight: moderateScale(24),
                        color: themeColors.textPrimary,
                        marginVertical: moderateScale(8),
                    },
                    // Normal text container (like div, span)
                    div: {
                        fontSize: moderateScale(16),
                        lineHeight: moderateScale(24),
                        color: themeColors.textPrimary,
                    },
                    span: {
                        fontSize: moderateScale(16),
                        lineHeight: moderateScale(24),
                        color: themeColors.textPrimary,
                    },
                    // Lists
                    ol: {
                        marginVertical: moderateScale(8),
                        paddingLeft: moderateScale(24),
                    },
                    ul: {
                        marginVertical: moderateScale(8),
                        paddingLeft: moderateScale(24),
                    },
                    li: {
                        fontSize: moderateScale(16),
                        lineHeight: moderateScale(24),
                        color: themeColors.textPrimary,
                        marginBottom: moderateScale(4),
                    },
                    'li:not(:last-child)': {
                        marginBottom: moderateScale(4),
                    },
                    'ol li': {
                        paddingLeft: moderateScale(4),
                    },
                    // Text formatting
                    strong: {
                        fontWeight: '700',
                        color: themeColors.textPrimary,
                    },
                    b: {
                        fontWeight: '700',
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
                    i: {
                        fontStyle: 'italic',
                        color: themeColors.textPrimary,
                    },
                    // Images
                    img: {
                        width: wp("90%"),
                        height: undefined,
                        aspectRatio: 1, // Maintain aspect ratio
                        maxWidth: "100%",
                        objectFit: "scale-down",
                        marginVertical: moderateScale(12),
                        borderRadius: moderateScale(8),
                        alignSelf: 'center',
                    },
                    // Headers
                    h1: {
                        fontSize: moderateScale(24),
                        fontWeight: '700',
                        marginVertical: moderateScale(16),
                        color: themeColors.textPrimary,
                        lineHeight: moderateScale(32),
                    },
                    h2: {
                        fontSize: moderateScale(20),
                        fontWeight: '700',
                        marginVertical: moderateScale(14),
                        color: themeColors.textPrimary,
                        lineHeight: moderateScale(28),
                    },
                    h3: {
                        fontSize: moderateScale(18),
                        fontWeight: '700',
                        marginVertical: moderateScale(12),
                        color: themeColors.textPrimary,
                        lineHeight: moderateScale(26),
                    },
                    // Links
                    a: {
                        fontSize: moderateScale(16),
                        color: themeColors.primary, // Use your primary color for links
                        textDecorationLine: 'underline',
                        fontWeight: '500',
                        marginVertical: moderateScale(4),
                    },
                    // Code and preformatted text
                    code: {
                        backgroundColor: themeColors.backgroundSecondary,
                        paddingHorizontal: moderateScale(6),
                        paddingVertical: moderateScale(2),
                        borderRadius: moderateScale(4),
                        fontFamily: 'monospace',
                        fontSize: moderateScale(14),
                    },
                    pre: {
                        backgroundColor: themeColors.backgroundSecondary,
                        padding: moderateScale(12),
                        borderRadius: moderateScale(8),
                        marginVertical: moderateScale(8),
                    },
                }}
                enableExperimentalBR={false}
                enableExperimentalGhostLinesPrevention={true}
                systemFonts={['System', '-apple-system', 'Roboto', 'Helvetica Neue', 'Manrope-Regular', 'Manrope-Bold']}
                enableCSSInlineProcessing={true}
                // Additional props for better rendering
                defaultTextProps={{
                    selectable: true,
                    style: {
                        fontSize: moderateScale(16),
                        lineHeight: moderateScale(24),
                        color: themeColors.textPrimary,
                    }
                }}
                ignoredStyles={['fontFamily', 'fontFamily']}
                renderersProps={{
                    img: {
                        enableExperimentalPercentWidth: true
                    }
                }}
            />
        );
    };

    const renderItem = ({ item }) => {
        if (item.type === 'task') {
            return (
                <Card style={[styles.taskCard, { backgroundColor: themeColors.card }]}>
                    <Card.Content style={styles.taskCardContent}>
                        <View style={styles.taskHeader}>
                            <Text style={[styles.taskTitle, { color: themeColors.textPrimary }]}>{title}</Text>
                        </View>

                        <View style={styles.section}>
                            {renderTaskDescription()}
                        </View>
                    </Card.Content>
                </Card>
            );
        } else if (item.type === 'comments') {
            return (
                <Card style={[styles.taskCard, { backgroundColor: themeColors.card }]}>
                    <Card.Content>
                        <View style={styles.section}>
                            <Text style={[styles.commentsTitle, { color: themeColors.textPrimary }]}>
                                Submissions ({comments?.length || 0})
                            </Text>

                            {comments?.length > 0 ? (
                                comments.map(comment => (
                                    <TouchableOpacity
                                        key={comment?.id}
                                        style={[styles.commentCard, {
                                            backgroundColor: themeColors.card,
                                            borderColor: themeColors.lightGray
                                        }]}
                                        activeOpacity={0.7}
                                        delayLongPress={500}
                                    >
                                        <View style={styles.commentHeader}>
                                            <View style={styles.commentAuthor}>
                                                {comment.student?.profile_pic ? (
                                                    <Image
                                                        source={{ uri: comment.student.profile_pic }}
                                                        style={styles.commentAvatar}
                                                    />
                                                ) : (
                                                    <View style={[styles.profileImage, styles.profileImageFallback]}>
                                                        <Avatar.Text
                                                            size={hp('4.5%')}
                                                            label={getInitials(comment.student?.first_name, comment.student?.last_name)}
                                                            style={styles.commentAvatar}
                                                        />
                                                    </View>
                                                )}
                                                <View style={styles.commentAuthorInfo}>
                                                    <Text style={[styles.commentAuthorName, { color: themeColors.textPrimary }]}>
                                                        {comment.student?.first_name || 'Unknown User'}
                                                    </Text>
                                                    <Text style={[styles.commentTimestamp, { color: themeColors.textSecondary }]}>
                                                        {moment(comment.date).format('MMM D, YYYY [at] h:mm A')}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>

                                        <View style={styles.commentContent}>
                                            <Text style={[styles.commentText, { color: themeColors.textPrimary }]}>
                                                {comment.text}
                                            </Text>

                                            {comment.file_url && (
                                                <View style={styles.attachments}>
                                                    {renderAttachments(comment.file_url)}
                                                </View>
                                            )}

                                            {renderReactions(comment.reactions, comment.id)}
                                        </View>

                                        {renderReplies(comment.replies, comment.id)}
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <Text style={[styles.noCommentsText, { color: themeColors.textSecondary }]}>
                                    No submissions yet
                                </Text>
                            )}
                        </View>
                    </Card.Content>
                </Card>
            );
        }
        return null;
    };

    const flatListData = [
        { id: 'task', type: 'task' },
        { id: 'comments', type: 'comments' }
    ];

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
                <TaskDetailsSkeleton />
            </SafeAreaView>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top', 'left', 'right']}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <FlatList
                ref={scrollViewRef}
                data={flatListData}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={[
                    styles.scrollContainer,
                    { paddingBottom: inputContainerHeight + 20 } // Dynamic padding based on input height
                ]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                style={{ flex: 1 }}
            />
            <Animated.View
                ref={inputContainerRef}
                style={[
                    styles.commentInputContainer,
                    {
                        transform: [{ translateY: translateY }]
                    }
                ]}
                onLayout={onInputContainerLayout}
            >
                <TextEditor
                    attachments={attachments}
                    setAttachments={setAttachments}
                    richTextEditor={richTextEditor}
                    commentText={commentText}
                    setCommentText={handleHtmlChange}
                    isSubmitting={isSubmitting}
                    handleAddComment={handleAddComment}
                    isKeyboardVisible={isKeyboardVisible}
                    handleAddAttachment={handleAddAttachment}
                    handleRemoveAttachment={handleRemoveAttachment}
                />
            </Animated.View>
            <Modal
                transparent={true}
                visible={showEmojiPicker}
                animationType="fade"
                onRequestClose={() => setShowEmojiPicker(false)}
            >
                <TouchableWithoutFeedback onPress={() => setShowEmojiPicker(false)}>
                    <View style={styles.emojiPickerOverlay} />
                </TouchableWithoutFeedback>

                <Animated.View
                    style={[
                        styles.emojiPickerContainer,
                        {
                            transform: [
                                { translateX: -wp('20%') },
                                { translateY: -hp('15%') },
                            ],
                            top: '50%',
                            left: '25%',
                            backgroundColor: themeColors.surface
                        }
                    ]}
                >
                    <View style={styles.emojiSelectorContainer}>
                        <EmojiSelector
                            onEmojiSelected={emoji => {
                                if (activeEmojiPicker) {
                                    handleAddReaction(activeEmojiPicker, emoji);
                                }
                                setShowEmojiPicker(false);
                            }}
                            placeholder='Find emoji...'
                            showSearchBar={true}
                            showHistory={true}
                            showSectionTitles={true}
                            columns={8}
                            theme={themeColors.isDark ? 'dark' : 'light'}
                            categoryContainerStyle={[styles.categoryContainer, {
                                backgroundColor: themeColors.surface
                            }]}
                            categoryLabelStyle={[styles.categoryLabel, {
                                color: themeColors.textSecondary
                            }]}
                        />
                    </View>
                </Animated.View>
            </Modal>

            <Modal
                transparent={true}
                animationType="fade"
                visible={isdeleting}
                onRequestClose={() => setDeleting(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setDeleting(false)}
                >
                    <View style={[styles.alertContainer, { backgroundColor: themeColors.surface }]}>
                        <Text style={[styles.alertTitle, { color: themeColors.textPrimary }]}>Delete Comment?</Text>
                        <Text style={[styles.alertMessage, { color: themeColors.textSecondary }]}>This can't be undone</Text>
                        <TouchableOpacity
                            style={[styles.destructiveButton, { borderBottomColor: themeColors.lightGray }]}
                            onPress={handleCommentDelete}
                        >
                            <Text style={styles.destructiveButtonText}>Delete</Text>
                        </TouchableOpacity>

                        <View style={[styles.separator, { backgroundColor: themeColors.lightGray }]} />

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => {
                                setDeletingComment(null);
                                setDeleting(false);
                            }}
                        >
                            <Text style={[styles.cancelButtonText, { color: themeColors.primary }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    safeArea: {
        flex: 1,
        backgroundColor: colors.white,
    },
    scrollContainer: {
        paddingBottom: hp('2%'),
    },
    textEditorWrapper: {
        // This will make TextEditor stay at bottom and move up with keyboard
        // position: 'absolute',
        // bottom: 0,
        // left: 0,
        // right: 0,
    },
    taskCard: {
        margin: hp('1.5%'),
        borderRadius: moderateScale(12),
        elevation: 3,
        backgroundColor: "#fff",
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    taskTitle: {
        fontSize: moderateScale(18),
        fontFamily: 'Manrope-Medium',
        color: colors.textPrimary,
        flex: 1,
    },
    taskCardContent: {
        padding: hp('2%'),
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: hp('1%'),
    },
    section: {
        marginBottom: hp('1%'),
    },
    topicDescription: {
        fontSize: moderateScale(16),
        lineHeight: moderateScale(24),
        fontFamily: 'Manrope-Regular',
    },
    commentsTitle: {
        fontSize: moderateScale(18),
        fontFamily: 'Manrope-Medium',
        color: colors.textPrimary,
        marginBottom: hp('2%'),
    },
    noCommentsText: {
        fontSize: moderateScale(14),
        textAlign: 'center',
        fontFamily: 'Manrope-Regular',
        marginVertical: hp('2%'),
    },
    commentCard: {
        backgroundColor: '#fafafa',
        borderRadius: moderateScale(12),
        padding: hp('2%'),
        marginBottom: hp('2%'),
        borderWidth: 1,
        borderColor: '#eee',
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: hp('1%'),
    },
    commentAuthor: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    commentAvatar: {
        width: hp('4.5%'),
        height: hp('4.5%'),
        borderRadius: hp('2.25%'),
        marginRight: hp('1.5%'),
    },
    commentAuthorInfo: {
        flex: 1,
    },
    commentAuthorName: {
        fontSize: moderateScale(15),
        fontFamily: 'Manrope-Medium',
        color: colors.textPrimary,
        marginBottom: 2,
    },
    commentTimestamp: {
        fontSize: moderateScale(12),
        color: colors.textSecondary,
        fontFamily: 'Manrope-Regular',
    },
    commentContent: {
        marginLeft: hp('5.5%'),
    },
    commentText: {
        fontSize: moderateScale(14),
        color: colors.textPrimary,
        lineHeight: 20,
        marginBottom: hp('1%'),
        fontFamily: 'Manrope-Regular',
    },
    commentActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    commentActionButton: {
        padding: wp('1%'),
        marginLeft: wp('1%'),
    },
    reactionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: hp('1%'),
        gap: wp('1%'),
    },
    replyReactionsContainer: {
        marginTop: hp('0.5%'),
    },
    reactionPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f2f5',
        borderRadius: moderateScale(16),
        paddingHorizontal: wp('1.5%'),
        paddingVertical: hp('0.3%'),
        borderWidth: 1,
        borderColor: '#e4e6eb',
    },
    reactionEmoji: {
        fontSize: moderateScale(14),
        fontFamily: 'Manrope-Regular',
    },
    reactionCount: {
        fontSize: moderateScale(12),
        marginLeft: wp('0.5%'),
        color: colors.textSecondary,
        fontFamily: 'Manrope-Medium',
    },
    attachments: {
        marginTop: hp('1%'),
    },
    attachmentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: hp('1%'),
        borderRadius: moderateScale(8),
        marginBottom: hp('0.5%'),
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    attachmentIcon: {
        marginRight: wp('2%'),
    },
    attachmentName: {
        fontSize: moderateScale(13),
        color: colors.textSecondary,
        flex: 1,
        fontFamily: 'Manrope-Regular',
    },
    repliesContainer: {
        marginTop: hp('2%'),
        marginLeft: hp('1%'),
    },
    repliesDivider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp('1.5%'),
    },
    repliesLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#e0e0e0',
    },
    repliesLabel: {
        fontSize: moderateScale(12),
        color: colors.textSecondary,
        marginHorizontal: wp('3%'),
        fontFamily: 'Manrope-Medium',
    },
    replyCard: {
        backgroundColor: '#ffffff',
        borderRadius: moderateScale(10),
        padding: hp('1.5%'),
        marginBottom: hp('1%'),
        borderLeftWidth: 3,
        borderLeftColor: colors.primary,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    replyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: hp('0.5%'),
    },
    replyAuthor: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    replyAvatar: {
        width: hp('3.5%'),
        height: hp('3.5%'),
        borderRadius: hp('1.75%'),
        marginRight: hp('1%'),
    },
    replyAuthorInfo: {
        flex: 1,
    },
    replyAuthorName: {
        fontSize: moderateScale(13),
        fontFamily: 'Manrope-Medium',
        color: colors.primary,
        marginBottom: 1,
    },
    replyTimestamp: {
        fontSize: moderateScale(11),
        color: colors.textSecondary,
        fontFamily: 'Manrope-Regular',
    },
    replyContent: {
        marginLeft: hp('4%'),
    },
    replyEditor: {
        minHeight: hp('2%'),
        backgroundColor: 'transparent',
        fontSize: moderateScale(13),
        fontFamily: 'Manrope-Regular',
    },
    replyText: {
        fontSize: moderateScale(13),
        color: colors.textPrimary,
        lineHeight: 18,
        fontFamily: 'Manrope-Regular',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertContainer: {
        width: '75%',
        backgroundColor: colors.background,
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    alertTitle: {
        fontSize: moderateScale(18),
        fontFamily: 'Manrope-Bold',
        textAlign: 'center',
        paddingTop: 24,
        paddingBottom: 8,
        color: colors.textPrimary,
    },
    alertMessage: {
        fontSize: moderateScale(14),
        textAlign: 'center',
        paddingBottom: 24,
        paddingHorizontal: 16,
        color: colors.textSecondary,
    },
    destructiveButton: {
        paddingVertical: 16,
        alignItems: 'center',
        borderBottomWidth: 0.5,
        borderBottomColor: colors.lightGray,
    },
    destructiveButtonText: {
        color: '#ff3b30',
        fontSize: moderateScale(18),
        fontFamily: 'Manrope-Medium',
    },
    cancelButton: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: moderateScale(18),
        fontFamily: 'Manrope-Medium',
        color: colors.primary,
    },
    separator: {
        height: 0.5,
        backgroundColor: colors.lightGray,
    },
    emojiPickerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    emojiPickerContainer: {
        position: 'absolute',
        width: wp('90%'),
        height: hp('30%'),
        backgroundColor: colors.white,
        borderRadius: moderateScale(12),
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        overflow: 'hidden',
    },
    emojiSelectorContainer: {
        height: "100%",
        width: '100%',
    },
    categoryContainer: {
        height: hp('10%'),
        backgroundColor: "#fff",
    },
    categoryLabel: {
        fontSize: moderateScale(12),
        color: "#666",
        fontFamily: 'Manrope-Regular',
    },
    skeletonContainer: {
        padding: 16,
    },
    profileImageFallback: {
        backgroundColor: colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topicDescription: {
        flex: 1,
    },
    descriptionText: {
        fontSize: moderateScale(16),
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: moderateScale(20),
    },
});

export default TaskDetailsScreen;