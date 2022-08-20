import { Box, FormGroup } from '@erxes/ui/src/components';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { QpaySectionStyle } from '../../styles';
import SocialPaySection from './SocialPaySection';
import QpaySection from './QpaySection';
import Select from 'react-select-plus';

type Props = {
  type?: string;
};

type State = {
  type: string;
};

class PaymentSection extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { type } = props;

    this.state = {
      type: type ? type : ''
    };
  }

  onClickEvent = (variable, e) => {
    this.setState({ type: variable });
  };

  onChange = option => {
    this.setState({ type: option ? option.value : '' });
  };

  render() {
    const paymentTypes = [
      { label: 'Qpay', value: 'qpay' },
      { label: 'Social Pay', value: 'socialPay' }
    ];

    return (
      <Box title={__('Choose payment type')} name="showPayment" isOpen={true}>
        <QpaySectionStyle>
          <FormGroup>
            <Select
              value={this.state.type}
              onChange={this.onChange}
              options={paymentTypes}
            />
          </FormGroup>

          {this.state.type === 'socialPay' && (
            <SocialPaySection
              amount="10"
              invoiceNo="socialPay test invoice"
              phone="91101133"
            />
          )}

          {this.state.type === 'qpay' && (
            <QpaySection amount="10" description="qpay test invoice" />
          )}
        </QpaySectionStyle>
      </Box>
    );
  }
}

export default PaymentSection;
