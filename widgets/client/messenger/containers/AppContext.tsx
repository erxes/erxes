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
import { postMessage, requestBrowserInfo } from "../../utils";
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
  activeConversation: string | null;
  activeFaqCategory: IFaqCategory | null;
  activeFaqArticle: IFaqArticle | null;
  isAttachingFile: boolean;
  isBrowserInfoSaved: boolean;
  headHeight: number;
}

interface IStore extends IState {
  getColor: () => string;
  getUiOptions: () => IIntegrationUiOptions;
  getBrand: () => IBrand;
  getMessengerData: () => IIntegrationMessengerData;
  saveBrowserInfo: () => void;
  toggle: (isVisible?: boolean) => void;
  toggleNotifier: (isVisible?: boolean) => void;
  toggleNotifierFull: (isVisible?: boolean) => void;
  changeRoute: (route: string) => void;
  changeConversation: (converstionId: string) => void;
  goToConversation: (conversationId: string) => void;
  goToFaqCategory: (category?: IFaqCategory) => void;
  goToFaqArticle: (article: IFaqArticle) => void;
  goToConversationList: () => void;
  saveGetNotified: (
    doc: { type: string; value: string },
    callback?: () => void
  ) => void;
  endConversation: () => void;
  readConversation: (conversationId: string) => void;
  readMessages: (conversationId: string) => void;
  sendMessage: (message: string, attachments?: IAttachment[]) => void;
  sendTypingInfo: (conversationId: string, text: string) => void;
  sendFile: (file: File) => void;
  setHeadHeight: (headHeight: number) => void;
  setUnreadCount: (count: number) => void;
  isLoggedIn: () => boolean;
}

const AppContext = React.createContext({} as IStore);

export const AppConsumer = AppContext.Consumer;

export class AppProvider extends React.Component<{}, IState> {
  constructor(props: {}) {
    super(props);

    let activeRoute = "conversationList";

    const { messengerData } = connection.data;
    const { requireAuth, showChat } = messengerData;

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
      headHeight: 200
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
              isBrowserInfoSaved: true
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
      return this.setState({ activeRoute: "accquireInformation" });
    }

    this.setState({ activeRoute: route });
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
            $customerId: String!
            $type: String!
            $value: String!
          ) {
            widgetsSaveCustomerGetNotified(
              customerId: $customerId
              type: $type
              value: $value
            )
          }
        `,

        variables: {
          customerId: connection.data.customerId,
          type,
          value
        }
      })

      // after mutation
      .then(() => {
        this.setState({ isSavingNotified: false });

        if (callback) {
          callback();
        }

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

  readConversation = (conversationId: string) => {
    this.toggle();
    this.changeConversation(conversationId);
    this.changeRoute("conversationDetail");
    this.readMessages(conversationId);
    this.toggleNotifier();
    this.toggle();
  };

  readMessages = (conversationId: string) => {
    if (this.state.unreadCount === 0) {
      return;
    }

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

  sendMessage = (message: string, attachments?: IAttachment[]) => {
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
          conversationId: activeConversation,
          customerId: connection.data.customerId,
          user: null,
          content: message,
          createdAt: Number(new Date()),
          attachments: attachments || [],
          internal: false,
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

    this.setState({ sendingMessage: true });

    return (
      client
        .mutate({
          mutation: gql`
            mutation widgetsInsertMessage(
              ${connection.queryVariables}
              $message: String
              $conversationId: String
              $attachments: [AttachmentInput]
            ) {

            widgetsInsertMessage(
              ${connection.queryParams}
              message: $message
              conversationId: $conversationId
              attachments: $attachments
            ) {
              ${graphqlTypes.messageFields}
            }
          }`,

          variables: {
            integrationId: connection.data.integrationId,
            customerId: connection.data.customerId,
            conversationId: activeConversation,
            message,
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
        })

        .catch((e: Error) => {
          this.setState({ sendingMessage: false });
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
        self.sendMessage("This message has an attachment", [attachment]);
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
          goToConversation: this.goToConversation,
          goToFaqCategory: this.goToFaqCategory,
          goToFaqArticle: this.goToFaqArticle,
          goToConversationList: this.goToConversationList,
          saveGetNotified: this.saveGetNotified,
          endConversation: this.endConversation,
          readConversation: this.readConversation,
          readMessages: this.readMessages,
          sendMessage: this.sendMessage,
          sendTypingInfo: this.sendTypingInfo,
          sendFile: this.sendFile,
          setHeadHeight: this.setHeadHeight,
          setUnreadCount: this.setUnreadCount,
          isLoggedIn: this.isLoggedIn
        }}
      >
        {this.props.children}
      </AppContext.Provider>
    );
  }
}
