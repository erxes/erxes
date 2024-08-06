import * as React from 'react';
import { createContext, useContext, useState } from 'react';
import { getLocalStorageItem, setLocalStorageItem } from '../../common';
import { connection } from '../connection';
import { IMessage } from '../types';
import { useRouter } from './Router';
import { postMessage, requestBrowserInfo } from '../../utils';
import {
  READ_CONVERSATION_MESSAGES_MUTATION,
  SAVE_BROWSER_INFO,
  SEND_TYPING_INFO_MUTATION,
  WIDGETS_SAVE_CUSTOMER_GET_NOTIFIED,
  WIDGET_GET_BOT_INTIAL_MESSAGE,
} from '../graphql/mutations';
import { useLazyQuery, useMutation } from '@apollo/react-hooks';
import {
  GET_UNREAD_COUNT,
  GET_WIDGET_EXPORT_MESSENGER_DATA,
} from '../graphql/queries';
import { toggleNotifier } from '../utils/util';
import { IBrowserInfo } from '../../types';

interface ConversationContextType {
  activeConversationId: string | null;
  isMessengerVisible: boolean;
  setActiveConversationId: (id: string) => void;
  changeConversation: (converstionId: string) => void;
  setLastConversationId: (converstionId: string) => void;
  goToConversation: (conversationId: string) => void;
  goToConversationList: () => void;
  getLastConversationId: () => void;
  prepareOpenLastConversation: () => void;
  endConversation: () => void;
  exportConversation: (e: any) => (callback: (exportData: any) => void) => void;
  readConversation: (conversationId: string) => void;
  toggle: (isVisible?: boolean) => void;
  saveGetNotified: (
    doc: { type: string; value: string },
    callback?: () => void
  ) => void;
  isSavingNotified: boolean;
  lastUnreadMessage?: IMessage;
  setLastUnreadMessage: (val: IMessage) => void;
  setUnreadCount: (count: number) => void;
  getBotInitialMessage: (callback: (bodData: any) => void) => void;
  sendTypingInfo: (conversationId: string, text: string) => void;
  readMessages: (conversationId: string) => void;
  unreadCount: number;
  isBotTyping: boolean;
  setIsBotTyping: (bool: boolean) => void;
  createConversation: () => void;
  browserInfo: IBrowserInfo;
  isBrowserInfoSaved: boolean;
}

const ConversationContext = createContext<ConversationContextType>(
  {} as ConversationContextType
);

