import { IUser } from 'modules/auth/types';
import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import { Step, Steps } from 'modules/common/components/step';
import {
  Preview,
  StepWrapper,
  TitleContainer
} from 'modules/common/components/step/styles';
import { __, Alert } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import { IBrand } from 'modules/settings/brands/types';
import { LANGUAGES } from 'modules/settings/general/constants';
import { MessengerPreview, Row } from 'modules/settings/integrations/styles';
import {
  IIntegration,
  IMessages,
  IMessengerData,
  IUiOptions
} from 'modules/settings/integrations/types';
import React from 'react';
import { Link } from 'react-router-dom';
import { Appearance, Availability, Greeting, Intro, Options } from './steps';
import CommonPreview from './widgetPreview/CommonPreview';

type Props = {
  teamMembers: IUser[];
  integration?: IIntegration;
  brands: IBrand[];
  save: (
    params: {
      name: string;
      brandId: string;
      languageCode: string;
      messengerData: IMessengerData;
      uiOptions: IUiOptions;
    }
  ) => void;
};

type State = {
  title: string;
  brandId: string;
  languageCode: string;
  activeStep: number;
  color: string;
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
};

class CreateMessenger extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const integration = props.integration || ({} as IIntegration);
    const languageCode = integration.languageCode || 'en';
    const configData = integration.messengerData || {};
    const links = configData.links || {};
    const messages = configData.messages || {};
    const uiOptions = integration.uiOptions || {};

    this.state = {
      title: integration.name,
      brandId: integration.brandId || '',
      languageCode,
      activeStep: 1,
      color: uiOptions.color || '#6569DF',
      wallpaper: uiOptions.wallpaper || '1',
      notifyCustomer: configData.notifyCustomer || false,
      requireAuth: configData.requireAuth ? true : false,
      showChat: configData.showChat ? true : false,
      showLauncher: configData.showLauncher ? true : false,
      forceLogoutWhenResolve: configData.forceLogoutWhenResolve ? true : false,
      supporterIds: configData.supporterIds || [],
      availabilityMethod: configData.availabilityMethod || 'manual',
      isOnline: configData.isOnline || false,
      timezone: configData.timezone || '',
      onlineHours: (configData.onlineHours || []).map(h => ({
        _id: Math.random(),
        ...h
      })),
      logo: uiOptions.logo || '',
      logoPreviewStyle: {},
      logoPreviewUrl: uiOptions.logo || '/images/erxes.png',
      facebook: links.facebook || '',
      twitter: links.twitter || '',
      youtube: links.youtube || '',
      messages: { ...this.generateMessages(messages) }
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
    this.setState({ [key]: value } as Pick<State, keyof State>);
  };

  save = e => {
    e.preventDefault();

    const {
      title,
      brandId,
      languageCode,
      messages,
      facebook,
      twitter,
      youtube,
      requireAuth,
      showChat,
      showLauncher,
      forceLogoutWhenResolve
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
      languageCode: this.state.languageCode,
      messengerData: {
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
        links
      },
      uiOptions: {
        color: this.state.color,
        wallpaper: this.state.wallpaper,
        logo: this.state.logo
      }
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
        <Button btnStyle="simple" size="small" icon="cancel-1">
          Cancel
        </Button>
      </Link>
    );

    return (
      <Button.Group>
        {cancelButton}
        <Button
          btnStyle="success"
          size="small"
          icon="checked-1"
          onClick={this.save}
        >
          Save
        </Button>
      </Button.Group>
    );
  }

  render() {
    const {
      activeStep,
      title,
      supporterIds,
      isOnline,
      availabilityMethod,
      onlineHours,
      timezone,
      color,
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
      forceLogoutWhenResolve
    } = this.state;

    const message = messages[languageCode];

    const breadcrumb = [
      { title: __('Settings'), link: '/settings/integrations' },
      { title: __('Integrations') },
      { title: __('Messenger') }
    ];

    const onChange = e =>
      this.onChange('title', (e.currentTarget as HTMLInputElement).value);

    return (
      <StepWrapper>
        <Wrapper.Header title={__('Messenger')} breadcrumb={breadcrumb} />

        <TitleContainer>
          <div>{__('Title')}</div>
          <FormControl
            required={true}
            onChange={onChange}
            defaultValue={title}
          />
        </TitleContainer>

        <Row>
          <Steps active={activeStep}>
            <Step
              img="/images/icons/erxes-06.svg"
              title="Default Settings"
              onClick={this.onStepClick.bind(null, 'default')}
            >
              <Options
                onChange={this.onChange}
                brandId={brandId}
                notifyCustomer={notifyCustomer}
                languageCode={languageCode}
                requireAuth={requireAuth}
                showChat={showChat}
                showLauncher={showLauncher}
                forceLogoutWhenResolve={forceLogoutWhenResolve}
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
              img="/images/icons/erxes-16.svg"
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
              title="Hours & Availability"
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
              img="/images/icons/erxes-04.svg"
              title="Appearance"
              onClick={this.onStepClick.bind(null, 'appearance')}
              nextButton={this.renderButtons()}
            >
              <Appearance
                onChange={this.onChange}
                color={color}
                logoPreviewUrl={logoPreviewUrl}
                wallpaper={wallpaper}
              />
            </Step>
          </Steps>

          <MessengerPreview>
            <Preview fullHeight={true}>
              <CommonPreview
                teamMembers={this.props.teamMembers}
                message={message}
                supporterIds={supporterIds}
                isOnline={isOnline}
                wallpaper={wallpaper}
                color={color}
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
        </Row>
      </StepWrapper>
    );
  }
}

export default CreateMessenger;
