// components/CustomHeader/CustomHeader.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { hp, moderateScale, wp } from '../../utils/responsive';

const CustomHeader = ({ title, subtitle, color }) => {
  const navigation = useNavigation();
  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.toggleDrawer()}
        style={styles.menuButton}
      >
        <Icon name="menu" size={hp("3.2%")} color={color.textPrimary} />
      </TouchableOpacity>
      {title &&
        <View style={styles.rightContainer}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSubtitle}>{subtitle}</Text>
        </View>}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // backgroundColor: '#fff',
    // paddingHorizontal: wp('4%'),
  },
  menuButton: {
    padding: moderateScale(4),
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 100
  },
  title: {
    fontSize: moderateScale(18),
    color: '#1e293b',
    fontFamily: 'Manrope-Bold',
  },
  rightContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    padding: moderateScale(4),
    marginLeft: wp('4%'),
  },

  headerTitle: {
    fontSize: moderateScale(20),
    color: '#1e293b',
    fontFamily: 'Manrope-Bold',
    // marginBottom: moderateScale(4),
  },
  headerSubtitle: {
    fontSize: moderateScale(14),
    color: '#64748b',
    fontFamily: 'Manrope-Regular',
  },
});

export default CustomHeader;