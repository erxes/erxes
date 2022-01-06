import gql from "graphql-tag";
import * as React from "react";
import client from "../../apollo-client";
import { getLocalStorageItem, setLocalStorageItem } from "../../common";
import {
  IBrand,
  IBrowserInfo,
  IIntegrationMessengerData,
  IIntegrationUiOptions
} from "../../types";
import uploadHandler from "../../uploadHandler";
import { newLineToBr, postMessage, requestBrowserInfo } from "../../utils";
import { connection } from "../connection";
import graphqlTypes from "../graphql";
import { IAttachment, IFaqArticle, IFaqCategory, IMessage } from "../types";

interface IState {
  unreadCount: number;
  sendingMessage: boolean;
  lastSentTypingInfo?: string;
  lastUnreadMessage?: IMessage;
  isMessengerVisible: boolean;
  isSavingNotified: boolean;
  activeRoute: string | "";
  currentWebsiteApp?: string;
  activeConversation: string | null;
  activeFaqCategory: IFaqCategory | null;
  activeFaqArticle: IFaqArticle | null;
  isAttachingFile: boolean;
  isBrowserInfoSaved: boolean;
  headHeight: number;
  botTyping: boolean;
  browserInfo: IBrowserInfo;
  selectedSkill: string | null;
  inputDisabled: boolean;
  errorMessage: string;
}

interface IStore extends IState {
  getColor: () => string;
  getUiOptions: () => IIntegrationUiOptions;
  getBrand: () => IBrand;
  getMessengerData: () => IIntegrationMessengerData;
  onSelectSkill: (skillId: string) => void;
  saveBrowserInfo: () => void;
  toggle: (isVisible?: boolean) => void;
  toggleNotifier: (isVisible?: boolean) => void;
  toggleNotifierFull: (isVisible?: boolean) => void;
  changeRoute: (route: string) => void;
  changeConversation: (converstionId: string) => void;
  goToConversation: (conversationId: string) => void;
  goToWebsiteApp: (name: string) => void;
  goToFaqCategory: (category?: IFaqCategory) => void;
  goToFaqArticle: (article: IFaqArticle) => void;
  goToConversationList: () => void;
  saveGetNotified: (
    doc: { type: string; value: string },
    callback?: () => void
  ) => void;
  endConversation: () => void;
  exportConversation: (callback: (exportData: any) => void) => void;
  readConversation: (conversationId: string) => void;
  readMessages: (conversationId: string) => void;
  replyAutoAnswer: (message: string, payload: string, type: string) => void;
  getBotInitialMessage: (callback: (bodData: any) => void) => void;
  // getMessageSkills: (callback: (data: any) => void) => void;
  changeOperatorStatus: (
    _id: string,
    operatorStatus: string,
    callback: () => void
  ) => void;
  sendMessage: (
    contentType: string,
    message: string,
    attachments?: IAttachment[]
  ) => void;
  sendTypingInfo: (conversationId: string, text: string) => void;
  sendFile: (file: File) => void;
  setHeadHeight: (headHeight: number) => void;
  setUnreadCount: (count: number) => void;
  isLoggedIn: () => boolean;
  setBotTyping: (typing: boolean) => void;
  botTyping: boolean;
  browserInfo: IBrowserInfo;
  selectedSkill: string | null;
  inputDisabled: boolean;
}

export const MESSAGE_TYPES = {
  VIDEO_CALL: "videoCall",
  VIDEO_CALL_REQUEST: "videoCallRequest",
  TEXT: "text",
  ALL: ["videoCall", "videoCallRequest", "text"]
};

const AppContext = React.createContext({} as IStore);

export const AppConsumer = AppContext.Consumer;

