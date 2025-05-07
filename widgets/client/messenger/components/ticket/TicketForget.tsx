import * as React from "react";

import Container from "../common/Container";
import SuccessForm from "./SuccessForm";
import { __ } from "../../../utils";
import { useTicket } from "../../context/Ticket";

const TicketForget: React.FC = ({}) => {
  const { ticketData = [] } = useTicket();
  const data = ticketData[0];

  return (
    <Container
      withBottomNavBar={false}
      title={__("Show ticket number")}
      backRoute="ticket"
    >
      <div className="ticket-container">
        <SuccessForm ticketNumber={data.number} isForget />
      </div>
    </Container>
  );
};

export default TicketForget;
