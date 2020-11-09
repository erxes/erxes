import { IUser } from 'modules/auth/types';
import Button from 'modules/common/components/Button';
import { Step, Steps } from 'modules/common/components/step';
import {
  ControlWrapper,
  Indicator,
  Preview,
  StepWrapper
} from 'modules/common/components/step/styles';
import { __, Alert } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import { IBrand } from 'modules/settings/brands/types';
import { LANGUAGES } from 'modules/settings/general/constants';
import {
  Content,
  LeftContent,
  MessengerPreview
} from 'modules/settings/integrations/styles';
import {
  IIntegration,
  IMessages,
  IMessengerApps,
  IMessengerData,
  IUiOptions
} from 'modules/settings/integrations/types';
import React from 'react';
import { Link } from 'react-router-dom';
import AddOns from '../../containers/messenger/AddOns';
import { Appearance, Availability, Greeting, Intro, Options } from './steps';
import Connection from './steps/Connection';
import CommonPreview from './widgetPreview/CommonPreview';

type Props = {
  teamMembers: IUser[];
  integration?: IIntegration;
  brands: IBrand[];
  save: (params: {
    name: string;
    brandId: string;
    languageCode: string;
    channelIds?: string[];
    messengerData: IMessengerData;
    uiOptions: IUiOptions;
    messengerApps: IMessengerApps;
  }) => void;
};

type State = {
  title: string;
  botEndpointUrl?: string;
  botShowInitialMessage?: boolean;
  brandId: string;
  channelIds: string[];
  languageCode: string;
  color: string;
  textColor: string;
  wallpaper: string;
  notifyCustomer: boolean;
  supporterIds: string[];
  availabilityMethod: string;
  isOnline: boolean;
  timezone: string;
  onlineHours: any;
  logo: string;
  logoPreviewStyle: any;
  logoPreviewUrl: string;
  facebook: string;
  twitter: string;
  youtube: string;
  messages: IMessages;
  isStepActive?: boolean;
  requireAuth?: boolean;
  showChat?: boolean;
  showLauncher?: boolean;
  forceLogoutWhenResolve?: boolean;
  showVideoCallRequest?: boolean;
  messengerApps: IMessengerApps;
};

