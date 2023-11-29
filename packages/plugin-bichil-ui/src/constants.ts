const dateFormat = 'MM/DD/YYYY';
const timeFormat = 'HH:mm';
const dateAndTimeFormat = 'MM/DD/YYYY HH:mm';

const dayOfTheWeekFormat = 'dd';
const dateOfTheMonthFormat = 'MM/DD';

const COLORS = {
  absent: 'rgba(255,88,87,0.5)',
  absentBorder: 'rgba(255,88,87,0.1)',
  shiftRequest: '#85C7F2',
  paidAbsence: 'rgba(72,191,132, 0.5)',
  unpaidAbsence: '#E7C8DD',
  shiftNotClosed: 'rgba(175,66,174,0.5)',
  regularTimeclock: ' rgba(0, 177, 78, 0.1)',
  activeTimeclock: 'rgba(255,88,87,0.2)',
  weekend: 'rgba(244,193,189,1.0)',
  white: '#ffffff',
  blank: '#ffffff'
};

export {
  dateAndTimeFormat,
  dateFormat,
  timeFormat,
  dayOfTheWeekFormat,
  dateOfTheMonthFormat,
  COLORS
};
