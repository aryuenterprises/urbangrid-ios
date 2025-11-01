import React from 'react';
import { TouchableOpacity, Text, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { globalstyles } from '../../utils/globalStyles';
import { hp, moderateScale } from '../../utils/responsive';

const GradientButton = ({
  colors = ['#4c669f', '#3b5998', '#192f6a'],
  text = 'Continue',
  onPress,
  style,
  textStyle,
  disable,
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, style]} disabled={disable}>
      <LinearGradient
        colors={colors}
        style={styles.gradient}
        start={{ x: 1, y: 0 }}  // Starts at top
        end={{ x: 1, y: 1 }}    // Ends at bottom
      >
        <Text style={[globalstyles.buttonText, textStyle]}>{text}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = {
  button: {
    overflow: 'hidden',
    // padding: Platform.OS === 'ios' ? 100 : hp("1%"),
    borderRadius: moderateScale(25),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    ...Platform.select({
      ios: {
        height: hp("5%"),
      },
    }),
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        flex: 1,
        padding: 0
      },
      android: {
        padding: hp("2%")
      }
    })
  },
  buttonText: {
    color: 'white',
    fontFamily: 'Manrope-Bold',
    fontSize: moderateScale(16),

  }
};

export default GradientButton;