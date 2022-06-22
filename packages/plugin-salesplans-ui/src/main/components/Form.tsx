import React, { useState, useEffect } from 'react';
import Select from 'react-select-plus';
import Datetime from '@nateradebaugh/react-datetime';
import { FlexItem } from '@erxes/ui-settings/src/styles';
import {
  __,
  Button,
  Box,
  ControlLabel,
  FormControl,
  FormGroup,
  FlexItem as CommonFlexItem,
  FlexRightItem,
  Form as CommonForm,
  FlexContent,
  SidebarList,
  Table
} from '@erxes/ui/src';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartment from '@erxes/ui/src/team/containers/SelectDepartments';
import { SalesPlansWrapper } from '../styles';
import { TYPES } from '../../constants';

type Props = {
  labels: any[];
  products: any[];
  categories: any[];
  timeframes: any[];
  type: string;
  initialData?: any;
  setType: (type: string) => void;
  submit: (data: any) => void;
};

const Form = (props: Props) => {
  const {
    labels,
    products = [],
    categories = [],
    timeframes = [],
    type,
    initialData = {},
    setType,
    submit
  } = props;

  const [categoryId, setCategoryId] = useState<string>('');
  const [salesPlan, setSalesPlan] = useState<any>({
    name: initialData.name ? initialData.name : '',
    description: initialData.description ? initialData.description : '',
    type: initialData.type ? initialData.type : '',
    date: initialData.date ? initialData.date : '',
    departmentId: initialData.departmentId ? initialData.departmentId : '',
    branchId: initialData.branchId ? initialData.branchId : ''
  });

  useEffect(() => handleState(type, 'type'), [type]);

  console.log(initialData);

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

  const renderCategories = () => {
    if (!categories) return null;

    return categories.map((item: any, index: number) => {
      return (
        <li key={index}>
          <a onClick={() => setCategoryId(item._id)}>{item.name}</a>
        </li>
      );
    });
  };

  const renderProducts = () => {
    if (!products) return null;

    let filteredProducts = products;

    if (categoryId.length !== 0)
      filteredProducts = products.filter(
        (item: any) => item.categoryId === categoryId
      );

    const handleSubmit = () => {
      console.log('Pog');
    };

    const renderSubmitButton = () => {
      if (!initialData) return null;

      return (
        <td>
          <Button
            type="button"
            btnStyle="success"
            icon="check-circle"
            onClick={handleSubmit}
            uppercase={false}
            size="small"
          >
            {__('Submit')}
          </Button>
        </td>
      );
    };

    const renderTimeframeInputs = () => {
      if (timeframes.length === 0) return null;

      switch (type) {
        case 'Day':
          return timeframes.map((item: any, index: number) => {
            return (
              <td key={`timeframeInput-${index}`}>
                <FormGroup>
                  <FormControl type="number" name={`timeframeForm-${index}`} />
                </FormGroup>
              </td>
            );
          });
        default:
          return null;
      }
    };

    return filteredProducts.map((item: any, index: number) => {
      return (
        <tr key={`products-${index}`}>
          <td>{item.name}</td>
          {renderTimeframeInputs()}
          {renderSubmitButton()}
        </tr>
      );
    });
  };

  const renderProductsList = () => {
    const renderSubmitHeader = () => {
      if (!initialData) return null;

      return <th>Actions</th>;
    };

    const renderTimeframes = () => {
      if (!timeframes) return null;

      switch (type) {
        case 'Day':
          return timeframes.map((item: any, index: number) => {
            return <th key={`timeframe-${index}`}>{item.name}</th>;
          });
        default:
          return null;
      }
    };

    return (
      <FlexContent>
        <CommonFlexItem count={2}>
          <Box title={__('Filter by Category')} isOpen={true}>
            <SidebarList>{renderCategories()}</SidebarList>
          </Box>
        </CommonFlexItem>
        <CommonFlexItem count={8} hasSpace={true}>
          <Table condensed={true}>
            <thead>
              <tr>
                <th>Name</th>
                {renderTimeframes()}
                {renderSubmitHeader()}
              </tr>
            </thead>
            <tbody>{renderProducts()}</tbody>
          </Table>
        </CommonFlexItem>
      </FlexContent>
    );
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
              value={salesPlan.name}
              required={true}
              onChange={(event: any) =>
                handleState((event.target as HTMLInputElement).value, 'name')
              }
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Description</ControlLabel>
            <FormControl
              type="text"
              componentClass="textarea"
              name="description"
              value={salesPlan.description}
              onChange={(event: any) =>
                handleState(
                  (event.target as HTMLInputElement).value,
                  'description'
                )
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
              customOption={{ value: '', label: 'All Departments' }}
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
              customOption={{ value: '', label: 'All branches' }}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Label</ControlLabel>
            <Select
              value={salesPlan.labels}
              onChange={(event: any) => handleState(event.value, 'labels')}
              options={labels.map((item: any) => {
                return { value: item._id, label: item.title };
              })}
            />
          </FormGroup>
        </FlexItem>
      </FlexContent>
      {renderProductsList()}
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
