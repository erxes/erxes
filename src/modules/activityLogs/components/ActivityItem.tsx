import { IUser } from 'modules/auth/types';
import Icon from 'modules/common/components/Icon';
import React from 'react';
import Task from '../containers/items/boardItems/Task';
import Conversation from '../containers/items/conversation/Conversation';
import Email from '../containers/items/Email';
import InternalNote from '../containers/items/InternalNote';
import { ActivityIcon, ActivityRow } from '../styles';
import { IActivityLog } from '../types';
import { getIconAndColor } from '../utils';
import CreatedLog from './items/boardItems/CreatedLog';
import MovementLog from './items/boardItems/MovementLog';
import MergedLog from './items/MergedLog';

type Props = {
  activity: IActivityLog;
  currenUser: IUser;
};

class ActivityItem extends React.Component<Props> {
  renderDetail(type: string, children: React.ReactNode) {
    const iconAndColor = getIconAndColor(type);

    if (type === 'conversation') {
      return children;
    }

    return (
      <ActivityRow key={Math.random()}>
        <ActivityIcon color={iconAndColor.color}>
          <Icon icon={iconAndColor.icon} />
        </ActivityIcon>
        {children}
      </ActivityRow>
    );
  }

  render() {
    const { activity, currenUser } = this.props;
    const { _id, contentType, action } = activity;

    switch ((action && action) || contentType) {
      case 'note':
        return this.renderDetail(
          'note',
          <InternalNote
            noteId={_id}
            activity={activity}
            currenUser={currenUser}
          />
        );
      case 'conversation':
        return this.renderDetail(
          'conversation',
          <Conversation conversationId={_id} activity={activity} />
        );
      case 'taskDetail':
        return this.renderDetail('task', <Task taskId={_id} />);
      case 'email':
        return this.renderDetail(
          'email',
          <Email emailId={_id} activity={activity} />
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
      case 'merge':
        return this.renderDetail(
          activity.contentType,
          <MergedLog activity={activity} />
        );
      default:
        return <div />;
    }
  }
}

export default ActivityItem;
