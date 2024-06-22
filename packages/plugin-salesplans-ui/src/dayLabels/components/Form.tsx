import DateControl from '@erxes/ui/src/components/form/DateControl';
import React, { useState } from 'react';
import Label from '@erxes/ui/src/components/Label';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import SelectLabels from '../../settings/containers/SelectLabels';
import { __ } from '@erxes/ui/src/utils';
import dayjs from 'dayjs';
import {
  Button,
  ControlLabel,
  Form as CommonForm,
  FormGroup,
} from '@erxes/ui/src/components';
import { DateContainer } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { IDayLabel, IDayLabelParams } from '../types';
import {
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper,
} from '@erxes/ui/src/styles/eindex';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

const Form = (props: Props) => {
  const { renderButton, closeModal } = props;

  const [dayLabelParams, setDayLabelParams] = useState<IDayLabelParams>({
    dates: [],
  });

  const generateDoc = (values: { _id?: string }) => {
    const finalValues = values;

    return {
      ...finalValues,
      ...dayLabelParams,
      dates: (dayLabelParams.dates || []).map((d) => new Date(d)),
    };
  };

  const onInputChange = (e) => {
    e.preventDefault();
    const value = e.target.value;
    const name = e.target.name;

    setDayLabelParams({ ...dayLabelParams, [name]: value });
  };

  const onSelectChange = (name, value) => {
    setDayLabelParams((prevState) => ({ ...prevState, [name]: value }));
  };

  const removeDate = (date, e) => {
    const newDayLabelParam = { ...dayLabelParams };
    newDayLabelParam.dates = (newDayLabelParam.dates || []).filter(
      (d) => d !== date,
    );
    setDayLabelParams(newDayLabelParam);
  };

  const onSelectDate = (value) => {
    const newDayLabelParam = { ...dayLabelParams };

    const strVal = dayjs(value).format('YYYY/MM/DD');

    if (strVal === 'Invalid Date') {
      return;
    }

    if (!(newDayLabelParam.dates || []).includes(strVal)) {
      (newDayLabelParam.dates || []).push(strVal);
    }

    setDayLabelParams(newDayLabelParam);
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    return (
      <>
        {(dayLabelParams.dates || []).map((d) => (
          <span key={Math.random()} onClick={removeDate.bind(this, d)}>
            <Label children={d} />
            &nbsp;
          </span>
        ))}
        <FormGroup>
          <ControlLabel required={true}>{__(`Date`)}</ControlLabel>
          <DateContainer>
            <DateControl
              name="createdAtFrom"
              placeholder="Choose date"
              defaultValue={
                dayLabelParams.dates && dayLabelParams.dates.length
                  ? dayLabelParams.dates[dayLabelParams.dates.length - 1]
                  : new Date()
              }
              onChange={onSelectDate}
            />
          </DateContainer>
        </FormGroup>
        <FormGroup>
          <ControlLabel>Branch</ControlLabel>
          <SelectBranches
            label="Choose branch"
            name="branchIds"
            initialValue={''}
            onSelect={(branchIds) => onSelectChange('branchIds', branchIds)}
            multi={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Department</ControlLabel>
          <SelectDepartments
            label="Choose department"
            name="departmentIds"
            initialValue={''}
            onSelect={(departmentIds) =>
              onSelectChange('departmentIds', departmentIds)
            }
            multi={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>Labels</ControlLabel>
          <SelectLabels
            label="Choose label"
            name="labelIds"
            initialValue={''}
            onSelect={(labelIds) => onSelectChange('labelIds', labelIds)}
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
            object: dayLabelParams,
          })}
        </ModalFooter>
      </>
    );
  };

  return <CommonForm renderContent={renderContent} />;
};

export default Form;
