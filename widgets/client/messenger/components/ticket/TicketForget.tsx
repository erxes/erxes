import * as React from "react";

import Container from "../common/Container";
import SuccessForm from "./SuccessForm";
import { __ } from "../../../utils";
import { useTicket } from "../../context/Ticket";

const TicketForget: React.FC = ({}) => {
  const { ticketData = [] } = useTicket();
  const data = ticketData[0];

  const renderContent = () => {
    if (!data || !data.number) {
      return <h4>Ticket number not found!</h4>;
    }

    return <SuccessForm ticketNumber={data.number} isForget />;
  };

  return (
    <Container
      withBottomNavBar={false}
      title={__("Show ticket number")}
      backRoute="ticket"
    >
      <div className="ticket-container">{renderContent()}</div>
    </Container>
  );
};

export default TicketForget;
