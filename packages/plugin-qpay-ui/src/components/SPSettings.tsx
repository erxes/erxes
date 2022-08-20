import {
  Button,
  ControlLabel,
  FormGroup,
  HeaderDescription,
  FormControl
} from '@erxes/ui/src/components';
import { __ } from '@erxes/ui/src/utils';
import { MainStyleTitle as Title } from '@erxes/ui/src/styles/eindex';
import { Wrapper } from '@erxes/ui/src/layout';
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
      currentMap: props.configsMap.SocialPAY || {}
    };
  }

  save = e => {
    e.preventDefault();

    const { currentMap } = this.state;
    const { configsMap } = this.props;
    configsMap.SocialPAY = currentMap;
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

    if (key === 'pushNotification' && !value) {
      value = 'https://localhost:3000/pushNotif';
      currentMap[key] = value;
    }

    if (key === 'inStoreSPUrl' && !value) {
      value = 'https://instore.golomtbank.com';
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
      { title: __('SocialPay') }
    ];

    const header = (
      <HeaderDescription
        icon="/images/actions/25.svg"
        title="SocialPay"
        description="SocialPay"
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
        {this.renderItem('inStoreSPTerminal', 'Terminal')}
        {this.renderItem('inStoreSPKey', 'Key')}
        {this.renderItem('inStoreSPUrl', 'InStore SocialPay url')}
        {this.renderItem(
          'pushNotification',
          'Push notification url with /pushNotif'
        )}
      </SettingsContent>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('SocialPay config')}
            breadcrumb={breadcrumb}
          />
        }
        mainHead={header}
        actionBar={
          <Wrapper.ActionBar
            left={<Title> {__('SocialPay API configs')}</Title>}
            right={actionButtons}
          />
        }
        leftSidebar={
          <>
            <PaymentSection type="socialPay" />
          </>
        }
        content={content}
        center={true}
      />
    );
  }
}

export default GeneralSettings;
