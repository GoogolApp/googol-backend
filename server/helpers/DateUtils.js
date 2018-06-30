/**
 * Convert a Date to Brazil timezone.
 */
const convertToBrazilTimezone = (date) => {
  return new Date(date.valueOf() - date.getTimezoneOffset() * 60000);
};

module.exports = {convertToBrazilTimezone};
