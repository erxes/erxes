import * as React from "react";

import Button from "../common/Button";
import Container from "../common/Container";
import FileUploader from "../common/FileUploader";
import Input from "../common/Input";
import SuccessForm from "./SuccessForm";
import { __ } from "../../../utils";

type Props = {
  loading: boolean;
  isSubmitted: boolean;
  ticketNumber: string;
  customerAddLoading: boolean;
  handleSubmit: (e: any) => void;
  handleChange: (e: any) => void;
  handleButtonClick: () => void;
  handleFiles: (files: any) => void;
};

const TicketSubmitForm: React.FC<Props> = ({
  handleSubmit,
  isSubmitted,
  loading,
  ticketNumber,
  customerAddLoading,
  handleChange,
  handleFiles,
  handleButtonClick,
}) => {
  const submitText = __("Submit");
  const continueText = __("Continue");

  const renderForm = () => {
    return (
      <form id="ticket-form" onSubmit={handleSubmit}>
        <div className="form-container">
          <div className="ticket-form-item">
            <Input
              id="firstName"
              label="Name"
              onChange={handleChange}
              placeholder="First name"
              required={true}
            />
            <Input
              id="lastName"
              placeholder="Last name"
              onChange={handleChange}
              required={true}
            />
          </div>
          <div className="ticket-form-item">
            <Input
              id="phone"
              label="Phone number, Email"
              placeholder="Phone number"
              onChange={handleChange}
              type="number"
              required={true}
            />
            <Input
              id="email"
              placeholder="Email"
              type="email"
              required={true}
              onChange={handleChange}
            />
          </div>
          <div className="ticket-form-item">
            <div className="input-container">
              <label htmlFor="type">{__("Ticket type")}</label>
              <select id="ticketType" onChange={handleChange}>
                <option value="">Choose type...</option>
                <option value="request">Request</option>
                <option value="complaint">Complaint</option>
              </select>
            </div>
          </div>
          <div className="input-container">
            <label htmlFor="type">{__("Attachments")}</label>
            <FileUploader handleFiles={handleFiles} />
          </div>
          <div className="ticket-form-item">
            <Input id="title" label="Ticket title" onChange={handleChange} />
          </div>
          <div className="ticket-form-item">
            <Input
              textArea
              id="description"
              label="Describe the problem"
              onChange={handleChange}
            />
          </div>
        </div>
      </form>
    );
  };

  return (
    <Container
      withBottomNavBar={false}
      title={__("Submit a ticket")}
      backRoute="ticket"
      persistentFooter={
        !isSubmitted ? (
          <Button form="ticket-form" type="submit" full>
            {customerAddLoading ? (
              <div className="loader" />
            ) : (
              <span className="font-semibold">{submitText}</span>
            )}
          </Button>
        ) : (
          <Button full onClick={handleButtonClick}>
            <span className="font-semibold">{continueText}</span>
          </Button>
        )
      }
    >
      <div className="ticket-container">
        {loading ? (
          <div className="loader" />
        ) : isSubmitted ? (
          <SuccessForm ticketNumber={ticketNumber} />
        ) : (
          renderForm()
        )}
      </div>
    </Container>
  );
};

export default TicketSubmitForm;
