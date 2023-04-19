import { __ } from '@erxes/ui/src/utils';
import { isEnabled } from '@erxes/ui/src/utils/core';

const menuTimeClock = (searchFilter: string) => {
  const navigationMenu = [
    { title: __('Timeclocks'), link: `/timeclocks${searchFilter}` }
  ];

  if (!isEnabled('bichil')) {
    navigationMenu.push({
      title: __('Time logs'),
      link: `/timeclocks/logs${searchFilter}`
    });
  }

  navigationMenu.push(
    { title: __('Requests'), link: `/timeclocks/requests${searchFilter}` },
    { title: __('Schedule'), link: `/timeclocks/schedule${searchFilter}` },
    { title: __('Report'), link: `/timeclocks/report${searchFilter}` },
    { title: __('Configuration'), link: `/timeclocks/config${searchFilter}` }
  );

  return navigationMenu;
};
const dateFormat = 'MM/DD/YYYY';
const dateDayFormat = 'dd MM/DD/YYYY';
const timeFormat = 'HH:mm';
const dateAndTimeFormat = 'MM/DD/YYYY HH:mm';

const dayOfTheWeekFormat = 'dd';
const dateOfTheMonthFormat = 'MM/DD';

export {
  menuTimeClock,
  dateFormat,
  timeFormat,
  dateAndTimeFormat,
  dateDayFormat,
  dayOfTheWeekFormat,
  dateOfTheMonthFormat
};
