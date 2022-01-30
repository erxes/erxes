import React from 'react';
import { IUser } from '../../auth/types';
import Icon from '../../components/Icon';
import Tip from '../../components/Tip';
import InternalNote from '../containers/items/InternalNote';
import { ActivityIcon, ActivityRow } from '../styles';
import { IActivityLog } from '../types';
import { formatText, getIconAndColor } from '../utils';

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
    const { _id, contentType } = activity;

    if (contentType === 'note') {
      return this.renderDetail(
        'note',
        <InternalNote
          noteId={_id}
          activity={activity}
          currentUser={currentUser}
        />
      );
    }

    if (activityRenderItem) {
      return activityRenderItem(activity, currentUser);
    }

    return <div />;
  }
}

export default ActivityItem;
