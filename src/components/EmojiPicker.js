// EmojiPicker.js - Fixed Version
import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { getEmojisByCategory } from '../utils/Emoji';
import { hp, moderateScale } from '../utils/responsive';

const EmojiPicker = ({ onSelect }) => {
  const [activeCategory, setActiveCategory] = useState('Smileys & Emotion');
  const emojisByCategory = getEmojisByCategory();

  return (
    <View style={styles.container}>
      {/* Category Tabs - Horizontal Scroll */}
      {/* <FlatList
        horizontal
        data={Object.keys(emojisByCategory)}
        renderItem={({ item: category }) => (
          <TouchableOpacity 
            onPress={() => setActiveCategory(category)}
            style={styles.categoryTab}
          >
            <Text style={[
              styles.categoryText,
              activeCategory === category && styles.activeCategory
            ]}>
              {category.split(' & ')[0]}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(category) => category}
        contentContainerStyle={styles.categoryList}
        showsHorizontalScrollIndicator={false}
      /> */}

      {/* Emoji Grid */}
      <FlatList
        data={emojisByCategory[activeCategory] || []}
        numColumns={8}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => onSelect(item.unified)}
            style={styles.emojiItem}
          >
            <Text style={styles.emoji}>{item.char}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.unified}
        contentContainerStyle={styles.emojiGrid}
        initialNumToRender={50}
        windowSize={5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    backgroundColor: 'white',
  },
  categoryList: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  categoryTab: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginHorizontal: 4,
  },
  categoryText: {
    fontSize: moderateScale(14),
    color: '#666',
    fontFamily: 'Manrope-Regular',
  },
  activeCategory: {
    fontFamily: 'Manrope-Bold',
    color: '#000',
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  emojiGrid: {
    paddingBottom: 16,
  },
  emojiItem: {
    width: '12.5%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: moderateScale(24),
  },
});

export default EmojiPicker;