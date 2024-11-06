import React from "react";
import {
  ActivityIcon,
  ActivityRow
} from "@erxes/ui-log/src/activityLogs/styles";
import {
  formatText,
  getIconAndColor
} from "@erxes/ui-log/src/activityLogs/utils";

import Icon from "@erxes/ui/src/components/Icon";
import Tip from "@erxes/ui/src/components/Tip";
import TaggedLog from "./containers/TaggedLog";

type Props = {
  contentType: string;
  activity: any;
  currentUser: any;
};

const ActivityItem: React.FC<Props> = ({ contentType, activity }) => {
  const renderDetail = (children: React.ReactNode) => {
    const type = contentType.split(":")[1];
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
  };

  const { action } = activity;
  const type = activity.contentType.split(":")[1];
  const tagIds = activity.content ? activity.content.tagIds : [];

  switch ((action && action) || type) {
    case "tagged":
      return renderDetail(<TaggedLog tagIds={tagIds} activity={activity} />);
    default:
      return <div />;
  }
};

export default ActivityItem;
