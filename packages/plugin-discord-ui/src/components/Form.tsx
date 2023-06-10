import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Info from '@erxes/ui/src/components/Info';
import { Step, Steps } from '@erxes/ui/src/components/step';
import {
  ControlWrapper,
  FlexItem,
  Indicator,
  LeftItem,
  Preview,
  StepWrapper
} from '@erxes/ui/src/components/step/styles';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { Alert, __ } from '@erxes/ui/src/utils';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import client from '@erxes/ui/src/apolloClient';
import * as React from 'react';
import { Link } from 'react-router-dom';
import gql from 'graphql-tag';

import SelectBrand from '@erxes/ui-inbox/src/settings/integrations/containers/SelectBrand';
import SelectChannels from '@erxes/ui-inbox/src/settings/integrations/containers/SelectChannels';
import {
  AccountBox,
  AccountItem,
  AccountTitle,
  Content,
  ImageWrapper,
  MessengerPreview,
  TextWrapper
} from '@erxes/ui-inbox/src/settings/integrations/styles';
import Accounts from '../containers/Accounts';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Spinner from '@erxes/ui/src/components/Spinner';
import { queries } from '../graphql';

interface DiscordChannel {
  id: string;
  type: number;
  name: string;
}

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

type State = {
  channelIds: string[];
  accountId: string;
  selectedDiscordChannels: string[];
  loadingDiscordChannels: boolean;
  discordChannels: DiscordChannel[];
};

class Discord extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      channelIds: [],
      accountId: '',
      selectedDiscordChannels: [],
      loadingDiscordChannels: false,
      discordChannels: []
    };
  }

  generateDoc = (values: { name: string; brandId: string }) => {
    const { channelIds, accountId, selectedDiscordChannels } = this.state;

    return {
      ...values,
      kind: 'discord',
      channelIds,
      accountId,
      data: {
        discordChannelIds: selectedDiscordChannels
      }
    };
  };

  channelOnChange = (values: string[]) => {
    this.setState({ channelIds: values } as Pick<State, keyof State>);
  };

  onSelectAccount = (accountId: string) => {
    if (!accountId) {
      return this.setState({ discordChannels: [], accountId: '' });
    }

    this.setState({ loadingDiscordChannels: true });

    client
      .query({
        query: gql(queries.discordChannels),
        variables: {
          accountId
        }
      })
      .then(({ data, loading }: any) => {
        if (!loading) {
          this.setState({
            discordChannels: data.discordChannels,
            accountId,
            loadingDiscordChannels: false
          });
        }
      })
      .catch(error => {
        Alert.error(error.message);
        this.setState({ loadingDiscordChannels: false });
      });
  };

  onSelectDiscordChannels = (discordChannelId: string) => {
    const { selectedDiscordChannels } = this.state;
    if (selectedDiscordChannels.includes(discordChannelId)) {
      return this.setState({
        selectedDiscordChannels: selectedDiscordChannels.filter(
          item => item !== discordChannelId
        )
      });
    }

    this.setState({
      selectedDiscordChannels: [...selectedDiscordChannels, discordChannelId]
    });
  };

  renderDiscordChannels = () => {
    const { discordChannels, loadingDiscordChannels } = this.state;

    if (loadingDiscordChannels) {
      return <Spinner objective={true} />;
    }

    if (discordChannels.length === 0) {
      return <EmptyState icon="folder-2" text={__('There are no channels')} />;
    }

    return (
      <FlexItem>
        <LeftItem>
          <AccountBox>
            <AccountTitle>{__('Discord Channels')}</AccountTitle>
            {discordChannels.map(channel => (
              <AccountItem key={channel.id}>
                {channel.name}

                <Button
                  btnStyle={
                    this.state.selectedDiscordChannels.includes(channel.id)
                      ? 'primary'
                      : 'simple'
                  }
                  onClick={() => this.onSelectDiscordChannels(channel.id)}
                >
                  {this.state.selectedDiscordChannels.includes(channel.id)
                    ? __('Selected')
                    : __('Select')}
                </Button>
              </AccountItem>
            ))}
          </AccountBox>
        </LeftItem>
      </FlexItem>
    );
  };

  renderContent = (formProps: IFormProps) => {
    const { renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        <Steps active={1}>
          <Step img="/images/icons/erxes-01.svg" title="Connect Account">
            <FlexItem>
              <LeftItem>
                <FormGroup>
                  <Info>
                    <strong>{__('Add account description question')}</strong>
                    <br />
                    {__('Add account description')}
                  </Info>
                </FormGroup>

                <Accounts
                  formProps={formProps}
                  onSelectAccount={this.onSelectAccount}
                  accountId={this.state.accountId}
                />
              </LeftItem>
            </FlexItem>
          </Step>

          <Step img="/images/icons/erxes-04.svg" title="Connect Your Pages">
            {this.renderDiscordChannels()}
          </Step>

          <Step
            img="/images/icons/erxes-16.svg"
            title="Integration Setup"
            noButton={true}
          >
            <FlexItem>
              <LeftItem>
                <FormGroup>
                  <ControlLabel required={true}>Integration Name</ControlLabel>
                  <p>
                    {__('Name this integration to differentiate from the rest')}
                  </p>
                  <FormControl
                    {...formProps}
                    name="name"
                    required={true}
                    autoFocus={true}
                  />
                </FormGroup>

                <SelectBrand
                  isRequired={true}
                  formProps={formProps}
                  description={__(
                    'Which specific Brand does this integration belong to?'
                  )}
                />

                <SelectChannels
                  defaultValue={this.state.channelIds}
                  isRequired={true}
                  onChange={this.channelOnChange}
                />
              </LeftItem>
            </FlexItem>
          </Step>
        </Steps>
        <ControlWrapper>
          <Indicator>
            {__('You are creating')}
            <strong> {__('Discord')}</strong> {__('integration')}
          </Indicator>
          <Button.Group>
            <Link to="/settings/integrations">
              <Button btnStyle="simple" icon="times-circle">
                Cancel
              </Button>
            </Link>
            {renderButton({
              values: this.generateDoc(values),
              isSubmitted
            })}
          </Button.Group>
        </ControlWrapper>
      </>
    );
  };

  renderForm = () => {
    return <Form renderContent={this.renderContent} />;
  };

  render() {
    const title = __('Discord');

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Integrations'), link: '/settings/integrations' },
      { title }
    ];

    return (
      <StepWrapper>
        <Wrapper.Header title={title} breadcrumb={breadcrumb} />
        <Content>
          {this.renderForm()}

          <MessengerPreview>
            <Preview fullHeight={true}>
              <ImageWrapper>
                <TextWrapper>
                  <h1>
                    {__('Connect your')} {title}
                  </h1>
                  <p>
                    {__(
                      'Connect your Discord to start receiving emails in your team inbox'
                    )}
                  </p>
                  <img alt={title} src="/images/previews/facebook.png" />
                </TextWrapper>
              </ImageWrapper>
            </Preview>
          </MessengerPreview>
        </Content>
      </StepWrapper>
    );
  }
}

export default Discord;
