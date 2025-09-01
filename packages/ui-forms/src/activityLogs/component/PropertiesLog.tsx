import React from "react";
import {
  ActivityDate,
  FlexBody,
  FlexCenterContent,
} from "@erxes/ui-log/src/activityLogs/styles";
import Tip from "@erxes/ui/src/components/Tip";
import dayjs from "dayjs";
import { renderUserFullName } from "@erxes/ui/src/utils";
import GenerateCustomFields from "@erxes/ui-forms/src/settings/properties/components/GenerateCustomFields";

type PropertiesLogProps = {
  activity: any;
  fieldsGroups: any;
};

const PropertiesLog: React.FC<PropertiesLogProps> = ({
  activity,
  fieldsGroups,
}) => {
  const renderContent = () => {
    const { createdByDetail, content } = activity;
    const fields = fieldsGroups?.fieldsGroups || [];
    const { customFieldsData = [] } = content || {};
    let userName = "Unknown";
    if (createdByDetail?.type === "user") {
      userName = renderUserFullName(createdByDetail.content);
    }

    const updatedProps = {
      isDetail: false,
      customFieldsData: customFieldsData,
      fieldsGroups: fields,
    };

    return (
      <span>
        {userName} change Properties to
        <GenerateCustomFields {...updatedProps} />
      </span>
    );
  };

  const { createdAt } = activity;

  return (
    <FlexCenterContent>
      <FlexBody>{renderContent()}</FlexBody>
      <Tip text={dayjs(createdAt).format("llll")}>
        <ActivityDate>{dayjs(createdAt).format("MMM D, h:mm A")}</ActivityDate>
      </Tip>
    </FlexCenterContent>
  );
};

export default PropertiesLog;
