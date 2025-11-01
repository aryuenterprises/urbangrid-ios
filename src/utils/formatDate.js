/**
 * Formats a date into a readable date & time string.
 * @param {Date} date - The date to format.
 * @param {Object} [options] - Optional formatting options.
 * @param {boolean} [options.includeTime=true] - Whether to include time in the output.
 * @param {boolean} [options.includeSeconds=false] - Whether to include seconds in the time.
 * @param {string} [options.locale='en-US'] - The locale to use for formatting.
 * @returns {string} Formatted date-time string.
 */
export const formatDateTime = (date, { includeTime = true, includeSeconds = false, locale = 'en-US' } = {}) => {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    
    const dateOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    };

    const timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };

    if (includeSeconds) {
        timeOptions.second = '2-digit';
    }

    if (includeTime) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const dateStr = `${day}-${month}-${year}`;
        const timeStr = date.toLocaleTimeString(locale, timeOptions);
        return `${dateStr} ${timeStr}`;
    } else {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const dateStr = `${day}-${month}-${year}`;
        return dateStr;
    }
};