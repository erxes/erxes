import gql from 'graphql-tag';
import * as React from 'react';
import { useContext, createContext, useState } from 'react';
import client, { wsLink } from '../../apollo-client';
import { getLocalStorageItem, setLocalStorageItem } from '../../common';
import {
  IBrand,
  IBrowserInfo,
  IIntegrationMessengerData,
  IIntegrationUiOptions,
} from '../../types';
import uploadHandler from '../../uploadHandler';
import { newLineToBr, postMessage, requestBrowserInfo } from '../../utils';
import { connection } from '../connection';
import graphqlTypes from '../graphql';
import { IAttachment, IFaqArticle, IFaqCategory, IMessage } from '../types';

interface IState {
  unreadCount: number;
  sendingMessage: boolean;
  lastSentTypingInfo?: string;
  lastUnreadMessage?: IMessage;
  isMessengerVisible: boolean;
  isSavingNotified: boolean;
  activeRoute: string | '';
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
  VIDEO_CALL: 'videoCall',
  VIDEO_CALL_REQUEST: 'videoCallRequest',
  TEXT: 'text',
  ALL: ['videoCall', 'videoCallRequest', 'text'],
};

// Create the AppContext
const AppContext = createContext({} as IStore);

// Custom hook to use the AppContext
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<IState>(() => {
    let activeRoute = 'conversationList';
    let inputDisabled = false;

    const { messengerData } = connection.data;
    const { requireAuth, showChat, skillData = {} } = messengerData;

    // Check conditions and update activeRoute and inputDisabled accordingly
    if (!isLoggedIn() && requireAuth) {
      activeRoute = 'accquireInformation';
    }

    if (!requireAuth && !getLocalStorageItem('hasNotified')) {
      activeRoute = 'home';
    }

    if (!showChat) {
      activeRoute = 'home';
    }

    const { options = [] } = skillData;

    if (options.length > 0) {
      inputDisabled = true;
    }

    // Return the initial state object based on computed values
    return {
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
      errorMessage: '',
    };
  });

  const getBrand = () => {
    return connection.data.brand || {};
  };

  const isLoggedIn = () => {
    const { email, phone }: any = connection.setting;

    return email || phone || getLocalStorageItem('getNotifiedType');
  };

  const getUiOptions = () => {
    return connection.data.uiOptions || {};
  };

  const getColor = () => {
    return getUiOptions().color;
  };

  const getMessengerData = () => {
    return connection.data.messengerData || {};
  };

  const isOnline = () => {
    return getMessengerData().isOnline;
  };

  const isSmallContainer = () => {
    const { activeRoute } = state;

    if (activeRoute === 'accquireInformation') {
      return true;
    }

    return false;
  };

  const saveBrowserInfo = () => {
    requestBrowserInfo({
      source: 'fromMessenger',
      callback: (browserInfo: IBrowserInfo) => {
        connection.browserInfo = browserInfo;

        const variables = {
          visitorId: connection.data.visitorId,
          customerId: connection.data.customerId,
          browserInfo,
        };

        client
          .mutate({
            mutation: gql(graphqlTypes.saveBrowserInfo),
            variables,
          })

          .then(({ data: { widgetsSaveBrowserInfo } }: any) => {
            setState((prevState) => ({
              ...prevState,
              lastUnreadMessage: widgetsSaveBrowserInfo,
              isBrowserInfoSaved: true,
              browserInfo,
            }));
          });
      },
    });
  };

  const toggle = (isVisible?: boolean) => {
    const { activeRoute } = state;

    // notify parent window launcher state
    postMessage('fromMessenger', 'messenger', {
      isVisible: !isVisible,
      isSmallContainer: isSmallContainer(),
    });

    let newState: any = { ...state, isMessengerVisible: !isVisible };

    if (activeRoute.includes('conversation')) {
      newState = { ...newState, ...prepareOpenLastConversation() };
    }

    setState(newState);
  };

  const setHeadHeight = (headHeight: number) => {
    setState((prevState) => ({
      ...prevState,
      headHeight,
    }));
  };

  const toggleNotifier = (isVisible?: boolean) => {
    // notify state
    postMessage('fromMessenger', 'notifier', { isVisible: !isVisible });
  };

  const toggleNotifierFull = (isVisible?: boolean) => {
    // notify state
    postMessage('fromMessenger', 'notifierFull', { isVisible: !isVisible });
  };

  const changeRoute = (route: string) => {
    if (
      route === 'conversationDetail' &&
      !isLoggedIn() &&
      connection.data.messengerData.requireAuth
    ) {
      // if visitor did not give email or phone then ask
      setState((prevState) => ({
        ...prevState,
        activeRoute: 'accquireInformation',
        selectedSkill: null,
      }));
      return;
    }

    const { skillData = {} } = connection.data.messengerData;
    const { options = [] } = skillData;
    setState((prevState) => ({
      ...prevState,
      activeRoute: route,
      selectedSkill: null,
      inputDisabled: options.length > 0,
    }));
  };

  const changeConversation = (_id: string) => {
    // save last conversationId
    setLastConversationId(_id);

    // reset last unread message
    const { lastUnreadMessage } = state;

    const options = {
      activeConversation: _id,
      activeRoute: _id ? 'conversationDetail' : 'conversationCreate',
      lastUnreadMessage,
    };

    if (lastUnreadMessage && lastUnreadMessage.conversationId === _id) {
      options.lastUnreadMessage = undefined;
    }

    setState((prevState) => ({
      ...prevState,
      options,
    }));
  };

  const goToWebsiteApp = (id: string) => {
    setState((prevState) => ({
      ...prevState,
      currentWebsiteApp: id,
    }));

    changeRoute('websiteApp');
  };

  const goToConversation = (conversationId: string) => {
    changeConversation(conversationId);
    changeRoute('conversationDetail');
    readMessages(conversationId);
  };

  const goToFaqCategory = (category?: IFaqCategory) => {
    const { activeFaqCategory } = state;
    if (category) {
      setState((prevState) => ({
        ...prevState,
        activeFaqCategory: category,
      }));
    }
    setState((prevState) => ({
      ...prevState,
      activeRoute:
        activeFaqCategory || category ? 'faqCategory' : 'conversationList',
    }));
  };

  const goToFaqArticle = (article: IFaqArticle) => {
    setState((prevState) => ({
      ...prevState,
      activeRoute: 'faqArticle',
      activeFaqArticle: article,
    }));
  };

  const goToConversationList = () => {
    // reset current conversation
    changeConversation('');

    changeRoute('conversationList');
  };

  const getLastConversationId = () => {
    const brandConfig = getLocalStorageItem(connection.setting.brand_id) || {};
    return brandConfig.lastConversationId;
  };

  const setLastConversationId = (id: string) => {
    const brandId = connection.setting.brand_id;
    const brandConfig = getLocalStorageItem(brandId) || {};

    brandConfig.lastConversationId = id;

    setLocalStorageItem(brandId, brandConfig);
  };

  const prepareOpenLastConversation = () => {
    const _id = getLastConversationId();

    return {
      activeConversation: _id || '',
      activeRoute: _id ? 'conversationDetail' : 'conversationCreate',
    };
  };

  const saveGetNotified = (
    { type, value }: { type: string; value: string },
    callback?: () => void
  ) => {
    if (!value) {
      return;
    }

    setState((prevState) => ({
      ...prevState,
      isSavingNotified: true,
    }));

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
          value,
        },
      })

      // after mutation
      .then(({ data: { widgetsSaveCustomerGetNotified } }: any) => {
        setState((prevState) => ({
          ...prevState,
          isSavingNotified: false,
        }));

        if (callback) {
          callback();
        }

        // cache customerId
        setLocalStorageItem('customerId', widgetsSaveCustomerGetNotified._id);
        connection.data.customerId = widgetsSaveCustomerGetNotified._id;

        // save email
        setLocalStorageItem('getNotifiedType', type);
        setLocalStorageItem('getNotifiedValue', value);

        // redirect to conversation
        setState((prevState) => ({
          ...prevState,
          ...prepareOpenLastConversation(),
        }));

        // notify parent window launcher state
        postMessage('fromMessenger', 'messenger', {
          isVisible: true,
          isSmallContainer: isSmallContainer(),
        });

        const messengerDataJson = getLocalStorageItem('messengerDataJson');
        const messengerData = JSON.parse(messengerDataJson);
        messengerData.customerId = widgetsSaveCustomerGetNotified._id;
        setLocalStorageItem('messengerDataJson', JSON.stringify(messengerData));

        wsLink.restart();
      });
  };

  const endConversation = () => {
    const setting = connection.setting;

    // ignore this action for inapp
    if (setting.email) {
      return;
    }

    // reset local storage items
    setLocalStorageItem('getNotifiedType', '');
    setLocalStorageItem('getNotifiedValue', '');
    setLocalStorageItem('customerId', '');
    setLocalStorageItem('hasNotified', '');

    setLastConversationId('');

    toggle(true);
    window.location.reload();
  };

  const exportConversation = (callback: (exportData: any) => void) => {
    const { activeConversation } = state;
    return client
      .query({
        query: gql(graphqlTypes.widgetExportMessengerDataQuery),
        variables: {
          _id: activeConversation,
          integrationId: connection.data.integrationId,
        },
      })
      .then(({ data }: any) => {
        if (data.widgetExportMessengerData) {
          callback(data.widgetExportMessengerData);
        }
      });
  };

  const readConversation = (conversationId: string) => {
    toggle();
    changeConversation(conversationId);
    changeRoute('conversationDetail');
    readMessages(conversationId);
    toggleNotifier();
    toggle();
  };

  const readMessages = (conversationId: string) => {
    client
      .mutate({
        mutation: gql(graphqlTypes.readConversationMessages),
        variables: { conversationId },
        refetchQueries: [
          {
            query: gql(graphqlTypes.unreadCountQuery),
            variables: { conversationId },
          },
        ],
      })

      .then(() => {
        setUnreadCount(0);
      });
  };

  const setBotTyping = (typing: boolean) => {
    setState((prevState) => ({
      ...prevState,
      botTyping: typing,
    }));
  };

  const sendTypingInfo = (conversationId: string, text: string) => {
    const { lastSentTypingInfo } = state;

    if (lastSentTypingInfo === text) {
      return;
    }
    setState((prevState) => ({
      ...prevState,
      lastSentTypingInfo: text,
    }));

    client.mutate({
      mutation: gql(graphqlTypes.sendTypingInfo),
      variables: { conversationId, text },
    });
  };

  const changeOperatorStatus = (
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
          operatorStatus,
        },
      })
      .then(() => {
        if (callback) {
          callback();
        }
      });
  };

  const onSelectSkill = (skillId: string) => {
    setState((prevState) => ({
      ...prevState,
      selectedSkill: skillId,
      inputDisabled: false,
    }));
  };

  const getBotInitialMessage = (callback: (botData: any) => void) => {
    return client
      .mutate({
        mutation: gql`
          mutation widgetGetBotInitialMessage($integrationId: String) {
            widgetGetBotInitialMessage(integrationId: $integrationId)
          }
        `,
        variables: {
          integrationId: connection.data.integrationId,
        },
      })
      .then(({ data }) => {
        if (data && data.widgetGetBotInitialMessage) {
          callback(data.widgetGetBotInitialMessage);
        }
      });
  };

  const replyAutoAnswer = (message: string, payload: string, type: string) => {
    setState((prevState) => ({
      ...prevState,
      sendingMessage: true,
    }));

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
          conversationId: state.activeConversation,
          integrationId: connection.data.integrationId,
          customerId: connection.data.customerId,
          visitorId: connection.data.visitorId,
          message: newLineToBr(message),
          type,
          payload,
        },
      })
      .then(({ data }) => {
        if (!data) {
          setState((prevState) => ({
            ...prevState,
            sendingMessage: false,
          }));
          return;
        }

        const { conversationId, customerId } = data.widgetBotRequest;

        setLocalStorageItem('customerId', customerId);
        connection.data.customerId = customerId;

        setState((prevState) => ({
          ...prevState,
          sendingMessage: false,
          activeConversation: conversationId,
        }));
      })
      .catch(() => {
        setState((prevState) => ({
          ...prevState,
          sendingMessage: false,
        }));
      });
  };

  const sendMessage = (
    contentType: string,
    message: string,
    attachments?: IAttachment[]
  ) => {
    // current conversation
    const { activeConversation, sendingMessage } = state;

    let optimisticResponse;
    let update;

    // generate optimistic response
    if (activeConversation) {
      optimisticResponse = {
        __typename: 'Mutation',
        widgetsInsertMessage: {
          __typename: 'ConversationMessage',
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
          engageData: null,
        },
      };

      update = (proxy: any, { data: { widgetsInsertMessage } }: any) => {
        const selector = {
          query: gql(
            graphqlTypes.conversationDetailQuery(
              connection.enabledServices.dailyco
            )
          ),
          variables: {
            _id: widgetsInsertMessage.conversationId,
            integrationId: connection.data.integrationId,
          },
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
      return 'Already sending';
    }

    setState((prevState) => ({
      ...prevState,
      sendingMessage: true,
      errorMessage: '',
    }));

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
            skillId: state.selectedSkill,
            contentType,
            message: newLineToBr(message),
            attachments,
          },
          optimisticResponse,
          update,
        })

        // after mutation
        .then(({ data }: any) => {
          setState((prevState) => ({
            ...prevState,
            sendingMessage: false,
          }));

          const { widgetsInsertMessage } = data;

          if (!activeConversation) {
            changeConversation(widgetsInsertMessage.conversationId);
          }

          if (!connection.data.customerId) {
            connection.data.customerId = widgetsInsertMessage.customerId;
            connection.data.visitorId = null;
            setLocalStorageItem('customerId', widgetsInsertMessage.customerId);
          }
        })

        .catch((e: Error) => {
          setState((prevState) => ({
            ...prevState,
            sendingMessage: false,
            errorMessage:
              e && e.message ? e.message.replace('GraphQL error: ', '') : '',
          }));
        })
    );
  };

  const sendFile = (file: File) => {
    uploadHandler({
      file,

      beforeUpload() {
        setState((prevState) => ({
          ...prevState,
          isAttachingFile: true,
        }));
      },

      // upload to server
      afterUpload({ response, fileInfo }: { response: any; fileInfo: any }) {
        setState((prevState) => ({
          ...prevState,
          isAttachingFile: false,
        }));

        const attachment = { url: response, ...fileInfo };

        // send message with attachment

        sendMessage(MESSAGE_TYPES.TEXT, 'This message has an attachment', [
          attachment,
        ]);
      },

      onError: (message) => {
        alert(message);
        setState((prevState) => ({
          ...prevState,
          isAttachingFile: false,
        }));
      },
    });
  };

  const setUnreadCount = (count: number) => {
    setState((prevState) => ({
      ...prevState,
      unreadCount: count,
    }));
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        getColor,
        getUiOptions,
        getBrand,
        getMessengerData,
        saveBrowserInfo,
        toggle,
        toggleNotifier,
        toggleNotifierFull,
        changeRoute,
        changeConversation,
        goToWebsiteApp,
        goToConversation,
        goToFaqCategory,
        goToFaqArticle,
        goToConversationList,
        saveGetNotified,
        endConversation,
        exportConversation,
        readConversation,
        readMessages,
        replyAutoAnswer,
        getBotInitialMessage,
        onSelectSkill,
        changeOperatorStatus,
        sendMessage,
        sendTypingInfo,
        setBotTyping,
        sendFile,
        setHeadHeight,
        setUnreadCount,
        isLoggedIn,
        browserInfo: state.browserInfo,
        inputDisabled: state.inputDisabled,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
