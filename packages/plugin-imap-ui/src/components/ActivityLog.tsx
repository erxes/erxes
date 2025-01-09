import {
  AcitivityHeader,
  ActivityDate,
  ActivityIcon,
  ActivityRow,
  IMapActivityContent,
  SentWho,
} from "../styles";
import React, { useEffect, useState } from "react";

import Button from "@erxes/ui/src/components/Button";
import { CenterText } from "@erxes/ui-log/src/activityLogs/styles";
import Icon from "@erxes/ui/src/components/Icon";
import { Link } from "react-router-dom";
import Tip from "@erxes/ui/src/components/Tip";
import { __ } from "@erxes/ui/src/utils/core";
import dayjs from "dayjs";
import { getIconAndColor } from "@erxes/ui-log/src/activityLogs/utils";

type Props = {
  contentType: string;
  activity: any;
  currentUser: any;
};

const ActivityItem = (props: Props) => {
  const { activity } = props;

  const { contentTypeDetail = {}, contentType } = activity;
  const { body, subject, createdAt } = contentTypeDetail;

  const [shrink, setShrink] = useState<boolean>(
    (contentTypeDetail.body || "").length > 380 ? true : false
  );

  useEffect(() => {
    const activityRows = document.querySelectorAll(".activity-row");

    activityRows.forEach((row) => {
      const styleTags =
        (row.getElementsByTagName("style") as any) || ([] as any);

      while (styleTags && styleTags.length > 0) {
        styleTags[0].parentNode.removeChild(styleTags[0]);
      }
    });
  }, [body]);

  const renderWhom = (contentTypeDetail) => {
    const { from, to } = contentTypeDetail;

    const From = from ? from.map((f) => f.name || f.address) : "unknown";
    const To = to ? to.map((f) => f.name || f.address) : "unknown";

    return (
      <SentWho>
        <strong>{From.map((f) => f)}</strong>
        {__("send email to ")}
        <strong>{To.map((t) => t)}</strong>
      </SentWho>
    );
  };

  const renderExpandButton = (contentTypeDetail) => {
    const { inboxConversationId } = contentTypeDetail;

    if (!shrink) {
      return null;
    }

    return (
      <>
        <Button
          size="small"
          btnStyle="warning"
          onClick={() => setShrink(!shrink)}
        >
          {shrink ? __("Expand email") : __("Shrink email")}
        </Button>

        <CenterText>
          <Link to={`/inbox/index?_id=${inboxConversationId}`}>
            {__("See full mail")} <Icon icon="angle-double-right" />
          </Link>
        </CenterText>
      </>
    );
  };

  if (contentType && !contentType.includes("imap")) {
    return null;
  }

  const iconAndColor = getIconAndColor("email");

  return (
    <ActivityRow className="activity-row">
      <Tip text={__("imap email")} placement="top">
        <ActivityIcon color={iconAndColor.color}>
          <Icon icon={iconAndColor.icon} />
        </ActivityIcon>
      </Tip>

      <AcitivityHeader>
        <strong>{subject}</strong>
        <ActivityDate>{dayjs(createdAt).format("lll")}</ActivityDate>
      </AcitivityHeader>
      {renderWhom(contentTypeDetail)}

      <IMapActivityContent $shrink={shrink}>
        <div dangerouslySetInnerHTML={{ __html: body }} />
        {renderExpandButton(contentTypeDetail)}
      </IMapActivityContent>
    </ActivityRow>
  );
};

export default ActivityItem;
