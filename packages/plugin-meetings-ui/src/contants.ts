import { __ } from '@erxes/ui/src/utils';

export const menuMeeting = (searchFilter: string) => {
  const navigationMenu = [
    { title: __('My calendar'), link: `/meetings/myCalendar${searchFilter}` },
    { title: __('My meetings'), link: `/meetings/myMeetings` }
    // {
    //   title: __('Agenda template'),
    //   link: `/meetings/agendaTemplate`
    // }
  ];

  return navigationMenu;
};
