import DateControl from '@erxes/ui/src/components/form/DateControl';
import React, { useState } from 'react';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import SelectLabels from '../../settings/containers/SelectLabels';
import { __ } from '@erxes/ui/src/utils';
import {
  Button,
  ControlLabel,
  Form as CommonForm,
  FormGroup,
} from '@erxes/ui/src/components';
import { DateContainer } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { IDayLabel } from '../types';
import {
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper,
} from '@erxes/ui/src/styles/eindex';

type Props = {
  dayLabel: IDayLabel;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

const EditForm = (props: Props) => {
  const { dayLabel, renderButton, closeModal } = props;

  const [labelIds, setLabelIds] = useState<string[]>(dayLabel.labelIds || []);

  const generateDoc = (values: { _id?: string }) => {
    const finalValues = values;

    return {
      _id: dayLabel._id,
      ...finalValues,
      labelIds,
    };
  };

  const onSelectChange = (value) => {
    setLabelIds(value);
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>{__(`Date`)}</ControlLabel>
          <DateContainer>
            <DateControl
              name="createdAtFrom"
              placeholder="Choose date"
              value={dayLabel.date}
              onChange={() => {}}
            />
          </DateContainer>
        </FormGroup>
        <FormGroup>
          <ControlLabel>Branch</ControlLabel>
          <SelectBranches
            label="Choose branch"
            name="branchIds"
            initialValue={dayLabel.branchId}
            onSelect={() => {}}
            multi={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Department</ControlLabel>
          <SelectDepartments
            label="Choose department"
            name="departmentIds"
            initialValue={dayLabel.departmentId}
            onSelect={() => {}}
            multi={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>Labels</ControlLabel>
          <SelectLabels
            label="Choose label"
            name="labelIds"
            initialValue={dayLabel.labelIds}
            onSelect={(labelIds) => onSelectChange(labelIds)}
            multi={true}
          />
        </FormGroup>
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
            values: generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: dayLabel,
          })}
        </ModalFooter>
      </>
    );
  };

  return <CommonForm renderContent={renderContent} />;
};

export default EditForm;
