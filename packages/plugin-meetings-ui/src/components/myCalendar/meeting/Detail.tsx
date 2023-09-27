import Icon from '@erxes/ui/src/components/Icon';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import { colors } from '@erxes/ui/src/styles';
import { __ } from '@erxes/ui/src/utils';
import moment from 'moment';
import React from 'react';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';

import {
  MeetingDetailColumn,
  MeetingDetailFooter,
  MeetingDetailRow,
  MeetingWrapper
} from '../../../styles';
import { IMeeting, ITopic } from '../../../types';

import { TopicFormContainer } from '../../../containers/myCalendar/topic/Form';
import Button from '@erxes/ui/src/components/Button';
import { Link } from 'react-router-dom';
import { DrawerDetail } from '@erxes/ui-automations/src/styles';

type Props = {
  meetingDetail: IMeeting;
  changeStatus: (status: string, meetingId: string) => void;
};
export const MeetingDetail = (props: Props) => {
  const { meetingDetail, changeStatus } = props;
  const { topics = [], deals } = meetingDetail || {};
  const { participantUser } = meetingDetail || {};

  const renderTopicItem = (topic: ITopic) => {
    return (
      <div className="description" key={topic?._id}>
        <MeetingDetailRow>
          <MeetingDetailColumn>
            <span>Topic name: </span> &nbsp;
            {topic?.title}
          </MeetingDetailColumn>
        </MeetingDetailRow>
        <MeetingDetailRow>
          <MeetingDetailColumn>
            <span>Description:</span> &nbsp;
            {topic?.description}
          </MeetingDetailColumn>
        </MeetingDetailRow>
        <MeetingDetailRow>
          <MeetingDetailColumn>
            <span>Topic owner:</span> &nbsp;
            {
              participantUser?.find(
                participant => participant._id === topic?.ownerId
              )?.details?.fullName
            }
          </MeetingDetailColumn>
        </MeetingDetailRow>
      </div>
    );
  };

  const renderMeetingAgenda = () => {
    if (!topics || topics.length === 0)
      return <EmptyState text={`Empty`} icon="clipboard-blank" />;

    return topics?.map((topic: ITopic) => topic && renderTopicItem(topic));
  };

  const trigger = (
    <Button id={'AddTopicButton'} btnStyle="success" icon="plus-circle">
      Add topic
    </Button>
  );

  const modalContent = props => (
    <TopicFormContainer
      {...props}
      meetingId={meetingDetail?._id}
      participantUserIds={meetingDetail?.participantUser?.map(user => user._id)}
      meetingStatus={meetingDetail?.status}
    />
  );

  const renderAddButton = (
    <ModalTrigger
      title={__('Add topic')}
      trigger={trigger}
      content={modalContent}
      enforceFocus={false}
    />
  );

  const renderTabContent = () => {
    return (
      <>
        <MeetingDetailRow>
          <MeetingDetailColumn>
            <Icon icon="calendar-alt" color={colors.colorCoreBlue} /> &nbsp;
            {meetingDetail?.startDate &&
              moment(meetingDetail?.startDate).format(
                'ddd, MMMM DD, YYYY • HH:mm a'
              )}
          </MeetingDetailColumn>
          <MeetingDetailColumn>
            <Icon icon="map" color={colors.colorCoreBlue} /> &nbsp;
            {meetingDetail?.method === 'offline' ? (
              <>
                <span>Location:</span>
                {' ' + meetingDetail?.location}
              </>
            ) : (
              <>
                <span>Method:</span>
                {' ' + meetingDetail?.method}
              </>
            )}
          </MeetingDetailColumn>
        </MeetingDetailRow>
        <MeetingDetailRow>
          <MeetingDetailColumn>
            <span> Created By: </span>
            {' ' + meetingDetail?.createdUser?.details?.fullName}
          </MeetingDetailColumn>
          <MeetingDetailColumn>
            <span>Team members:</span>{' '}
            {meetingDetail?.participantUser?.map((user, index) => {
              if (index != meetingDetail?.participantUser?.length - 1)
                return <>{user.details?.fullName},</>;
              return <>{user.details?.fullName}</>;
            })}
          </MeetingDetailColumn>
        </MeetingDetailRow>
        <MeetingDetailRow>
          <MeetingDetailColumn>
            <DrawerDetail>
              <span>Deals:</span>{' '}
              {deals?.map(deal => {
                const { boardId, _id, pipeline } = deal;
                const link = `/deal/board?id=${boardId}&pipelineId=${pipeline._id}&itemId=${_id}`;
                return (
                  <>
                    <Link to={link}>{deal.name} </Link>,
                  </>
                );
              })}
            </DrawerDetail>
          </MeetingDetailColumn>
        </MeetingDetailRow>
        <p className="description"> {meetingDetail?.description}</p>
        <MeetingDetailRow>
          <MeetingDetailColumn>
            <span>Meeting Agenda:</span>
          </MeetingDetailColumn>
          {meetingDetail?.status !== 'completed' && renderAddButton}
        </MeetingDetailRow>
        {renderMeetingAgenda()}
      </>
    );
  };

  return (
    <MeetingWrapper>
      <h3>{meetingDetail?.title}</h3>
      {renderTabContent()}

      {meetingDetail?.status !== 'completed' && (
        <MeetingDetailFooter>
          <Button
            btnStyle="warning"
            onClick={() => {
              changeStatus(meetingDetail?._id, 'canceled');
            }}
            icon="times-circle"
          >
            Cancel meeting
          </Button>
          <Button
            btnStyle="warning"
            onClick={() => {
              changeStatus(meetingDetail?._id, 'draft');
            }}
            icon="times-circle"
          >
            Save as default
          </Button>
          <Button
            btnStyle="success"
            onClick={() => {
              changeStatus(
                meetingDetail?._id,
                meetingDetail?.status === 'ongoing' ? 'completed' : 'ongoing'
              );
            }}
            icon="times-circle"
          >
            {meetingDetail?.status !== 'ongoing'
              ? 'Start meeting'
              : 'End meeting'}
          </Button>
        </MeetingDetailFooter>
      )}
    </MeetingWrapper>
  );
};
