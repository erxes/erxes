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
import gql from 'graphql-tag';
import { queries } from '../graphql';
import Spinner from '@erxes/ui/src/components/Spinner';
import EmptyState from '@erxes/ui/src/components/EmptyState';

interface TelegramChat {
  _id: string;
  type: string;
  title: string;
}

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

type State = {
  channelIds: string[];
  accountId: string;
  selectedTelegramChatId?: string;
  loadingTelegramChats: boolean;
  telegramChats: TelegramChat[];
};

class Telegram extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      channelIds: [],
      accountId: '',
      selectedTelegramChatId: undefined,
      loadingTelegramChats: false,
      telegramChats: []
    };
  }

  generateDoc = (values: { name: string; brandId: string }) => {
    const { channelIds, accountId, selectedTelegramChatId } = this.state;

    return {
      ...values,
      kind: 'telegram',
      channelIds,
      accountId,
      data: {
        telegramChatId: selectedTelegramChatId
      }
    };
  };

  channelOnChange = (values: string[]) => {
    this.setState({ channelIds: values } as Pick<State, keyof State>);
  };

  onSelectAccount = (accountId: string) => {
    if (!accountId) {
      this.setState({ accountId: '' });
    }

    this.setState({ loadingTelegramChats: true });

    client
      .query({
        query: gql(queries.telegramChats)
      })
      .then(({ data, loading }) => {
        if (!loading) {
          this.setState({
            accountId,
            telegramChats: data.telegramChats,
            loadingTelegramChats: false
          });
        }
      })
      .catch(error => {
        Alert.error(error.message);
        this.setState({ loadingTelegramChats: false });
      });
  };

  onSelectChat = (id: string) => {
    this.setState({ selectedTelegramChatId: id });
  };

  renderChats = () => {
    const { telegramChats, loadingTelegramChats } = this.state;

    if (loadingTelegramChats) {
      return <Spinner objective={true} />;
    }

    if (telegramChats.length == 0) {
      return (
        <EmptyState
          icon="folder-2"
          text={__('There are no chats this bot is an admin of')}
        />
      );
    }

    return (
      <FlexItem>
        <LeftItem>
          <AccountBox>
            <AccountTitle>{__('Telegram Chats')}</AccountTitle>
            {telegramChats.map(chat => (
              <AccountItem key={chat._id}>
                {chat.title}
                <Button
                  btnStyle={
                    this.state.selectedTelegramChatId == chat._id
                      ? 'primary'
                      : 'simple'
                  }
                  onClick={() => this.onSelectChat(chat._id)}
                >
                  {this.state.selectedTelegramChatId == chat._id
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
                    <strong>{__('Add bot token')}</strong>
                    <br />
                    Add a bot token to watch chats that they are an admin of.
                    See <a>https://telegram.me/BotFather</a> for information on
                    creating a bot token
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

          <Step img="/images/icons/erxes-04.svg" title="Connect your Chat">
            {this.renderChats()}
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
            <strong> {__('Telegram')}</strong> {__('integration')}
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
    const title = __('Telegram');

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
                      'Connect your Telegram to start receiving emails in your team inbox'
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

export default Telegram;
