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
  activity: {
    createdAt: string;
    createdByDetail?: {
      type?: string;
      content?: any;
    };
    content?: {
      customFieldsData?: Array<{ field: string; value: any }>;
    };
  };
  fieldsGroups: any[];
};

const PropertiesLog: React.FC<PropertiesLogProps> = ({
  activity,
  fieldsGroups,
}) => {
  const { createdByDetail, content, createdAt } = activity;

  const fields = fieldsGroups || [];
  const customFieldsData = content?.customFieldsData ?? [];

  const userName =
    createdByDetail?.type === "user"
      ? renderUserFullName(createdByDetail.content)
      : "Unknown";

  return (
    <FlexCenterContent>
      <FlexBody>
        <span>
          {userName} changed properties to{" "}
          <GenerateCustomFields
            isDetail={false}
            customFieldsData={customFieldsData}
            fieldsGroups={fields}
          />
        </span>
      </FlexBody>
      <Tip text={dayjs(createdAt).format("llll")}>
        <ActivityDate>{dayjs(createdAt).format("MMM D, h:mm A")}</ActivityDate>
      </Tip>
    </FlexCenterContent>
  );
};

export default PropertiesLog;
