import React, { useState, useEffect } from 'react';
import {
  FullContent,
  MiddleContent,
  ModalFooter
} from '@erxes/ui/src/styles/main';
import Select from 'react-select-plus';
import { FlexItem, ExpandWrapper } from '@erxes/ui-settings/src/styles';
import {
  __,
  FormGroup,
  ControlLabel,
  FormControl,
  Button
} from '@erxes/ui/src';
import Datetime from '@nateradebaugh/react-datetime';

type Props = {
  units: any;
  branches: any;
  save: (data: any) => void;
  closeModal: () => void;
};

function CreateSalesPlan1({ closeModal, save, units, branches }: Props) {
  const [salesPlan, setSalesPlan] = useState({
    type: '',
    branchId: '',
    unitId: '',
    name: '',
    description: '',
    date: ''
  });

  useEffect(() => {
    const tempState = { ...salesPlan };

    tempState.date = '';

    setSalesPlan(tempState);
  }, [salesPlan.type]);

  useEffect(() => {
    var dateObj = new Date(salesPlan.date);
    console.log(
      'helooooooo',
      salesPlan.date,
      dateObj.getDate(),
      dateObj.getFullYear(),
      dateObj.getMonth()
    );
    dateObj.setMonth(1);

    console.log('byeeeeeee', dateObj, dateObj.getMonth());
  }, [salesPlan.date]);

  const changeState = (value, key) => {
    const tempState = { ...salesPlan };

    tempState[key] = value;

    setSalesPlan(tempState);
  };

  const options = labels => {
    const optionsData: [] = labels.map(t => {
      return { value: t._id, label: t.title };
    });

    return optionsData;
  };

  const selectTime = () => {
    if (salesPlan.type) {
      if (salesPlan.type === 'Year') {
        return (
          <FormGroup>
            <ControlLabel>Year</ControlLabel>
            <Datetime
              dateFormat="YYYY"
              onChange={e => changeState(e, 'date')}
              closeOnSelect={true}
              utc={true}
              timeFormat={false}
              value={salesPlan.date}
            />
          </FormGroup>
        );
      }
      if (salesPlan.type === 'Month') {
        return (
          <FormGroup>
            <ControlLabel>Month</ControlLabel>
            <Datetime
              dateFormat="MMM YYYY"
              onChange={e => changeState(e, 'date')}
              closeOnSelect={true}
              utc={true}
              timeFormat={false}
              value={salesPlan.date}
            />
          </FormGroup>
        );
      }
      if (salesPlan.type === 'Day') {
        return (
          <FormGroup>
            <ControlLabel>Day</ControlLabel>
            <Datetime
              dateFormat="MMM DD, YYYY"
              onChange={e => changeState(e, 'date')}
              closeOnSelect={true}
              utc={true}
              timeFormat={false}
              value={salesPlan.date}
            />
          </FormGroup>
        );
      }
    }
    return null;
  };

  const selectForm = (labels, state, placeholder) => {
    let optionData = [
      { value: 'Year', label: 'Year' },
      { value: 'Month', label: 'Month' },
      { value: 'Day', label: 'Day' }
    ];

    switch (state) {
      case 'branchId':
        optionData = options(branches);
        break;
      case 'unitId':
        optionData = options(units);
        break;
    }

    return (
      <Select
        placeholder={placeholder}
        options={optionData}
        value={salesPlan[state]}
        style={{ width: '100%' }}
        onChange={e => changeState(e.value, state)}
        clearable={false}
        searchable={false}
      />
    );
  };

  const onSave = () => {
    save(salesPlan);
  };

  const renderTab = () => {
    const types = [
      { value: 'Year', label: 'Year' },
      { value: 'Month', label: 'Month' },
      { value: 'Day', label: 'Day' }
    ];

    const cancel = (
      <Button
        btnStyle="simple"
        type="button"
        onClick={closeModal}
        icon="times-circle"
        uppercase={false}
      >
        Cancel
      </Button>
    );
    const save = (
      <Button
        btnStyle="success"
        type="button"
        onClick={onSave}
        icon="check-circle"
        uppercase={false}
      >
        Save
      </Button>
    );
    return (
      <FlexItem>
        <FormGroup>
          <ControlLabel>Type</ControlLabel>
          {selectForm(types, 'type', 'Choose type')}
        </FormGroup>
        {selectTime()}
        <FormGroup>
          <ControlLabel>Branch</ControlLabel>
          {selectForm(branches, 'branchId', 'Choose branch')}
        </FormGroup>
        <FormGroup>
          <ControlLabel>Unit</ControlLabel>
          {selectForm(units, 'unitId', 'Choose unit')}
        </FormGroup>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>
          <FormControl
            type="text"
            name="remainder"
            onChange={e =>
              changeState((e.target as HTMLInputElement).value, 'name')
            }
          ></FormControl>
        </FormGroup>
        <ExpandWrapper>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            type="text"
            componentClass="textarea"
            name="remainder"
            onChange={e =>
              changeState((e.target as HTMLInputElement).value, 'description')
            }
          ></FormControl>
        </ExpandWrapper>
        <ModalFooter>
          {cancel}
          {save}
        </ModalFooter>
      </FlexItem>
    );
  };
  return (
    <FullContent center={true} align={true}>
      <MiddleContent transparent={true}>{renderTab()}</MiddleContent>
    </FullContent>
  );
}

export default CreateSalesPlan1;
