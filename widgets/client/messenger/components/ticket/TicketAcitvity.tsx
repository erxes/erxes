import * as React from "react";

import { ITicketActivityLog } from "../../types";
import { __ } from "../../../utils";

type Props = {
  activity: ITicketActivityLog;
};

export const renderUserFullName = (data: any) => {
  const { details } = data;
  if (details && details.fullName) {
    return details.fullName;
  }

  if (details && (details.firstName || details.lastName)) {
    return (data.firstName || "") + " " + (data.lastName || "");
  }

  if (data.email || data.username) {
    return data.email || data.username;
  }

  return "Unknown";
};

const TicketActivity: React.FC<Props> = ({ activity }) => {
  const { contentType, action, createdByDetail, content } = activity;
  const type = contentType.split(":")[1];

  const renderDetail = (contentType: string, children: React.ReactNode) => {
    let src =
      "https://office.erxes.io/gateway/read-file?key=offi…-erxes-io/chz8U6ErcBCK102DtFGVferxes.png&width=20";

    if (createdByDetail && createdByDetail.type === "user") {
      const { content } = createdByDetail;

      if (content && content.details) {
        src = content.details.avatar || "";
      }
    }

    return (
      <>
        <div className="user">
          <img src={src} alt="" />
        </div>
        {children}
      </>
    );
  };

  const renderContent = () => {
    let userName = "Unknown";

    if (createdByDetail && createdByDetail.type === "user") {
      const { content } = createdByDetail;

      if (content && content.details) {
        userName = renderUserFullName(createdByDetail.content);
      }
    }

    switch ((action && action) || type) {
      case "create":
        return renderDetail(
          activity.contentType,
          <span>
            <strong>{userName}</strong> created <b>ticket</b>
          </span>
        );

      case "assignee":
        return renderDetail(
          "assignee",
          <span>
            <strong>{userName}</strong> assigned <b>team member</b>
          </span>
        );

      case "archive":
        return renderDetail(
          "archive",
          <span>
            <strong>{userName}</strong> {content} this {type}
          </span>
        );

      case "moved":
        return renderDetail(
          activity.contentType,
          <span>
            <strong>{userName}</strong>
            moved <b>{content.text || ""}</b>
          </span>
        );

      case "convert":
        return renderDetail(
          activity.contentType,
          <span>
            <strong>{userName}</strong> {__("converted")}
          </span>
        );

      case "delete":
        return renderDetail(
          activity.contentType,
          <span>
            <strong>{userName}</strong> {__("deleted")}
          </span>
        );

      default:
        return <div />;
    }
  };

  return <div className="ticket-progress-log">{renderContent()}</div>;
};

export default TicketActivity;
