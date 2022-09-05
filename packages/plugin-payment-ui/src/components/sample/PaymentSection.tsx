import { Box, FormGroup } from '@erxes/ui/src/components';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { QpaySectionStyle } from '../styles';
import SocialPaySection from './SocialPaySection';
import QpaySection from './QpaySection';
import Select from 'react-select-plus';
import { IPaymentConfigDocument } from 'types';

type Props = {
  type?: string;
  queryParams: any;
  paymentConfigs: IPaymentConfigDocument[];
};

type State = {
  type: string;
  paymentId: string;
};

class PaymentSection extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { type } = props;

    this.state = {
      type: type ? type : '',
      paymentId: ''
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
    const { paymentId } = this.state;
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
              amount="10"
              invoiceNo="socialPay test invoice"
              phone=""
            />
          )}

          {this.state.type === 'qpay' && (
            <QpaySection
              paymentConfigId={paymentId}
              amount="10"
              description="qpay test invoice"
            />
          )}
        </QpaySectionStyle>
      </Box>
    );
  }
}

export default PaymentSection;
