import * as React from "react";
import * as dayjs from "dayjs";

import { IAttachment, ITicketActivityLog, ITicketComment } from "../../types";
import { __, readFile } from "../../../utils";

import Button from "../common/Button";
import Container from "../common/Container";
import Input from "../common/Input";
import TicketActivity from "./TicketAcitvity";
import { useTicket } from "../../context/Ticket";

type Props = {
  activityLogs: ITicketActivityLog[];
  comment: string;
  comments: ITicketComment[];
  setComment: (comment: string) => void;
  onComment: () => void;
};

const TicketShowProgress: React.FC<Props> = ({
  onComment,
  setComment,
  comment,
  comments,
  activityLogs,
}) => {
  const { ticketData = {} } = useTicket();

  const renderAttachments = (attachments: IAttachment[]) => {
    return attachments.map((attachment, index) => (
      <div key={attachment.url} className="ticket-attachment">
        <img
          src={readFile(attachment.url)}
          alt={`ticket-image-${index}`}
          onLoad={() => {
            URL.revokeObjectURL(attachment.name);
          }}
        />
      </div>
    ));
  };

  const renderTicketIssue = () => {
    const { name, type, description, attachments } = ticketData;

    return (
      <div className="ticket-progress-content">
        <div className="content-header">
          <b>{name}</b>
          <span>{type}</span>
        </div>
        {description && <p>{description}</p>}
        {attachments && attachments.length !== 0 && (
          <div className="ticket-attachments">
            {renderAttachments(attachments)}
          </div>
        )}
      </div>
    );
  };

  const renderComments = () => {
    if (!comments || comments.length === 0) return null;

    return comments.map((comment: ITicketComment) => {
      const { userType, createdUser, createdAt, content } =
        comment || ({} as ITicketComment);
      const { firstName, lastName, email, emails, phone, phones, avatar } =
        createdUser || ({} as any);

      let renderName = "Visitor";

      renderName =
        firstName || lastName
          ? `${firstName} ${lastName}`
          : email
            ? email
            : emails && emails.length !== 0
              ? emails?.[0]
              : phone
                ? phone
                : phones && phones.length !== 0
                  ? phones?.[0]
                  : "Unknown";

      return (
        <div key={comment._id} className={`ticket-progress-log ${userType}`}>
          <div className="user">
            <img
              src={
                avatar
                  ? avatar.includes("read-file")
                    ? avatar
                    : readFile(avatar)
                  : ""
              }
              alt=""
            />
          </div>
          <span>
            <strong>{renderName}</strong> added <b>comment</b>
            <div className="comment">{content}</div>
            <div className="date">
              {dayjs(createdAt).format("YYYY-MM-DD, LT")}
            </div>
          </span>
        </div>
      );
    });
  };

  const renderTicketLogs = () => {
    return (
      <div className="ticket-progress-logs">
        <span>{__("Ticket log")}</span>
        {activityLogs.map((log, index) => (
          <TicketActivity key={index} activity={log} />
        ))}
        {renderComments()}
      </div>
    );
  };

  const renderContent = () => {
    const { number, stage } = ticketData;

    return (
      <>
        <div className="ticket-lbl">
          <label>Ticket number:</label>
          <span>{number}</span>
        </div>
        <div className="ticket-lbl">
          <label>Ticket status:</label>
          <span className="lbl">{stage?.name}</span>
        </div>
        {renderTicketIssue()}
        {renderTicketLogs()}
      </>
    );
  };

  return (
    <Container
      withBottomNavBar={false}
      title={__("Ticket progress")}
      backRoute="ticket"
      persistentFooter={
        <Button full onClick={() => onComment()}>
          <span className="font-semibold">{__("Send comment")}</span>
        </Button>
      }
    >
      <div className="ticket-progress-container">
        <div className="ticket-progress-main-content">{renderContent()}</div>
        <div className="ticket-comment-form">
          <div className="ticket-form-item">
            <Input
              id="comment"
              label="Add a comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>
      </div>
    </Container>
  );
};

export default TicketShowProgress;
