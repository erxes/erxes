import { IUser } from 'modules/auth/types';
import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';
import React from 'react';
import Task from '../containers/items/boardItems/Task';
import Conversation from '../containers/items/Conversation';
import Email from '../containers/items/Email';
import InternalNote from '../containers/items/InternalNote';
import { ActivityIcon, ActivityRow } from '../styles';
import { IActivityLog } from '../types';
import { formatText, getIconAndColor } from '../utils';
import ArchiveLog from './items/archive/ArchiveLog';
import AssigneeLog from './items/boardItems/AssigneeLog';
import MovementLog from './items/boardItems/MovementLog';
import ConvertLog from './items/ConvertLog';
import CreatedLog from './items/create/CreatedLog';
import DeletedLog from './items/delete/DeletedLog';
import MergedLog from './items/MergedLog';
import SegmentLog from './items/SegmentLog';

type Props = {
  activity: IActivityLog;
  currentUser: IUser;
};

class ActivityItem extends React.Component<Props> {
  renderDetail(type: string, children: React.ReactNode) {
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
  }

  render() {
    const { activity, currentUser } = this.props;
    const { _id, contentType, action } = activity;

    switch ((action && action) || contentType) {
      case 'note':
        return this.renderDetail(
          'note',
          <InternalNote
            noteId={_id}
            activity={activity}
            currentUser={currentUser}
          />
        );
      case 'conversation':
        return this.renderDetail(
          'conversation',
          <Conversation conversationId={_id} activity={activity} />
        );
      case 'taskDetail':
        return this.renderDetail('task', <Task taskId={_id} />);
      case 'engage-email':
        return this.renderDetail(
          'email',
          <Email emailType="engage" emailId={_id} activity={activity} />
        );
      case 'email':
        return this.renderDetail(
          'email',
          <Email emailType="email" emailId={_id} activity={activity} />
        );
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
      case 'archive':
        return this.renderDetail('archive', <ArchiveLog activity={activity} />);
      default:
        return <div />;
    }
  }
}

export default ActivityItem;