export const ConversationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { activeRoute, setRoute, isSmallContainer, setActiveRoute } =
    useRouter();

  const [lastUnreadMessage, setLastUnreadMessage] = useState<
    IMessage | undefined
  >(undefined);

  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isBrowserInfoSaved, setIsBrowserInfoSaved] = useState(false);
  const [browserInfo, setBrowserInfo] = useState<IBrowserInfo>({});
  const [activeConversationId, setActiveConversationId] = useState('');
  const [isMessengerVisible, setIsMessengerVisible] = useState(false);
  const [isSavingNotified, setIsSavingNotified] = useState(false);
  const [lastSentTypingInfo, setLastSentTypingInfo] = useState<
    string | undefined
  >(undefined);
  const [unreadCount, setUnreadCount] = useState(0);

  const [mutateSendTypingInfo] = useMutation(SEND_TYPING_INFO_MUTATION);

  const [mutateReadConversationMessages] = useMutation(
    READ_CONVERSATION_MESSAGES_MUTATION
  );
  const [mutateWidgetsSaveCustomerGetNotified] = useMutation(
    WIDGETS_SAVE_CUSTOMER_GET_NOTIFIED
  );

  const [mutateWidgetGetBotInitialMessage] = useMutation(
    WIDGET_GET_BOT_INTIAL_MESSAGE
  );
  const [mutateSaveBrowserInfo] = useMutation(SAVE_BROWSER_INFO);

  React.useEffect(() => {
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

          mutateSaveBrowserInfo({
            variables,
            onCompleted(data) {
              const { widgetsSaveBrowserInfo } = data || {};

              setIsBrowserInfoSaved(true);
              setLastUnreadMessage(widgetsSaveBrowserInfo);
              setBrowserInfo(browserInfo);
            },
          });
        },
      });
    };
    saveBrowserInfo();
  }, [mutateSaveBrowserInfo, requestBrowserInfo]);

  const getBotInitialMessage = (callback: (botData: any) => void) => {
    return mutateWidgetGetBotInitialMessage({
      variables: {
        integrationId: connection.data.integrationId,
      },
      onCompleted(data) {
        if (data && data.widgetGetBotInitialMessage) {
          callback(data.widgetGetBotInitialMessage);
        }
      },
    });
  };
  const setLastConversationId = (id: string) => {
    const brandId = connection.setting.brand_id;
    const brandConfig = getLocalStorageItem(brandId) || {};

    brandConfig.lastConversationId = id;

    setLocalStorageItem(brandId, brandConfig);
  };

  const changeConversation = (_id: string) => {
    // save last conversationId
    setLastConversationId(_id);

    // reset last unread message

    const options = {
      activeConversation: _id,
      activeRoute: _id ? 'conversationDetail' : 'conversationCreate',
      lastUnreadMessage,
    };

    if (lastUnreadMessage && lastUnreadMessage.conversationId === _id) {
      options.lastUnreadMessage = undefined;
    }
    setActiveConversationId(_id);
  };

  const readMessages = (conversationId: string) => {
    mutateReadConversationMessages({
      variables: { conversationId },
      refetchQueries: [
        {
          query: GET_UNREAD_COUNT,
          variables: { conversationId },
        },
      ],
      onCompleted: () => {
        setUnreadCount(0);
      },
    });
  };

  const goToConversation = (conversationId: string) => {
    changeConversation(conversationId);
    setRoute('conversationDetail');
    readMessages(conversationId);
  };

  const goToConversationList = () => {
    // reset current conversation
    changeConversation('');

    setRoute('conversationList');
  };

  const getLastConversationId = () => {
    const brandConfig = getLocalStorageItem(connection.setting.brand_id) || {};
    return brandConfig.lastConversationId;
  };

  const toggle = (isVisible?: boolean) => {
    // notify parent window launcher state
    postMessage('fromMessenger', 'messenger', {
      isVisible: !isMessengerVisible,
      isSmallContainer,
    });

    setIsMessengerVisible(!isMessengerVisible);

    if (activeRoute.includes('conversation')) {
      prepareOpenLastConversation();
    }
  };

  const prepareOpenLastConversation = () => {
    const _id = getLastConversationId();

    setActiveConversationId(_id || '');
    setRoute(_id ? 'conversationDetail' : 'conversationCreate');
  };

  const endConversation = () => {
    const { setting } = connection;

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

  const [getWidgetExportMessengerData] = useLazyQuery(
    GET_WIDGET_EXPORT_MESSENGER_DATA
  );

  const exportConversation: any = async (
    callback: (exportData: any) => void
  ) => {
    return getWidgetExportMessengerData({
      onCompleted(data) {
        if (data.widgetExportMessengerData) {
          callback(data.widgetExportMessengerData);
        }
      },
    });
  };

  const readConversation = (conversationId: string) => {
    toggle();
    changeConversation(conversationId);
    setRoute('conversationDetail');
    readMessages(conversationId);
    toggleNotifier();
    toggle();
  };

  const saveGetNotified = (
    { type, value }: { type: string; value: string },
    callback?: () => void
  ) => {
    if (!value) {
      return;
    }

    setIsSavingNotified(true);
    mutateWidgetsSaveCustomerGetNotified({
      variables: {
        customerId: connection.data.customerId,
        visitorId: connection.data.visitorId,
        type,
        value,
      },
      // after mutation
      onCompleted(data) {
        const { widgetsSaveCustomerGetNotified } = data || {};
        setIsSavingNotified(false);

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
        prepareOpenLastConversation();

        // notify parent window launcher state
        postMessage('fromMessenger', 'messenger', {
          isVisible: true,
          isSmallContainer: isSmallContainer,
        });

        const messengerDataJson = getLocalStorageItem('messengerDataJson');
        const messengerData = JSON.parse(messengerDataJson);
        messengerData.customerId = widgetsSaveCustomerGetNotified._id;
        setLocalStorageItem('messengerDataJson', JSON.stringify(messengerData));

        // wsLink.restart();
      },
    });
  };

  const createConversation = () => {
    setActiveConversationId('');
    setActiveRoute('conversationCreate');
  };

  const sendTypingInfo = (conversationId: string, text: string) => {
    if (lastSentTypingInfo === text) {
      return;
    }

    setLastSentTypingInfo(text);

    mutateSendTypingInfo({
      variables: { conversationId, text },
    });
  };

  return (
    <ConversationContext.Provider
      value={{
        activeConversationId,
        isMessengerVisible,
        setActiveConversationId,
        changeConversation,
        setLastConversationId,
        goToConversation,
        goToConversationList,
        getLastConversationId,
        prepareOpenLastConversation,
        endConversation,
        exportConversation,
        readConversation,
        toggle,
        saveGetNotified,
        isSavingNotified,
        lastUnreadMessage,
        setLastUnreadMessage,
        setUnreadCount,
        getBotInitialMessage,
        sendTypingInfo,
        readMessages,
        unreadCount,
        isBotTyping,
        setIsBotTyping,
        createConversation,
        isBrowserInfoSaved,
        browserInfo,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversation = () => useContext(ConversationContext);
