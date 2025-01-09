import { ControlLabel, FormControl } from '@erxes/ui/src/components/form';
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
  formProps?: any;
  onChangeDetails: (name: string, value: string, index: number) => void;
  onChange: (index: number, value: any) => void;
  removeOperator: (index: number) => void;
};

const OperatorForm = (props: Props) => {
  const {
    formProps,
    operator,
    onChange,
    onChangeDetails,
    removeOperator,
    index,
  } = props;

  const onChangeDetail = (e: any) => {
    onChangeDetails(e.target.name, e.target.value, index);
  };

  const onSelectUser = (value) => {
    onChange(index, { ...operator, userId: value });
  };

  const remove = () => {
    removeOperator && removeOperator(index);
  };

  const onForwardChange = (e: any) => {
    onChangeDetails('gsForwardAgent', e.target.checked, index);
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
      <FormGroup>
        <ControlLabel required={true}>
          {__('GrandStream username')}
        </ControlLabel>

        <FormControl
          {...formProps}
          defaultValue={(operator && operator.gsUsername) || ''}
          name={`gsUsername`}
          onChange={onChangeDetail}
          required={true}
          value={(operator && operator.gsUsername) || ''}
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel required={true}>
          {__('GrandStream password')}
        </ControlLabel>

        <FormControl
          {...formProps}
          name={`gsPassword`}
          defaultValue={(operator && operator.gsPassword) || ''}
          onChange={onChangeDetail}
          required={true}
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel required>{__('Is forwarding')}</ControlLabel>

        <FormControl
          checked={!!operator && operator.gsForwardAgent}
          componentclass="checkbox"
          onChange={onForwardChange}
        />
      </FormGroup>
    </OperatorFormView>
  );
};

export default OperatorForm;
