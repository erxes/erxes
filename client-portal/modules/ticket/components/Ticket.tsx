import React, { useState } from "react";
import { ListHead, ListBody, ListRow, Label } from "../../styles/tickets";
import Detail from "../containers/Detail";
import { IUser } from "../../types";
import dayjs from "dayjs";
import PriorityIndicator from "../../common/PriorityIndicator";

type Props = {
  loading: boolean;
  tickets: any;
  currentUser: IUser;
};

export default function Ticket({ tickets, currentUser }: Props) {
  const [ticketId, setId] = useState(null);

  if (!tickets || tickets.length === 0) {
    return null;
  }

  return (
    <>
      <ListHead className="head">
        <div>Subject</div>
        <div>Created date</div>
        <div>Priority</div>
        <div>Status</div>
      </ListHead>
      <ListBody>
        {tickets.map((ticket) => (
          <ListRow
            key={ticket._id}
            className="item"
            // onClick={() => setId(ticket._id)}
          >
            <div className="base-color">{ticket.name}</div>
            <div>{dayjs(ticket.createdAt).format("MMM D YYYY")}</div>
            <div>
              {<PriorityIndicator value={ticket.priority} />} {ticket.priority}
            </div>
            <div>
              <Label
                lblStyle={ticket.status === "active" ? "success" : "danger"}
              >
                {ticket.status}
              </Label>
            </div>
          </ListRow>
        ))}
      </ListBody>
      <Detail
        _id={ticketId}
        onClose={() => setId(null)}
        currentUser={currentUser}
      />
    </>
  );
}
