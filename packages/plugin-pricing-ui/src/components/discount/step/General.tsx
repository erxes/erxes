import React from 'react';
import Datetime from '@nateradebaugh/react-datetime';
// erxes
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import FormLabel from '@erxes/ui/src/components/form/Label';
import SelectProducts from '@erxes/ui-products/src/containers/SelectProducts';
import SelectProductCategory from '@erxes/ui-products/src/containers/SelectProductCategory';
import {
  DateContainer,
  FormWrapper,
  FormColumn
} from '@erxes/ui/src/styles/main';
import { FlexItem, LeftItem } from '@erxes/ui/src/components/step/styles';
import { __ } from '@erxes/ui/src/utils';
// local
import { Table } from '../../../styles';
import DiscountInput from '../form/DiscountInput';
import { DiscountData } from '../../../types';

type Props = {
  formValues: DiscountData;
  handleState: (key: string, value: any) => void;
};

export default function General(props: Props) {
  const { formValues, handleState } = props;

  // Functions
  const handleChange = (value: number) => {
    handleState('value', value);
  };

  const handleBonusChange = (value: any) => {
    handleState('bonusProduct', value);
  };

  const renderProductForm = () => {
    if (formValues.applyType === 'category')
      return (
        <>
          <FormGroup>
            <FormLabel>{__('Product categories')}</FormLabel>
            <SelectProductCategory
              name="categories"
              label="Choose categories"
              initialValue={formValues.categories}
              onSelect={categories => handleState('categories', categories)}
              multi={true}
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>{__('Exclude categories')}</FormLabel>
            <SelectProductCategory
              name="categoriesExcluded"
              label="Choose categories to exclude"
              initialValue={formValues.categoriesExcluded}
              onSelect={categories =>
                handleState('categoriesExcluded', categories)
              }
              multi={true}
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>{__('Exclude products')}</FormLabel>
            <SelectProducts
              name="productsExcluded"
              label="Choose products to exclude"
              initialValue={formValues.productsExcluded}
              onSelect={products => handleState('productsExcluded', products)}
              multi={true}
            />
          </FormGroup>
        </>
      );

    return (
      <FormGroup>
        <FormLabel>{__('Products')}</FormLabel>
        <SelectProducts
          name="products"
          label="Choose products"
          initialValue={formValues.products}
          onSelect={products => handleState('products', products)}
          multi={true}
        />
      </FormGroup>
    );
  };

  const renderDiscountOptions = () => (
    <FormGroup>
      <FormLabel>{__('Discount Type')}</FormLabel>
      <FormControl
        componentClass="radio"
        name="type"
        onChange={() => handleState('type', 'fixed')}
        defaultChecked={formValues.type === 'fixed'}
      >
        {__('Fixed')}
      </FormControl>
      <FormControl
        componentClass="radio"
        name="type"
        onChange={() => handleState('type', 'subtraction')}
        defaultChecked={formValues.type === 'subtraction'}
      >
        {__('Subtraction')}
      </FormControl>
      <FormControl
        componentClass="radio"
        name="type"
        onChange={() => handleState('type', 'percentage')}
        defaultChecked={formValues.type === 'percentage'}
      >
        {__('Percentage')}
      </FormControl>
      <FormControl
        componentClass="radio"
        name="type"
        onChange={() => handleState('type', 'bonus')}
        defaultChecked={formValues.type === 'bonus'}
      >
        {__('Bonus')}
      </FormControl>
    </FormGroup>
  );

  const renderDateRanger = () => {
    return (
      <>
        <FormGroup>
          <FormControl
            componentClass="checkbox"
            name="startDate"
            checked={formValues.isStartDateEnabled}
            onChange={(event: any) =>
              handleState('isStartDateEnabled', event.target.checked)
            }
          />
          <FormLabel>{__('Start Date')}</FormLabel>
          <DateContainer>
            <Datetime
              inputProps={{ placeholder: __('Select Date') }}
              dateFormat="MM/DD/YYYY"
              closeOnSelect={true}
              timeFormat={true}
              utc={true}
              value={formValues.startDate || undefined}
              onChange={(date: any) => handleState('startDate', date)}
            />
          </DateContainer>
        </FormGroup>
        <FormGroup>
          <FormControl
            componentClass="checkbox"
            name="endDate"
            checked={formValues.isEndDateEnabled}
            onChange={(event: any) =>
              handleState('isEndDateEnabled', event.target.checked)
            }
          />
          <FormLabel>{__('End Date')}</FormLabel>
          <DateContainer>
            <Datetime
              inputProps={{ placeholder: __('Select Date') }}
              dateFormat="MM/DD/YYYY"
              closeOnSelect={true}
              timeFormat={true}
              utc={true}
              value={formValues.endDate || undefined}
              onChange={(date: any) => handleState('endDate', date)}
            />
          </DateContainer>
        </FormGroup>
      </>
    );
  };

  const renderBaseForm = () => (
    <>
      <FormWrapper>
        <FormColumn>
          <FormGroup>
            <FormLabel required={true}>{__('Name')}</FormLabel>
            <FormControl
              type="text"
              name="name"
              placeholder={__('Name')}
              value={formValues.name}
              required={true}
              onChange={(event: any) =>
                handleState('name', (event.target as HTMLInputElement).value)
              }
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>{__('Applies to')}</FormLabel>
            <FormControl
              componentClass="radio"
              name="applyType"
              onChange={() => handleState('applyType', 'category')}
              defaultChecked={formValues.applyType === 'category'}
            >
              Specific Category
            </FormControl>
            <FormControl
              componentClass="radio"
              name="applyType"
              onChange={() => handleState('applyType', 'product')}
              defaultChecked={formValues.applyType === 'product'}
            >
              Specific Product
            </FormControl>
          </FormGroup>
          {renderProductForm()}
        </FormColumn>
        <FormColumn>
          <FormGroup>
            <FormLabel>{__('Status')}</FormLabel>
            <FormControl
              name="status"
              componentClass="select"
              options={[
                {
                  label: 'Active',
                  value: 'active'
                },
                {
                  label: 'Archived',
                  value: 'archived'
                },
                {
                  label: 'Draft',
                  value: 'draft'
                },
                {
                  label: 'Completed',
                  value: 'completed'
                }
              ]}
              onChange={(e: any) => handleState('status', e.target.value)}
              defaultValue={formValues.status}
            />
          </FormGroup>
          {renderDiscountOptions()}
          <DiscountInput
            type={formValues.type}
            value={formValues.value}
            handleChange={(value: number) => handleState('value', value)}
            bonusValue={formValues.bonusProduct}
            handleBonusChange={(value: any) =>
              handleState('bonusProduct', value)
            }
            isLabelOn={true}
          />
          {renderDateRanger()}
        </FormColumn>
      </FormWrapper>
    </>
  );

  return (
    <FlexItem>
      <LeftItem>{renderBaseForm()}</LeftItem>
    </FlexItem>
  );
}
