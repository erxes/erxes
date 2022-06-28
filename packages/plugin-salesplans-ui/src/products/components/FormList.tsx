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
  update: (data: any) => void;
  remove: (data: any) => void;
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

  const [productsList, setProductList] = useState<any>(
    data.products ? data.products : []
  );

  useEffect(() => setProductList(data.products ? data.products : []), [data]);

  const handleIntervals = (productId: string, label: string, value: string) => {
    const tempProductValues = [...productsList];
    const index = _.findIndex(tempProductValues, { productId: productId });

    if (index === -1)
      tempProductValues.push({
        productId: productId,
        intervals: [{ label, value }]
      });
    else {
      const product = tempProductValues[index];
      const intervals = product.intervals ? product.intervals : [];
      const intervalIndex = _.findIndex(intervals, { label });

      if (intervalIndex === -1) intervals.push({ label, value });
      else intervals[intervalIndex] = { label, value };
    }

    setProductList(tempProductValues);
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
    if (data && ['pending', 'published'].includes(data.status)) return null;

    return <th>Actions</th>;
  };

  const renderTimeframeInputs = (productId: string) => {
    if (timeframes.length === 0) return null;

    const index = _.findIndex(productsList, { productId: productId });
    const intervals = index > -1 ? productsList[index].intervals : [];

    switch (data && data.type) {
      case 'Year':
        return MONTH.map((item: any, index: number) => {
          const itemIndex = _.findIndex(intervals, { label: item.label });
          return (
            <td key={`timeframeYearInput-${index}`}>
              <FormGroup>
                <FormControl
                  type="number"
                  defaultValue={
                    itemIndex > -1 ? intervals[itemIndex].value : ''
                  }
                  disabled={
                    data && ['pending', 'published'].includes(data.status)
                  }
                  onChange={(event: any) =>
                    handleIntervals(productId, item.label, event.target.value)
                  }
                />
              </FormGroup>
            </td>
          );
        });
      case 'Month':
        return DAYS.map((item: any, index: number) => {
          const itemIndex = _.findIndex(intervals, { label: item.label });
          return (
            <td key={`timeframeMonthInput-${index}`}>
              <FormGroup>
                <FormControl
                  type="number"
                  defaultValue={
                    itemIndex > -1 ? intervals[itemIndex].value : ''
                  }
                  disabled={
                    data && ['pending', 'published'].includes(data.status)
                  }
                  onChange={(event: any) =>
                    handleIntervals(productId, item.label, event.target.value)
                  }
                />
              </FormGroup>
            </td>
          );
        });
      case 'Day':
        return timeframes.map((item: any, index: number) => {
          const itemIndex = _.findIndex(intervals, { label: item.name });
          return (
            <td key={`timeframeDayInput-${index}`}>
              <FormGroup>
                <FormControl
                  type="number"
                  defaultValue={
                    itemIndex > -1 ? intervals[itemIndex].value : ''
                  }
                  disabled={
                    data && ['pending', 'published'].includes(data.status)
                  }
                  onChange={(event: any) =>
                    handleIntervals(productId, item.name, event.target.value)
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
      const index = _.findIndex(productsList, { productId: productId });

      if (index > -1) {
        const productItem = productsList[index];

        if (productItem.__typename) delete productItem.__typename;

        if (productItem.intervals)
          productItem.intervals.map((item: any) => {
            if (item.__typename) delete item.__typename;
          });

        console.log(productItem);

        update(productItem);
      }
    };

    const renderSubmitButton = (productId: string) => {
      if (data && ['pending', 'published'].includes(data.status)) return null;

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
