import {
  __, Button, ControlLabel, FormGroup, HeaderDescription,
  FormControl,
  MainStyleTitle as Title, Wrapper
} from 'erxes-ui';
import React from 'react';
import { SettingsContent } from '../styles';
import { IConfigsMap } from '../types';
import QpaySection from './common/QpaySection';

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

type State = {
  configsMap: IConfigsMap;
};

class GeneralSettings extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      configsMap: props.configsMap,
    };
  }

  save = e => {
    e.preventDefault();

    const { configsMap } = this.state;

    this.props.save(configsMap);
  };

  onChangeConfig = (code: string, e) => {
    const { configsMap } = this.state;
    console.log(e.target.value, code);
    configsMap[code] = e.target.value;
    this.setState({ configsMap });
  };

  renderItem = (key: string, title: string, description?: string) => {
    const { configsMap } = this.state;
    let value = configsMap[key] || "";

    if (key === "callbackUrl" && !value) {
      value = 'https://localhost:3000/payments';
      configsMap[key] = value;
    }

    if (key === "qpayUrl" && !value) {
      value = 'https://merchant.qpay.mn';
      configsMap[key] = value;
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

        {this.renderItem("qpayMerchantUser", "Username")}
        {this.renderItem("qpayMerchantPassword", "Password")}
        {this.renderItem("qpayInvoiceCode", "Invoice code")}
        {this.renderItem("qpayUrl", "Qpay url")}
        {this.renderItem("callbackUrl", "Call back url with /payments")}

      </SettingsContent>
    );

    return (
      <>
        <Wrapper
          header={
            < Wrapper.Header
              title={__('Qpay config')}
              breadcrumb={breadcrumb}
            />
          }
          mainHead={header}
          actionBar={
            <>
              < Wrapper.ActionBar
                left={< Title > {__('Qpay API configs')}</Title >}
                right={actionButtons}
              />
            </>
          }
          leftSidebar={
            <QpaySection amount="10" description="qpay test invoice" />
          }
          content={content}
          center={true}
        />
      </>
    );
  }
}

export default GeneralSettings;
