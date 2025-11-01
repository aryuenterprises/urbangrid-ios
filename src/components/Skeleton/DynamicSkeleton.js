import React from 'react';
import { View, StyleSheet, Image, FlatList, Button, TouchableOpacity } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { hp, moderateScale, wp } from '../../utils/responsive';

const DynamicSkeleton = ({ children, isLoading, customSkeleton }) => {
  if (!isLoading) return children;
  
  if (customSkeleton) return customSkeleton;

  const processElement = (element, parentStyle = {}) => {
    if (!element) return null;

    const style = StyleSheet.flatten(element.props.style) || {};
    const combinedStyle = { ...parentStyle, ...style };

    // Skip certain components
    const excludedComponents = ['Button', 'ActivityIndicator', 'TouchableOpacity'];
    if (excludedComponents.includes(element.type?.displayName)) {
      return null;
    }

    // Handle different component types
    switch (element.type?.displayName) {
      case 'Text':
        return (
          <SkeletonPlaceholder.Item
            width={style.width || wp('60%')}
            height={style.fontSize || hp('2%')}
            borderRadius={moderateScale(4)}
            marginBottom={style.marginBottom || hp('1%')}
          />
        );
      case 'Image':
        return (
          <SkeletonPlaceholder.Item
            width={style.width || '100%'}
            height={style.height || hp('20%')}
            borderRadius={style.borderRadius || 0}
          />
        );
      case 'FlatList':
        return (
          <View style={combinedStyle}>
            {[1, 2, 3].map((_, i) => (
              <SkeletonPlaceholder.Item
                key={i}
                width="100%"
                height={hp('10%')}
                borderRadius={moderateScale(8)}
                marginBottom={hp('1%')}
              />
            ))}
          </View>
        );
      default:
        return (
          <SkeletonPlaceholder.Item style={combinedStyle}>
            {React.Children.map(element.props.children, (child) => 
              processElement(child, combinedStyle)
            )}
          </SkeletonPlaceholder.Item>
        );
    }
  };

  return (
    <SkeletonPlaceholder backgroundColor={colors.skeletonBg} highlightColor={colors.skeletonHighlight}>
      <View style={styles.container}>
        {React.Children.map(children, processElement)}
      </View>
    </SkeletonPlaceholder>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: moderateScale(16),
    flex: 1
  }
});

// Add display names to components
Text.displayName = 'Text';
Image.displayName = 'Image';
FlatList.displayName = 'FlatList';
Button.displayName = 'Button';
TouchableOpacity.displayName = 'TouchableOpacity';

export default DynamicSkeleton;