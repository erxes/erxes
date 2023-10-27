import {
  ActivityIcon,
  ActivityRow
} from '@erxes/ui-log/src/activityLogs/styles';
import {
  formatText,
  getIconAndColor
} from '@erxes/ui-log/src/activityLogs/utils';

import Icon from '@erxes/ui/src/components/Icon';
import React from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import BlockLog from './containers/BlockLog';

type Props = {
  contentType: string;
  activity: any;
  currentUser: any;
};

class ActivityItem extends React.Component<Props> {
  renderDetail(contentType: string, children: React.ReactNode) {
    const type = contentType.split(':')[1];

    const iconAndColor = getIconAndColor(type || contentType) || {};

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
    const { activity } = this.props;

    const { contentType, action, _id, contentId } = activity;

    const type = contentType.split(':')[1];

    const packageId = activity.content ? activity.content.packageId : [];

    const amount = activity.content ? activity.content.amount : [];

    switch ((action && action) || type) {
      case 'invest':
        return this.renderDetail(
          'invest',
          <BlockLog
            contentId={contentId}
            packageId={packageId}
            amount={amount}
            activity={activity}
          />
        );

      default:
        return <div />;
    }
  }
}

export default ActivityItem;
