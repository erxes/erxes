import React from 'react';
import { IUser } from '../../auth/types';
import Icon from '../../components/Icon';
import Tip from '../../components/Tip';
import InternalNote from '../containers/items/InternalNote';
import { ActivityIcon, ActivityRow } from '../styles';
import { IActivityLog } from '../types';
import { formatText, getIconAndColor } from '../utils';
import ArchiveLog from './items/archive/ArchiveLog';
import AssigneeLog from './items/boardItems/AssigneeLog';
import MovementLog from './items/boardItems/MovementLog';
import CreatedLog from './items/create/CreatedLog';
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
    const { activity, currentUser, activityRenderItem } = this.props;
    const { _id, contentType, action } = activity;

    console.log('31231231', contentType);

    switch ((action && action) || contentType) {
      case 'create':
        return this.renderDetail(
          activity.contentType,
          <CreatedLog activity={activity} />
        );

      case 'note':
        return this.renderDetail(
          'note',
          <InternalNote
            noteId={_id}
            activity={activity}
            currentUser={currentUser}
          />
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

      case 'moved':
        return this.renderDetail(
          activity.contentType,
          <MovementLog activity={activity} />
        );
    }

    if (activityRenderItem) {
      return activityRenderItem(activity, currentUser);
    }

    return <div />;
  }
}

export default ActivityItem;
