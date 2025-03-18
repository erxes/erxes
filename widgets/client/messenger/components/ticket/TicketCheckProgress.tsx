import * as React from "react";

import Button from "../common/Button";
import Input from "../common/Input";
import { __ } from "../../../utils";

type Props = {
  isForget: boolean;
  handleButtonClick: () => void;
  setNumber: (number: string) => void;
  setIsForget: (isForget: boolean) => void;
  setEmail: (email: string) => void;
  setPhone: (phone: string) => void;
  onForget: () => void;
};

const TicketCheckProgress: React.FC<Props> = ({
  handleButtonClick,
  setNumber,
  setEmail,
  setIsForget,
  setPhone,
  isForget,
  onForget,
}) => {
  const renderCheckForm = () => {
    return (
      <>
        <div className="ticket-form-item">
          <Input
            id="ticket-number"
            label="Enter ticket number"
            placeholder="Ticket number"
            onChange={(e) => setNumber(e.target.value)}
          />
        </div>
        <Button
          form="ticket-check-progress"
          onClick={() => handleButtonClick()}
          full
        >
          <span className="font-semibold">{__("See ticket")}</span>
        </Button>
      </>
    );
  };

  const renderForgetForm = () => {
    return (
      <>
        <div className="ticket-form-item forget-form">
          <p>You can enter either a phone number, an email address, or both.</p>
          <Input
            id="ticket-email"
            label="Enter email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            id="ticket-phone"
            label="Enter phone number"
            placeholder="Phone number"
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <Button form="ticket-check-progress" onClick={() => onForget()} full>
          <span className="font-semibold">{__("Get ticket number")}</span>
        </Button>
      </>
    );
  };

  const renderForm = () => {
    return (
      <form id="ticket-form">
        <div className="form-container">
          {isForget ? renderForgetForm() : renderCheckForm()}
          {!isForget && (
            <span className="forget" onClick={() => setIsForget(true)}>
              Forget your ticket number?
            </span>
          )}
        </div>
      </form>
    );
  };

  return <div className="ticket-check-content">{renderForm()}</div>;
};

export default TicketCheckProgress;
