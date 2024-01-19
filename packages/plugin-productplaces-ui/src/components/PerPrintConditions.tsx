import { GroupWrapper } from '@erxes/ui-segments/src/styles';
import { Button, ControlLabel, Tip } from '@erxes/ui/src/components';
import { FormColumn, FormWrapper } from '@erxes/ui/src/styles/main';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';

type Props = {
  condition: any;
  onChange: (id: string, condition: any) => void;
  onRemove: (id: string) => void;
};

const PerPrintConditions = (props: Props) => {
  const { condition, onChange, onRemove } = props;

  const onChangeConfig = (code: string, value) => {
    onChange(condition.id, { ...condition, [code]: value });
  };

  const onChangeHandler = (name, value) => {
    onChangeConfig(name, value);
  };

  return (
    <GroupWrapper>
      <FormWrapper>
        <FormColumn>
          <ControlLabel>{'Branch'}</ControlLabel>
          <SelectBranches
            label="Choose Branch"
            name="branchId"
            initialValue={condition.branchId}
            onSelect={(branchId) => onChangeHandler('branchId', branchId)}
            multi={false}
            customOption={{ value: '', label: 'Clean branch' }}
          />
        </FormColumn>
        <FormColumn>
          <ControlLabel>{'Department'}</ControlLabel>
          <SelectDepartments
            label="Choose department"
            name="selectedDepartmentIds"
            initialValue={condition.departmentId}
            onSelect={(departmentId) =>
              onChangeHandler('departmentId', departmentId)
            }
            multi={false}
            customOption={{ value: '', label: 'Clean department' }}
          />
        </FormColumn>
      </FormWrapper>
      <Tip text={'Delete'}>
        <Button
          btnStyle="simple"
          size="small"
          onClick={onRemove.bind(this, condition.id)}
          icon="times"
        />
      </Tip>
    </GroupWrapper>
  );
};
export default PerPrintConditions;
