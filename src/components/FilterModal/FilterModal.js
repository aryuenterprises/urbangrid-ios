import React, { useState, useMemo, useCallback, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, RefreshControl, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Button, Card, Searchbar, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ExpandableCalendar, AgendaList, CalendarProvider } from 'react-native-calendars';
import moment from 'moment';
import { moderateScale } from '../../utils/responsive';

const FilterModal = React.memo(({
    showFilters,
    activeFilters,
    toggleFilter,
    toggleSortOrder,
    clearFilters,
    setShowFilters,
    getStatusLabel
}) => {
    return (
        <Modal
            visible={showFilters}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowFilters(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Filter & Sort Tasks</Text>
                        <TouchableOpacity onPress={() => setShowFilters(false)}>
                            <MaterialIcons name="close" size={24} color="#05B8AD" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <View style={styles.filterSection}>
                            <Text style={styles.filterSectionTitle}>Status</Text>
                            <View style={styles.filterOptions}>
                                {['pending', 'in-progress', 'completed'].map(status => (
                                    <TouchableOpacity
                                        key={status}
                                        style={[
                                            styles.filterOption,
                                            activeFilters.status.includes(status) && styles.filterOptionActive
                                        ]}
                                        onPress={() => toggleFilter('status', status)}
                                    >
                                        <Text style={[
                                            styles.filterOptionText,
                                            activeFilters.status.includes(status) && styles.filterOptionTextActive
                                        ]}>
                                            {getStatusLabel(status)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.filterSection}>
                            <Text style={styles.filterSectionTitle}>Priority</Text>
                            <View style={styles.filterOptions}>
                                {['high', 'medium', 'low'].map(priority => (
                                    <TouchableOpacity
                                        key={priority}
                                        style={[
                                            styles.filterOption,
                                            activeFilters.priority.includes(priority) && styles.filterOptionActive
                                        ]}
                                        onPress={() => toggleFilter('priority', priority)}
                                    >
                                        <Text style={[
                                            styles.filterOptionText,
                                            activeFilters.priority.includes(priority) && styles.filterOptionTextActive
                                        ]}>
                                            {priority}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.filterSection}>
                            <Text style={styles.filterSectionTitle}>Sort By</Text>
                            <View style={styles.sortOptions}>
                                <TouchableOpacity
                                    style={styles.sortOption}
                                    onPress={() => toggleSortOrder('dueDate')}
                                >
                                    <MaterialIcons
                                        name={activeFilters.sortBy === 'dueDate' ?
                                            (activeFilters.sortOrder === 'asc' ? 'arrow-upward' : 'arrow-downward') :
                                            'swap-vert'}
                                        size={20}
                                        color={activeFilters.sortBy === 'dueDate' ? '#05B8AD' : '#8E8E93'}
                                    />
                                    <Text style={[
                                        styles.sortOptionText,
                                        activeFilters.sortBy === 'dueDate' && styles.sortOptionActive
                                    ]}>
                                        Due Date
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.sortOption}
                                    onPress={() => toggleSortOrder('priority')}
                                >
                                    <MaterialIcons
                                        name={activeFilters.sortBy === 'priority' ?
                                            (activeFilters.sortOrder === 'asc' ? 'arrow-upward' : 'arrow-downward') :
                                            'swap-vert'}
                                        size={20}
                                        color={activeFilters.sortBy === 'priority' ? '#05B8AD' : '#8E8E93'}
                                    />
                                    <Text style={[
                                        styles.sortOptionText,
                                        activeFilters.sortBy === 'priority' && styles.sortOptionActive
                                    ]}>
                                        Priority
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <Button
                            mode="outlined"
                            style={styles.clearButton}
                            labelStyle={styles.clearButtonText}
                            onPress={clearFilters}
                        >
                            Clear All
                        </Button>
                        <Button
                            mode="contained"
                            style={styles.applyButton}
                            labelStyle={styles.applyButtonText}
                            onPress={() => setShowFilters(false)}
                        >
                            Apply Filters
                        </Button>
                    </View>
                </View>
            </View>
        </Modal>
    )
});

export default FilterModal

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: wp('5%'),
        borderTopRightRadius: wp('5%'),
        maxHeight: hp('70%'),
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: wp('5%'),
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    modalTitle: {
        fontSize: moderateScale(18),
        fontFamily: 'Manrope-Bold',
        color: '#000000',
    },
    modalContent: {
        paddingHorizontal: wp('5%'),
        paddingVertical: hp('2%'),
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: wp('5%'),
        borderTopWidth: 1,
        borderTopColor: '#F2F2F7',
    },
    clearButton: {
        flex: 1,
        marginRight: wp('2%'),
        borderColor: '#05B8AD',
    },
    clearButtonText: {
        color: '#05B8AD',
    },
    applyButton: {
        flex: 1,
        backgroundColor: '#05B8AD',
    },
    applyButtonText: {
        color: '#FFFFFF',
    },
    filterSection: {
        marginBottom: hp('3%'),
    },
    filterSectionTitle: {
        fontSize: moderateScale(16),
        fontFamily: 'Manrope-Medium',
        color: '#000000',
        marginBottom: hp('1%'),
    },
    filterOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: wp('2%'),
    },
    filterOption: {
        paddingVertical: hp('1%'),
        paddingHorizontal: wp('4%'),
        borderRadius: wp('10%'),
        backgroundColor: '#F2F2F7',
        borderWidth: 1,
        borderColor: '#F2F2F7',
    },
    filterOptionActive: {
        backgroundColor: '#05B8AD20',
        borderColor: '#05B8AD',
    },
    filterOptionText: {
        fontSize: moderateScale(14),
        color: '#000000',
        fontFamily: 'Manrope-Regular',
    },
    filterOptionTextActive: {
        color: '#05B8AD',
        fontWeight: '500',
    },
    sortOptions: {
        flexDirection: 'row',
        gap: wp('4%'),
    },
    sortOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: hp('1%'),
        paddingHorizontal: wp('4%'),
        borderRadius: wp('10%'),
        backgroundColor: '#F2F2F7',
    },
    sortOptionText: {
        fontSize: moderateScale(14),
        color: '#8E8E93',
        marginLeft: wp('2%'),
        fontFamily: 'Manrope-Regular',
    },
    sortOptionActive: {
        color: '#05B8AD',
        fontWeight: '500',
    }
})