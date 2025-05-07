import { OperatorFormView, OperatorRemoveBtn } from '../styles';

import Button from '@erxes/ui/src/components/Button';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { Operator } from '../types';
import React from 'react';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import { __ } from '@erxes/ui/src/utils/core';

type Props = {
  operator?: Operator;
  index: number;
  onChange: (index: number, value: any) => void;
  removeOperator: (index: number) => void;
};

const OperatorForm = (props: Props) => {
  const { operator, onChange, removeOperator, index } = props;

  const onSelectUser = (value) => {
    onChange(index, { ...operator, userId: value });
  };

  const remove = () => {
    removeOperator && removeOperator(index);
  };

  return (
    <OperatorFormView>
      <OperatorRemoveBtn>
        <Button onClick={() => remove()} btnStyle="danger" icon="times" />
      </OperatorRemoveBtn>
      <FormGroup>
        <SelectTeamMembers
          label={`Choose operator ${index + 1}`}
          name="selectedMembers"
          multi={false}
          initialValue={operator?.userId || (operator && operator?.userId)}
          onSelect={onSelectUser}
        />
      </FormGroup>
    </OperatorFormView>
  );
};

export default OperatorForm;
