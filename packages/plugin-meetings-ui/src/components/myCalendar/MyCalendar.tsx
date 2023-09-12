import { Tabs, TabTitle } from '@erxes/ui/src/components/tabs';
import React, { useState } from 'react';
import Detail from '../../containers/myCalendar/meeting/Detail';
import PreviousDetail from '../../containers/myCalendar/meeting/PreviousDetail';
import { IMeeting, MeetingsQueryResponse } from '../../types';
import { generateColorCode } from '../../utils';
import { IUser } from '@erxes/ui/src/auth/types';
import { CalendarContainer } from '../../containers/myCalendar/meeting/Calendar';

type Props = {
  meetings?: IMeeting[];
  queryParams: any;
  meetingQuery: MeetingsQueryResponse;
  currentUser: IUser;
};

export const MyCalendarList = (props: Props) => {
  const { meetings, queryParams } = props;
  const { meetingId } = queryParams;
  const [currentTab, setCurrentTab] = useState('This session');
  const events =
    meetings?.map((meeting: IMeeting) => ({
      title: meeting.title,
      start: new Date(meeting.startDate), // Year, Month (0-11), Day, Hour, Minute
      end: new Date(meeting.endDate),
      id: meeting._id,
      color: generateColorCode(meeting.createdBy)
    })) || [];

  const companyId =
    (meetings?.find(meeting => meeting._id === meetingId)
      ?.companyId as string) || '';

  const renderTabContent = () => {
    if (currentTab === 'Previous session') {
      return <PreviousDetail companyId={companyId} queryParams={queryParams} />;
    }
    return <Detail meetingId={meetingId} queryParams={queryParams} />;
  };
  // Add more events as needed

  return !meetingId ? (
    <CalendarContainer
      events={events}
      queryParams={queryParams}
      currentUser={props.currentUser}
      meetings={meetings}
    />
  ) : (
    <>
      <Tabs full={true}>
        <TabTitle
          className={currentTab === 'This session' ? 'active' : ''}
          onClick={() => setCurrentTab('This session')}
        >
          {'This session'}
        </TabTitle>
        <TabTitle
          className={currentTab === 'Previous session' ? 'active' : ''}
          onClick={() => setCurrentTab('Previous session')}
        >
          {'Previous session'}
        </TabTitle>
      </Tabs>
      {renderTabContent()}
    </>
  );
};
