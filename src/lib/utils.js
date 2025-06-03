// Utility functions

/**
 * Formats a date string into a more readable format.
 * Example: "August 29, 2023, 10:00 AM"
 * @param {string | Date} date The date to format.
 * @returns {string} The formatted date string.
 */
export function formatDate(date) {
    return new Date(date).toLocaleString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Formats a date string into a shorter, date-only format.
 * Example: "August 29, 2023"
 * @param {string | Date} date The date to format.
 * @returns {string} The formatted date string.
 */
export function formatDateOnly(date) {
    return new Date(date).toLocaleString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Checks if an event's start date is in the future.
 * @param {string | Date} eventStartDate The event's start date.
 * @returns {boolean} True if the event is in the future, false otherwise.
 */
export function isEventInFuture(eventStartDate) {
    const currentDate = new Date();
    const startDate = new Date(eventStartDate);
    return startDate > currentDate;
}

/**
 * Handles click events for event items.
 * If the event is in the future, shows a toast.
 * Otherwise, navigates to the event page.
 * @param {object} event The event object (must have id, displayName, start).
 * @param {object} toastStore The Svelte store for toasts.
 * @param {function} goto The Svelte navigation function.
 */
export function handleEventNavigation(event, toastStore, goto) {
    if (isEventInFuture(event.start)) {
        toastStore.trigger({
            message: `Event "${event.displayName}" starts on ${formatDateOnly(event.start)}`,
            background: "variant-filled-primary",
        });
    } else {
        goto(`/events/${event.id}`);
    }
}
