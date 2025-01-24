import React, { useState } from "react";
import dayjs from "dayjs";
import Button from "@erxes/ui/src/components/Button";
import Icon from "@erxes/ui/src/components/Icon";
import Tip from "@erxes/ui/src/components/Tip";
import { __ } from "@erxes/ui/src/utils/core";
import { getIconAndColor } from "@erxes/ui-log/src/activityLogs/utils";
import { Link } from "react-router-dom";
import {
  AcitivityHeader,
  ActivityDate,
  ActivityIcon,
  ActivityRow,
  IMapActivityContent,
  SentWho
} from "./styles";
import { CenterText } from "@erxes/ui-log/src/activityLogs/styles";

type Props = {
  contentType: string;
  activity: any;
  currentUser: any;
};
const ActivityItem: React.FC<Props> = ({ contentType, activity }) => {
  if (contentType && !contentType.includes("engages:customer")) {
    return null;
  }
  const { contentTypeDetail = {} } = activity;
  const {
    body = "",
    subject = "",
    createdAt,
    from = "",
    to = [],
    cc = [],
    bcc = []
  } = contentTypeDetail;

  const [shrink, setShrink] = useState<boolean>(body.length > 380);

  const iconAndColor = getIconAndColor("email");

  return (
    <ActivityRow className='activity-row'>
      <Tip
        text={__("engages email")}
        placement='top'>
        <ActivityIcon color={iconAndColor.color}>
          <Icon icon={iconAndColor.icon} />
        </ActivityIcon>
      </Tip>

      <AcitivityHeader>
        <strong>{subject || __("No Subject")}</strong>
        <ActivityDate>
          {createdAt ? dayjs(createdAt).format("lll") : __("Unknown Date")}
        </ActivityDate>
      </AcitivityHeader>

      <SentWho>
        <strong>{from || __("Unknown Sender")}</strong>
        {__(" sent email to ")}
        <strong>
          {to.length > 0 ? to.join(", ") : __("Unknown Recipient")}
        </strong>
        {cc.length > 0 && (
          <>
            {", "}
            {__("cc:")}
            <strong>{cc.join(", ")}</strong>
          </>
        )}
        {bcc.length > 0 && (
          <>
            {", "}
            {__("bcc:")}
            <strong>{bcc.join(", ")}</strong>
          </>
        )}
      </SentWho>

      <IMapActivityContent $shrink={shrink}>
        <div dangerouslySetInnerHTML={{ __html: body }} />
        {body.length > 380 && (
          <>
            <Button
              size='small'
              btnStyle='warning'
              onClick={() => setShrink(!shrink)}>
              {shrink ? __("Show More") : __("Show Less")}
            </Button>
            <CenterText>
              <Link
                to={`/inbox/index?_id=${contentTypeDetail.inboxConversationId}`}>
                {__("See full email")} <Icon icon='angle-double-right' />
              </Link>
            </CenterText>
          </>
        )}
      </IMapActivityContent>
    </ActivityRow>
  );
};

export default ActivityItem;
