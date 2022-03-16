import { FormControl } from 'erxes-ui';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { LeftItem } from 'modules/common/components/step/styles';
import { __ } from 'modules/common/utils';
import { IPaymentConfig } from 'modules/leads/types';
import React from 'react';
import { FlexItem } from './style';

type Props = {
  paymentType?: string;
  paymentConfigs?: IPaymentConfig;
};

type State = {
  paymentType: string;
  paymentConfigs: IPaymentConfig;
};

class PaymentOptionStep extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      paymentType: props.paymentType || 'golomtEcommerce',
      paymentConfigs: props.paymentConfigs || {}
    };
  }

  onChangeType = e => {
    this.setState({ paymentType: e.currentTarget.value });
  };

  onChangeConfig = (code: string, e) => {
    const { paymentConfigs } = this.state;

    console.log(e.target.value, code);

    paymentConfigs[code] = e.target.value;

    this.setState({ configsMap });
  };

  renderItem = (key: string, title: string, description?: string) => {
    const { configsMap } = this.state;
    const value = configsMap[key] || '';

    return (
      <FormGroup>
        <ControlLabel>{title}</ControlLabel>
        {description && <p>{description}</p>}
        <FormControl
          defaultValue={value}
          onChange={this.onChangeConfig.bind(this, key)}
          value={value}
        />
      </FormGroup>
    );
  };

  renderGolomtEcommerce() {
    if (this.state.paymentType !== 'golomtEcommerce') {
      return null;
    }

    return (
      <>
        {this.renderItem(
          'GolomtEcommerceChecksumKey',
          'Голомт E-Commerce checksum key'
        )}
        {this.renderItem('GolomtEcommerceToken', 'Голомт E-Commerce token')}
        {this.renderItem(
          'GolomtEcommerceRedirectUrl',
          'Голомт E-Commerce redirect'
        )}
        {this.renderItem(
          'GolomtEcommercePushNotification',
          'Голомт E-Commerce push notification'
        )}
      </>
    );
  }

  renderSocialPay() {
    if (this.state.paymentType !== 'socialPay') {
      return null;
    }

    return (
      <>
        {this.renderItem('inStoreSPTerminal', 'Terminal')}
        {this.renderItem('inStoreSPKey', 'Key')}
        {this.renderItem('inStoreSPUrl', 'InStore SocialPay url')}
        {this.renderItem(
          'pushNotification',
          'Push notification url with /pushNotif'
        )}
      </>
    );
  }

  renderQpay() {
    if (this.state.paymentType !== 'qPay') {
      return null;
    }

    return (
      <>
        {this.renderItem('qpayMerchantUser', 'Username')}
        {this.renderItem('qpayMerchantPassword', 'Password')}
        {this.renderItem('qpayInvoiceCode', 'Invoice code')}
        {this.renderItem('qpayUrl', 'Qpay url')}
        {this.renderItem('callbackUrl', 'Call back url with /payments')}
      </>
    );
  }

  render() {
    return (
      <FlexItem>
        <LeftItem>
          <FormGroup>
            <ControlLabel htmlFor="paymentOptions">Options:</ControlLabel>
            <FormControl
              id="paymentOptions "
              componentClass="select"
              value={this.state.paymentType}
              onChange={this.onChangeType}
            >
              <option value={'golomtEcommerce'}>Golomt E-Commerce</option>
              <option value={'socialPay'}>Social Pay</option>
              <option value={'qPay'}>QPay</option>
            </FormControl>
          </FormGroup>
          {this.renderGolomtEcommerce()}
          {this.renderSocialPay()}
          {this.renderQpay()}
        </LeftItem>
      </FlexItem>
    );
  }
}

export default PaymentOptionStep;