class CreateMessenger extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const integration = props.integration || ({} as IIntegration);
    const languageCode = integration.languageCode || 'en';
    const configData = integration.messengerData || {
      notifyCustomer: false,
      requireAuth: true,
      showChat: true,
      showLauncher: true,
      forceLogoutWhenResolve: false,
      showVideoCallRequest: false,
      botEndpointUrl: '',
      botShowInitialMessage: false
    };
    const links = configData.links || {};
    const messages = configData.messages || {};
    const uiOptions = integration.uiOptions || {};
    const channels = integration.channels || [];
    const messengerApps = {};

    this.state = {
      title: integration.name,
      botEndpointUrl: configData.botEndpointUrl,
      botShowInitialMessage: configData.botShowInitialMessage,
      brandId: integration.brandId || '',
      languageCode,
      channelIds: channels.map(item => item._id) || [],
      color: uiOptions.color || '#6569DF',
      textColor: uiOptions.textColor || '#fff',
      wallpaper: uiOptions.wallpaper || '1',
      notifyCustomer: configData.notifyCustomer || false,
      requireAuth: configData.requireAuth,
      showChat: configData.showChat,
      showLauncher: configData.showLauncher,
      forceLogoutWhenResolve: configData.forceLogoutWhenResolve,
      supporterIds: configData.supporterIds || [],
      availabilityMethod: configData.availabilityMethod || 'manual',
      isOnline: configData.isOnline || false,
      timezone: configData.timezone || '',
      onlineHours: (configData.onlineHours || []).map(h => ({
        _id: Math.random(),
        ...h
      })),
      showVideoCallRequest: configData.showVideoCallRequest,
      logo: uiOptions.logo || '',
      logoPreviewStyle: {},
      logoPreviewUrl: uiOptions.logo || '/images/erxes.png',
      facebook: links.facebook || '',
      twitter: links.twitter || '',
      youtube: links.youtube || '',
      messages: { ...this.generateMessages(messages) },
      messengerApps
    };
  }

  generateMessages(integrationMessages) {
    const messages = {};

    LANGUAGES.forEach(item => {
      const message = integrationMessages[item.value] || {};

      messages[item.value] = {
        greetings: {
          title:
            message && message.greetings ? message.greetings.title || '' : '',
          message:
            message && message.greetings ? message.greetings.message || '' : ''
        },
        welcome: message.welcome || '',
        away: message.away || '',
        thank: message.thank || ''
      };
    });

    return messages;
  }

  onChange = <T extends keyof State>(key: T, value: State[T]) => {
    this.setState(({ [key]: value } as unknown) as Pick<State, keyof State>);
  };

  handleMessengerApps = (messengerApps: IMessengerApps) => {
    this.setState({ messengerApps });
  };

  save = e => {
    e.preventDefault();

    const {
      title,
      botEndpointUrl,
      botShowInitialMessage,
      brandId,
      languageCode,
      channelIds,
      messages,
      facebook,
      twitter,
      youtube,
      requireAuth,
      showChat,
      showLauncher,
      forceLogoutWhenResolve,
      showVideoCallRequest,
      messengerApps
    } = this.state;

    if (!languageCode) {
      return Alert.error('Set language');
    }

    if (!title) {
      return Alert.error('Write title');
    }

    if (!brandId) {
      return Alert.error('Choose a brand');
    }

    const links = { facebook, twitter, youtube };

    this.props.save({
      name: title,
      brandId,
      channelIds,
      languageCode: this.state.languageCode,
      messengerData: {
        botEndpointUrl,
        botShowInitialMessage,
        notifyCustomer: this.state.notifyCustomer,
        availabilityMethod: this.state.availabilityMethod,
        isOnline: this.state.isOnline,
        timezone: this.state.timezone,
        onlineHours: (this.state.onlineHours || []).map(oh => ({
          day: oh.day,
          from: oh.from,
          to: oh.to
        })),
        supporterIds: this.state.supporterIds,
        messages,
        requireAuth,
        showChat,
        showLauncher,
        forceLogoutWhenResolve,
        showVideoCallRequest,
        links
      },
      uiOptions: {
        color: this.state.color,
        textColor: this.state.textColor,
        wallpaper: this.state.wallpaper,
        logo: this.state.logo
      },
      messengerApps
    });
  };

  onStepClick = name => {
    if (name !== 'greeting') {
      return this.setState({ isStepActive: false });
    }

    return this.setState({ isStepActive: true });
  };

  renderButtons() {
    const cancelButton = (
      <Link to="/settings/integrations">
        <Button btnStyle="simple" icon="times-circle" uppercase={false}>
          Cancel
        </Button>
      </Link>
    );

    return (
      <Button.Group>
        {cancelButton}
        <Button
          btnStyle="success"
          uppercase={false}
          icon="check-circle"
          onClick={this.save}
        >
          Save
        </Button>
      </Button.Group>
    );
  }

  render() {
    const {
      title,
      botEndpointUrl,
      botShowInitialMessage,
      supporterIds,
      isOnline,
      availabilityMethod,
      onlineHours,
      timezone,
      color,
      textColor,
      logoPreviewUrl,
      wallpaper,
      brandId,
      languageCode,
      notifyCustomer,
      logoPreviewStyle,
      facebook,
      twitter,
      youtube,
      messages,
      isStepActive,
      requireAuth,
      showChat,
      showLauncher,
      forceLogoutWhenResolve,
      showVideoCallRequest,
      channelIds
    } = this.state;

    const { integration } = this.props;
    const message = messages[languageCode];

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('App store'), link: '/settings/integrations' },
      { title: __('Messenger') }
    ];

    return (
      <StepWrapper>
        <Wrapper.Header title={__('Messenger')} breadcrumb={breadcrumb} />
        <Content>
          <LeftContent>
            <Steps>
              <Step
                img="/images/icons/erxes-04.svg"
                title="Appearance"
                onClick={this.onStepClick.bind(null, 'appearance')}
              >
                <Appearance
                  onChange={this.onChange}
                  color={color}
                  textColor={textColor}
                  logoPreviewUrl={logoPreviewUrl}
                  wallpaper={wallpaper}
                />
              </Step>

              <Step
                img="/images/icons/erxes-09.svg"
                title="Greeting"
                onClick={this.onStepClick.bind(null, 'greeting')}
              >
                <Greeting
                  teamMembers={this.props.teamMembers}
                  onChange={this.onChange}
                  supporterIds={supporterIds}
                  messages={messages}
                  facebook={facebook}
                  languageCode={languageCode}
                  twitter={twitter}
                  youtube={youtube}
                />
              </Step>

              <Step
                img="/images/icons/erxes-07.svg"
                title="Intro"
                onClick={this.onStepClick.bind(null, 'intro')}
              >
                <Intro
                  onChange={this.onChange}
                  messages={messages}
                  languageCode={languageCode}
                />
              </Step>

              <Step
                img="/images/icons/erxes-03.svg"
                title={__('Hours & Availability')}
                onClick={this.onStepClick.bind(null, 'hours')}
              >
                <Availability
                  onChange={this.onChange}
                  isOnline={isOnline}
                  availabilityMethod={availabilityMethod}
                  timezone={timezone}
                  onlineHours={onlineHours}
                />
              </Step>

              <Step
                img="/images/icons/erxes-06.svg"
                title="Default Settings"
                onClick={this.onStepClick.bind(null, 'default')}
              >
                <Options
                  onChange={this.onChange}
                  notifyCustomer={notifyCustomer}
                  languageCode={languageCode}
                  requireAuth={requireAuth}
                  showChat={showChat}
                  showLauncher={showLauncher}
                  forceLogoutWhenResolve={forceLogoutWhenResolve}
                  showVideoCallRequest={showVideoCallRequest}
                />
              </Step>

              <Step
                img="/images/icons/erxes-16.svg"
                title={__('Integration Setup')}
                onClick={this.onStepClick.bind(null, 'setup')}
              >
                <Connection
                  title={title}
                  botEndpointUrl={botEndpointUrl}
                  botShowInitialMessage={botShowInitialMessage}
                  channelIds={channelIds}
                  brandId={brandId}
                  onChange={this.onChange}
                />
              </Step>
              <Step
                img="/images/icons/erxes-15.svg"
                title={__('Add Ons')}
                onClick={this.onStepClick.bind(null, 'addon')}
                noButton={true}
              >
                <AddOns
                  selectedBrand={brandId}
                  websiteMessengerApps={
                    integration && integration.websiteMessengerApps
                  }
                  leadMessengerApps={
                    integration && integration.leadMessengerApps
                  }
                  knowledgeBaseMessengerApps={
                    integration && integration.knowledgeBaseMessengerApps
                  }
                  handleMessengerApps={this.handleMessengerApps}
                />
              </Step>
            </Steps>
            <ControlWrapper>
              <Indicator>
                {__('You are')}{' '}
                {this.props.integration ? 'editing' : 'creating'}{' '}
                <strong>{title}</strong> {__('integration')}
              </Indicator>
              {this.renderButtons()}
            </ControlWrapper>
          </LeftContent>

          <MessengerPreview>
            <Preview fullHeight={true}>
              <CommonPreview
                teamMembers={this.props.teamMembers}
                message={message}
                supporterIds={supporterIds}
                isOnline={isOnline}
                wallpaper={wallpaper}
                color={color}
                textColor={textColor}
                brands={this.props.brands}
                brandId={brandId}
                logoPreviewStyle={logoPreviewStyle}
                logoPreviewUrl={logoPreviewUrl}
                isGreeting={isStepActive}
                facebook={facebook}
                twitter={twitter}
                youtube={youtube}
              />
            </Preview>
          </MessengerPreview>
        </Content>
      </StepWrapper>
    );
  }
}

export default CreateMessenger;
