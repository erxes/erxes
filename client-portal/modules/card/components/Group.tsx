import { Config, IUser } from "../../types";
import {
  GroupWrapper,
  Label,
  ListBody,
  ListHead,
  ListRow,
} from "../../styles/cards";

import EmptyState from "../../common/form/EmptyState";
import React from "react";
import dayjs from "dayjs";
import { useRouter } from "next/router";

type Props = {
  loading: boolean;
  items: any;
  currentUser: IUser;
  config: Config;
  type: string;
  groupType: string;
};

export default function Group({ items, type, groupType }: Props) {
  const router = useRouter();

  if (!items || items.length === 0) {
    return <EmptyState icon="ban" text="No cards" size="small" />;
  }

  return (
    <GroupWrapper>
      <ListHead className="head">
        <div>Subject</div>
        <div>Created date</div>
        <div>Stage changed date</div>
        <div>Start date</div>
        <div>Close date</div>
        <div>Stage</div>
        <div>Labels</div>
      </ListHead>
      <ListBody>
        {(items || []).map((item) => {
          const { stage = {}, labels } = item;

          return (
            <ListRow
              key={groupType + item._id}
              className="item"
              onClick={() => router.push(`/${type}s?itemId=${item._id}`)}
            >
              <div className="base-color">{item.name}</div>

              <div>{dayjs(item.createdAt).format("MMM D YYYY")}</div>
              <div>
                {item.stageChangedDate
                  ? dayjs(item.stageChangedDate).format("MMM D YYYY")
                  : "-"}
              </div>

              <div>
                {item.startDate
                  ? dayjs(item.startDate).format("MMM D YYYY")
                  : "-"}
              </div>

              <div>
                {item.closeDate
                  ? dayjs(item.closeDate).format("MMM D YYYY")
                  : "-"}
              </div>

              <div className="base-color">{stage.name}</div>

              <div>
                {(labels || []).map((label) => (
                  <Label
                    key={label._id}
                    lblStyle={"custom"}
                    colorCode={label.colorCode}
                  >
                    {label.name}
                  </Label>
                ))}
              </div>
            </ListRow>
          );
        })}
      </ListBody>
    </GroupWrapper>
  );
}
