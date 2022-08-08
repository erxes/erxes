import Label from '@erxes/ui/src/components/Label';
import { __, setBadge } from '@erxes/ui/src/utils/core';
import React from 'react';

type Props = {
  unreadConversationsCount?: number;
};

class UnreadCount extends React.Component<Props> {
  componentWillReceiveProps(nextProps: any) {
    const unreadCount = nextProps.unreadConversationsCount;

    if (unreadCount !== this.props.unreadConversationsCount) {
      setBadge(unreadCount, __('Team Inbox').toString());
    }
  }

  render() {
    const { unreadConversationsCount } = this.props;

    if (unreadConversationsCount === 0) {
      return null;
    }

    return (
      <Label shake={true} lblStyle="danger" ignoreTrans={true}>
        {unreadConversationsCount}
      </Label>
    );
  }
}

export default UnreadCount;
