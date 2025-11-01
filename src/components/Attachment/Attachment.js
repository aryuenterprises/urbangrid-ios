import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, StyleSheet,
  KeyboardAvoidingView, ScrollView, Platform, Modal, Dimensions,
  TouchableWithoutFeedback
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import { useAppTheme } from '../../hook/useAppTheme';
import { hp, moderateScale } from '../../utils/responsive';

const Attachment = ({ handleAddAttachment }) => {
  const { colors: themeColors } = useAppTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const linkUrlRef = useRef(null);

  useEffect(() => {
    if (isModalVisible && showLinkInput) {
      const timer = setTimeout(() => {
        linkUrlRef.current?.focus();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isModalVisible, showLinkInput]);

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setShowLinkInput(false);
    setLinkUrl('');
    setLinkTitle('');
  };

  const handleAttachmentPick = (type) => {
    handleAddAttachment(type);
    handleCloseModal();
  };

  const handleAttachLink = () => {
    if (!linkUrl.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid URL'
      });
      return;
    }

    const formattedUrl = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
    handleAddAttachment('link', {
      id: Date.now(),
      type: 'link',
      url: formattedUrl,
      name: linkTitle || formattedUrl
    });

    handleCloseModal();
  };

  const handleBackdropPress = () => {
    if (showLinkInput) {
      setShowLinkInput(false);
      setLinkUrl('');
      setLinkTitle('');
    } else {
      handleCloseModal();
    }
  };

  const handleContainerPress = (event) => {
    event.stopPropagation();
  };

  return (
    <>
      {/* Attachment Button */}
      <View>
        <TouchableOpacity
          style={[styles.fabButton, { backgroundColor: themeColors.primary }]}
          onPress={() => setIsModalVisible(true)}
        >
          <MaterialIcons name="attach-file" size={24} color={themeColors.white} />
        </TouchableOpacity>
      </View>

      {/* Attachment Picker Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType={showLinkInput ? 'fade' : 'slide'}
        onRequestClose={handleBackdropPress}
      >
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={showLinkInput ? styles.centerModalWrapper : styles.bottomModalWrapper}
            >
              <TouchableWithoutFeedback onPress={handleContainerPress}>
                <View styles={{backgroundColor: themeColors.card}}>
                  {!showLinkInput ? (
                    // Attachment Type Selection View
                    <View style={[styles.bottomSheetContainer, { 
                      backgroundColor: themeColors.card,
                      shadowColor: themeColors.isDark ? '#000' : '#888',
                      shadowOffset: { width: 0, height: -2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                      elevation: 10,
                    }]}>
                      <ScrollView
                        contentContainerStyle={{ paddingBottom: 20 }}
                        keyboardShouldPersistTaps="handled"
                      >
                        <Text style={[styles.sheetTitle, { color: themeColors.textPrimary }]}>
                          Add Attachment
                        </Text>
                        <View style={styles.optionsRow}>
                          {[
                            { type: 'image', icon: 'image', label: 'Image' },
                            { type: 'video', icon: 'videocam', label: 'Video' },
                            { type: 'file', icon: 'insert-drive-file', label: 'File' },
                            // { type: 'link', icon: 'link', label: 'Link', custom: true }
                          ].map(option => (
                            <TouchableOpacity
                              key={option.type}
                              style={[styles.option, { 
                                backgroundColor: 'transparent',
                              }]}
                              onPress={() => {
                                if (option.custom) return setShowLinkInput(true);
                                handleAttachmentPick(option.type);
                              }}
                            >
                              <MaterialIcons name={option.icon} size={28} color={themeColors.primary} />
                              <Text style={[styles.optionLabel, { color: themeColors.textSecondary }]}>
                                {option.label}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </ScrollView>
                    </View>
                  ) : (
                    // Link Input View
                    <View style={[styles.centeredSheetContainer, { 
                      backgroundColor: themeColors.surface,
                      shadowColor: themeColors.isDark ? '#000' : '#888',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 12,
                      elevation: 8,
                    }]}>
                      <ScrollView
                        contentContainerStyle={{ paddingBottom: 20 }}
                        keyboardShouldPersistTaps="handled"
                      >
                        <Text style={[styles.sheetTitle, { color: themeColors.textPrimary }]}>
                          Attach a Link
                        </Text>

                        <View style={[styles.inputWrapper, { 
                          backgroundColor: themeColors.background,
                          borderColor: themeColors.lightGray 
                        }]}>
                          <MaterialIcons name="link" size={22} color={themeColors.primary} />
                          <TextInput
                            ref={linkUrlRef}
                            placeholder="Enter link URL"
                            placeholderTextColor={themeColors.textSecondary}
                            value={linkUrl}
                            onChangeText={setLinkUrl}
                            style={[styles.textInput, { color: themeColors.textPrimary }]}
                            keyboardType="url"
                            returnKeyType="done"
                            onSubmitEditing={handleAttachLink}
                          />
                        </View>

                        <View style={[styles.inputWrapper, { 
                          backgroundColor: themeColors.background,
                          borderColor: themeColors.lightGray 
                        }]}>
                          <MaterialIcons name="title" size={22} color={themeColors.primary} />
                          <TextInput
                            placeholder="Optional title"
                            placeholderTextColor={themeColors.textSecondary}
                            value={linkTitle}
                            onChangeText={setLinkTitle}
                            style={[styles.textInput, { color: themeColors.textPrimary }]}
                            returnKeyType="done"
                            onSubmitEditing={handleAttachLink}
                          />
                        </View>

                        <View style={styles.linkButtons}>
                          <TouchableOpacity 
                            onPress={() => {
                              setShowLinkInput(false);
                              setLinkUrl('');
                              setLinkTitle('');
                            }}
                            style={styles.cancelButton}
                          >
                            <Text style={[styles.cancelText, { color: themeColors.textSecondary }]}>
                              Cancel
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            onPress={handleAttachLink} 
                            style={[styles.attachBtn, { backgroundColor: themeColors.primary }]}
                          >
                            <Text style={[styles.attachText, { color: themeColors.white }]}>
                              Attach
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </ScrollView>
                    </View>
                  )}
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  // Attachment Button Styles
  fabButton: {
    width: hp("6%"),
    height: hp("6%"),
    borderRadius: 100,
    // backgroundColor will be set dynamically
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    zIndex: 999
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomModalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  centerModalWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSheetContainer: {
    // backgroundColor and shadow will be set dynamically
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    // maxHeight: '70%',
    width: '100%',
  },
  centeredSheetContainer: {
    // backgroundColor and shadow will be set dynamically
    padding: 20,
    borderRadius: 16,
    maxWidth: 400,
    maxHeight: windowHeight * 0.7,
    marginHorizontal: 20,
    width: '90%',
  },
  sheetTitle: {
    fontSize: moderateScale(18),
    fontFamily: 'Manrope-Medium',
    textAlign: 'center',
    marginBottom: 15,
    // color will be set dynamically
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10
  },
  option: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
  },
  optionLabel: {
    fontSize: moderateScale(12),
    // color will be set dynamically
    marginTop: 5,
    fontFamily: 'Manrope-Regular',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor and borderColor will be set dynamically
    paddingHorizontal: 10,
    borderRadius: 10,
    marginVertical: 10,
    borderWidth: 1,
  },
  textInput: {
    flex: 1,
    padding: 10,
    fontSize: moderateScale(14),
    // color will be set dynamically
    fontFamily: 'Manrope-Regular',
  },
  linkButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15
  },
  cancelButton: {
    padding: 10,
    marginRight: 10,
  },
  cancelText: {
    // color will be set dynamically
    fontSize: moderateScale(14),
    fontFamily: 'Manrope-Regular',
  },
  attachBtn: {
    // backgroundColor will be set dynamically
    borderRadius: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  attachText: {
    // color will be set dynamically
    fontFamily: 'Manrope-Medium',
    fontSize: moderateScale(14),
  }
});

export default Attachment;