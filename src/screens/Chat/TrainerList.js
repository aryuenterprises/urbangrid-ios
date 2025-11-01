import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Alert, RefreshControl } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { hp, wp, moderateScale } from '../../utils/responsive'
import { colors, globalstyles } from '../../utils/globalStyles'
import { Avatar } from 'react-native-paper'
import GradientButton from '../../components/GradientButton/gradientButton'
import { useSelector } from 'react-redux'
import { addTrainersToChat } from '../../services/auth'
import Toast from 'react-native-toast-message'
import { useAppTheme } from '../../hook/useAppTheme'
import { useScrollDetection } from '../../hook/useScrollDetection'

const TrainerList = ({ navigation, route }) => {
    const { trainer } = route.params || {}
    const { colors: themeColors } = useAppTheme();
    const [searchQuery, setSearchQuery] = useState('')
    const [trainers, setTrainers] = useState(trainer)
    const [filteredTrainers, setFilteredTrainers] = useState(trainer)
    const [selectedTrainers, setSelectedTrainers] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const { studentProfile, user, token } = useSelector(state => state.auth);
    const { handleScroll, createAnimatedScrollView } = useScrollDetection();
    const AnimatedFlatList = createAnimatedScrollView(FlatList);
      const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredTrainers(trainers)
        } else {
            const filtered = trainers.filter(trainer =>
                trainer?.trainer?.full_name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            setFilteredTrainers(filtered)
        }
    }, [searchQuery, trainers])

  const onRefresh = useCallback(() => {
  }, []);

    const toggleTrainerSelection = (trainerId) => {
        if (selectedTrainers.includes(trainerId)) {
            setSelectedTrainers(selectedTrainers.filter(id => id !== trainerId))
        } else {
            setSelectedTrainers([...selectedTrainers, trainerId])
        }
    }

    const handleUnselectAll = () => {
        setSelectedTrainers([])
    }

    const handleSelectAll = () => {
        const allTrainerIds = filteredTrainers.map(trainer => trainer?.trainer?.employee_id)
        setSelectedTrainers(allTrainerIds)
    }

    const handleAddTrainers = async () => {
        if (selectedTrainers.length === 0) {
            Toast.show({
                type: 'error',
                text1: 'No Selection',
                text2: 'Please select at least one trainer to add'
            });
            return
        }

        try {
            setIsLoading(true)
            await addTrainersToChat(selectedTrainers[0], user.registration_id)
            navigation.goBack()
        } catch (error) {
            console.log("Error adding trainers:", error)
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to add trainers'
            });
        } finally {
            setIsLoading(false)
        }
    }

    const getInitials = (fullName) => {
        if (!fullName) return 'TN'
        const names = fullName.split(' ')
        return `${names[0]?.[0] || ''}${names[1]?.[0] || ''}`.toUpperCase()
    }

    const renderTrainerItem = ({ item }) => {
        const isSelected = selectedTrainers.includes(item?.trainer?.employee_id)

        return (
            <TouchableOpacity
                style={[styles.trainerItem, isSelected && styles.selectedItem, { backgroundColor: themeColors.card }]}
                onPress={() => toggleTrainerSelection(item?.trainer?.employee_id)}
            >
                {item?.trainer?.profile_pic ? (
                    <Avatar.Image
                        source={{ uri: item?.trainer?.profile_pic }}
                        size={hp('6%')}
                        style={styles.avatar}
                    />
                ) : (
                    <Avatar.Text
                        size={hp('6%')}
                        label={getInitials(item?.trainer?.full_name)}
                        style={styles.avatar}
                    />
                )}
                <View style={styles.trainerInfo}>
                    <Text style={[styles.trainerName, isSelected && styles.selectedText, { color: themeColors.textPrimary }]}>
                        {item?.trainer?.full_name}
                    </Text>
                    <Text style={[styles.trainerSpecialty, isSelected && styles.selectedSubText, { color: themeColors.textGrey }]} numberOfLines={1}>
                        {item?.trainer?.specialty || 'Fitness Trainer'}
                    </Text>
                </View>
                <View style={[styles.selectionIndicator, isSelected && styles.selectedCheckmark]}>
                    {isSelected ? (
                        <Ionicons
                            name="checkmark"
                            size={moderateScale(20)}
                            color="#FFFFFF"
                        />
                    ) : null}
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: themeColors.card }]}>
                <Ionicons name="search" size={moderateScale(20)} color="#666" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search trainers..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#999"
                />
            </View>

            {/* Selection Actions */}
            <View style={styles.selectionActions}>
                <Text style={styles.selectionText}>
                    {selectedTrainers.length ?
                        `${selectedTrainers.length} trainer${selectedTrainers.length > 1 ? 's' : ''} selected` : " "
                    }
                </Text>
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={selectedTrainers.length > 0 ? handleUnselectAll : handleSelectAll}
                    >
                        <Text style={styles.actionButtonText}>{selectedTrainers.length > 0 ? "Unselect All" : "Select All"}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Trainers List */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <Text>Loading trainers...</Text>
                </View>
            ) : (
                <AnimatedFlatList
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    data={filteredTrainers}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[themeColors.primary]}
                            tintColor={themeColors.primary}
                            progressBackgroundColor={themeColors.background}
                        />
                    }
                    renderItem={renderTrainerItem}
                    keyExtractor={item => item.trainer.employee_id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={globalstyles.loginContainer}>
                            <Text style={[globalstyles.buttonText, { color: themeColors.textSecondary }]}>No chats available</Text>
                        </View>
                    }
                />
            )}

            {selectedTrainers.length > 0 && (
                <View style={styles.addButton}>
                    <GradientButton
                        disable={isLoading}
                        colors={['#BA000C', '#5E000B']}
                        text={`Add ${selectedTrainers.length} Trainer${selectedTrainers.length > 1 ? 's' : ''}`}
                        onPress={handleAddTrainers}
                    />
                </View>
            )}
        </View>
    )
}

