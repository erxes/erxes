import { __, setBadge } from "@erxes/ui/src/utils/core";

import Label from "@erxes/ui/src/components/Label";
import React, { useEffect } from "react";

type Props = {
  unreadConversationsCount?: number;
};

const UnreadCount = (props: Props) => {
  useEffect(() => {
    const unreadCount = props.unreadConversationsCount;

    if (unreadCount !== props.unreadConversationsCount) {
      setBadge(unreadCount || 0, __("Team Inbox").toString());
    }
  }, [props.unreadConversationsCount]);

  const { unreadConversationsCount } = props;

  if (unreadConversationsCount === 0) {
    return null;
  }

  return (
    <Label shake={true} lblStyle="danger" ignoreTrans={true}>
      {unreadConversationsCount}
    </Label>
  );
};

export default UnreadCount;
