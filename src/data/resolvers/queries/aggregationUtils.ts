/**
 * Converts dateField into string using timeFormat
 * @param fieldName
 * @param timeFormat
 */
export const getDateFieldAsStr = ({
  fieldName = '$createdAt',
  timeFormat = '%Y-%m-%d',
}): {
  $dateToString: {
    format: string;
    date: string;
  };
} => {
  return {
    $dateToString: {
      format: timeFormat,
      date: fieldName,
    },
  };
};
