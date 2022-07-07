import { ActivityIcon, ActivityRow } from '../styles';
import { formatText, getIconAndColor } from '../utils';

import ErrorBoundary from '@erxes/ui/src/components/ErrorBoundary';
import { IActivityLog } from '../types';
import { IUser } from '@erxes/ui/src/auth/types';
import Icon from '@erxes/ui/src/components/Icon';
import InternalNote from '../containers/items/InternalNote';
import React from 'react';
import { RenderDynamicComponent } from '@erxes/ui/src/utils/core';
import Tip from '@erxes/ui/src/components/Tip';

type Props = {
  activity: IActivityLog;
  currentUser: IUser;
  activityRenderItem?: (
    activity: IActivityLog,
    currentUser?: IUser
  ) => React.ReactNode;
};

class ActivityItem extends React.Component<Props> {
  render() {
    const { activity, currentUser } = this.props;
    const { contentType, _id } = activity;

    const type = contentType.split(':')[1];

    const plugins: any[] = (window as any).plugins || [];

    if (type === 'note') {
      const iconAndColor = getIconAndColor(type);

      return (
        <ActivityRow key={Math.random()}>
          <Tip text={formatText(type || contentType)} placement="top">
            <ActivityIcon color={iconAndColor.color}>
              <Icon icon={iconAndColor.icon} />
            </ActivityIcon>
          </Tip>
          <InternalNote
            noteId={_id}
            activity={activity}
            currentUser={currentUser}
          />
        </ActivityRow>
      );
    }

    const pluginName = contentType.split(':')[0];

    for (const plugin of plugins) {
      if (pluginName === plugin.name && plugin.activityLog) {
        return (
          <ErrorBoundary>
            <RenderDynamicComponent
              scope={plugin.scope}
              component={plugin.activityLog}
              injectedProps={{
                contentType,
                activity,
                currentUser
              }}
            />
          </ErrorBoundary>
        );
      }
    }

    return null;
  }
}

export default ActivityItem;
