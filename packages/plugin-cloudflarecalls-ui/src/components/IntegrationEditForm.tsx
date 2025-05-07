import React, { useEffect, useState } from 'react';

import Button from '@erxes/ui/src/components/Button';
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

  if (integrationKind !== 'cloudflarecalls') {
    return null;
  }

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

  return (
    <>
      <>
        {operators.map((operator, index) => (
          <OperatorForm
            operator={operator}
            index={index}
            onChange={onChangeOperators}
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
