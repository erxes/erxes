import * as React from "react";

import { IconCheckTicket, IconTicket } from "../../../icons/Icons";

import Button from "../common/Button";
import Container from "../common/Container";
import { __ } from "../../../utils";

type Props = {
  loading: boolean;
  activeRoute: string;
  handleSubmit: (activeRoute: string) => void;
  setIsCheck: (isCheck: boolean) => void;
  handleButtonClick: () => void;
};

const Ticket: React.FC<Props> = ({
  loading,
  activeRoute,
  handleSubmit,
  handleButtonClick,
  setIsCheck,
}) => {
  const continueText = __("Continue");

  const renderSubmitForm = () => {
    return (
      <div className="type-choose-container">
        <div
          className={`${activeRoute === "ticket-submit" ? "active" : ""} ticket-box`}
          onClick={() => handleSubmit("ticket-submit")}
        >
          <IconTicket size="30px" />
          <span>Submit a ticket</span>
        </div>
        <div
          className={`${activeRoute === "check" ? "active" : ""} ticket-box`}
          onClick={() => handleSubmit("check")}
        >
          <IconCheckTicket size="30px" />
          <span>Check ticket progress</span>
        </div>
      </div>
    );
  };

  return (
    <Container
      withBottomNavBar={false}
      title={__("Ticket")}
      persistentFooter={
        <Button full onClick={handleButtonClick}>
          <span className="font-semibold">{continueText}</span>
        </Button>
      }
    >
      <div className="ticket-container">
        {loading ? <div className="loader" /> : renderSubmitForm()}
      </div>
    </Container>
  );
};

export default Ticket;
