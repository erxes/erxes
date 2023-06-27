import { Config, IUser } from "../../types";
import {
  GroupList,
  GroupWrapper,
  Label,
  ListHead,
  ListRow,
} from "../../styles/cards";

import { Card } from "react-bootstrap";
import React from "react";
import dayjs from "dayjs";
import { renderUserFullName } from "../../utils";
import { useRouter } from "next/router";

type Props = {
  loading: boolean;
  items: any;
  item: any;
  currentUser: IUser;
  config: Config;
  type: string;
  groupType: string;
};

export default function Group({ items, item, type, groupType }: Props) {
  const router = useRouter();

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <GroupList>
      <Card.Header>
        {groupType === "user" ? renderUserFullName(item) : item.name}
        <span>{item.itemsTotalCount}</span>
      </Card.Header>
      <GroupWrapper>
        <ListHead className="head">
          <div>Subject</div>
          <div>Created date</div>
          <div>Stage changed date</div>
          <div>Start date</div>
          <div>Close date</div>
          <div>Staging</div>
          <div>Labels</div>
        </ListHead>
        <div>
          {(items || []).map((card) => {
            const { stage = {}, labels } = card;

            return (
              <ListRow
                key={groupType + card._id}
                className="item"
                onClick={() => router.push(`/${type}s?itemId=${card._id}`)}
              >
                <div className="base-color">{card.name}</div>
                <div>{dayjs(card.createdAt).format("MMM D YYYY")}</div>
                <div>
                  {card.stageChangedDate
                    ? dayjs(card.stageChangedDate).format("MMM D YYYY")
                    : "-"}
                </div>

                <div>
                  {card.startDate
                    ? dayjs(card.startDate).format("MMM D YYYY")
                    : "-"}
                </div>

                <div>
                  {card.closeDate
                    ? dayjs(card.closeDate).format("MMM D YYYY")
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
        </div>
      </GroupWrapper>
    </GroupList>
  );
}
