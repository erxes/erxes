import DateControl from '@erxes/ui/src/components/form/DateControl';
import React from 'react';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import SelectLabels from '../../settings/containers/SelectLabels';
import { __ } from '@erxes/ui/src/utils';
import {
  Button,
  ControlLabel,
  Form as CommonForm,
  FormGroup
} from '@erxes/ui/src/components';
import { DateContainer } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { IDayLabel } from '../types';
import {
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper
} from '@erxes/ui/src/styles/eindex';

type Props = {
  dayLabel: IDayLabel;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  labelIds: string[];
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      labelIds: this.props.dayLabel.labelIds || []
    };
  }

  generateDoc = (values: { _id?: string }) => {
    const finalValues = values;
    const { dayLabel } = this.props;
    const { labelIds } = this.state;

    return {
      _id: dayLabel._id,
      ...finalValues,
      labelIds
    };
  };

  onSelectChange = value => {
    this.setState({
      labelIds: value
    });
  };

  onAfterSave = () => {
    this.props.closeModal();
  };

  renderContent = (formProps: IFormProps) => {
    const { renderButton, closeModal, dayLabel } = this.props;
    const { values, isSubmitted } = formProps;

    const { labelIds } = this.state;

    return (
      <>
        <ScrollWrapper>
          <FormGroup>
            <ControlLabel required={true}>{__(`Date`)}</ControlLabel>
            <DateContainer>
              <DateControl
                name="createdAtFrom"
                placeholder="Choose start date"
                value={dayLabel.date}
                onChange={() => {}}
              />
            </DateContainer>
          </FormGroup>
          <FormGroup>
            <ControlLabel>Branch</ControlLabel>
            <SelectBranches
              label="Choose branch"
              name="branchId"
              initialValue={dayLabel.branchId}
              onSelect={() => {}}
              multi={false}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Department</ControlLabel>
            <SelectDepartments
              label="Choose department"
              name="departmentId"
              initialValue={dayLabel.departmentId}
              onSelect={() => {}}
              multi={false}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel required={true}>Labels</ControlLabel>
            <SelectLabels
              label="Choose label"
              name="labelIds"
              initialValue={dayLabel.labelIds}
              onSelect={labelIds => this.onSelectChange(labelIds)}
              multi={true}
            />
          </FormGroup>
        </ScrollWrapper>
        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={closeModal}
            icon="times-circle"
            uppercase={false}
          >
            Close
          </Button>

          {renderButton({
            values: this.generateDoc(values),
            isSubmitted,
            callback: this.onAfterSave,
            object: dayLabel
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <CommonForm renderContent={this.renderContent} />;
  }
}

export default Form;
