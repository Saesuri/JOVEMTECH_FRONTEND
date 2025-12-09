/**
 * Centralized date utilities using native browser APIs.
 * No external dependencies required.
 */

/**
 * Creates an ISO string from a date and time input while preserving local timezone.
 * This is the correct way to send local datetime to a backend that expects ISO format.
 *
 * @param date - Date string in YYYY-MM-DD format (from HTML date input)
 * @param time - Time string in HH:MM format (from HTML time input)
 * @returns ISO 8601 formatted string with timezone offset
 *
 * @example
 * toLocalISOString("2024-12-07", "14:30") // "2024-12-07T14:30:00-03:00"
 */
export const toLocalISOString = (date: string, time: string): string => {
    const localDate = new Date(`${date}T${time}:00`);

    // Get timezone offset in minutes and convert to hours:minutes format
    const offsetMinutes = localDate.getTimezoneOffset();
    const offsetSign = offsetMinutes <= 0 ? "+" : "-";
    const offsetHours = String(Math.floor(Math.abs(offsetMinutes) / 60)).padStart(
        2,
        "0"
    );
    const offsetMins = String(Math.abs(offsetMinutes) % 60).padStart(2, "0");

    // Format: YYYY-MM-DDTHH:mm:ss+HH:MM
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, "0");
    const day = String(localDate.getDate()).padStart(2, "0");
    const hours = String(localDate.getHours()).padStart(2, "0");
    const minutes = String(localDate.getMinutes()).padStart(2, "0");
    const seconds = String(localDate.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetSign}${offsetHours}:${offsetMins}`;
};

/**
 * Returns today's date in YYYY-MM-DD format for HTML date inputs.
 * Uses local timezone to ensure the correct day is shown.
 *
 * @returns Date string in YYYY-MM-DD format
 *
 * @example
 * getTodayDateString() // "2024-12-07"
 */
export const getTodayDateString = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

/**
 * Subtracts days from a date. Native replacement for date-fns subDays.
 *
 * @param date - The date to subtract from
 * @param days - Number of days to subtract
 * @returns New Date object with days subtracted
 *
 * @example
 * subDays(new Date(), 7) // Date 7 days ago
 */
export const subDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
};

/**
 * Checks if two dates are the same calendar day. Native replacement for date-fns isSameDay.
 *
 * @param date1 - First date to compare
 * @param date2 - Second date to compare
 * @returns true if both dates are the same calendar day
 *
 * @example
 * isSameDay(new Date(), new Date()) // true
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
};

/**
 * Formats a date string for ICS calendar files and Google Calendar URLs.
 * Outputs format: YYYYMMDDTHHmmssZ
 *
 * @param dateStr - ISO date string to format
 * @returns Formatted date string for ICS/Google Calendar
 *
 * @example
 * formatForICS("2024-12-07T14:30:00Z") // "20241207T143000Z"
 */
export const formatForICS = (dateStr: string): string => {
    return new Date(dateStr).toISOString().replace(/-|:|\.\d\d\d/g, "");
};