export class AppProvider extends React.Component<{}, IState> {
  constructor(props: {}) {
    super(props);

    let activeRoute = "conversationList";
    let inputDisabled = false;

    const { messengerData } = connection.data;
    const { requireAuth, showChat, skillData = {} } = messengerData;

    // if visitor did not give email or phone then ask
    if (!this.isLoggedIn() && requireAuth) {
      activeRoute = "accquireInformation";
    }

    if (!requireAuth && !getLocalStorageItem("hasNotified")) {
      activeRoute = "home";
    }

    if (!showChat) {
      activeRoute = "home";
    }

    const { options = [] } = skillData;

    if (options.length > 0) {
      inputDisabled = true;
    }

    this.state = {
      unreadCount: 0,
      sendingMessage: false,
      lastUnreadMessage: undefined,
      isMessengerVisible: false,
      isSavingNotified: false,
      activeRoute,
      activeConversation: null,
      activeFaqCategory: null,
      activeFaqArticle: null,
      isAttachingFile: false,
      isBrowserInfoSaved: false,
      headHeight: 200,
      botTyping: false,
      browserInfo: {},
      selectedSkill: null,
      inputDisabled,
      errorMessage: ""
    };
  }

  getBrand() {
    return connection.data.brand || {};
  }

  isLoggedIn = () => {
    const { email, phone }: any = connection.setting;

    return email || phone || getLocalStorageItem("getNotifiedType");
  };

  getUiOptions = () => {
    return connection.data.uiOptions || {};
  };

  getColor = () => {
    return this.getUiOptions().color;
  };

  getMessengerData = () => {
    return connection.data.messengerData || {};
  };

  isOnline = () => {
    return this.getMessengerData().isOnline;
  };

  isSmallContainer = () => {
    const { activeRoute } = this.state;

    if (activeRoute === "accquireInformation") {
      return true;
    }

    return false;
  };

  saveBrowserInfo = () => {
    requestBrowserInfo({
      source: "fromMessenger",
      callback: (browserInfo: IBrowserInfo) => {
        const variables = {
          visitorId: connection.data.visitorId,
          customerId: connection.data.customerId,
          browserInfo
        };

        client
          .mutate({
            mutation: gql(graphqlTypes.saveBrowserInfo),
            variables
          })

          .then(({ data: { widgetsSaveBrowserInfo } }: any) => {
            this.setState({
              lastUnreadMessage: widgetsSaveBrowserInfo,
              isBrowserInfoSaved: true,
              browserInfo
            });
          });
      }
    });
  };

  toggle = (isVisible?: boolean) => {
    const { activeRoute } = this.state;

    // notify parent window launcher state
    postMessage("fromMessenger", "messenger", {
      isVisible: !isVisible,
      isSmallContainer: this.isSmallContainer()
    });

    let state: any = { isMessengerVisible: !isVisible };

    if (activeRoute.includes("conversation")) {
      state = { ...state, ...this.prepareOpenLastConversation() };
    }

    this.setState(state);
  };

  setHeadHeight = (headHeight: number) => {
    this.setState({ headHeight });
  };

  toggleNotifier = (isVisible?: boolean) => {
    // notify state
    postMessage("fromMessenger", "notifier", { isVisible: !isVisible });
  };

  toggleNotifierFull = (isVisible?: boolean) => {
    // notify state
    postMessage("fromMessenger", "notifierFull", { isVisible: !isVisible });
  };

  changeRoute = (route: string) => {
    if (
      route === "conversationDetail" &&
      !this.isLoggedIn() &&
      connection.data.messengerData.requireAuth
    ) {
      // if visitor did not give email or phone then ask
      return this.setState({
        activeRoute: "accquireInformation",
        selectedSkill: null
      });
    }

    const { skillData = {} } = connection.data.messengerData;
    const { options = [] } = skillData;

    this.setState({
      activeRoute: route,
      selectedSkill: null,
      inputDisabled: options.length > 0
    });
  };

  changeConversation = (_id: string) => {
    // save last conversationId
    this.setLastConversationId(_id);

    // reset last unread message
    const { lastUnreadMessage } = this.state;

    const options = {
      activeConversation: _id,
      activeRoute: _id ? "conversationDetail" : "conversationCreate",
      lastUnreadMessage
    };

    if (lastUnreadMessage && lastUnreadMessage.conversationId === _id) {
      options.lastUnreadMessage = undefined;
    }

    this.setState(options);
  };

  goToWebsiteApp = (id: string) => {
    this.setState({ currentWebsiteApp: id });

    this.changeRoute("websiteApp");
  };

  goToConversation = (conversationId: string) => {
    this.changeConversation(conversationId);
    this.changeRoute("conversationDetail");
    this.readMessages(conversationId);
  };

