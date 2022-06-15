import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Select from 'react-select-plus';
import Datetime from '@nateradebaugh/react-datetime';
import { FlexItem } from '@erxes/ui-settings/src/styles';
import {
  __,
  Button,
  Box,
  ControlLabel,
  SidebarList,
  FormControl,
  FormGroup,
  FlexItem as CommonFlexItem,
  FlexRightItem,
  Form as CommonForm,
  FlexContent,
  Table
} from '@erxes/ui/src';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectUnits from '@erxes/ui/src/team/containers/SelectUnits';
import { SalesPlansWrapper } from '../styles';
import { TYPES } from '../../constants';

type Props = {
  labels: any[];
  type: string;
  products: any[];
  categories: any[];
  edit?: boolean;
  setType: (type: string) => void;
  submit: (data: any) => void;
};

const Form = (props: Props) => {
  const {
    labels,
    type,
    products = [],
    categories = [],
    edit = false,
    setType,
    submit
  } = props;

  const [_products, setProducts] = useState<any[]>(products);
  const [_categories, setCategories] = useState<any[]>(categories);
  const [categoryId, setCategoryId] = useState<string>('');
  const [salesPlan, setSalesPlan] = useState<any>({
    type: type,
    branchId: '',
    unitId: '',
    name: '',
    description: '',
    labels: '',
    date: ''
  });

  useEffect(() => setProducts(products), [products]);
  useEffect(() => setCategories(categories), [categories]);
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

  const renderCategories = () => {
    if (!_categories) return null;

    return _categories.map((item: any, index: number) => {
      return (
        <li key={index}>
          <a onClick={() => setCategoryId(item._id)}>{item.name}</a>
        </li>
      );
    });
  };

  const renderProducts = () => {
    if (!_products) return null;

    let filteredProducts = _products;

    if (categoryId.length !== 0)
      filteredProducts = _products.filter(
        (item: any) => item.categoryId === categoryId
      );

    const handleSubmit = () => {
      console.log('Pog');
    };

    const renderSubmitButton = () => {
      if (!edit) return null;

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

    return filteredProducts.map((item: any, index: number) => {
      return (
        <tr key={index}>
          <td>{item.name}</td>
          <td></td>
          <td>
            <FormGroup>
              <FormControl type="number" name="config1" />
            </FormGroup>
          </td>
          <td>
            <FormGroup>
              <FormControl type="number" name="config2" />
            </FormGroup>
          </td>
          <td>
            <FormGroup>
              <FormControl type="number" name="quantity" />
            </FormGroup>
          </td>
          {renderSubmitButton()}
        </tr>
      );
    });
  };

  const renderProductsList = () => {
    const renderSubmitHeader = () => {
      if (!edit) return null;

      return <th>Actions</th>;
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
              <th>Name</th>
              <th>Category</th>
              <th>UE</th>
              <th>UU</th>
              <th>Quantity sold</th>
              {renderSubmitHeader()}
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
              required={true}
              onChange={(event: any) =>
                handleState((event.target as HTMLInputElement).value, 'name')
              }
            />
          </FormGroup>
        </FlexItem>
        <FlexItem>
          <FormGroup>
            <ControlLabel required={true}>Type</ControlLabel>
            <Select
              value={type}
              required={true}
              onChange={(event: any) => setType(event.value)}
              options={TYPES}
            />
          </FormGroup>
          {renderSelectTime()}
        </FlexItem>
      </FlexContent>
      <FlexContent>
        <FlexItem>
          <FormGroup>
            <ControlLabel>Description</ControlLabel>
            <FormControl
              type="text"
              componentClass="textarea"
              name="description"
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
        <FlexItem>
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
        </FlexItem>
        <FlexItem>
          <FormGroup>
            <ControlLabel required={true}>Unit</ControlLabel>
            <SelectUnits
              label="Choose unit"
              name="unit"
              initialValue={salesPlan.unitId}
              onSelect={unitId => handleState(unitId, 'unitId')}
              multi={false}
              customOption={{ value: '', label: 'All units' }}
            />
          </FormGroup>
        </FlexItem>
      </FlexContent>
      <FlexContent>
        <FlexItem>
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
