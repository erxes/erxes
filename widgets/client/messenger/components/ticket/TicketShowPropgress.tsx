import * as React from "react";

import { IAttachment, ITicketActivityLog } from "../../types";

import Button from "../common/Button";
import Container from "../common/Container";
import Input from "../common/Input";
import TicketActivity from "./TicketAcitvity";
import { __ } from "../../../utils";
import { useTicket } from "../../context/Ticket";

type Props = {
  activityLogs: ITicketActivityLog[];
  setComment: (comment: string) => void;
  handleSubmit: () => void;
};

const TicketShowProgress: React.FC<Props> = ({
  handleSubmit,
  setComment,
  activityLogs,
}) => {
  const { ticketData } = useTicket();
  const { ticketCheckProgress } = ticketData || {};

  const renderAttachments = (attachments: IAttachment[]) => {
    return attachments.map((attachment, index) => (
      <div key={attachment.url} className="ticket-attachment">
        <img
          src={attachment.name}
          alt={`ticket-image-${index}`}
          onLoad={() => {
            URL.revokeObjectURL(attachment.name);
          }}
        />
      </div>
    ));
  };

  const renderTicketIssue = () => {
    const { name, type, description, attachments } = ticketCheckProgress;

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

  const renderTicketLogs = () => {
    return (
      <div className="ticket-progress-logs">
        <span>{__("Ticket log")}</span>
        {activityLogs.map((log, index) => (
          <TicketActivity key={index} activity={log} />
        ))}
      </div>
    );
  };

  const renderContent = () => {
    const { number, stage } = ticketCheckProgress;

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
        <Button full onClick={() => handleSubmit()}>
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
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>
      </div>
    </Container>
  );
};

export default TicketShowProgress;