  goToFaqCategory = (category?: IFaqCategory) => {
    const { activeFaqCategory } = this.state;
    if (category) {
      this.setState({ activeFaqCategory: category });
    }

    this.setState({
      activeRoute:
        activeFaqCategory || category ? "faqCategory" : "conversationList"
    });
  };

  goToFaqArticle = (article: IFaqArticle) => {
    this.setState({
      activeRoute: "faqArticle",
      activeFaqArticle: article
    });
  };

  goToConversationList = () => {
    // reset current conversation
    this.changeConversation("");

    this.changeRoute("conversationList");
  };

  getLastConversationId = () => {
    const brandConfig = getLocalStorageItem(connection.setting.brand_id) || {};
    return brandConfig.lastConversationId;
  };

  setLastConversationId = (id: string) => {
    const brandId = connection.setting.brand_id;
    const brandConfig = getLocalStorageItem(brandId) || {};

    brandConfig.lastConversationId = id;

    setLocalStorageItem(brandId, brandConfig);
  };

  prepareOpenLastConversation = () => {
    const _id = this.getLastConversationId();

    return {
      activeConversation: _id || "",
      activeRoute: _id ? "conversationDetail" : "conversationCreate"
    };
  };

  saveGetNotified = (
    { type, value }: { type: string; value: string },
    callback?: () => void
  ) => {
    if (!value) {
      return;
    }

    this.setState({ isSavingNotified: true });

    client
      .mutate({
        mutation: gql`
          mutation widgetsSaveCustomerGetNotified(
            $customerId: String
            $visitorId: String
            $type: String!
            $value: String!
          ) {
            widgetsSaveCustomerGetNotified(
              customerId: $customerId
              visitorId: $visitorId
              type: $type
              value: $value
            )
          }
        `,

        variables: {
          customerId: connection.data.customerId,
          visitorId: connection.data.visitorId,
          type,
          value
        }
      })

      // after mutation
      .then(({ data: { widgetsSaveCustomerGetNotified } }: any) => {
        this.setState({ isSavingNotified: false });

        if (callback) {
          callback();
        }

        // cache customerId
        setLocalStorageItem("customerId", widgetsSaveCustomerGetNotified._id);
        connection.data.customerId = widgetsSaveCustomerGetNotified._id;

        // save email
        setLocalStorageItem("getNotifiedType", type);
        setLocalStorageItem("getNotifiedValue", value);

        // redirect to conversation
        this.setState(this.prepareOpenLastConversation());

        // notify parent window launcher state
        postMessage("fromMessenger", "messenger", {
          isVisible: true,
          isSmallContainer: this.isSmallContainer()
        });
      });
  };

  endConversation = () => {
    const setting = connection.setting;

    // ignore this action for inapp
    if (setting.email) {
      return;
    }

    // reset local storage items
    setLocalStorageItem("getNotifiedType", "");
    setLocalStorageItem("getNotifiedValue", "");
    setLocalStorageItem("customerId", "");
    setLocalStorageItem("hasNotified", "");

    this.setLastConversationId("");

    this.toggle(true);
    window.location.reload();
  };

  exportConversation = (callback: (exportData: any) => void) => {
    const { activeConversation } = this.state
    return client.query({
      query: gql(graphqlTypes.widgetExportMessengerDataQuery),
      variables: {
        _id: activeConversation,
        integrationId: connection.data.integrationId
      }
    }).then(({ data }: any) => {
      if (data.widgetExportMessengerData) {
        callback(data.widgetExportMessengerData);
      }
    });
  };

  readConversation = (conversationId: string) => {
    this.toggle();
    this.changeConversation(conversationId);
    this.changeRoute("conversationDetail");
    this.readMessages(conversationId);
    this.toggleNotifier();
    this.toggle();
  };

  readMessages = (conversationId: string) => {
    client
      .mutate({
        mutation: gql(graphqlTypes.readConversationMessages),
        variables: { conversationId },
        refetchQueries: [
          {
            query: gql(graphqlTypes.unreadCountQuery),
            variables: { conversationId }
          }
        ]
      })

      .then(() => {
        this.setUnreadCount(0);
      });
  };

  setBotTyping = (typing: boolean) => {
    this.setState({ botTyping: typing });
  };

