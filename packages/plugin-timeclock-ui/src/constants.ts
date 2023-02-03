import { __ } from '@erxes/ui/src/utils';

const menuTimeClock = (searchFilter: string) => {
  return [
    { title: __('Timeclocks'), link: `/timeclocks${searchFilter}` },
    { title: __('Requests'), link: `/timeclocks/requests${searchFilter}` },
    { title: __('Schedule'), link: `/timeclocks/schedule${searchFilter}` },
    { title: __('Report'), link: `/timeclocks/report${searchFilter}` },
    { title: __('Configuration'), link: `/timeclocks/config${searchFilter}` }
  ];
};
const dateFormat = 'MM/DD/YYYY';
export { menuTimeClock, dateFormat };
