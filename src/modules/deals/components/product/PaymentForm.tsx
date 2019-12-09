import ControlLabel from 'modules/common/components/form/Label';
// import CURRENCIES from 'modules/common/constants/currencies';
// import { __ } from 'modules/common/utils';
import React from 'react';
import { ContentColumn, ContentRow } from '../../styles';
import { IPaymentsData } from '../../types';

type Props = {
  total: { currency?: string; amount?: number };
  paymentsData?: IPaymentsData;
};

type State = {
  paymentsData: IPaymentsData;
};

class PaymentForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      paymentsData: this.props.paymentsData
        ? this.props.paymentsData
        : {
            prepayment: [],
            payment: [],
            afterPayment: []
          }
    };
  }

  renderTotal(value) {
    return Object.keys(value).map(key => (
      <div key={key}>
        {value[key].toLocaleString()} <b>{key}</b>
      </div>
    ));
  }

  render() {
    const { total } = this.props;

    return (
      <ContentRow>
        <ContentColumn>
          <ControlLabel>Total</ControlLabel>
          {this.renderTotal(total)}
        </ContentColumn>
      </ContentRow>
    );
  }
}

export default PaymentForm;
