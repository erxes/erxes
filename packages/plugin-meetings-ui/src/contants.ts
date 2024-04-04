import { __ } from '@erxes/ui/src/utils';

export const menuMeeting = () => {
  const navigationMenu = [
    { title: __('My calendar'), link: `/meetings/myCalendar` },
    { title: __('My meetings'), link: `/meetings/myMeetings` }
    // {
    //   title: __('Agenda template'),
    //   link: `/meetings/agendaTemplate`
    // }
  ];

  return navigationMenu;
};
