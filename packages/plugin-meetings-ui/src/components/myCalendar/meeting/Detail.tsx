import Icon from '@erxes/ui/src/components/Icon';
import { Tabs, TabTitle } from '@erxes/ui/src/components/tabs';
import { __ } from '@erxes/ui/src/utils';
import moment from 'moment';
import React, { useState } from 'react';
import {
  MeetingDetailColumn,
  MeetingDetailRow,
  MeetingWrapper
} from '../../../styles';
import { IMeeting, ITopic } from '../../../types';

import { TopicFormContainer } from '../../../containers/myCalendar/topic/Form';

type Props = {
  meetingDetail: IMeeting;
};
export const MeetingDetail = (props: Props) => {
  const { meetingDetail } = props;
  const { topics } = meetingDetail;
  const [currentTab, setCurrentTab] = useState('This session');
  const renderTabContent = () => {
    if (currentTab === 'This session') {
      return (
        <>
          <MeetingWrapper>
            <MeetingDetailRow>
              <MeetingDetailColumn>
                <Icon icon="calendar-alt"></Icon>{' '}
                {meetingDetail.startDate &&
                  moment(meetingDetail.startDate).format(
                    'ddd, MMMM DD, YYYY • HH:mm a'
                  )}
              </MeetingDetailColumn>
              <MeetingDetailColumn>
                Location: {meetingDetail.location}
              </MeetingDetailColumn>
            </MeetingDetailRow>
            <MeetingDetailRow>
              <MeetingDetailColumn>
                Created By: {meetingDetail.createdUser?.details?.fullName}
              </MeetingDetailColumn>
              <MeetingDetailColumn>
                Team members:{' '}
                {meetingDetail.participantUser.map((user, index) => {
                  if (index != meetingDetail.participantUser.length - 1)
                    return <>{user.details?.fullName},</>;
                  return <>{user.details?.fullName}</>;
                })}
              </MeetingDetailColumn>
            </MeetingDetailRow>
            <MeetingDetailRow>
              <MeetingDetailColumn>
                <> {meetingDetail.description}</>
              </MeetingDetailColumn>
            </MeetingDetailRow>
            Meeting Agenda:
            {topics.map((topic: ITopic) => {
              return (
                <TopicFormContainer
                  topic={topic}
                  meetingId={meetingDetail._id}
                  participantUserIds={meetingDetail.participantUser.map(
                    user => user._id
                  )}
                />
              );
            })}
            <TopicFormContainer
              meetingId={meetingDetail._id}
              participantUserIds={meetingDetail.participantUser.map(
                user => user._id
              )}
            />
          </MeetingWrapper>
        </>
      );
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
