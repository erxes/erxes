import { Config, IUser } from "../../types";
import { Label, ListBody, ListHead, ListRow } from "../../styles/tickets";

import Detail from "../containers/Detail";
import EmptyContent from "../../common/EmptyContent";
import React from "react";
import TicketHeader from "./TicketHeader";
import dayjs from "dayjs";
import { useRouter } from "next/router";

type Props = {
  loading: boolean;
  tickets: any;
  currentUser: IUser;
  config: Config;
};

export default function Ticket({ tickets, currentUser, config }: Props) {
  const router = useRouter();
  const { itemId } = router.query as { itemId: string };

  const renderContent = () => {
    if (!tickets || tickets.length === 0) {
      return <EmptyContent text="You don't have more tickets to view!" />;
    }

    return (
      <>
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
          {(tickets || []).map((ticket) => {
            const { stage = {}, labels } = ticket;

            return (
              <ListRow
                key={ticket._id}
                className="item"
                onClick={() => router.push(`/tickets?itemId=${ticket._id}`)}
              >
                <div className="base-color">{ticket.name}</div>

                <div>{dayjs(ticket.createdAt).format("MMM D YYYY")}</div>
                <div>
                  {ticket.stageChangedDate
                    ? dayjs(ticket.stageChangedDate).format("MMM D YYYY")
                    : "-"}
                </div>

                <div>
                  {ticket.startDate
                    ? dayjs(ticket.startDate).format("MMM D YYYY")
                    : "-"}
                </div>

                <div>
                  {ticket.closeDate
                    ? dayjs(ticket.closeDate).format("MMM D YYYY")
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
      </>
    );
  };

  if (itemId) {
    return (
      <Detail
        _id={itemId}
        onClose={() => router.push("/tickets")}
        currentUser={currentUser}
        config={config}
      />
    );
  }

  return (
    <>
      <TicketHeader ticketLabel={config.ticketLabel || "Tickets"} />
      {renderContent()}
    </>
  );
}
