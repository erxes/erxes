import React from 'react';

import { FlexCenter } from 'modules/common/styles/main';
import Button from 'modules/common/components/Button';
import { __ } from 'modules/common/utils';
import QPayInput from './QPayInput';
import { IInvoiceParams, IOrder } from 'modules/orders/types';

type Props = {
  closeModal?: () => void;
  order: IOrder;
  billType: string;
  createQPayInvoice: (params: IInvoiceParams) => void;
  maxAmount?: number;
};

type State = {
  amount: number;
};

export default class SplitQPayForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { amount: 0 };
  }

  render() {
    const {
      order,
      closeModal,
      billType,
      createQPayInvoice,
      maxAmount
    } = this.props;
    const { amount } = this.state;

    const onCancel = () => {
      closeModal && closeModal();
    };

    const setAmount = (qpayAmount: number) => {
      this.setState({ amount: qpayAmount });
    };

    const onSubmit = () => {
      createQPayInvoice({ orderId: order._id, amount });

      onCancel();
    };

    return (
      <>
        <QPayInput
          billType={billType}
          order={order}
          setAmount={setAmount}
          amount={this.state.amount}
          maxAmount={maxAmount}
        />
        <div>
          <FlexCenter>
            <Button btnStyle="simple" icon="cancel-1" block onClick={onCancel}>
              {__('Cancel')}
            </Button>
            {amount ? (
              <Button
                btnStyle="success"
                icon="check-circle"
                block
                onClick={onSubmit}
              >
                {__('Create invoice')}
              </Button>
            ) : null}
          </FlexCenter>
        </div>
      </>
    );
  } // end render()
}
