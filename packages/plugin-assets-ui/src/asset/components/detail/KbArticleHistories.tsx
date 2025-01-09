import {
  ActivityList,
  DateType,
  InfoSection
} from "@erxes/ui-sales/src/boards/styles/activityLogs";
import { ActivityIcon, Timeline } from "@erxes/ui-log/src/activityLogs/styles";
import { Icon, NameCard } from "@erxes/ui/src/components";
import colors from "@erxes/ui/src/styles/colors";
import dayjs from "dayjs";
import React from "react";
import { IKBArticleHistory } from "../../../common/types";
import { FlexColumn } from "@erxes/ui/src/components/step/style";

type Props = {
  histories: IKBArticleHistory[];
};

const iconColors = {
  added: colors.colorCoreGreen,
  removed: colors.colorCoreRed
};

const KbArticleHistories = ({ histories }: Props) => {
  return (
    <Timeline>
      {histories.map(({ _id, action = "", user, createdAt }) => (
        <ActivityList key={_id}>
          <ActivityIcon
            color={iconColors[action] || colors.colorCoreGray}
            style={{ left: "-75px" }}
          >
            <Icon icon={action === "added" ? "plus-square" : "trash-alt"} />
          </ActivityIcon>
          <FlexColumn>
            <NameCard user={user} />
            <InfoSection>
              {action.charAt(0).toUpperCase() + action.slice(1)}
            </InfoSection>
          </FlexColumn>
          <DateType>{dayjs(createdAt).format("DD MMM YYYY, HH:mm")}</DateType>
        </ActivityList>
      ))}
    </Timeline>
  );
};

export default KbArticleHistories;
