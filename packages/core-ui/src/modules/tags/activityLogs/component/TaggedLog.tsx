import React from "react";
import {
  ActivityDate,
  FlexBody,
  FlexCenterContent
} from "@erxes/ui-log/src/activityLogs/styles";
import { ITag } from "../../types";
import Tags from "@erxes/ui/src/components/Tags";
import Tip from "@erxes/ui/src/components/Tip";
import dayjs from "dayjs";
import { renderUserFullName } from "@erxes/ui/src/utils";

type TaggedLogProps = {
  activity: any;
  tags: ITag[];
};

const TaggedLog: React.FC<TaggedLogProps> = ({ activity, tags }) => {
  const renderContent = () => {
    const { createdByDetail } = activity;
    let userName = "Unknown";

    if (createdByDetail && createdByDetail.type === "user") {
      const { content } = createdByDetail;

      if (content && content.details) {
        userName = renderUserFullName(createdByDetail.content);
      }
    }

    const tagNames = (tags || []).map(tag => (
      <Tags key={tag._id} tags={[tag]} size="medium" />
    ));

    return (
      <span>
        {userName} change tag to
        {tagNames}
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

export default TaggedLog;
