import React from 'react';
import NumberFormat from 'react-number-format';

import colors from '../../../common/styles/colors';
import Icon from '../../../common/components/Icon';
import FormGroup from '../../../common/components/form/Group';
import ControlLabel from '../../../common/components/form/Label';
import { __ } from '../../../common/utils';
import { Amount, Input } from '../../../orders/styles';
import { formatNumber } from '../../../utils';
import { IOrder } from '../../../orders/types';
import { PAYMENT_TYPES } from '../../../constants';

type Props = {
  cashAmount: number;
  color: string;
  reset: (key: string) => void;
  onStateChange: (key: string, value: any) => void;
  order: IOrder;
  isSplit?: boolean;
  cardAmount?: number;
};

export default class CashForm extends React.Component<Props> {
  render() {
    const {
      color,
      reset,
      cashAmount,
      onStateChange,
      isSplit,
      cardAmount = 0,
      order
    } = this.props;

    const inputProps: any = {
      allowNegative: false,
      thousandSeparator: true,
      prefix: '₮',
      inputMode: 'numeric'
    };

    const handleInput = (value: number | undefined) => {
      onStateChange(PAYMENT_TYPES.CASH, value);

      const totalMatches = value && cardAmount + value === order.totalAmount;

      if (isSplit && totalMatches) {
        onStateChange('paymentEnabled', true);
      } else {
        onStateChange('paymentEnabled', false);
      }
    };

    const handleClick = () => {
      onStateChange('activeInput', PAYMENT_TYPES.CASH);
    };

    const changeAmount = (cashAmount || 0) - (order.totalAmount || 0);
    const changeColor =
      changeAmount < 0 ? colors.colorCoreRed : colors.colorCoreTeal;

    return (
      <React.Fragment>
        <FormGroup>
          <ControlLabel>{__('In Cash')}</ControlLabel>
          <Input color={color}>
            <NumberFormat
              name="cashAmount"
              value={cashAmount}
              onValueChange={values => handleInput(values.floatValue)}
              onClick={() => handleClick()}
              {...inputProps}
            />
            <div onClick={() => reset(PAYMENT_TYPES.CASH)}>
              <Icon icon="cancel" size={13} />
            </div>
          </Input>
        </FormGroup>

        {/** hide change amount in split payment form */}
        {!isSplit && changeAmount !== 0 && (
          <Amount color={changeColor}>
            <span>{__('Change amount')}</span>
            {formatNumber(changeAmount)}₮
          </Amount>
        )}
      </React.Fragment>
    );
  } // end render()
}
