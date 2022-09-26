import {
  Button,
  ControlLabel,
  FormGroup,
  HeaderDescription,
  FormControl
} from '@erxes/ui/src/components';
import { MainStyleTitle as Title } from '@erxes/ui/src/styles/eindex';
import { Wrapper } from '@erxes/ui/src/layout';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { SettingsContent } from '../styles';
import { IConfigsMap } from '../types';
import PaymentSection from './common/PaymentSection';

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

type State = {
  currentMap: IConfigsMap;
};

class GeneralSettings extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      currentMap: props.configsMap.QPAY || {}
    };
  }

  save = e => {
    e.preventDefault();

    const { currentMap } = this.state;
    const { configsMap } = this.props;
    configsMap.QPAY = currentMap;
    this.props.save(configsMap);
  };

  onChangeConfig = (code: string, e) => {
    const { currentMap } = this.state;
    const value = e.target.value;
    currentMap[code] = value;

    this.setState({ currentMap });
  };

  renderItem = (key: string, title: string, description?: string) => {
    const { currentMap } = this.state;
    let value = currentMap[key] || '';

    if (key === 'callbackUrl' && !value) {
      value = 'https://localhost:3000/payments';
      currentMap[key] = value;
    }

    if (key === 'qpayUrl' && !value) {
      value = 'https://merchant.qpay.mn';
      currentMap[key] = value;
    }

    return (
      <FormGroup>
        <ControlLabel>{title}</ControlLabel>
        <FormControl
          defaultValue={value}
          onChange={this.onChangeConfig.bind(this, key)}
          value={value}
        />
      </FormGroup>
    );
  };

  render() {
    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Qpay') }
    ];

    const header = (
      <HeaderDescription
        icon="/images/actions/25.svg"
        title="Qpay"
        description="qpay"
      />
    );

    const actionButtons = (
      <>
        <Button
          btnStyle="primary"
          onClick={this.save}
          icon="check-circle"
          uppercase={false}
        >
          Save
        </Button>
      </>
    );

    const content = (
      <SettingsContent title={__('General settings')}>
        {this.renderItem('qpayMerchantUser', 'Username')}
        {this.renderItem('qpayMerchantPassword', 'Password')}
        {this.renderItem('qpayInvoiceCode', 'Invoice code')}
        {this.renderItem('qpayUrl', 'Qpay url')}
        {this.renderItem('callbackUrl', 'Call back url with /payments')}
      </SettingsContent>
    );

    return (
      <>
        <Wrapper
          header={
            <Wrapper.Header title={__('Qpay config')} breadcrumb={breadcrumb} />
          }
          mainHead={header}
          actionBar={
            <>
              <Wrapper.ActionBar
                left={<Title> {__('Qpay API configs')}</Title>}
                right={actionButtons}
              />
            </>
          }
          leftSidebar={<PaymentSection type="qpay" />}
          content={content}
          center={true}
        />
      </>
    );
  }
}

export default GeneralSettings;
