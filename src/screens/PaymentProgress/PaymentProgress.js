import { StyleSheet, Text, View, TouchableOpacity, Linking } from 'react-native'
import React from 'react'
import { hp, moderateScale, wp } from '../../utils/responsive'
import { colors } from '../../utils/globalStyles'
import { useAppTheme } from '../../hook/useAppTheme'

const PaymentProgress = ({ route }) => {
    const { batch } = route.params || {}
    const { colors: themeColors } = useAppTheme();

    // Calculate payment data based on batch info
    const paymentPercentage = 75 // You can calculate this dynamically
    const amountPaid = 3750
    const balance = 2500
    const payment = {
        installmentNo: 3,
        dueDate: "25 Oct 2023",
        amountDue: "$1,250",
        amountPaid: "$3,750",
        balance: "$2,500",
        paymentStatus: "Partial Payment",
        paymentLink: "https://portal.aryuacademy.com/",
        invoice: "https://employee.aryutechnologies.com/dashboard"
    }

    const handleLinkPress = (url) => {
        Linking.openURL(url).catch(err => 
            console.error('Failed to open URL:', err)
        );
    }

    return (
        <View style={[styles.container, {backgroundColor: themeColors.background}]}>
            <View style={[styles.card, {backgroundColor: themeColors.card}]}>
                <View style={styles.progressContainer}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.progressPercentage}>{paymentPercentage}% Paid</Text>
                        <Text style={[styles.progressStatus, {color: themeColors.textGrey}]}>Partial Payment</Text>
                    </View>

                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${paymentPercentage}%` }
                            ]}
                        />
                    </View>

                    <View style={styles.paymentDetails}>
                        <Text style={[styles.paymentText, {color: themeColors.textSecondary}]}>Amount Paid: ${amountPaid.toLocaleString()}</Text>
                        <Text style={[styles.paymentText, {color: themeColors.textSecondary}]}>Balance: ${balance.toLocaleString()}</Text>
                    </View>
                </View>
            </View>

            {/* Payment Details Section */}
            <View style={[styles.paymentDetailsCard, {backgroundColor: themeColors.card}]}>
                <Text style={styles.sectionTitle}>Payment Details</Text>
                
                <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, {color: themeColors.textSecondary}]}>Installment No:</Text>
                    <Text style={[styles.detailValue, {color: themeColors.textSecondary}]}>{payment.installmentNo}</Text>
                </View>
                
                <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, {color: themeColors.textSecondary}]}>Due Date:</Text>
                    <Text style={[styles.detailValue, {color: themeColors.textSecondary}]}>{payment.dueDate}</Text>
                </View>
                
                <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, {color: themeColors.textSecondary}]}>Amount Due:</Text>
                    <Text style={[styles.detailValue, {color: themeColors.textSecondary}]}>{payment.amountDue}</Text>
                </View>
                
                <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, {color: themeColors.textSecondary}]}>Amount Paid:</Text>
                    <Text style={[styles.detailValue, {color: themeColors.textSecondary}]}>{payment.amountPaid}</Text>
                </View>
                
                <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, {color: themeColors.textSecondary}]}>Balance:</Text>
                    <Text style={[styles.detailValue, {color: themeColors.textSecondary}]}>{payment.balance}</Text>
                </View>
                
                <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, {color: themeColors.textSecondary}]}>Payment Status:</Text>
                    <Text style={[styles.detailValue, {color: themeColors.warning}]}>{payment.paymentStatus}</Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleLinkPress(payment.paymentLink)}
                    >
                        <Text style={styles.actionButtonText}>Make Payment</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.invoiceButton]}
                        onPress={() => handleLinkPress(payment.invoice)}
                    >
                        <Text style={[styles.actionButtonText, styles.invoiceButtonText]}>Download Invoice</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

export default PaymentProgress

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: moderateScale(16),
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: moderateScale(8),
        padding: moderateScale(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        marginBottom: moderateScale(16),
    },
    progressContainer: {
        marginTop: hp('0.5%'),
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp('1%'),
    },
    progressPercentage: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: colors.primary,
                fontFamily: 'Manrope-SemiBold',
    },
    progressStatus: {
        fontSize: moderateScale(12),
        color: colors.textTertiary,
        fontFamily: 'Manrope-Regular',
    },
    progressBar: {
        height: hp('0.8%'),
        backgroundColor: colors.lightGray,
        borderRadius: moderateScale(4),
        overflow: 'hidden',
        marginBottom: hp('1.5%'),
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.success,
        borderRadius: moderateScale(4),
    },
    paymentDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    paymentText: {
        fontSize: moderateScale(12),
        color: colors.textSecondary,
        fontFamily: 'Manrope-Regular',
    },
    // Payment Details Card Styles
    paymentDetailsCard: {
        backgroundColor: colors.white,
        borderRadius: moderateScale(8),
        padding: moderateScale(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: moderateScale(16),
        color: colors.primary,
        marginBottom: moderateScale(16),
        fontFamily: 'Manrope-SemiBold',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: moderateScale(8),
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGray,
    },
    detailLabel: {
        fontSize: moderateScale(14),
        color: colors.textSecondary,
        fontFamily: 'Manrope-SemiBold',
    },
    detailValue: {
        fontSize: moderateScale(14),
        color: colors.textPrimary,
        fontFamily: 'Manrope-Medium',
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: moderateScale(20),
        gap: moderateScale(12),
    },
    actionButton: {
        flex: 1,
        backgroundColor: colors.primary,
        paddingVertical: moderateScale(12),
        borderRadius: moderateScale(6),
        alignItems: 'center',
    },
    invoiceButton: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    actionButtonText: {
        color: colors.white,
        fontSize: moderateScale(14),
        fontFamily: 'Manrope-SemiBold',
    },
    invoiceButtonText: {
        color: colors.primary,
    },
})