import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Text, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { hp, moderateScale, wp } from '../../utils/responsive';
import { globalstyles } from '../../utils/globalStyles';
import { useAppTheme } from '../../hook/useAppTheme';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CustomTabBar = ({ state, descriptors, navigation }) => {
    const dispatch = useDispatch();
    const { colors: themeColors, isDark } = useAppTheme();
    const isFooterVisible = useSelector((state) => state.footer.isVisible);
    const translateY = useRef(new Animated.Value(0)).current;
    // Use a ref to store animations dynamically
    const scaleAnimations = useRef({}).current;
    const insets = useSafeAreaInsets();
    // Function to get or create animation value
    const getScaleAnimation = (index) => {
        if (!scaleAnimations[index]) {
            scaleAnimations[index] = new Animated.Value(1);
        }
        return scaleAnimations[index];
    };

    useEffect(() => {
        if (isFooterVisible) {
            Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                friction: 8,
                tension: 40
            }).start();
        } else {
            Animated.spring(translateY, {
                toValue: 100,
                useNativeDriver: true,
                friction: 8,
                tension: 40
            }).start();
        }
    }, [isFooterVisible]);

    const handleTabPress = (index, onPress) => {
        const scaleAnim = getScaleAnimation(index);
        // Scale animation on press
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.9,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            })
        ]).start();

        onPress();
    };

    // Gradient colors based on theme
    const gradientColors = isDark
        ? ['rgba(30, 30, 30, 0.9)', 'rgba(45, 45, 45, 0.8)', 'rgba(60, 60, 60, 0.7)']
        : ['rgba(255, 255, 255, 0.9)', 'rgba(245, 245, 245, 0.8)', 'rgba(235, 235, 235, 0.7)'];

    return (
        <Animated.View style={[
            styles.tabBar,
            {
                marginBottom: insets.bottom,
                transform: [{ translateY }],
                backgroundColor: 'transparent', // Remove solid background
            }
        ]}>
            {/* Blur View with Gradient */}
            {/* <BlurView
                intensity={isDark ? 30 : 20}
                tint={isDark ? "dark" : "light"}
                style={StyleSheet.absoluteFillObject}
            /> */}

            {/* Gradient Overlay */}
            <LinearGradient
                colors={gradientColors}
                locations={[0, 0.5, 1]}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            {/* Border with Gradient */}
            <LinearGradient
                colors={isDark
                    ? ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.1)']
                    : ['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0.1)']
                }
                style={styles.borderGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            />

            {state.routes.map((route, index) => {
                const scaleAnim = getScaleAnimation(index);
                const { options } = descriptors[route.key];
                const label =
                    options.tabBarLabel !== undefined
                        ? options.tabBarLabel
                        : options.title !== undefined
                            ? options.title
                            : route.name;
                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                    });
                };

                let iconName;
                switch (route.name) {
                    case 'Dashboard':
                        iconName = 'view-dashboard';
                        break;
                    case 'Classes':
                        iconName = 'book-open';
                        break;
                    case 'Attendance':
                        iconName = 'calendar-check';
                        break;
                    case 'Course':
                        iconName = 'clipboard-list';
                        break;
                    case 'Chat':
                        iconName = 'chat';
                        break;
                    default:
                        iconName = 'circle';
                }

                return (
                    <Animated.View
                        key={route.key}
                        style={[
                            styles.tabContainer,
                            { transform: [{ scale: scaleAnim }] }
                        ]}
                    >
                        <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            testID={options.tabBarTestID}
                            onPress={() => handleTabPress(index, onPress)}
                            onLongPress={onLongPress}
                            style={[
                                styles.tabItem,
                                isFocused && {
                                    backgroundColor: isDark
                                        ? `${themeColors.primary}20`
                                        : `${themeColors.primary}15`
                                }
                            ]}
                        >
                            <View style={styles.iconContainer}>
                                <MaterialCommunityIcons
                                    name={iconName}
                                    size={hp(2.8)}
                                    color={isFocused ? themeColors.primary : themeColors.textSecondary}
                                />
                                {isFocused && (
                                    <View style={[
                                        styles.activeDot,
                                        { backgroundColor: themeColors.primary }
                                    ]} />
                                )}
                            </View>

                            <Text style={[
                                styles.tabLabel,
                                {
                                    color: isFocused ? themeColors.primary : themeColors.textSecondary,
                                    fontSize: moderateScale(9),
                                    fontFamily: isFocused ? 'Manrope-SemiBold' : 'Manrope-Medium'
                                }
                            ]}>
                                {label}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                );
            })}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: hp("8%"),
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        overflow: "hidden",
        ...Platform.select({
            ios: {
                margin: hp("1.5%"),
                borderRadius: moderateScale(30),
            },
            android: {
                borderRadius: moderateScale(20),
                marginHorizontal: wp('2%'),
            }
        }),
    },
    borderGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
    },
    tabContainer: {
        flex: 1,
        alignItems: 'center',
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: wp("1%"),
        paddingVertical: hp('0.8%'),
        ...Platform.select({
            ios: {
                paddingVertical: hp("1.5%"),
                paddingHorizontal: 0,
                width: '100%',
            },
            android: {
                borderRadius: moderateScale(12),
                width: '90%',
            },
        }),
    },
    iconContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: hp('0.3%'),
    },
    tabLabel: {
        textAlign: 'center',
        marginTop: hp('0.2%'),
    },
    activeDot: {
        position: 'absolute',
        bottom: -hp('0.3%'),
        width: moderateScale(4),
        height: moderateScale(4),
        borderRadius: moderateScale(2),
    },
});

export default CustomTabBar;