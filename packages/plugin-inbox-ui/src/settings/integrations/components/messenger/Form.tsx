import { Alert, __ } from "@erxes/ui/src/utils";
import { Appearance, Availability, Greeting, Intro, Options } from "./steps";
import {
  Content,
  LeftContent,
  MessengerPreview,
} from "@erxes/ui-inbox/src/settings/integrations/styles";
import {
  ControlWrapper,
  Indicator,
  Preview,
  StepWrapper,
} from "@erxes/ui/src/components/step/styles";
import {
  ICallData,
  IExternalLink,
  IIntegration,
  IMessages,
  IMessengerApps,
  IMessengerData,
  ISkillData,
  ITicketTypeMessenger,
  IUiOptions,
} from "@erxes/ui-inbox/src/settings/integrations/types";
import { Step, Steps } from "@erxes/ui/src/components/step";

import AddOns from "../../containers/messenger/AddOns";
import Button from "@erxes/ui/src/components/Button";
import CommonPreview from "./widgetPreview/CommonPreview";
import ConfigSetup from "./steps/ConfigSetup";
import { IBrand } from "@erxes/ui/src/brands/types";
import { IUser } from "@erxes/ui/src/auth/types";
import { LANGUAGES } from "@erxes/ui-settings/src/general/constants";
import { Link } from "react-router-dom";
import React from "react";
import { SmallLoader } from "@erxes/ui/src/components/ButtonMutate";
import TicketSelect from "../../containers/messenger/Ticket";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { linkify } from "@erxes/ui-inbox/src/inbox/utils";

type Props = {
  teamMembers: IUser[];
  integration?: IIntegration;
  messengerApps?: IMessengerApps;
  brands: IBrand[];
  save: (params: {
    name: string;
    brandId: string;
    languageCode: string;
    channelIds?: string[];
    messengerData: IMessengerData;
    ticketData: ITicketTypeMessenger;
    uiOptions: IUiOptions;
    messengerApps: IMessengerApps;
    callData: ICallData;
  }) => void;
  isLoading: boolean;
};

type BotPersistentMenuTypeMessenger = {
  _id: string;
  type: string;
  text: string;
  link: string;
};

type State = {
  ticketStageId?: string;
  ticketPipelineId?: string;
  ticketBoardId?: string;
  ticketToggle?: boolean;
  title: string;
  botEndpointUrl?: string;
  botShowInitialMessage?: boolean;
  botCheck?: boolean;
  botGreetMessage?: string;
  persistentMenus?: BotPersistentMenuTypeMessenger[];
  skillData?: ISkillData;
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
  responseRate: string;
  showTimezone: boolean;
  onlineHours: any;
  logo: string;
  logoPreviewStyle: any;
  logoPreviewUrl: string;
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
  messages: IMessages;
  isStepActive?: boolean;
  activeStep?: string;
  requireAuth?: boolean;
  showChat?: boolean;
  showLauncher?: boolean;
  hideWhenOffline?: boolean;
  forceLogoutWhenResolve?: boolean;
  showVideoCallRequest?: boolean;
  messengerApps: IMessengerApps;
  externalLinks: IExternalLink[];
  callData?: ICallData;
};

