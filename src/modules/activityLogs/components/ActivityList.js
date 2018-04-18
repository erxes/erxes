import React from 'react';
import PropTypes from 'prop-types';
import { EmptyState, Icon } from 'modules/common/components';
import { Timeline, ActivityTitle } from '../styles';
import ActivityLogProcessor from '../utils';
import ActivityItem from './ActivityItem';

const propTypes = {
  activities: PropTypes.array,
  user: PropTypes.object,
  target: PropTypes.string,
  type: PropTypes.string
};

class ActivityList extends React.Component {
  renderList(activity) {
    const activities = activity.data;

    return (
      <div key={activity.title}>
        {activities.length ? (
          <ActivityTitle>
            <Icon erxes icon="calendar" /> {activity.title}
          </ActivityTitle>
        ) : null}
        {activities.map(rowData => ActivityItem(rowData))}
      </div>
    );
  }

  render() {
    let { activities } = this.props;
    const activityLogProcessor = new ActivityLogProcessor(this.props);

    activities = activityLogProcessor.process();

    if (!activities || activities.length < 1) {
      return (
        <EmptyState
          text="There aren’t any activities at the moment."
          icon="clock"
        />
      );
    }

    return <Timeline>{activities.map(item => this.renderList(item))}</Timeline>;
  }
}

ActivityList.propTypes = propTypes;

export default ActivityList;
