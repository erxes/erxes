import { Tabs, TabTitle } from '@erxes/ui/src/components/tabs';
import React, { useEffect, useState } from 'react';
import Detail from '../../containers/myCalendar/meeting/Detail';
import PreviousDetail from '../../containers/myCalendar/meeting/PreviousDetail';
import { IMeeting } from '../../types';
import { CalendarComponent } from './meeting/Calendar';
import { generateColorCode } from '../../utils';

type Props = {
  meetings?: IMeeting[];
  queryParams: any;
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
      bgColor: generateColorCode(meeting.createdBy)
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
    <CalendarComponent events={events} />
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
