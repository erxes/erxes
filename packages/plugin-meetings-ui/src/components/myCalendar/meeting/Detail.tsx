import Icon from '@erxes/ui/src/components/Icon';
import { Tabs, TabTitle } from '@erxes/ui/src/components/tabs';
import { colors } from '@erxes/ui/src/styles';
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
          <MeetingDetailRow>
            <MeetingDetailColumn>
              <Icon icon="calendar-alt" color={colors.colorCoreBlue} /> &nbsp;
              {meetingDetail.startDate &&
                moment(meetingDetail.startDate).format(
                  'ddd, MMMM DD, YYYY • HH:mm a'
                )}
            </MeetingDetailColumn>
            <MeetingDetailColumn>
              <Icon icon="map" color={colors.colorCoreBlue} /> &nbsp;
              <span>Location:</span>
              {' ' + meetingDetail.location}
            </MeetingDetailColumn>
          </MeetingDetailRow>
          <MeetingDetailRow>
            <MeetingDetailColumn>
              <span> Created By: </span>
              {' ' + meetingDetail.createdUser?.details?.fullName}
            </MeetingDetailColumn>
            <MeetingDetailColumn>
              <span>Team members:</span>{' '}
              {meetingDetail.participantUser.map((user, index) => {
                if (index != meetingDetail.participantUser.length - 1)
                  return <>{user.details?.fullName},</>;
                return <>{user.details?.fullName}</>;
              })}
            </MeetingDetailColumn>
          </MeetingDetailRow>
          <p className="description"> {meetingDetail.description}</p>
          <span>Meeting Agenda:</span>
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
        </>
      );
    }
    return <>this is previous session</>;
  };

  return (
    <MeetingWrapper>
      <h3>{meetingDetail.title}</h3>
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
    </MeetingWrapper>
  );
};
