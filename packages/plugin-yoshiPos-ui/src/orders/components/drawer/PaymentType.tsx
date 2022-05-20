import React from 'react';
import { __ } from '../../../common/utils';
import { Card, Cards, TypeWrapper } from './style';

type Props = {
  color: string;
  togglePaymentType: (type: string) => void;
  isPortrait?: boolean;
};

type State = {
  selectedPaymentType: string;
};

export const PAYMENT_METHODS = {
  CARD: 'card',
  CASH: 'cash',
  QPAY: 'qpay'
};

class PaymentType extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedPaymentType: ''
    };
  }

  onChangeCard = value => {
    this.setState({ selectedPaymentType: value });
    this.props.togglePaymentType(value);
  };

  render() {
    const { isPortrait } = this.props;
    const { selectedPaymentType } = this.state;

    return (
      <TypeWrapper isPortrait={isPortrait}>
        <h2>{__('Choose the payment method')}</h2>

        <Cards isPortrait={isPortrait}>
          <Card
            className={
              selectedPaymentType === PAYMENT_METHODS.CARD ? 'activeCard' : ''
            }
            isPortrait={isPortrait}
            onClick={() => this.onChangeCard(PAYMENT_METHODS.CARD)}
          >
            <div>
              <img src="/images/payment4.png" alt="payment2" />
            </div>
          </Card>
          <Card
            className={
              selectedPaymentType === PAYMENT_METHODS.QPAY ? 'activeCard' : ''
            }
            isPortrait={isPortrait}
            onClick={() => this.onChangeCard(PAYMENT_METHODS.QPAY)}
          >
            <div>
              <img src="/images/payment1.png" alt="payment3" />
            </div>
          </Card>
        </Cards>
      </TypeWrapper>
    );
  }
}

export default PaymentType;
