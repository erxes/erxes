import * as React from "react";

import Button from "../common/Button";
import Container from "../common/Container";
import FileUploader from "../common/FileUploader";
import { IconCheckInCircle } from "../../../icons/Icons";
import Input from "../common/Input";
import { __ } from "../../../utils";

type Props = {
  loading: boolean;
  isSubmitted: boolean;
  handleSubmit: () => void;
  handleButtonClick: () => void;
};

const TicketShowProgress: React.FC<Props> = ({
  handleSubmit,
  isSubmitted,
  loading,
  handleButtonClick,
}) => {
  const submitText = __("Submit");
  const continueText = __("Continue");

  const renderSubmitted = () => {
    return (
      <div className="success-wrapper">
        <div className="message">
          <IconCheckInCircle />
          <h3>{__("Your message has been sent")}</h3>
          <p>{__("Thank you for sharing your thoughts")}</p>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    return (
      <>
        <div className="ticket-lbl">
          <label>Ticket number:</label>
          <span>10201248</span>
        </div>
        <div className="ticket-lbl">
          <label>Ticket status:</label>
          <span className="lbl">Fixing</span>
        </div>
      </>
    );
  };

  return (
    <Container
      withBottomNavBar={false}
      title={__("Ticket progress")}
      backRoute="ticket"
      persistentFooter={
        !isSubmitted ? (
          <Button form="ticket-form" type="submit" full>
            <span className="font-semibold">{submitText}</span>
          </Button>
        ) : (
          <Button full onClick={handleButtonClick}>
            <span className="font-semibold">{continueText}</span>
          </Button>
        )
      }
    >
      <div className="ticket-container">{renderContent()}</div>
    </Container>
  );
};

export default TicketShowProgress;
