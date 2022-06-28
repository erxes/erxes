import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import {
  __,
  ActionButtons,
  Button,
  FormControl,
  FormGroup,
  Table,
  Tip,
  Icon
} from '@erxes/ui/src';
import { MONTH, DAYS } from '../../constants';

type Props = {
  timeframes: any[];
  products: any[];
  categoryId: string;
  data: any;
  update: (doc: any) => void;
  remove: (doc: any) => void;
};

const FormList = (props: Props) => {
  const {
    timeframes = [],
    products = [],
    categoryId = '',
    data = {},
    update,
    remove
  } = props;

  const [productValues, setProductValues] = useState<any>(
    data.products ? data.products : []
  );

  useEffect(() => setProductValues(data.products ? data.products : []), [data]);

  const handleQuantities = (
    productId: string,
    label: string,
    value: string
  ) => {
    const tempProductValues = [...productValues];

    const index = _.findIndex(tempProductValues, { _id: productId });

    if (index === -1)
      tempProductValues.push({
        _id: productId,
        quantities: [{ label, value }]
      });
    else {
      const product = tempProductValues[index];
      const quantities = product.quantities;
      const _index = _.findIndex(quantities, { label });
      if (_index === -1) quantities.push({ label, value });
      else quantities[_index] = { label, value };
    }

    setProductValues(tempProductValues);
  };

  const renderTimeframesHeader = () => {
    if (!timeframes) return null;

    switch (data && data.type) {
      case 'Year':
        return MONTH.map((item: any, index: number) => {
          return <th key={`timeframeYear-${index}`}>{item.label}</th>;
        });
      case 'Month':
        return DAYS.map((item: any, index: number) => {
          return <th key={`timeframeMonth-${index}`}>{item.label}</th>;
        });
      case 'Day':
        return timeframes.map((item: any, index: number) => {
          return <th key={`timeframeDay-${index}`}>{item.name}</th>;
        });
      default:
        return null;
    }
  };

  const renderActionsHeader = () => {
    if (data && data.status === 'published') return null;

    return <th>Actions</th>;
  };

  const renderTimeframeInputs = (productId: string) => {
    if (timeframes.length === 0) return null;

    const index = _.findIndex(productValues, { _id: productId });
    const quantities = index > -1 ? productValues[index].quantities : [];

    switch (data && data.type) {
      case 'Year':
        return MONTH.map((item: any, index: number) => {
          const itemIndex = _.findIndex(quantities, { label: item.label });
          return (
            <td key={`timeframeYearInput-${index}`}>
              <FormGroup>
                <FormControl
                  type="number"
                  defaultValue={
                    itemIndex > -1 ? quantities[itemIndex].value : ''
                  }
                  disabled={data && data.status === 'published'}
                  onChange={(event: any) =>
                    handleQuantities(productId, item.label, event.target.value)
                  }
                />
              </FormGroup>
            </td>
          );
        });
      case 'Month':
        return DAYS.map((item: any, index: number) => {
          const itemIndex = _.findIndex(quantities, { label: item.label });
          return (
            <td key={`timeframeMonthInput-${index}`}>
              <FormGroup>
                <FormControl
                  type="number"
                  defaultValue={
                    itemIndex > -1 ? quantities[itemIndex].value : ''
                  }
                  disabled={data && data.status === 'published'}
                  onChange={(event: any) =>
                    handleQuantities(productId, item.label, event.target.value)
                  }
                />
              </FormGroup>
            </td>
          );
        });
      case 'Day':
        return timeframes.map((item: any, index: number) => {
          const itemIndex = _.findIndex(quantities, { label: item.label });
          return (
            <td key={`timeframeDayInput-${index}`}>
              <FormGroup>
                <FormControl
                  type="number"
                  defaultValue={
                    itemIndex > -1 ? quantities[itemIndex].value : ''
                  }
                  disabled={data && data.status === 'published'}
                  onChange={(event: any) =>
                    handleQuantities(productId, item.label, event.target.value)
                  }
                />
              </FormGroup>
            </td>
          );
        });
      default:
        return null;
    }
  };

  const renderProducts = () => {
    if (!products) return null;

    let filteredProducts = products;

    if (categoryId.length !== 0)
      filteredProducts = products.filter(
        (item: any) => item.categoryId === categoryId
      );

    const handleSubmit = (productId: string) => {
      const index = _.findIndex(productValues, { _id: productId });
      const productItem = productValues[index];
      delete productItem.__typename;
      productItem.quantities.map((item: any) => delete item.__typename);
      update(productItem);
    };

    const renderSubmitButton = (productId: string) => {
      if (data && data.status === 'published') return null;

      return (
        <td>
          <ActionButtons>
            <Tip text={__('Submit')} placement="bottom">
              <Button
                type="button"
                btnStyle="link"
                onClick={() => handleSubmit(productId)}
                size="small"
              >
                <Icon icon="check-circle" />
              </Button>
            </Tip>
            <Tip text={__('Delete')} placement="bottom">
              <Button
                type="button"
                btnStyle="link"
                onClick={() => remove(productId)}
                size="small"
              >
                <Icon icon="times" />
              </Button>
            </Tip>
          </ActionButtons>
        </td>
      );
    };

    return filteredProducts.map((item: any, index: number) => {
      return (
        <tr key={`products-${index}`}>
          <td>{item.name}</td>
          {renderTimeframeInputs(item._id)}
          {renderSubmitButton(item._id)}
        </tr>
      );
    });
  };

  return (
    <Table condensed={true}>
      <thead>
        <tr>
          <th>Name</th>
          {renderTimeframesHeader()}
          {renderActionsHeader()}
        </tr>
      </thead>
      <tbody>{renderProducts()}</tbody>
    </Table>
  );
};

export default FormList;
