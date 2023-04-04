import React, { useState } from 'react';

import Select from 'react-select-plus';
import FormControl from '../../common/form/Control';
import FormGroup from '../../common/form/Group';
import Button from '../../common/Button';
import { ICustomField, Ticket } from '../../types';
import { ControlLabel } from '../../common/form';
import { FormWrapper } from '../../styles/main';
import GenerateField from './GenerateField';

type Props = {
  handleSubmit: (doc: Ticket) => void;
  customFields?: any[];
};

const PRIORITY_OPTIONS = [
  {
    label: 'Critical',
    value: 'critical'
  },
  {
    label: 'Normal',
    value: 'normal'
  },
  {
    label: 'Low',
    value: 'low'
  }
];

export default function TicketForm({ handleSubmit, customFields }: Props) {
  const [ticket, setTicket] = useState<Ticket>({} as Ticket);
  const [customFieldsData, setCustomFieldsData] = useState<ICustomField[]>([]);

  const handleClick = () => {
    handleSubmit({ ...ticket, customFieldsData });
  };

  const onCustomFieldsDataChange = ({ _id, value }) => {
    const field = customFieldsData?.find((c) => c.field === _id);

    for (const f of customFields) {
      const logics = f.logics || [];

      if (!logics.length) {
        continue;
      }

      if (
        logics.findIndex((l) => l.fieldId && l.fieldId.includes(_id)) === -1
      ) {
        continue;
      }

      customFieldsData.forEach((c) => {
        if (c.field === f._id) {
          c.value = '';
        }
      });
    }

    if (field) {
      field.value = value;
      setCustomFieldsData(customFieldsData);
    } else {
      setCustomFieldsData([...customFieldsData, { field: _id, value }]);
    }
  };

  function renderControl({ label, name, placeholder, value = '' }) {
    const handleChange = (e) => {
      setTicket({
        ...ticket,
        [name]: e.target.value
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

  function renderCustomFields() {
    return customFields.map((field: any, index: number) => {
      return (
        <GenerateField
          key={index}
          field={field}
          onValueChange={onCustomFieldsDataChange}
          isEditing={true}
        />
      );
    });
  }

  return (
    <FormWrapper>
      <h4>Add a new ticket</h4>
      <div className="content">
        {renderControl({
          name: 'subject',
          label: 'Subject',
          value: ticket.subject,
          placeholder: 'Enter a subject'
        })}
        {renderControl({
          name: 'description',
          label: 'Description',
          value: ticket.description,
          placeholder: 'Enter a description'
        })}
        {renderCustomFields()}
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
