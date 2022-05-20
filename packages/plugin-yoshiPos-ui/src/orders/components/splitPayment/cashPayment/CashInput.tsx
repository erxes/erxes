import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';
import React from 'react';
import NumberFormat from 'react-number-format';
import Icon from '../../../../common/components/Icon';
import FormGroup from '../../../../common/components/form/Group';
import ControlLabel from '../../../../common/components/form/Label';
import { __ } from '../../../../common/utils';
import { Input } from '../../../../orders/styles';
import { IOrder } from '../../../../orders/types';

type Props = {
  color?: string;
  order: IOrder;
  setAmount: (amount: number | string) => void;
  amount: number | string;
  inputLabel?: string;
  usePrefix?: boolean;
  getStringValue?: boolean;
  setBill?: string;
};

export default class CardInput extends React.Component<Props> {
  render() {
    const {
      color = '',
      setAmount,
      inputLabel,
      amount,
      usePrefix,
      getStringValue,
      setBill
    } = this.props;

    const inputProps: any = {
      allowNegative: false,
      thousandSeparator: !getStringValue && true,
      prefix: !getStringValue && usePrefix && '₮',
      inputMode: 'numeric'
    };

    const onValueChange = values => {
      let value = values.floatValue || 0;

      if (getStringValue) {
        value = values.value.toString();
      }

      setAmount(value);
    };

    return (
      <React.Fragment>
        <FormGroup>
          {inputLabel ? <ControlLabel>{__(inputLabel)}</ControlLabel> : ''}
          <Input color={color} setBill={setBill}>
            <NumberFormat
              value={amount}
              onValueChange={onValueChange}
              {...inputProps}
            />
            <div onClick={() => setAmount(0)}>
              <Icon icon="cancel" size={13} />
            </div>
          </Input>
        </FormGroup>
      </React.Fragment>
    );
  } // end render()
}
