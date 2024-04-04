import { ActivityIcon, ActivityRow } from '../styles';
import { formatText, getIconAndColor } from '../utils';

import ErrorBoundary from '@erxes/ui/src/components/ErrorBoundary';
import { IActivityLog } from '../types';
import { IIntegration } from '@erxes/ui-inbox/src/settings/integrations/types';
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
    const { contentType, _id, contentTypeDetail } = activity;

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
      const hasIntegration =
        contentType.includes('conversation') &&
        contentTypeDetail &&
        contentTypeDetail.integration;
      let kind = '';
      let scope = plugin.scope;
      let component = plugin.activityLog;

      if (hasIntegration) {
        const integration = (contentTypeDetail.integration ||
          {}) as IIntegration;
        kind = integration.kind.split('-')[0];
      }

      if (kind) {
        const p = plugins.find(pl => pl.name === kind);

        if (p) {
          scope = p.scope;
          component = p.activityLog;
        }
      }

      if ((kind === plugin.name || pluginName === plugin.name) && component) {
        return (
          <ErrorBoundary>
            <RenderDynamicComponent
              scope={scope}
              component={component}
              injectedProps={{
                contentType,
                activity,
                currentUser,
                conversationId: _id
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
