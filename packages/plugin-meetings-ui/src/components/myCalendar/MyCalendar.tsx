import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import Detail from '../../containers/myCalendar/meeting/Detail';
import { IMeeting } from '../../types';
import { CalendarComponent } from './meeting/Calendar';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  meetings?: IMeeting[];
  queryParams: any;
  showCreateMeeting: boolean;
};

export const MyCalendarList = (props: Props) => {
  const { meetings, queryParams, showCreateMeeting } = props;
  const { meetingId } = queryParams;

  const events =
    meetings?.map((meeting: IMeeting) => ({
      title: meeting.title,
      start: new Date(meeting.startDate), // Year, Month (0-11), Day, Hour, Minute
      end: new Date(meeting.endDate),
      color: '#1e90ff'
    })) || [];

  console.log('events =====================', events);
  // Add more events as needed

  return !meetingId ? (
    <CalendarComponent events={events} />
  ) : (
    <Detail meetingId={meetingId} queryParams={queryParams} />
  );
};
