import { Tabs, TabTitle } from '@erxes/ui/src/components/tabs';
import { __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import { IMeeting, MeetingDetailQueryResponse } from '../../../types';

type Props = {
  meetingDetail: IMeeting;
};
export const MeetingDetail = (props: Props) => {
  const { meetingDetail } = props;
  const [currentTab, setCurrentTab] = useState('This session');

  const renderTabContent = () => {
    if (currentTab === 'This session') {
      return <>this is this session</>;
    }
    return <>this is previous session</>;
  };

  return (
    <>
      <h2>{meetingDetail.title}</h2>
      <Tabs full={true}>
        <TabTitle
          className={currentTab === 'This session' ? 'active' : ''}
          onClick={() => setCurrentTab('This session')}
        >
          {__('This session')}
        </TabTitle>
        <TabTitle
          className={currentTab === 'Previous session' ? 'active' : ''}
          onClick={() => setCurrentTab('Previous session')}
        >
          {__('Previous session')}
        </TabTitle>
      </Tabs>
      {renderTabContent()}
    </>
  );
};