  sendTypingInfo = (conversationId: string, text: string) => {
    const { lastSentTypingInfo } = this.state;

    if (lastSentTypingInfo === text) {
      return;
    }

    this.setState({ lastSentTypingInfo: text }, () => {
      client.mutate({
        mutation: gql(graphqlTypes.sendTypingInfo),
        variables: { conversationId, text }
      });
    });
  };

  changeOperatorStatus = (
    _id: string,
    operatorStatus: string,
    callback: () => void
  ) => {
    return client
      .mutate({
        mutation: gql`
          mutation changeConversationOperator(
            $_id: String!
            $operatorStatus: String!
          ) {
            changeConversationOperator(
              _id: $_id
              operatorStatus: $operatorStatus
            )
          }
        `,
        variables: {
          _id,
          operatorStatus
        }
      })
      .then(() => {
        if (callback) {
          callback();
        }
      });
  };

  onSelectSkill = (skillId: string) => {
    this.setState({ selectedSkill: skillId, inputDisabled: false });
  };

  getBotInitialMessage = (callback: (botData: any) => void) => {
    return client
      .mutate({
        mutation: gql`
          mutation widgetGetBotInitialMessage($integrationId: String) {
            widgetGetBotInitialMessage(integrationId: $integrationId)
          }
        `,
        variables: {
          integrationId: connection.data.integrationId
        }
      })
      .then(({ data }) => {
        if (data?.widgetGetBotInitialMessage) {
          callback(data.widgetGetBotInitialMessage);
        }
      });
  };

  replyAutoAnswer = (message: string, payload: string, type: string) => {
    this.setState({ sendingMessage: true });

    return client
      .mutate({
        mutation: gql`
          mutation widgetBotRequest(
            $message: String!
            $payload: String!
            $type: String!
            $conversationId: String
            $customerId: String
            $visitorId: String
            $integrationId: String!
          ) {
            widgetBotRequest(
              message: $message
              payload: $payload
              type: $type
              conversationId: $conversationId
              customerId: $customerId
              visitorId: $visitorId
              integrationId: $integrationId
            )
          }
        `,
        variables: {
          conversationId: this.state.activeConversation,
          integrationId: connection.data.integrationId,
          customerId: connection.data.customerId,
          visitorId: connection.data.visitorId,
          message: newLineToBr(message),
          type,
          payload
        }
      })
      .then(({ data }) => {
        const { conversationId, customerId } = data?.widgetBotRequest;

        setLocalStorageItem("customerId", customerId);
        connection.data.customerId = customerId;

        this.setState({
          sendingMessage: false,
          activeConversation: conversationId
        });
      })
      .catch(() => {
        this.setState({ sendingMessage: false });
      });
  };

