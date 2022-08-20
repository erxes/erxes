import Conversation from './containers/Conversation';
import React from 'react';

type Props = {
  contentType: string;
  activity: any;
  currentUser: any;
};

class ActivityItem extends React.Component<Props> {
  render() {
    const { activity } = this.props;

    const { _id } = activity;

    return <Conversation conversationId={_id} activity={activity} />;
  }
}

export default ActivityItem;
