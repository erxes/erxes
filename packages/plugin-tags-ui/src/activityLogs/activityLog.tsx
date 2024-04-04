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
import TaggedLog from './containers/TaggedLog';
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

    const tagIds = activity.content ? activity.content.tagIds : [];

    switch ((action && action) || type) {
      case 'tagged':
        return this.renderDetail(
          'tagged',
          <TaggedLog tagIds={tagIds} activity={activity} />
        );

      default:
        return <div />;
    }
  }
}

export default ActivityItem;
