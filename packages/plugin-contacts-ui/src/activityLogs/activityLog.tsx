import {
  ActivityIcon,
  ActivityRow
} from '@erxes/ui-log/src/activityLogs/styles';
import {
  formatText,
  getIconAndColor
} from '@erxes/ui-log/src/activityLogs/utils';

import CreatedLog from './components/CreateLog';
import Icon from '@erxes/ui/src/components/Icon';
import MergedLog from './containers/MergedLog';
import React from 'react';
import Tip from '@erxes/ui/src/components/Tip';

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

    const { contentType, action, _id } = activity;

    const type = contentType.split(':')[1];

    switch ((action && action) || type) {
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
