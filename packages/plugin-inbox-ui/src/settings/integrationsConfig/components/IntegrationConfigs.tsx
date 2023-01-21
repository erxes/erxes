import Button from '@erxes/ui/src/components/Button';
import CollapseContent from '@erxes/ui/src/components/CollapseContent';
import { FormControl } from '@erxes/ui/src/components/form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Info from '@erxes/ui/src/components/Info';
import { loadDynamicComponent, __ } from '@erxes/ui/src/utils/core';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import React from 'react';
import { ContentBox, Title } from '@erxes/ui-settings/src/styles';
import { KEY_LABELS } from '@erxes/ui-settings/src/general/constants';
import { IConfigsMap } from '@erxes/ui-settings/src/general/types';

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

type State = {
  configsMap: IConfigsMap;
};

class IntegrationConfigs extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      configsMap: props.configsMap
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

  renderItem = (
    key: string,
    type?: string,
    description?: string,
    defaultValue?: string,
    label?: string
  ) => {
    const { configsMap } = this.state;

    return (
      <FormGroup>
        <ControlLabel>{label || KEY_LABELS[key]}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          type={type || 'text'}
          defaultValue={configsMap[key] || defaultValue}
          onChange={this.onChangeInput.bind(this, key)}
        />
      </FormGroup>
    );
  };

  renderContent = () => {
    const { configsMap } = this.state;

    return (
      <ContentBox id={'IntegrationSettingsMenu'}>
        <CollapseContent title="Twitter">
          <Info>
            <a
              target="_blank"
              href="https://docs.erxes.io/docs/user-guide/xos/system-configuration#twitter"
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
              href="https://docs.erxes.io/docs/user-guide/xos/system-configuration#nylas-integrations"
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
              href="https://docs.erxes.io/docs/user-guide/xos/system-configuration#video-calls"
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
          {this.renderItem('VIDEO_CALL_TIME_DELAY_BETWEEN_REQUESTS', 'number')}
          {this.renderItem('VIDEO_CALL_MESSAGE_FOR_TIME_DELAY')}
        </CollapseContent>

        <CollapseContent title="Sunshine Conversations API">
          <Info>
            <a
              target="_blank"
              href="https://docs.erxes.io/docs/user-guide/xos/system-configuration#sunshine-conversations-api-integration"
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
            '',
            'https://yourdomain/smooch/webhook'
          )}
        </CollapseContent>

        <CollapseContent title="WhatsApp Chat-API">
          <Info>
            <a
              target="_blank"
              href="https://docs.erxes.io/docs/user-guide/xos/system-configuration#whatsapp-integration"
              rel="noopener noreferrer"
            >
              {__('Learn how to set WhatsApp Integration Variables')}
            </a>
          </Info>
          {this.renderItem('CHAT_API_UID')}
          {this.renderItem('CHAT_API_WEBHOOK_CALLBACK_URL')}
        </CollapseContent>

        <CollapseContent title="Telnyx SMS">
          {this.renderItem('TELNYX_API_KEY')}
        </CollapseContent>

        {loadDynamicComponent(
          'inboxIntegrationSettings',
          {
            renderItem: this.renderItem
          },
          true
        )}
      </ContentBox>
    );
  };

  render() {
    const actionButtons = (
      <Button btnStyle="success" onClick={this.save} icon="check-circle">
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
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__('Integrations config')}</Title>}
            right={actionButtons}
          />
        }
        content={this.renderContent()}
        hasBorder={true}
      />
    );
  }
}

export default IntegrationConfigs;
