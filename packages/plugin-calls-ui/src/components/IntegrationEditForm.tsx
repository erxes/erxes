import React, { useEffect, useState } from 'react';

import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import OperatorForm from './OperatorForm';
import { __ } from '@erxes/ui/src/utils/core';

interface IProps {
  integrationKind: string;
  details: any;
  onChange: (key: string, value: any) => void;
}

const IntegrationEditForm = (props: IProps) => {
  const { integrationKind, details } = props;
  const [operators, setOperators] = useState<any>(details.operators);

  useEffect(() => {
    props.onChange('operators', operators);
  }, [operators]);

  if (integrationKind !== 'calls') {
    return null;
  }

  const onChange = (e: any) => {
    props.onChange(e.target.name, e.target.value);
  };

  const onChangeOperatorDetails = (
    name: string,
    value: string,
    index: number,
  ) => {
    const currentOperator = operators.find((_, i) => i === index);

    if (currentOperator) {
      const updatedOperator = { ...currentOperator, [name]: value };
      let newOperators = [...operators];
      newOperators.splice(index, 1, updatedOperator);
      setOperators(newOperators);
    }
  };

  const onChangeOperators = (index: number, value: any) => {
    let newOperators = [...operators];
    newOperators.splice(index, 1, value);

    setOperators(newOperators);
  };

  const handleAddOperation = () => {
    setOperators([
      ...operators,
      { userId: '', gsUsername: '', gsPassword: '', gsForwardAgent: false },
    ]);
  };

  const handleRemoveOperator = (index: number) => {
    const filtered = operators.filter((l, i) => i !== index);

    setOperators(filtered);
  };

  const renderInput = (name: string, label: string, defaultValue: string) => {
    return (
      <FormGroup>
        <ControlLabel required={false}>{label}</ControlLabel>
        <FormControl
          name={name}
          required={false}
          autoFocus={false}
          defaultValue={defaultValue}
          onChange={onChange}
        />
      </FormGroup>
    );
  };

  const keys = ['host', 'smtpHost', 'smtpPort', 'mainUser', 'user', 'password'];

  return (
    <>
      {renderInput('phone', 'Phone number', details.phone)}

      {renderInput('wsServer', 'Web socket server', details.wsServer)}
      {renderInput('queues', 'Queues', details.queues)}

      <>
        {operators.map((operator, index) => (
          <OperatorForm
            operator={operator}
            index={index}
            onChange={onChangeOperators}
            onChangeDetails={onChangeOperatorDetails}
            removeOperator={handleRemoveOperator}
            key={index}
          />
        ))}
        <FormGroup>
          <div style={{ display: 'flex', justifyContent: 'end' }}>
            <Button
              btnStyle="simple"
              icon="plus-1"
              size="medium"
              onClick={handleAddOperation}
            >
              {__('Add Operator')}
            </Button>
          </div>
        </FormGroup>
      </>
    </>
  );
};

export default IntegrationEditForm;
