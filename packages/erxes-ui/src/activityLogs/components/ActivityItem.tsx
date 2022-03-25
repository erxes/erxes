import React from 'react';
import { IUser } from '../../auth/types';
import Icon from '../../components/Icon';
import Tip from '../../components/Tip';
import Task from '../containers/items/boardItems/Task';
import Conversation from '../containers/items/Conversation';
import InternalNote from '../containers/items/InternalNote';
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

type Props = {
  activity: IActivityLog;
  currentUser: IUser;
  activityRenderItem?: (
    activity: IActivityLog,
    currentUser?: IUser
  ) => React.ReactNode;
};

class ActivityItem extends React.Component<Props> {
  renderDetail(contentType: string, children: React.ReactNode) {
    const type = contentType.split(':')[1];

    const iconAndColor = getIconAndColor(type || contentType) || {};

    if (type === 'conversation') {
      return children;
    }

    return (
      <ActivityRow key={Math.random()}>
        <Tip text={formatText(type || contentType)} placement="top">
          <ActivityIcon color={iconAndColor.color}>
            <Icon icon={iconAndColor.icon} />
          </ActivityIcon>
        </Tip>
        {children}
      </ActivityRow>
    );
  }

  render() {
    const { activity, currentUser } = this.props;
    const { _id, contentType, action } = activity;

    const type = contentType.split(':')[1];

    switch ((action && action) || type) {
      case 'conversation':
        return this.renderDetail(
          'conversation',
          <Conversation conversationId={_id} activity={activity} />
        );
      case 'taskDetail':
        return this.renderDetail('task', <Task taskId={_id} />);

      case 'comment':
        return this.renderDetail(
          'conversation',
          <Conversation conversationId={_id} activity={activity} />
        );
      case 'moved':
        return this.renderDetail(
          activity.contentType,
          <MovementLog activity={activity} />
        );
      case 'create':
        return this.renderDetail(
          activity.contentType,
          <CreatedLog activity={activity} />
        );
      case 'delete':
        return this.renderDetail(
          activity.contentType,
          <DeletedLog activity={activity} />
        );

      case 'note':
        return this.renderDetail(
          'internalnotes:note',
          <InternalNote
            noteId={_id}
            activity={activity}
            currentUser={currentUser}
          />
        );

      case 'merge':
        return this.renderDetail(
          activity.contentType,
          <MergedLog activity={activity} />
        );

      case 'convert':
        return this.renderDetail(
          activity.contentType,
          <ConvertLog activity={activity} />
        );
      case 'segment':
        return this.renderDetail(
          activity.action,
          <SegmentLog activity={activity} />
        );
      case 'assignee':
        return this.renderDetail(
          'assignee',
          <AssigneeLog activity={activity} />
        );

      case 'tagged':
        return this.renderDetail('tagged', <TaggedLog activity={activity} />);
      case 'archive':
        return this.renderDetail('archive', <ArchiveLog activity={activity} />);
      case 'send':
        if (contentType === 'campaign') {
          return this.renderDetail(
            activity.contentType,
            <CampaignLog activity={activity} />
          );
        }

        return this.renderDetail(
          activity.contentType,
          <SmsLog activity={activity} />
        );
      default:
        return <div />;
    }
  }
}

export default ActivityItem;
