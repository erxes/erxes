import Button from 'modules/common/components/Button';
import CollapseContent from 'modules/common/components/CollapseContent';
import { FormControl } from 'modules/common/components/form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Info from 'modules/common/components/Info';
import Toggle from 'modules/common/components/Toggle';
import { Title } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import { ContentBox } from '../../styles';
import { KEY_LABELS } from '../constants';
import { IConfigsMap } from '../types';
import Header from './Header';
import Sidebar from './Sidebar';
import { ContentDisabler } from './styles';

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

type State = {
  configsMap: IConfigsMap;
  useNativeGmail: boolean;
};

class IntegrationConfigs extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      configsMap: props.configsMap,
      useNativeGmail: props.configsMap.USE_NATIVE_GMAIL === 'true' || false
    };
  }

  save = e => {
    e.preventDefault();

    const { configsMap } = this.state;

    this.props.save(configsMap);
  };

  onChangeConfig = (code: string, value) => {
    const { configsMap } = this.state;

    configsMap[code] = value;

    this.setState({ configsMap });
  };

  onChangeInput = (code: string, e) => {
    this.onChangeConfig(code, e.target.value);
  };

  renderItem(key: string, description?: string, defaultValue?: string) {
    const { configsMap } = this.state;

    return (
      <FormGroup>
        <ControlLabel>{KEY_LABELS[key]}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          defaultValue={configsMap[key] || defaultValue}
          onChange={this.onChangeInput.bind(this, key)}
        />
      </FormGroup>
    );
  }

  onTypeChange = (code: string, e) => {
    this.setState({ useNativeGmail: e.target.checked }, () => {
      this.onChangeConfig(code, this.state.useNativeGmail.toString());
    });
  };

  renderContent = () => {
    const { configsMap, useNativeGmail } = this.state;

    return (
      <ContentBox>
        <CollapseContent title="Facebook">
          <Info>
            <a
              target="_blank"
              href="https://docs.erxes.io/administrator/system-config#facebook"
              rel="noopener noreferrer"
            >
              {__('Learn how to set Facebook Integration Variables')}
            </a>
          </Info>
          {this.renderItem('FACEBOOK_APP_ID')}
          {this.renderItem('FACEBOOK_APP_SECRET')}
          {this.renderItem('FACEBOOK_VERIFY_TOKEN')}
          {this.renderItem(
            'FACEBOOK_PERMISSIONS',
            '',
            'pages_messaging,pages_manage_ads,pages_manage_engagement,pages_manage_metadata,pages_read_user_content'
          )}
        </CollapseContent>

        <CollapseContent title="Twitter">
          <Info>
            <a
              target="_blank"
              href="https://docs.erxes.io/administrator/system-config#twitter"
              rel="noopener noreferrer"
            >
              {__('Learn how to set Twitter Integration Variables')}
            </a>
          </Info>
          {this.renderItem('TWITTER_CONSUMER_KEY')}
          {this.renderItem('TWITTER_CONSUMER_SECRET')}
          {this.renderItem('TWITTER_ACCESS_TOKEN')}
          {this.renderItem('TWITTER_ACCESS_TOKEN_SECRET')}
          {this.renderItem('TWITTER_WEBHOOK_ENV')}
        </CollapseContent>

        <CollapseContent title="Nylas">
          <Info>
            <a
              target="_blank"
              href="https://docs.erxes.io/administrator/system-config#nylas-integrations"
              rel="noopener noreferrer"
            >
              {__('Learn how to set Nylas Integration')}
            </a>
          </Info>

          {this.renderItem('NYLAS_CLIENT_ID')}
          {this.renderItem('NYLAS_CLIENT_SECRET')}
          {this.renderItem(
            'NYLAS_WEBHOOK_CALLBACK_URL',
            'https://yourdomain/nylas/webhook'
          )}
          {this.renderItem('MICROSOFT_CLIENT_ID')}
          {this.renderItem('MICROSOFT_CLIENT_SECRET')}
        </CollapseContent>

        <CollapseContent title="Video call">
          <Info>
            <a
              target="_blank"
              href="https://docs.erxes.io/administrator/system-config#video-calls"
              rel="noopener noreferrer"
            >
              {__('Learn more about Video call configuration')}
            </a>
          </Info>
          <FormGroup>
            <ControlLabel>Video call type</ControlLabel>
            <FormControl
              name="VIDEO_CALL_TYPE"
              defaultValue={configsMap.VIDEO_CALL_TYPE}
              componentClass="select"
              options={[
                { value: '', label: '' },
                { value: 'daily', label: 'Daily' }
              ]}
              onChange={this.onChangeInput.bind(this, 'VIDEO_CALL_TYPE')}
            />
          </FormGroup>
          {this.renderItem('DAILY_API_KEY')}
          {this.renderItem('DAILY_END_POINT')}
        </CollapseContent>

        <CollapseContent title="Gmail">
          <Info>
            <a
              target="_blank"
              href="https://docs.erxes.io/administrator/system-config#gmail"
              rel="noopener noreferrer"
            >
              {__('Learn how to set Gmail Integration Variables')}
            </a>
          </Info>
          <FormGroup horizontal={true}>
            <Toggle
              value={configsMap.USE_NATIVE_GMAIL}
              checked={useNativeGmail}
              onChange={this.onTypeChange.bind(this, 'USE_NATIVE_GMAIL')}
              icons={false}
            />
            <ControlLabel>{KEY_LABELS.USE_NATIVE_GMAIL}</ControlLabel>
          </FormGroup>
          <br />
          <ContentDisabler disable={!useNativeGmail}>
            {this.renderItem('GOOGLE_GMAIL_TOPIC')}
            {this.renderItem('GOOGLE_GMAIL_SUBSCRIPTION_NAME')}
          </ContentDisabler>
        </CollapseContent>

        <CollapseContent title="Sunshine Conversations API">
          <Info>
            <a
              target="_blank"
              href="https://docs.erxes.io/administrator/system-config#sunshine-conversations-api-integration"
              rel="noopener noreferrer"
            >
              {__('Learn how to set Smooch Integration Variables')}
            </a>
          </Info>
          {this.renderItem('SMOOCH_APP_ID')}
          {this.renderItem('SMOOCH_APP_KEY_ID')}
          {this.renderItem('SMOOCH_APP_KEY_SECRET')}
          {this.renderItem(
            'SMOOCH_WEBHOOK_CALLBACK_URL',
            'https://yourdomain/smooch/webhook'
          )}
        </CollapseContent>

        <CollapseContent title="WhatsApp Chat-API">
          <Info>
            <a
              target="_blank"
              href="https://docs.erxes.io/administrator/system-config#whatsapp-integration"
              rel="noopener noreferrer"
            >
              {__('Learn how to set WhatsApp Integration Variables')}
            </a>
          </Info>
          {this.renderItem('CHAT_API_UID')}
          {this.renderItem('CHAT_API_WEBHOOK_CALLBACK_URL')}
        </CollapseContent>

        <CollapseContent title="Product Board">
          <Info>
            <a
              target="_blank"
              href="https://docs.erxes.io/administrator/system-config#productBoard"
              rel="noopener noreferrer"
            >
              {__('Learn how to set Product Board Integration Variables')}
            </a>
          </Info>
          {this.renderItem('PRODUCT_BOARD_TOKEN')}
        </CollapseContent>

        <CollapseContent title="Telnyx SMS">
          {this.renderItem('TELNYX_API_KEY')}
        </CollapseContent>
      </ContentBox>
    );
  };

  render() {
    const actionButtons = (
      <Button
        btnStyle="primary"
        onClick={this.save}
        icon="check-circle"
        uppercase={false}
      >
        Save
      </Button>
    );

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Integrations config') }
    ];

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Integrations config')}
            breadcrumb={breadcrumb}
          />
        }
        mainHead={<Header />}
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__('Integrations config')}</Title>}
            right={actionButtons}
          />
        }
        leftSidebar={<Sidebar />}
        content={this.renderContent()}
      />
    );
  }
}

export default IntegrationConfigs;