class CreateMessenger extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const integration = props.integration || ({} as IIntegration);
    const languageCode = integration.languageCode || "en";
    const configData =
      integration.messengerData ||
      ({
        skillData: undefined,
        notifyCustomer: false,
        requireAuth: true,
        showChat: true,
        showLauncher: true,
        hideWhenOffline: false,
        forceLogoutWhenResolve: false,
        showVideoCallRequest: false,
        botEndpointUrl: "",
        botShowInitialMessage: false,
        botCheck: false,
        isReceiveWebCall: false,
        botGreetMessage: "",
        persistentMenus: [] as BotPersistentMenuTypeMessenger[],
      } as IMessengerData);
    const callData = integration.callData;
    const links = configData.links || {};
    const externalLinks = configData.externalLinks || [];
    const messages = configData.messages || {};
    const uiOptions = integration.uiOptions || {};
    const ticketData = integration.ticketData || {};
    const channels = integration.channels || [];
    const messengerApps = props.messengerApps || {};

    this.state = {
      title: integration.name,
      botEndpointUrl: configData.botEndpointUrl,
      botCheck: configData.botCheck,
      botGreetMessage: configData.botGreetMessage,
      persistentMenus: configData.persistentMenus,
      botShowInitialMessage: configData.botShowInitialMessage,
      skillData: configData.skillData,
      brandId: integration.brandId || "",
      languageCode,
      ticketStageId: ticketData.ticketStageId || "",
      ticketPipelineId: ticketData.ticketPipelineId || "",
      ticketBoardId: ticketData.ticketBoardId || "",
      ticketToggle: ticketData.ticketToggle || false,
      channelIds: channels.map((item) => item._id) || [],
      color: uiOptions.color || "#6569DF",
      textColor: uiOptions.textColor || "#fff",
      wallpaper: uiOptions.wallpaper || "1",
      notifyCustomer: configData.notifyCustomer || false,
      requireAuth: configData.requireAuth,
      showChat: configData.showChat,
      showLauncher: configData.showLauncher,
      hideWhenOffline: configData.hideWhenOffline,
      forceLogoutWhenResolve: configData.forceLogoutWhenResolve,
      supporterIds: configData.supporterIds || [],
      availabilityMethod: configData.availabilityMethod || "manual",
      isOnline: configData.isOnline || false,
      timezone: configData.timezone || "",
      responseRate: configData.responseRate || "A few minutes",
      showTimezone: configData.showTimezone || false,
      onlineHours: (configData.onlineHours || []).map((h) => ({
        _id: Math.random(),
        ...h,
      })),
      showVideoCallRequest: configData.showVideoCallRequest,
      logo: uiOptions.logo || "",
      logoPreviewStyle: {},
      logoPreviewUrl: uiOptions.logo || "/images/erxes.png",
      facebook: links.facebook || "",
      instagram: links.instagram || "",
      twitter: links.twitter || "",
      youtube: links.youtube || "",
      messages: { ...this.generateMessages(messages) },
      messengerApps,
      externalLinks,
      callData: callData,
    };
  }

  generateMessages(integrationMessages) {
    const messages = {};

    LANGUAGES.forEach((item) => {
      const message = integrationMessages[item.value] || {};

      messages[item.value] = {
        greetings: {
          title:
            message && message.greetings ? message.greetings.title || "" : "",
          message:
            message && message.greetings ? message.greetings.message || "" : "",
        },
        welcome: message.welcome || "",
        away: message.away || "",
        thank: message.thank || "",
      };
    });

    return messages;
  }

  onChange = <T extends keyof State>(key: T, value: State[T]) => {
    this.setState({ [key]: value } as unknown as Pick<State, keyof State>);
  };

  onExternalLinksChange = (newExternalLinks: IExternalLink[]) => {
    this.setState({ externalLinks: newExternalLinks });
  };

  onChangePersistent = (persistentMenus: BotPersistentMenuTypeMessenger[]) => {
    this.setState({ persistentMenus: persistentMenus });
  };

  handleMessengerApps = (messengerApps: IMessengerApps) => {
    this.setState({ messengerApps });
  };
  handleFormChange = (name: string, value: string | object | boolean) => {
    this.setState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  save = (e) => {
    e.preventDefault();

    const {
      title,
      botEndpointUrl,
      botShowInitialMessage,
      brandId,
      botCheck,
      botGreetMessage,
      persistentMenus,
      languageCode,
      channelIds,
      messages,
      facebook,
      instagram,
      twitter,
      youtube,
      requireAuth,
      showChat,
      showLauncher,
      hideWhenOffline,
      forceLogoutWhenResolve,
      showVideoCallRequest,
      messengerApps,
      skillData,
      externalLinks,
      callData,
      ticketStageId,
      ticketPipelineId,
      ticketBoardId,
      ticketToggle,
    } = this.state;

    if (!languageCode) {
      return Alert.error("Set language");
    }

    if (!title) {
      return Alert.error("Insert integration name");
    }

    if (!brandId) {
      return Alert.error("Choose a brand");
    }

    if (channelIds.length < 1) {
      return Alert.error("Choose a channel");
    }

    if (messengerApps.websites && messengerApps.websites.length > 0) {
      for (const website of messengerApps.websites) {
        if (website.url === "") {
          return Alert.error(`Set Website URL`);
        }
        if (website.description === "") {
          return Alert.error(`Set Website Description`);
        }
        if (website.buttonText === "") {
          return Alert.error(`Set Website Button Text`);
        }
      }
    }

    if (skillData && Object.keys(skillData).length !== 0) {
      const skillOptions = (skillData as ISkillData).options || [];

      if (skillOptions.length === 0) {
        return Alert.error("Please add skill options");
      }

      if (skillOptions.length === 1) {
        return Alert.error("Please add more than one skill option");
      }

      for (const option of skillOptions) {
        if (!option.label || !option.skillId) {
          return Alert.error("Please select skill or enter label");
        }
      }
    }

    const links = {
      facebook: linkify(facebook),
      instagram: linkify(instagram),
      twitter: linkify(twitter),
      youtube: linkify(youtube),
    };

    this.props.save({
      name: title,
      brandId,
      channelIds,
      languageCode: this.state.languageCode,
      messengerData: {
        skillData,
        botEndpointUrl,
        botShowInitialMessage,
        botCheck,
        botGreetMessage,
        persistentMenus,
        notifyCustomer: this.state.notifyCustomer,
        availabilityMethod: this.state.availabilityMethod,
        isOnline: this.state.isOnline,
        timezone: this.state.timezone,
        responseRate: this.state.responseRate,
        showTimezone: this.state.showTimezone,
        onlineHours: (this.state.onlineHours || []).map((oh) => ({
          day: oh.day,
          from: oh.from,
          to: oh.to,
        })),
        supporterIds: this.state.supporterIds,
        messages,
        requireAuth,
        showChat,
        showLauncher,
        hideWhenOffline,
        forceLogoutWhenResolve,
        showVideoCallRequest,
        links,
        externalLinks,
      },
      ticketData: {
        ticketStageId: ticketStageId,
        ticketPipelineId: ticketPipelineId,
        ticketBoardId: ticketBoardId,
        ticketToggle: ticketToggle,
      },
      uiOptions: {
        color: this.state.color,
        textColor: this.state.textColor,
        wallpaper: this.state.wallpaper,
        logo: this.state.logo,
      },
      messengerApps,
      callData: callData || {},
    });
  };

  onStepClick = (name) => {
    this.setState({
      isStepActive: !!(
        name === "greeting" ||
        name === "hours" ||
        name === "addon"
      ),
      activeStep: name,
    });
  };

  renderButtons() {
    const { isLoading } = this.props;

    const cancelButton = (
      <Link to="/settings/integrations">
        <Button btnStyle="simple" icon="times-circle">
          Cancel
        </Button>
      </Link>
    );

    return (
      <Button.Group>
        {cancelButton}
        <Button
          disabled={isLoading}
          btnStyle="success"
          icon={isLoading ? undefined : "check-circle"}
          onClick={this.save}
        >
          {isLoading && <SmallLoader />}
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
      botCheck,
      botGreetMessage,
      persistentMenus,
      supporterIds,
      isOnline,
      availabilityMethod,
      onlineHours,
      timezone,
      responseRate,
      showTimezone,
      color,
      textColor,
      logoPreviewUrl,
      wallpaper,
      brandId,
      languageCode,
      notifyCustomer,
      logoPreviewStyle,
      facebook,
      instagram,
      twitter,
      youtube,
      messages,
      isStepActive,
      activeStep,
      requireAuth,
      showChat,
      showLauncher,
      hideWhenOffline,
      forceLogoutWhenResolve,
      showVideoCallRequest,
      channelIds,
      skillData,
      messengerApps,
      externalLinks,
      callData,
      ticketStageId,
      ticketPipelineId,
      ticketBoardId,
      ticketToggle,
    } = this.state;

    const { integration } = this.props;
    const message = messages[languageCode];

    const breadcrumb = [
      { title: __("Settings"), link: "/settings" },
      { title: __("Integrations"), link: "/settings/integrations" },
      { title: __("Messenger") },
    ];

    return (
      <StepWrapper>
        <Wrapper.Header title={__("Messenger")} breadcrumb={breadcrumb} />
        <Content>
          <LeftContent>
            <Steps>
              <Step
                img="/images/icons/erxes-04.svg"
                title="Appearance"
                onClick={this.onStepClick.bind(null, "appearance")}
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
                onClick={this.onStepClick.bind(null, "greeting")}
              >
                <Greeting
                  teamMembers={this.props.teamMembers}
                  onChange={this.onChange}
                  supporterIds={supporterIds}
                  messages={messages}
                  facebook={facebook}
                  instagram={instagram}
                  languageCode={languageCode}
                  twitter={twitter}
                  youtube={youtube}
                  externalLinks={externalLinks}
                  onExternalLinksChange={this.onExternalLinksChange}
                />
              </Step>

              <Step
                img="/images/icons/erxes-07.svg"
                title="Intro"
                onClick={this.onStepClick.bind(null, "intro")}
              >
                <Intro
                  skillData={skillData}
                  onChange={this.onChange}
                  messages={messages}
                  languageCode={languageCode}
                />
              </Step>

              <Step
                img="/images/icons/erxes-03.svg"
                title={__("Hours & Availability")}
                onClick={this.onStepClick.bind(null, "hours")}
              >
                <Availability
                  onChange={this.onChange}
                  isOnline={isOnline}
                  availabilityMethod={availabilityMethod}
                  timezone={timezone}
                  responseRate={responseRate}
                  showTimezone={showTimezone}
                  onlineHours={onlineHours}
                  hideWhenOffline={hideWhenOffline}
                />
              </Step>

              <Step
                img="/images/icons/erxes-06.svg"
                title="Default Settings"
                onClick={this.onStepClick.bind(null, "default")}
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
                img="/images/icons/erxes-24.svg"
                title={__("Config Setup")}
                onClick={this.onStepClick.bind(null, "cfCall")}
              >
                <ConfigSetup
                  onChange={this.onChange}
                  callData={callData}
                  title={title}
                  botCheck={botCheck}
                  botGreetMessage={botGreetMessage}
                  persistentMenus={persistentMenus}
                  botEndpointUrl={botEndpointUrl}
                  botShowInitialMessage={botShowInitialMessage}
                  channelIds={channelIds}
                  brandId={brandId}
                  handleFormChange={this.handleFormChange}
                  ticketPipelineId={ticketPipelineId || ""}
                  ticketBoardId={ticketBoardId || ""}
                  ticketStageId={ticketStageId || ""}
                />
              </Step>
              <Step
                img="/images/icons/erxes-15.svg"
                title={__("Add Ons")}
                onClick={this.onStepClick.bind(null, "addon")}
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
                {__("You are")}{" "}
                {this.props.integration ? "editing" : "creating"}{" "}
                <strong>{title}</strong> {__("integration")}
              </Indicator>
              {this.renderButtons()}
            </ControlWrapper>
          </LeftContent>

          <MessengerPreview>
            <Preview $fullHeight={true}>
              <CommonPreview
                teamMembers={this.props.teamMembers}
                message={message}
                supporterIds={supporterIds}
                isOnline={isOnline}
                wallpaper={wallpaper}
                color={color}
                textColor={textColor}
                skillData={skillData}
                brands={this.props.brands}
                brandId={brandId}
                timezone={timezone}
                showTimezone={showTimezone}
                responseRate={responseRate}
                logoPreviewStyle={logoPreviewStyle}
                logoPreviewUrl={logoPreviewUrl}
                showChatPreview={isStepActive}
                activeStep={activeStep}
                showVideoCallRequest={showVideoCallRequest}
                messengerApps={messengerApps}
                facebook={facebook}
                instagram={instagram}
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
