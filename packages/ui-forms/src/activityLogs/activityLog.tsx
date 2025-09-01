import React from "react";
import {
  ActivityIcon,
  ActivityRow,
} from "@erxes/ui-log/src/activityLogs/styles";
import {
  formatText,
  getIconAndColor,
} from "@erxes/ui-log/src/activityLogs/utils";
import Icon from "@erxes/ui/src/components/Icon";
import Tip from "@erxes/ui/src/components/Tip";
import PropertiesLog from "./containers/PropertiesLog";

type Props = {
  contentType: string;
  activity: any;
  currentUser: any;
};

const ActivityItem: React.FC<Props> = ({
  contentType,
  activity,
  currentUser,
}) => {
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
  const customFieldsData = activity.content
    ? activity.content.customFieldsData
    : [];

  switch ((action && action) || type) {
    case "properties":
      return renderDetail(
        <PropertiesLog
          activity={activity}
          contentType={contentType}
          currentUser={currentUser}
          customFieldsData={customFieldsData}
        />
      );
    default:
      return <div />;
  }
};

export default ActivityItem;
