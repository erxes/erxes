import React from 'react';

import Button from '../../../../common/components/Button';
import { __ } from '../../../../common/utils';
import CashInput from './CashInput';
import { IOrder, IPaymentInput } from '../../../../orders/types';
import { CardInputColumn } from '../../../../orders/styles';
import { FlexCenter } from '../../../../common/styles/main';

type Props = {
  order: IOrder;
  remainder: number;
  cashAmount: number;
  setAmount: (num: number | string) => void;
  addPayment: (params: IPaymentInput, callback?: () => void) => void;
};

export default class CashSection extends React.Component<Props> {
  render() {
    const { order, cashAmount, setAmount, addPayment, remainder } = this.props;

    const onClick = () => {
      const amount = cashAmount > remainder ? remainder : cashAmount;

      addPayment({ _id: order._id, cashAmount: amount }, () => {
        setAmount(0);
      });
    };

    const remainderAmount = Math.abs(cashAmount - remainder).toLocaleString();

    return (
      <FlexCenter>
        <CardInputColumn>
          <CashInput
            order={order}
            setAmount={setAmount}
            amount={cashAmount}
            inputLabel={__('In Cash')}
          />

          {cashAmount ? (
            <React.Fragment>
              <Button
                size="small"
                btnStyle="warning"
                onClick={onClick}
                block={true}
              >
                {__('Pay bill')}
              </Button>
              <span>
                {__(
                  cashAmount < remainder ? 'Remainder amount' : 'Change amount'
                )}
                : {remainderAmount}
              </span>
            </React.Fragment>
          ) : null}
        </CardInputColumn>
      </FlexCenter>
    );
  }
}
