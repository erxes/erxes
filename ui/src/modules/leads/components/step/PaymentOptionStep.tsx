import { FormControl } from 'erxes-ui';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { LeftItem } from 'modules/common/components/step/styles';
import { __ } from 'modules/common/utils';
import {
  IGolomtConfig,
  IQPayConfig,
  ISocialPayConfig
} from 'modules/leads/types';
import React from 'react';
import { FlexItem } from './style';

type Props = {
  paymentType?: string;
  paymentConfig?: ISocialPayConfig | IQPayConfig | IGolomtConfig;
  onChange: (name: string, value: any) => void;
};

class PaymentOptionStep extends React.Component<Props> {
  onChangeType = e => {
    if (e.currentTarget.value === 'none') {
      this.props.onChange('paymentConfig', {});
    }

    this.props.onChange('paymentType', e.currentTarget.value);
  };

  onChangeConfig = (code: string, e) => {
    const { paymentConfig = {} } = this.props;

    console.log(e.target.value, code);

    paymentConfig[code] = e.target.value;

    this.props.onChange('paymentConfig', paymentConfig);
  };

  renderItem = (key: string, title: string, description?: string) => {
    const { paymentConfig = {} } = this.props;
    const value = paymentConfig[key] || '';

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
    if (this.props.paymentType !== 'golomtEcommerce') {
      return null;
    }

    return (
      <>
        {this.renderItem('checksumKey', 'Голомт E-Commerce checksum key')}
        {this.renderItem('token', 'Голомт E-Commerce token')}
        {this.renderItem('redirectUrl', 'Голомт E-Commerce redirect')}
        {this.renderItem(
          'pushNotification',
          'Голомт E-Commerce push notification'
        )}
      </>
    );
  }

  renderSocialPay() {
    if (this.props.paymentType !== 'socialPay') {
      return null;
    }

    return (
      <>
        {this.renderItem('terminal', 'Terminal')}
        {this.renderItem('key', 'Key')}
        {this.renderItem('url', 'InStore SocialPay url')}
        {this.renderItem(
          'pushNotification',
          'Push notification url with /pushNotif'
        )}
      </>
    );
  }

  renderQpay() {
    if (this.props.paymentType !== 'qPay') {
      return null;
    }

    return (
      <>
        {this.renderItem('merchantUser', 'Username')}
        {this.renderItem('merchantPassword', 'Password')}
        {this.renderItem('invoiceCode', 'Invoice code')}
        {this.renderItem('qPayUrl', 'Qpay url')}
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
              value={this.props.paymentType || 'none'}
              onChange={this.onChangeType}
            >
              <option value={'none'}>None</option>
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
