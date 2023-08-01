import { GroupWrapper } from '@erxes/ui-segments/src/styles';
import { Button, ControlLabel, Tip } from '@erxes/ui/src/components';
import { FormColumn, FormWrapper } from '@erxes/ui/src/styles/main';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { LittleGroup } from '../styles';

type Props = {
  condition: any;
  onChange: (id: string, condition: any) => void;
  onRemove: (id: string) => void;
};

type State = {};

class PerPrintConditions extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {};
  }

  onChangeConfig = (code: string, value) => {
    const { condition, onChange } = this.props;
    onChange(condition.id, { ...condition, [code]: value });
  };

  onChange = (name, value) => {
    this.onChangeConfig(name, value);
  };

  onChangeInput = (code: string, e) => {
    this.onChangeConfig(code, e.target.value);
  };

  render() {
    const { condition } = this.props;
    return (
      <GroupWrapper>
        <FormWrapper>
          <FormColumn>
            <ControlLabel>{'Branch'}</ControlLabel>
            <SelectBranches
              label="Choose Branch"
              name="branchId"
              initialValue={condition.branchId}
              onSelect={branchId => this.onChange('branchId', branchId)}
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
              onSelect={departmentId =>
                this.onChange('departmentId', departmentId)
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
            onClick={this.props.onRemove.bind(this, condition.id)}
            icon="times"
          />
        </Tip>
      </GroupWrapper>
    );
  }
}
export default PerPrintConditions;
