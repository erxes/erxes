const getDayAsString = dayNumber => {
  let day;

  switch (dayNumber) {
    case 1:
      day = 'monday';
      break;

    case 2:
      day = 'tuesday';
      break;

    case 3:
      day = 'wednesday';
      break;

    case 4:
      day = 'thursday';
      break;

    case 5:
      day = 'friday';
      break;

    case 6:
      day = 'saturday';
      break;

    case 7:
      day = 'sunday';
      break;
  }

  return day;
};

const isDateInRange = (date, from, to) => {
  const fromDate = new Date(Date.parse(`${date.toLocaleDateString()} ${from}`));

  const endDate = new Date(Date.parse(`${date.toLocaleDateString()} ${to}`));

  // check interval
  if (fromDate <= date && endDate >= date) {
    return true;
  }

  return false;
};

const isWeekday = day => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(day);

const isWeekend = day => ['saturday', 'sunday'].includes(day);

export const checkAvailability = (integration, date) => {
  // we can determine state from isOnline field value when method is manual
  if (integration.availabilityMethod === 'manual') {
    return integration.isOnline;
  }

  const day = getDayAsString(date.getDay());

  // auto ====================

  // check by everyday config
  const everydayConf = integration.onlineHours.find(c => c.day === 'everyday');

  if (everydayConf) {
    return isDateInRange(date, everydayConf.from, everydayConf.to);
  }

  // check by weekdays config
  const weekdaysConf = integration.onlineHours.find(c => c.day === 'weekdays');

  if (weekdaysConf && isWeekday(day)) {
    return isDateInRange(date, weekdaysConf.from, weekdaysConf.to);
  }

  // check by weekends config
  const weekendsConf = integration.onlineHours.find(c => c.day === 'weekends');

  if (weekendsConf && isWeekend(day)) {
    return isDateInRange(date, weekendsConf.from, weekendsConf.to);
  }

  // check by regular day config
  const dayConf = integration.onlineHours.find(c => c.day === day);

  if (dayConf) {
    return isDateInRange(date, dayConf.from, dayConf.to);
  }

  return false;
};
