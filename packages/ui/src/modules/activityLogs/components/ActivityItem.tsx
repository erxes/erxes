import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';
import React from 'react';
import Task from '../containers/items/boardItems/Task';
import Conversation from '../containers/items/Conversation';
import { ActivityIcon, ActivityRow } from '../styles';
import { IActivityLog } from '../types';
import { formatText, getIconAndColor } from '../utils';
import ArchiveLog from './items/archive/ArchiveLog';
import AssigneeLog from './items/boardItems/AssigneeLog';
import MovementLog from './items/boardItems/MovementLog';
import CampaignLog from './items/CampaignLog';
import ConvertLog from './items/ConvertLog';
import CreatedLog from './items/create/CreatedLog';
import DeletedLog from './items/delete/DeletedLog';
import MergedLog from './items/MergedLog';
import SegmentLog from './items/SegmentLog';
import SmsLog from './items/SmsLog';
import TaggedLog from './items/TaggedLog';

const renderDetail = (type: string, children: React.ReactNode) => {
  const iconAndColor = getIconAndColor(type) || {};

  if (type === 'conversation') {
    return children;
  }

  return (
    <ActivityRow key={Math.random()}>
      <Tip text={formatText(type)} placement="top">
        <ActivityIcon color={iconAndColor.color}>
          <Icon icon={iconAndColor.icon} />
        </ActivityIcon>
      </Tip>
      {children}
    </ActivityRow>
  );
};

const activityItem = (activity: IActivityLog) => {
  const { _id, contentType, action } = activity;

  switch ((action && action) || contentType) {
    case 'conversation':
      return renderDetail(
        'conversation',
        <Conversation conversationId={_id} activity={activity} />
      );
    case 'taskDetail':
      return renderDetail('task', <Task taskId={_id} />);
    case 'comment':
      return renderDetail(
        'conversation',
        <Conversation conversationId={_id} activity={activity} />
      );
    case 'moved':
      return renderDetail(
        activity.contentType,
        <MovementLog activity={activity} />
      );
    case 'create':
      return renderDetail(
        activity.contentType,
        <CreatedLog activity={activity} />
      );
    case 'delete':
      return renderDetail(
        activity.contentType,
        <DeletedLog activity={activity} />
      );
    case 'merge':
      return renderDetail(
        activity.contentType,
        <MergedLog activity={activity} />
      );
    case 'convert':
      return renderDetail(
        activity.contentType,
        <ConvertLog activity={activity} />
      );
    case 'segment':
      return renderDetail(activity.action, <SegmentLog activity={activity} />);
    case 'assignee':
      return renderDetail('assignee', <AssigneeLog activity={activity} />);
    case 'tagged':
      return renderDetail('tagged', <TaggedLog activity={activity} />);
    case 'archive':
      return renderDetail('archive', <ArchiveLog activity={activity} />);
    case 'send':
      if (contentType === 'campaign') {
        return renderDetail(
          activity.contentType,
          <CampaignLog activity={activity} />
        );
      }

      return renderDetail(activity.contentType, <SmsLog activity={activity} />);
    default:
      return <div />;
  }
};

export default activityItem;
