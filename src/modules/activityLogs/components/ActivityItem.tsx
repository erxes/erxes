import Icon from 'modules/common/components/Icon';
import React from 'react';
import Task from '../containers/items/boardItems/Task';
import Conversation from '../containers/items/conversation/Conversation';
import InternalNote from '../containers/items/InternalNote';
import { ActivityIcon, ActivityRow } from '../styles';
import { IActivityLog } from '../types';
import { getIconAndColor } from '../utils';
import CreatedLog from './items/boardItems/CreatedLog';
import MovementLog from './items/boardItems/MovementLog';
import MergedLog from './items/MergedLog';

type Props = {
  activity: IActivityLog;
};

class ActivityItem extends React.Component<Props> {
  renderDetail(type: string, children: React.ReactNode) {
    const iconAndColor = getIconAndColor(type);

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
    const { activity } = this.props;
    const { _id, contentType, action } = activity;

    switch ((action && action) || contentType) {
      case 'note':
        return this.renderDetail(
          'note',
          <InternalNote noteId={_id} activity={activity} />
        );
      case 'conversation':
        return this.renderDetail(
          'conversation',
          <Conversation conversationId={_id} activity={activity} />
        );
      case 'taskDetail':
        return this.renderDetail('task', <Task taskId={_id} />);
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
