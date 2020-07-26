import client from 'apolloClient';
import gql from 'graphql-tag';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { FlexItem, LeftItem } from 'modules/common/components/step/styles';
import Toggle from 'modules/common/components/Toggle';
import { Alert } from 'modules/common/utils';
import { LANGUAGES } from 'modules/settings/general/constants';
import { queries } from 'modules/settings/integrations/graphql';
import React from 'react';
import { Description } from '../../../styles';

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

  onInputChange = <T extends keyof State>(name: any, value: State[T]) => {
    this.setState({ [name]: value } as Pick<State, keyof State>);
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
              checked: <span>Yes</span>,
              unchecked: <span>No</span>
            }}
          />
        </div>
      </FormGroup>
    );
  }

  render() {
    const languageOnChange = e =>
      this.onInputChange(
        'languageCode',
        (e.currentTarget as HTMLInputElement).value
      );

    const notifyCustomerChange = e =>
      this.onChangeFunction('notifyCustomer', e.target.checked);

    const showVideoCallRequestChange = e => {
      const checked = e.target.checked;

      if (checked) {
        client
          .query({
            query: gql(queries.fetchApi),
            variables: { path: '/videoCall/usageStatus', params: {} },
            fetchPolicy: 'network-only'
          })
          .then(({ data: { integrationsFetchApi } }) => {
            if (integrationsFetchApi) {
              this.onChangeFunction('showVideoCallRequest', true);
            } else {
              Alert.error('Please configure a video call settings');
            }
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

            <FormControl
              componentClass="select"
              id="languageCode"
              defaultValue={this.props.languageCode}
              onChange={languageOnChange}
            >
              {LANGUAGES.map((item, index) => (
                <option key={index} value={item.value}>
                  {item.label}
                </option>
              ))}
            </FormControl>
          </FormGroup>

          {this.renderToggle({
            label: 'Require Authentication',
            description: 'It will require email and phone in widget',
            checked: this.props.requireAuth,
            onChange: requireAuthChange
          })}

          {this.renderToggle({
            label: 'Show chat',
            description:
              'Hide chat section and show only knowledgebase and form',
            checked: this.props.showChat,
            onChange: showChatChange
          })}

          {this.renderToggle({
            label: 'Show launcher',
            description:
              'The widget section will invisible but you can still get messenger data',
            checked: this.props.showLauncher,
            onChange: showLauncherChange
          })}

          {this.renderToggle({
            label: 'Force logout when resolve',
            description:
              'If an operator resolve the conversation from inbox then client session will end automatically',
            checked: this.props.forceLogoutWhenResolve,
            onChange: forceLogoutWhenResolveChange
          })}

          {this.renderToggle({
            label: 'Notify customer',
            description:
              'If customer is offline and inserted email, it will send email when operator respond',
            checked: this.props.notifyCustomer,
            onChange: notifyCustomerChange
          })}

          {this.renderToggle({
            label: 'Show video call request',
            checked: this.props.showVideoCallRequest,
            onChange: showVideoCallRequestChange
          })}
        </LeftItem>
      </FlexItem>
    );
  }
}

export default Options;
