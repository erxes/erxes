import { ActivityIcon, ActivityRow } from '@erxes/ui/src/activityLogs/styles';
import { formatText, getIconAndColor } from '@erxes/ui/src/activityLogs/utils';
import Icon from '@erxes/ui/src/components/Icon';
import Tip from '@erxes/ui/src/components/Tip';
import React from 'react';
import AssigneeLog from './containers/AssigneeLog';
import CreatedLog from './components/CreatedLog';
import Task from './containers/Task';
import MovementLog from './containers/MovementLog';
import ArchiveLog from './components/ArchiveLog';
import DeletedLog from './components/DeleteLog';
import ConvertLog from './containers/ConvertLog';

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
      case 'taskDetail':
        return this.renderDetail('task', <Task taskId={_id} />);

      case 'create':
        return this.renderDetail(
          activity.contentType,
          <CreatedLog activity={activity} />
        );

      case 'assignee':
        return this.renderDetail(
          'assignee',
          <AssigneeLog activity={activity} />
        );

      case 'archive':
        return this.renderDetail('archive', <ArchiveLog activity={activity} />);

      case 'moved':
        return this.renderDetail(
          activity.contentType,
          <MovementLog activity={activity} />
        );

      case 'convert':
        return this.renderDetail(
          activity.contentType,
          <ConvertLog activity={activity} />
        );

      case 'delete':
        return this.renderDetail(
          activity.contentType,
          <DeletedLog activity={activity} />
        );

      default:
        return <div />;
    }
  }
}

export default ActivityItem;
