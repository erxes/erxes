import * as React from "react";

import Button from "../common/Button";
import Input from "../common/Input";
import { __ } from "../../../utils";

type Props = {
  handleButtonClick: () => void;
};

const TicketCheckProgress: React.FC<Props> = ({ handleButtonClick }) => {
  const renderForm = () => {
    return (
      <form id="ticket-form">
        <div className="form-container">
          <div className="ticket-form-item">
            <Input
              id="ticket-number"
              label="Enter ticket number"
              placeholder="Ticket number"
            />
          </div>
          <Button
            form="ticket-check-progress"
            onClick={() => handleButtonClick()}
            full
          >
            <span className="font-semibold">{__("See ticket")}</span>
          </Button>
        </div>
      </form>
    );
  };

  return <div className="ticket-check-content">{renderForm()}</div>;
};

export default TicketCheckProgress;
