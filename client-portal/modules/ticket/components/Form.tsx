import React, { useState } from "react";

import Select from "react-select-plus";
import FormControl from "../../common/form/Control";
import FormGroup from "../../common/form/Group";
import Button from "../../common/Button";
import { Ticket } from "../../types";
import { ControlLabel } from "../../common/form";
import { FormWrapper } from "../../styles/main";

type Props = {
  handleSubmit: (doc: Ticket) => void;
};

const PRIORITY_OPTIONS = [
  {
    label: "Critical",
    value: "critical",
  },
  {
    label: "Normal",
    value: "normal",
  },
  {
    label: "Low",
    value: "low",
  },
];

export default function TicketForm({ handleSubmit }: Props) {
  const [ticket, setTicket] = useState<Ticket>({} as Ticket);

  const handleClick = () => {
    handleSubmit(ticket);
  };

  const handleSelect = (option) => {
    setTicket((currentValues) => ({
      ...currentValues,
      priority: option.value,
    }));
  };

  function renderControl({ label, name, placeholder, value = "" }) {
    const handleChange = (e) => {
      setTicket({
        ...ticket,
        [name]: e.target.value,
      });
    };

    return (
      <FormGroup>
        <ControlLabel>{label}</ControlLabel>
        <FormControl
          name={name}
          placeholder={placeholder}
          value={value}
          required={true}
          onChange={handleChange}
        />
      </FormGroup>
    );
  }

  return (
    <FormWrapper>
      <h4>Add a new ticket</h4>
      <div className="content">
        {renderControl({
          name: "subject",
          label: "Subject",
          value: ticket.subject,
          placeholder: "Enter a subject",
        })}
        {renderControl({
          name: "description",
          label: "Description",
          value: ticket.description,
          placeholder: "Enter a description",
        })}
        {/* <Select
        name="priority"
        value={ticket.priority || ''}
        options={PRIORITY_OPTIONS}
        onChange={handleSelect}
      /> */}
        <div className="right">
          <Button
            btnStyle="success"
            onClick={handleClick}
            uppercase={false}
            icon="check-circle"
          >
            Save
          </Button>
        </div>
      </div>
    </FormWrapper>
  );
}
