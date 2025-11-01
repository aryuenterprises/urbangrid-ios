import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  Platform,
  TextInput,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Image
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Video } from 'react-native-video';
import { IconButton } from 'react-native-paper';
import { hp, moderateScale, wp } from '../utils/responsive';
import Attachment from './Attachment/Attachment';
import { useAppTheme } from '../hook/useAppTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const EnhancedTextEditor = ({
  replyingTo,
  setReplyingTo,
  attachments = [],
  setAttachments,
  richTextEditor,
  commentText = '',
  setCommentText,
  isSubmitting,
  handleAddComment,
  handleAddAttachment,
  handleRemoveAttachment
}) => {
  const { colors: themeColors } = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);
  const insets = useSafeAreaInsets();

  const renderAttachment = (attachment) => {
    switch (attachment.type) {
      case 'image':
        return (
          <View style={styles.attachmentContainer} key={attachment.id}>
            <Image
              source={{ uri: attachment.url }}
              style={styles.attachmentImage}
              resizeMode="cover"
            />
            <View style={styles.attachmentActions}>
              <IconButton
                icon="close"
                size={16}
                onPress={() => handleRemoveAttachment(attachment.id)}
                style={[styles.attachmentRemoveButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
                iconColor={themeColors.white}
              />
            </View>
          </View>
        );
      case 'video':
        return (
          <View style={styles.attachmentContainer} key={attachment.id}>
            <Video
              source={{ uri: attachment.url }}
              style={styles.attachmentVideo}
              resizeMode="cover"
              controls
              paused
            />
            <View style={styles.attachmentActions}>
              <IconButton
                icon="close"
                size={16}
                onPress={() => handleRemoveAttachment(attachment.id)}
                style={[styles.attachmentRemoveButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
                iconColor={themeColors.white}
              />
            </View>
          </View>
        );
      case 'file':
        return (
          <View style={[styles.fileAttachment, { backgroundColor: themeColors.card }]} key={attachment.id}>
            <MaterialIcons name="insert-drive-file" size={24} color={themeColors.textSecondary} />
            <View style={styles.fileAttachmentInfo}>
              <Text style={[styles.fileAttachmentName, { color: themeColors.textPrimary }]} numberOfLines={1}>
                {attachment.name}
              </Text>
              <Text style={[styles.fileAttachmentSize, { color: themeColors.textSecondary }]}>
                {(Math.random() * 2).toFixed(1)} MB
              </Text>
            </View>
            <IconButton
              icon="close"
              size={16}
              onPress={() => handleRemoveAttachment(attachment.id)}
              style={styles.attachmentRemoveButton}
              iconColor={themeColors.textSecondary}
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingView}
      keyboardVerticalOffset={insets.bottom}
    >
      {/* Reply Indicator */}
      {replyingTo && (
        <View style={[styles.replyingToContainer, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.replyingToText, { color: themeColors.textSecondary }]}>
            Replying to {replyingTo.author}
          </Text>
          <TouchableOpacity onPress={() => setReplyingTo(null)}>
            <MaterialIcons name="close" size={20} color={themeColors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Enhanced Input Container */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: themeColors.card,
            borderTopColor: themeColors.lightGray,
            paddingBottom: insets.bottom
          }
        ]}
      >
        {attachments.length > 0 && (
          <ScrollView
            horizontal
            style={styles.attachmentsPreview}
            contentContainerStyle={styles.attachmentsPreviewContent}
          >
            {attachments.map(renderAttachment)}
          </ScrollView>
        )}

        <View style={styles.inputRow}>
          <Attachment handleAddAttachment={handleAddAttachment} />
          <View style={[styles.richEditorContainer, {
            backgroundColor: themeColors.background,
            borderColor: isFocused ? themeColors.primary : themeColors.lightGray
          }]}>
            <TextInput
              ref={richTextEditor}
              style={[styles.richEditor, { color: themeColors.textPrimary }]}
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Write your comment..."
              placeholderTextColor={themeColors.textSecondary}
              editable={!isSubmitting}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              multiline={true}
              returnKeyType="default"
            />
          </View>
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: themeColors.primary },
              (isSubmitting || (!commentText.trim() && attachments.length === 0)) && [
                styles.sendButtonDisabled,
                { backgroundColor: themeColors.textSecondary }
              ]
            ]}
            onPress={handleAddComment}
            disabled={isSubmitting || (!commentText.trim() && attachments.length === 0)}
          >
            {isSubmitting ? (
              <ActivityIndicator color={themeColors.white} />
            ) : (
              <MaterialIcons
                name="send"
                size={24}
                color={themeColors.white}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 0,
  },
  inputContainer: {
    borderTopWidth: 1,
    paddingHorizontal: moderateScale(12),
    paddingTop: hp("1%"),
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: moderateScale(8),
  },
  richEditorContainer: {
    flex: 1,
    borderWidth: 1,
    borderRadius: moderateScale(20),
    marginHorizontal: moderateScale(8),
    maxHeight: hp('15%'),
  },
  richEditor: {
    flex: 1,
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(8),
    fontSize: moderateScale(16),
    textAlignVertical: 'center',
  },
  sendButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  attachmentsPreview: {
    maxHeight: hp('15%'),
    marginBottom: moderateScale(8),
  },
  attachmentsPreviewContent: {
    paddingRight: moderateScale(8),
  },
  attachmentContainer: {
    width: wp('25%'),
    height: hp('12%'),
    marginRight: moderateScale(8),
    borderRadius: moderateScale(8),
    overflow: 'hidden',
  },
  attachmentImage: {
    width: '100%',
    height: '100%',
  },
  attachmentVideo: {
    width: '100%',
    height: '100%',
  },
  attachmentActions: {
    position: 'absolute',
    top: moderateScale(4),
    right: moderateScale(4),
  },
  attachmentRemoveButton: {
    margin: 0,
    padding: 0,
  },
  fileAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(8),
    borderRadius: moderateScale(8),
    marginRight: moderateScale(8),
    minWidth: wp('60%'),
  },
  fileAttachmentInfo: {
    flex: 1,
    marginLeft: moderateScale(8),
  },
  fileAttachmentName: {
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
  fileAttachmentSize: {
    fontSize: moderateScale(12),
    marginTop: moderateScale(2),
  },
  replyingToContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(8),
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  replyingToText: {
    fontSize: moderateScale(14),
    flex: 1,
    marginRight: moderateScale(8),
  },
});

export default EnhancedTextEditor;