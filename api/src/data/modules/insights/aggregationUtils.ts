/**
 * Converts dateField into string using timeFormat
 * @param fieldName
 * @param timeFormat
 */
export const getDateFieldAsStr = ({
  fieldName = '$createdAt',
  timeFormat = '%Y-%m-%d',
  timeZone = '+08',
}): {
  $dateToString: {
    format: string;
    date: string;
    timezone: string;
  };
} => {
  return {
    $dateToString: {
      format: timeFormat,
      date: fieldName,
      timezone: timeZone,
    },
  };
};

/**
 * Return duration calculation as seconds
 */
export const getDurationField = ({
  startField = '$createdAt',
  endField = '$closedAt',
}): {
  $divide: [{ $subtract: string[] }, number];
} => {
  return {
    $divide: [
      {
        $subtract: [startField, endField],
      },
      1000,
    ],
  };
};
