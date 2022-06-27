import React, { useState, useEffect } from 'react';
import Select from 'react-select-plus';
import Datetime from '@nateradebaugh/react-datetime';
import { FlexItem } from '@erxes/ui-settings/src/styles';
import {
  __,
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  FlexRightItem,
  Form as CommonForm,
  FlexContent
} from '@erxes/ui/src';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartment from '@erxes/ui/src/team/containers/SelectDepartments';
import { SalesPlansWrapper } from '../styles';
import { TYPES } from '../../constants';

type Props = {
  labels: any[];
  type: string;
  initialData?: any;
  setType: (type: string) => void;
  submit: (data: any) => void;
};

const Form = (props: Props) => {
  const { labels, type, initialData = {}, setType, submit } = props;

  const [salesPlan, setSalesPlan] = useState<any>({
    name: initialData.name ? initialData.name : '',
    description: initialData.description ? initialData.description : '',
    type: initialData.type ? initialData.type : '',
    date: initialData.date ? initialData.date : '',
    labels: initialData.labels ? initialData.labels : [],
    departmentId: initialData.departmentId ? initialData.departmentId : '',
    branchId: initialData.branchId ? initialData.branchId : ''
  });

  useEffect(() => handleState(type, 'type'), [type]);

  const handleSubmit = () => {
    submit(salesPlan);
  };

  const handleState = (value: any, key: string) => {
    const tempState = { ...salesPlan };
    tempState[key] = value;

    setSalesPlan(tempState);
  };

  const renderSelectTime = () => {
    if (!type) return null;

    switch (type) {
      case 'Year':
        return (
          <FormGroup>
            <ControlLabel>Year</ControlLabel>
            <Datetime
              dateFormat="YYYY"
              closeOnSelect={true}
              utc={true}
              timeFormat={false}
              onChange={(e: any) => handleState(e, 'date')}
              value={salesPlan.date}
            />
          </FormGroup>
        );
      case 'Month':
        return (
          <FormGroup>
            <ControlLabel>Month</ControlLabel>
            <Datetime
              dateFormat="MMM YYYY"
              closeOnSelect={true}
              utc={true}
              timeFormat={false}
              onChange={(e: any) => handleState(e, 'date')}
              value={salesPlan.date}
            />
          </FormGroup>
        );
      case 'Day': {
        return (
          <FormGroup>
            <ControlLabel>Day</ControlLabel>
            <Datetime
              dateFormat="MMM DD, YYYY"
              closeOnSelect={true}
              utc={true}
              timeFormat={false}
              onChange={(e: any) => handleState(e, 'date')}
              value={salesPlan.date}
            />
          </FormGroup>
        );
      }
      default:
        return null;
    }
  };

  const renderSelectLabel = () => {
    const labelOnChange = (values: any[]) => {
      handleState(values.map((item: any) => item.value) || [], 'labels');
    };

    if (labels && labels.length !== 0)
      return (
        <FormGroup>
          <ControlLabel>Label</ControlLabel>
          <Select
            value={salesPlan.labels}
            onChange={labelOnChange}
            options={labels.map((item: any) => {
              return { value: item._id, label: item.title };
            })}
            multi={true}
          />
        </FormGroup>
      );

    return null;
  };

  const renderContent = () => (
    <>
      <FlexContent>
        <FlexItem>
          <FormGroup>
            <ControlLabel required={true}>Name</ControlLabel>
            <FormControl
              type="text"
              name="name"
              placeholder={__('Name')}
              value={salesPlan.name}
              required={true}
              onChange={(event: any) =>
                handleState((event.target as HTMLInputElement).value, 'name')
              }
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel required={true}>Type</ControlLabel>
            <Select
              name="type"
              required={true}
              value={salesPlan.type}
              onChange={(event: any) => setType(event.value)}
              options={TYPES}
            />
          </FormGroup>
          {renderSelectTime()}
          {renderSelectLabel()}
        </FlexItem>
        <FlexItem>
          <FormGroup>
            <ControlLabel required={true}>Department</ControlLabel>
            <SelectDepartment
              label="Choose department"
              name="department"
              initialValue={salesPlan.departmentId}
              onSelect={departmentId =>
                handleState(departmentId, 'departmentId')
              }
              multi={false}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel required={true}>Branch</ControlLabel>
            <SelectBranches
              label="Choose branch"
              name="branch"
              initialValue={salesPlan.branchId}
              onSelect={branchId => handleState(branchId, 'branchId')}
              multi={false}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Description</ControlLabel>
            <FormControl
              type="text"
              componentClass="textarea"
              name="description"
              placeholder={__('Description')}
              value={salesPlan.description}
              onChange={(event: any) =>
                handleState(
                  (event.target as HTMLInputElement).value,
                  'description'
                )
              }
            />
          </FormGroup>
        </FlexItem>
      </FlexContent>
      <FlexContent>
        <FlexRightItem>
          <FormGroup>
            <Button
              btnStyle="simple"
              type="button"
              icon="times-circle"
              uppercase={false}
            >
              {__('Cancel')}
            </Button>
            <Button
              btnStyle="success"
              type="button"
              onClick={handleSubmit}
              icon="check-circle"
              uppercase={false}
            >
              {__('Save')}
            </Button>
          </FormGroup>
        </FlexRightItem>
      </FlexContent>
    </>
  );

  return (
    <SalesPlansWrapper>
      <CommonForm renderContent={renderContent} />
    </SalesPlansWrapper>
  );
};

export default Form;