export default TrainerList

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp('4%'),
        paddingVertical: hp('2%'),
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: moderateScale(8),
        marginRight: wp('3%'),
        borderRadius: moderateScale(20),
        backgroundColor: colors.lightPrimary + '20',
    },
    header: {
        flex: 1,
    },
    headerTitle: {
        fontSize: moderateScale(22),
        fontWeight: '700',
        color: '#2c3e50',
        fontFamily: 'Manrope-Bold',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        margin: wp('4%'),
        marginBottom: hp('1%'),
        borderRadius: moderateScale(25),
        paddingHorizontal: wp('3%'),
        height: hp('6%'),
    },
    searchIcon: {
        marginRight: wp('2%'),
    },
    searchInput: {
        flex: 1,
        fontSize: moderateScale(16),
        color: '#2c3e50',
        height: '100%',
        fontFamily: 'Manrope-Regular',
    },
    selectionActions: {
        paddingHorizontal: wp('4%'),
        paddingVertical: hp('1.5%'),
        backgroundColor: colors.lightPrimary + '20',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectionText: {
        fontSize: moderateScale(14),
        color: colors.primary,
        fontFamily: 'Manrope-Medium',
    },
    actionButtons: {
        flexDirection: 'row',
    },
    actionButton: {
        marginLeft: wp('3%'),
        paddingVertical: hp('0.5%'),
        paddingHorizontal: wp('2%'),
    },
    actionButtonText: {
        fontSize: moderateScale(14),
        color: colors.primary,
        fontFamily: 'Manrope-Medium',
    },
    selectAllButton: {
        padding: wp('4%'),
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    selectAllText: {
        fontSize: moderateScale(16),
        color: colors.primary,
        fontFamily: 'Manrope-Medium',
    },
    listContent: {
        paddingBottom: hp('10%'),
    },
    trainerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: wp('4%'),
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#ffffff',
    },
    selectedItem: {
        backgroundColor: '#E8F4FD',
        borderLeftWidth: 3,
        borderLeftColor: '#0073B1',
    },
    avatar: {
        width: wp('12%'),
        height: wp('12%'),
        borderRadius: wp('6%'),
        marginRight: wp('3%'),
        alignContent: "center",
        alignItems: "center",
        justifyContent: "center"
    },
    trainerInfo: {
        flex: 1,
        marginLeft: wp('3%'),
    },
    trainerName: {
        fontSize: moderateScale(16),
        fontFamily: 'Manrope-Medium',
        color: '#2c3e50',
        marginBottom: hp('0.5%'),
    },
    selectedText: {
        color: '#0073B1',
    },
    trainerSpecialty: {
        fontSize: moderateScale(14),
        color: '#666666',
        fontFamily: 'Manrope-Regular',
    },
    selectedSubText: {
        color: '#0073B1',
    },
    selectionIndicator: {
        width: wp('6%'),
        height: wp('6%'),
        borderRadius: wp('3%'),
        borderWidth: 2,
        borderColor: '#CCCCCC',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: wp('2%'),
    },
    selectedCheckmark: {
        backgroundColor: '#0073B1',
        borderColor: '#0073B1',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: hp('5%'),
    },
    emptyText: {
        fontSize: moderateScale(16),
        color: '#6c757d',
        fontFamily: 'Manrope-Regular',
    },
    addButton: {
        position: 'absolute',
        bottom: hp('11%'),
        left: wp('5%'),
        right: wp('5%'),
        // backgroundColor: colors.primary,
        // paddingVertical: hp('2%'),
        // borderRadius: moderateScale(25),
        // alignItems: 'center',
        // justifyContent: 'center',
        // elevation: 5,
        // shadowColor: '#000',
        // shadowOffset: {
        //     width: 0,
        //     height: 2,
        // },
        // shadowOpacity: 0.25,
        // shadowRadius: 3.84,
    },
})