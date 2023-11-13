import { Alert, __ } from 'coreui/utils';
import { FlexItem, LeftItem } from '@erxes/ui/src/components/step/styles';

import ControlLabel from '@erxes/ui/src/components/form/Label';
import { Description } from '@erxes/ui-inbox/src/settings/integrations/styles';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { LANGUAGES } from '@erxes/ui-settings/src/general/constants';
import React from 'react';
import Select from 'react-select-plus';
import Toggle from '@erxes/ui/src/components/Toggle';
import client from '@erxes/ui/src/apolloClient';
import { gql } from '@apollo/client';
import { queries } from '@erxes/ui-inbox/src/settings/integrations/graphql';

type Props = {
  onChange: (
    name:
      | 'languageCode'
      | 'notifyCustomer'
      | 'requireAuth'
      | 'showChat'
      | 'showLauncher'
      | 'forceLogoutWhenResolve',
    value: string
  ) => void;
  brandId?: string;
  languageCode: string;
  notifyCustomer?: boolean;
  requireAuth?: boolean;
  showChat?: boolean;
  showLauncher?: boolean;
  forceLogoutWhenResolve?: boolean;
  showVideoCallRequest?: boolean;
};

type State = {
  supporters?: any;
  languageCode?: string;
};

class Options extends React.Component<Props, State> {
  onChangeFunction = (name, value) => {
    this.setState({ [name]: value });
    this.props.onChange(name, value);
  };

  onSelectChange = (e, name) => {
    let value = '';

    if (e) {
      value = e.value;
    }

    this.setState({ [name]: value });
    this.props.onChange(name, value);
  };

  renderToggle({
    label,
    description,
    onChange,
    checked
  }: {
    label: string;
    description?: string;
    checked?: boolean;
    onChange: (e: React.FormEvent) => void;
  }) {
    return (
      <FormGroup>
        <ControlLabel>{label}</ControlLabel>
        <Description>{description}</Description>
        <div>
          <Toggle
            checked={checked}
            onChange={onChange}
            icons={{
              checked: <span>{__('Yes')}</span>,
              unchecked: <span>{__('No')}</span>
            }}
          />
        </div>
      </FormGroup>
    );
  }

  render() {
    const languageOnChange = e => this.onSelectChange(e, 'languageCode');

    const notifyCustomerChange = e =>
      this.onChangeFunction('notifyCustomer', e.target.checked);

    const showVideoCallRequestChange = e => {
      const checked = e.target.checked;

      if (checked) {
        client
          .query({
            query: gql(queries.integrationsVideoCallUsageStatus),
            fetchPolicy: 'network-only'
          })
          .then(({ data: { integrationsVideoCallUsageStatus } }) => {
            if (integrationsVideoCallUsageStatus) {
              this.onChangeFunction('showVideoCallRequest', true);
            } else {
              Alert.error('Please configure a video call settings');
            }
          })
          .catch(error => {
            Alert.error(error.message);
          });
      } else {
        this.onChangeFunction('showVideoCallRequest', false);
      }
    };

    const requireAuthChange = e =>
      this.onChangeFunction('requireAuth', e.target.checked);

    const showChatChange = e =>
      this.onChangeFunction('showChat', e.target.checked);

    const showLauncherChange = e =>
      this.onChangeFunction('showLauncher', e.target.checked);

    const forceLogoutWhenResolveChange = e =>
      this.onChangeFunction('forceLogoutWhenResolve', e.target.checked);

    return (
      <FlexItem>
        <LeftItem>
          <FormGroup>
            <ControlLabel>Default Language</ControlLabel>
            <Select
              id="languageCode"
              value={this.props.languageCode}
              options={LANGUAGES}
              onChange={languageOnChange}
              clearable={false}
            />
          </FormGroup>

          {this.renderToggle({
            label: __('Require Authentication'),
            description: __('It will require email and phone in widget'),
            checked: this.props.requireAuth,
            onChange: requireAuthChange
          })}

          {this.renderToggle({
            label: __('Show chat'),
            description: __(
              'Hide chat section and show only knowledgebase and form'
            ),
            checked: this.props.showChat,
            onChange: showChatChange
          })}

          {this.renderToggle({
            label: __('Show launcher'),
            description: __(
              'The widget section will invisible but you can still get messenger data'
            ),
            checked: this.props.showLauncher,
            onChange: showLauncherChange
          })}

          {this.renderToggle({
            label: __('Force logout when resolve'),
            description: __(
              'If an operator resolve the conversation from inbox then client session will end automatically'
            ),
            checked: this.props.forceLogoutWhenResolve,
            onChange: forceLogoutWhenResolveChange
          })}

          {this.renderToggle({
            label: __('Notify customer'),
            description: __(
              'If customer is offline and inserted email, it will send email when operator respond'
            ),
            checked: this.props.notifyCustomer,
            onChange: notifyCustomerChange
          })}

          {this.renderToggle({
            label: __('Show video call request'),
            checked: this.props.showVideoCallRequest,
            onChange: showVideoCallRequestChange
          })}
        </LeftItem>
      </FlexItem>
    );
  }
}

export default Options;
