import React, { useState, useEffect, useCallback } from 'react';
import _ from 'lodash';
import {
  __,
  ActionButtons,
  Button,
  FormControl,
  FormGroup,
  Tip,
  Icon
} from '@erxes/ui/src';
import { MONTH, DAYS } from '../../constants';

type Props = {
  product: any;
  productSales: any;
  status: string;
  type: string;
  timeframes: any[];
  update: (data: any) => void;
  remove: (data: any) => void;
};

const Row = (props: Props) => {
  const {
    product = {},
    productSales = {},
    status = '',
    type = '',
    timeframes = [],
    update,
    remove
  } = props;

  const [intervalValues, setIntervalValues] = useState<any[]>(
    productSales.intervals ? productSales.intervals : []
  );

  const handleOnChange = (label: string, value: string) => {
    const tempIntervalValues = [...intervalValues];

    if (value.length !== 0) {
      const intervalIndex = _.findIndex(tempIntervalValues, { label });

      if (intervalIndex === -1) tempIntervalValues.push({ label, value });
      else tempIntervalValues[intervalIndex] = { label, value };

      setIntervalValues(tempIntervalValues);
    }
  };

  const handleSubmit = () => {
    const tempIntervalValues = [...intervalValues];

    tempIntervalValues.map((item: any) => {
      if (item.__typename) delete item.__typename;
    });

    update({ productId: product._id, intervals: tempIntervalValues });
  };

  const handleRemove = () => {
    setIntervalValues([]);
    remove(product._id);
  };

  const renderTimeframeInputs = () => {
    if (timeframes.length === 0) return null;

    const disabled = ['pending', 'published'].includes(status);

    const handleDefaultValue = (label: string): string => {
      const index = _.findIndex(intervalValues, { label: label });
      return index > -1 ? intervalValues[index].value : '';
    };

    switch (type) {
      case 'Year':
        return MONTH.map((item: any, index: number) => {
          return (
            <td key={`timeframeYearInput-${index}`}>
              <FormGroup>
                <FormControl
                  type="number"
                  value={handleDefaultValue(item.label)}
                  disabled={disabled}
                  onChange={(event: any) =>
                    handleOnChange(item.label, event.target.value)
                  }
                  required
                />
              </FormGroup>
            </td>
          );
        });
      case 'Month':
        return DAYS.map((item: any, index: number) => {
          return (
            <td key={`timeframeMonthInput-${index}`}>
              <FormGroup>
                <FormControl
                  type="number"
                  defaultValue={handleDefaultValue(item.label)}
                  disabled={disabled}
                  onChange={(event: any) =>
                    handleOnChange(item.label, event.target.value)
                  }
                  required
                />
              </FormGroup>
            </td>
          );
        });
      case 'Day':
        return timeframes.map((item: any, index: number) => {
          return (
            <td key={`timeframeDayInput-${index}`}>
              <FormGroup>
                <FormControl
                  type="number"
                  defaultValue={handleDefaultValue(item.name)}
                  disabled={disabled}
                  onChange={(event: any) =>
                    handleOnChange(item.name, event.target.value)
                  }
                  required
                />
              </FormGroup>
            </td>
          );
        });
      default:
        return null;
    }
  };

  const renderActions = () => {
    if (['pending', 'published'].includes(status)) return null;

    return (
      <td>
        <ActionButtons>
          <Tip text={__('Submit')} placement="bottom">
            <Button
              type="button"
              btnStyle="link"
              onClick={() => handleSubmit()}
              size="small"
            >
              <Icon icon="check-circle" />
            </Button>
          </Tip>
          <Tip text={__('Delete')} placement="bottom">
            <Button
              type="button"
              btnStyle="link"
              onClick={() => handleRemove()}
              size="small"
            >
              <Icon icon="times" />
            </Button>
          </Tip>
        </ActionButtons>
      </td>
    );
  };

  return (
    <tr>
      <td>{product.name && product.name}</td>
      {renderTimeframeInputs()}
      {renderActions()}
    </tr>
  );
};

export default Row;
