import Icon from '@erxes/ui/src/components/Icon';
import { Tabs, TabTitle } from '@erxes/ui/src/components/tabs';
import { colors } from '@erxes/ui/src/styles';
import { __ } from '@erxes/ui/src/utils';
import moment from 'moment';
import React, { useState } from 'react';
import {
  MeetingDetailColumn,
  MeetingDetailFooter,
  MeetingDetailRow,
  MeetingWrapper
} from '../../../styles';
import { IMeeting, ITopic } from '../../../types';

import { TopicFormContainer } from '../../../containers/myCalendar/topic/Form';
import Button from '@erxes/ui/src/components/Button';

type Props = {
  meetingDetail: IMeeting;
  changeStatus: (status: string, meetingId: string) => void;
};
export const MeetingDetail = (props: Props) => {
  const { meetingDetail, changeStatus } = props;
  const { topics } = meetingDetail;

  const renderTabContent = () => {
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
              meetingStatus={meetingDetail.status}
            />
          );
        })}
        {meetingDetail.status !== 'completed' && (
          <TopicFormContainer
            meetingId={meetingDetail._id}
            participantUserIds={meetingDetail.participantUser.map(
              user => user._id
            )}
            meetingStatus={meetingDetail.status}
          />
        )}{' '}
      </>
    );
  };

  console.log(meetingDetail, 'meetingDetail');
  return (
    <MeetingWrapper>
      {renderTabContent()}

      {meetingDetail.status !== 'completed' && (
        <MeetingDetailFooter>
          <Button
            btnStyle="warning"
            onClick={() => {
              changeStatus(meetingDetail._id, 'canceled');
            }}
            icon="times-circle"
          >
            Cancel
          </Button>
          <Button
            btnStyle="warning"
            onClick={() => {
              changeStatus(meetingDetail._id, 'draft');
            }}
            icon="times-circle"
          >
            Save as default
          </Button>
          <Button
            btnStyle="success"
            onClick={() => {
              changeStatus(
                meetingDetail._id,
                meetingDetail.status === 'ongoing' ? 'completed' : 'ongoing'
              );
            }}
            icon="times-circle"
          >
            {meetingDetail.status === 'scheduled'
              ? 'Start meeting'
              : 'End meeting'}
          </Button>
        </MeetingDetailFooter>
      )}
    </MeetingWrapper>
  );
};