  sendMessage = (
    contentType: string,
    message: string,
    attachments?: IAttachment[]
  ) => {
    // current conversation
    const { activeConversation, sendingMessage } = this.state;

    let optimisticResponse;
    let update;

    // generate optimistic response
    if (activeConversation) {
      optimisticResponse = {
        __typename: "Mutation",
        widgetsInsertMessage: {
          __typename: "ConversationMessage",
          _id: Math.round(Math.random() * -1000000),
          contentType: MESSAGE_TYPES.TEXT,
          conversationId: activeConversation,
          customerId: connection.data.customerId,
          user: null,
          content: newLineToBr(message),
          createdAt: Number(new Date()),
          attachments: attachments || [],
          internal: false,
          botData: null,
          fromBot: false,
          messengerAppData: null,
          videoCallData: null,
          engageData: null
        }
      };

      update = (proxy: any, { data: { widgetsInsertMessage } }: any) => {
        const selector = {
          query: gql(graphqlTypes.conversationDetailQuery),
          variables: {
            _id: widgetsInsertMessage.conversationId,
            integrationId: connection.data.integrationId
          }
        };

        // Read data from our cache for this query
        const cacheData = proxy.readQuery(selector);

        const messages = cacheData.widgetsConversationDetail.messages;

        // check duplications
        if (
          !messages.find((m: IMessage) => m._id === widgetsInsertMessage._id)
        ) {
          // Add our message from the mutation to the end
          messages.push(widgetsInsertMessage);

          // Write out data back to the cache
          proxy.writeQuery({ ...selector, data: cacheData });
        }
      };
    }

    // Preventing from creating new conversations
    if (!activeConversation && sendingMessage) {
      return "Already sending";
    }

    this.setState({ sendingMessage: true, errorMessage: "" });

    return (
      client
        .mutate({
          mutation: gql`
            mutation widgetsInsertMessage(
              ${connection.queryVariables}
              $message: String
              $contentType: String
              $conversationId: String
              $attachments: [AttachmentInput]
              $skillId: String
            ) {

            widgetsInsertMessage(
              ${connection.queryParams}
              contentType: $contentType
              message: $message
              conversationId: $conversationId
              attachments: $attachments
              skillId: $skillId
            ) {
              ${graphqlTypes.messageFields}
            }
          }`,

          variables: {
            integrationId: connection.data.integrationId,
            customerId: connection.data.customerId,
            visitorId: connection.data.visitorId,
            conversationId: activeConversation,
            skillId: this.state.selectedSkill,
            contentType,
            message: newLineToBr(message),
            attachments
          },
          optimisticResponse,
          update
        })

        // after mutation
        .then(({ data }: any) => {
          this.setState({ sendingMessage: false });

          const { widgetsInsertMessage } = data;

          if (!activeConversation) {
            this.changeConversation(widgetsInsertMessage.conversationId);
          }

          if (!connection.data.customerId) {
            connection.data.customerId = widgetsInsertMessage.customerId;
            connection.data.visitorId = null;
            setLocalStorageItem("customerId", widgetsInsertMessage.customerId);
          }
        })

        .catch((e: Error) => {
          this.setState({
            sendingMessage: false,
            errorMessage:
              e && e.message ? e.message.replace("GraphQL error: ", "") : ""
          });
        })
    );
  };

  sendFile = (file: File) => {
    const self = this;

    uploadHandler({
      file,

      beforeUpload() {
        self.setState({ isAttachingFile: true });
      },

      // upload to server
      afterUpload({ response, fileInfo }: { response: any; fileInfo: any }) {
        self.setState({ isAttachingFile: false });

        const attachment = { url: response, ...fileInfo };

        // send message with attachment
        self.sendMessage(MESSAGE_TYPES.TEXT, "This message has an attachment", [
          attachment
        ]);
      },

      onError: message => {
        alert(message);
        self.setState({ isAttachingFile: false });
      }
    });
  };

  setUnreadCount = (count: number) => {
    this.setState({ unreadCount: count });
  };

  public render() {
    return (
      <AppContext.Provider
        value={{
          ...this.state,
          getColor: this.getColor,
          getUiOptions: this.getUiOptions,
          getBrand: this.getBrand,
          getMessengerData: this.getMessengerData,
          saveBrowserInfo: this.saveBrowserInfo,
          toggle: this.toggle,
          toggleNotifier: this.toggleNotifier,
          toggleNotifierFull: this.toggleNotifierFull,
          changeRoute: this.changeRoute,
          changeConversation: this.changeConversation,
          goToWebsiteApp: this.goToWebsiteApp,
          goToConversation: this.goToConversation,
          goToFaqCategory: this.goToFaqCategory,
          goToFaqArticle: this.goToFaqArticle,
          goToConversationList: this.goToConversationList,
          saveGetNotified: this.saveGetNotified,
          endConversation: this.endConversation,
          exportConversation: this.exportConversation,
          readConversation: this.readConversation,
          readMessages: this.readMessages,
          replyAutoAnswer: this.replyAutoAnswer,
          getBotInitialMessage: this.getBotInitialMessage,
          onSelectSkill: this.onSelectSkill,
          changeOperatorStatus: this.changeOperatorStatus,
          sendMessage: this.sendMessage,
          sendTypingInfo: this.sendTypingInfo,
          setBotTyping: this.setBotTyping,
          sendFile: this.sendFile,
          setHeadHeight: this.setHeadHeight,
          setUnreadCount: this.setUnreadCount,
          isLoggedIn: this.isLoggedIn,
          browserInfo: this.state.browserInfo,
          inputDisabled: this.state.inputDisabled
        }}
      >
        {this.props.children}
      </AppContext.Provider>
    );
  }
}
