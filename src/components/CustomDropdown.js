import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { globalstyles } from '../utils/globalStyles';
import { hp, moderateScale } from '../utils/responsive';
import Icon from 'react-native-vector-icons/Ionicons';

const CustomDropdown = ({
  items,
  defaultValue,
  placeholder,
  onSelectItem,
  style,
  selectedCourse = "",
  dropDownContainerStyle,
  zIndex,
  zIndexInverse,
  multiple = false,
  searchable = false,
  disabled = false,
  color,
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue || selectedCourse);
  const [dropDownItems, setDropDownItems] = useState(items);
  
  useEffect(() => {
    if (selectedCourse) {
      setValue(selectedCourse.course);
    }
  }, [selectedCourse]);

  // Update items when items prop changes
  useEffect(() => {
    setDropDownItems(items);
  }, [items]);

  return (
    <View style={[globalstyles.inputWrapper, style]}>
      <DropDownPicker
        open={open}
        value={value}
        items={dropDownItems}
        setOpen={setOpen}
        setValue={setValue}
        setItems={setDropDownItems}
        listMode="SCROLLVIEW"
        placeholder={placeholder}
        onSelectItem={(item) => {
          setValue(item.value);
          if (onSelectItem) onSelectItem(item);
        }}
        multiple={multiple}
        searchable={searchable}
        disabled={disabled}
        zIndex={zIndex}
        zIndexInverse={zIndexInverse}
        style={{
          borderColor: open ? color.primary : '#ddd',
          paddingHorizontal: hp("1%"),
          paddingLeft: hp("1%"),
          backgroundColor: color.background
        }}
        dropDownContainerStyle={[{
          borderColor: '#ddd',
          marginTop: 5,
        }, dropDownContainerStyle]}
        textStyle={{
          fontSize: moderateScale(16),
          color: color.textPrimary,
          fontFamily: 'Manrope-Regular',
        }}
        placeholderStyle={{
          color: color.textSecondary,
          fontSize: moderateScale(16),
          fontFamily: 'Manrope-Regular',
        }}
        selectedItemContainerStyle={{
          backgroundColor: color.lightGray,
        }}
        selectedItemLabelStyle={{
          fontFamily: 'Manrope-Bold',
          color: color.primary,
        }}
        listItemContainerStyle={{
          height: 40,
        }}
        listItemLabelStyle={{
          color: color.textPrimary,
          fontSize: moderateScale(14),
          fontFamily: 'Manrope-Regular',
        }}
        searchContainerStyle={{
          borderBottomColor: '#ddd',
          paddingBottom: 10,
        }}
        searchTextInputStyle={[globalstyles.input, {
          borderColor: '#ddd',
          marginBottom: 0,
        }]}
        searchPlaceholder="Search..."
        searchPlaceholderTextColor={color.textSecondary}
        ArrowUpIconComponent={() => <Icon name="chevron-up" size={20} color={color.textSecondary} />}
        ArrowDownIconComponent={() => <Icon name="chevron-down" size={20} color={color.textSecondary} />}
        TickIconComponent={() => <Icon name="checkmark" size={20} color={color.primary} />}
        CloseIconComponent={() => <Icon name="x" size={20} color={color.error} />}
        modalProps={{
          animationType: 'fade',
        }}
        modalTitle="Select an item"
        modalTitleStyle={{
          fontFamily: 'Manrope-Bold',
        }}
        modalContentContainerStyle={{
          backgroundColor: color.backgroundColor,
        }}
        modalAnimationType="fade"
      />
    </View>
  );
};

export default CustomDropdown;