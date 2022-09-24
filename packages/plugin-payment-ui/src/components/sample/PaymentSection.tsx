import { Buffer } from 'buffer';
import React from 'react';
import Select from 'react-select-plus';
import { IPaymentConfigDocument } from 'types';

import { Box, FormGroup } from '@erxes/ui/src/components';
import { __ } from '@erxes/ui/src/utils';

import { QpaySectionStyle } from '../styles';
import QpaySection from './QpaySection';
import SocialPaySection from './SocialPaySection';

type Props = {
  type?: string;
  queryParams: any;
  paymentConfigs: IPaymentConfigDocument[];
};

type State = {
  type: string;
  paymentId: string;
  amount: string;
};

class PaymentSection extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { type, queryParams } = props;

    const base64 = queryParams.q;
    console.log(base64);

    const data = Buffer.from(base64, 'base64').toString('ascii');
    const { amount } = JSON.parse(data);
    console.log(data);

    this.state = {
      type: type ? type : '',
      paymentId: '',
      amount
    };
  }

  onChange = option => {
    const value = option.value;
    const paymentConfig = this.props.paymentConfigs.find(
      pc => pc._id === value
    );

    this.setState({
      paymentId: value,
      type: paymentConfig ? paymentConfig.type : ''
    });
  };

  render() {
    const { paymentConfigs } = this.props;
    const { paymentId, amount } = this.state;
    const paymentTypes = paymentConfigs.map(e => ({
      value: e._id,
      label: e.name
    }));

    return (
      <Box title={__('Choose payment type')} name="showPayment" isOpen={true}>
        <QpaySectionStyle>
          <FormGroup>
            <Select
              value={paymentId}
              onChange={this.onChange}
              options={paymentTypes}
            />
          </FormGroup>

          {this.state.type === 'socialPay' && (
            <SocialPaySection
              paymentConfigId={paymentId}
              amount={amount}
              invoiceNo="socialPay test invoice"
              phone=""
            />
          )}

          {this.state.type === 'qpay' && (
            <QpaySection
              paymentConfigId={paymentId}
              amount={amount}
              description="qpay test invoice"
            />
          )}
        </QpaySectionStyle>
      </Box>
    );
  }
}

export default PaymentSection;
