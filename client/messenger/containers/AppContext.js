import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import client from '../../apollo-client';
import { postMessage, requestBrowserInfo } from '../../utils';
import { connection, getLocalStorageItem, setLocalStorageItem } from '../connection';
import uploadHandler from '../../uploadHandler';
import graphqlTypes from '../graphql';

const AppContext = React.createContext();

export const AppConsumer = AppContext.Consumer;

export class AppProvider extends React.Component {
  constructor(props) {
    super(props);

    let activeRoute = 'conversationList';

    // if visitor did not give email or phone then ask
    if (!this.isLoggedIn()) {
      activeRoute = 'accquireInformation';
    }

    this.state = {
      lastUnreadMessage: null,
      isMessengerVisible: false,
      activeRoute,
      activeConversation: '',
      isAttachingFile: false,
      isBrowserInfoSaved: false,
    }

    this.saveBrowserInfo = this.saveBrowserInfo.bind(this);
    this.toggle = this.toggle.bind(this);
    this.changeRoute = this.changeRoute.bind(this);
    this.changeConversation = this.changeConversation.bind(this);
    this.goToConversation = this.goToConversation.bind(this);
    this.goToConversationList = this.goToConversationList.bind(this);
    this.openLastConversation = this.openLastConversation.bind(this);
    this.saveGetNotified = this.saveGetNotified.bind(this);
    this.endConversation = this.endConversation.bind(this);
    this.readConversation = this.readConversation.bind(this);
    this.readMessages = this.readMessages.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.sendFile = this.sendFile.bind(this);
  }

  isLoggedIn() {
    const { email, phone } = connection.setting;
    return email || phone || getLocalStorageItem('getNotifiedType');
  }

  isSmallContainer() {
    const { activeRoute } = this.state;

    if(activeRoute === 'accquireInformation') {
      return true;
    }

    return false;
  }

  saveBrowserInfo() {
    requestBrowserInfo({
      source: 'fromMessenger',
      callback: (browserInfo) => {
        const variables = {
          customerId: connection.data.customerId,
          browserInfo
        };

        client.mutate({
          mutation: gql(graphqlTypes.saveBrowserInfo),
          variables,
        })

        .then(({ data: { saveBrowserInfo } }) => {
          this.setState({
            lastUnreadMessage: saveBrowserInfo,
            isBrowserInfoSaved: true
          });
        });
      }
    })
  }

  toggle(isVisible) {
    const { activeRoute } = this.state;

    // notify parent window launcher state
    postMessage(
      'fromMessenger',
      'messenger',
      { isVisible: !isVisible, isSmallContainer: this.isSmallContainer() }
    );

    this.setState({ isMessengerVisible: !isVisible });

    if (activeRoute.includes('conversation')) {
      this.openLastConversation();
    }
  }

  toggleNotifier(isVisible) {
    // notify state
    postMessage('fromMessenger', 'notifier', { isVisible: !isVisible });
  }

  toggleNotifierFull(isVisible) {
    // notify state
    postMessage('fromMessenger', 'notifierFull', { isVisible: !isVisible });
  }

  changeRoute(route) {
    if (route === 'conversationDetail' && !this.isLoggedIn()) {
      // if visitor did not give email or phone then ask
      return this.setState({ activeRoute: 'accquireInformation' });
    }

    this.setState({ activeRoute: route });
  }

  changeConversation(_id) {
    // save last conversationId
    setLocalStorageItem('lastConversationId', _id);

    const options = {
      activeConversation: _id,
      activeRoute: _id ? 'conversationDetail' : 'conversationCreate'
    };

    // reset last unread message
    const { lastUnreadMessage } = this.state;

    if (lastUnreadMessage && lastUnreadMessage.conversationId === _id) {
      options.lastUnreadMessage = null;
    }

    this.setState(options);
  }

  goToConversation(conversationId) {
    this.changeConversation(conversationId);
    this.changeRoute('conversationDetail');
    this.readMessages(conversationId);
  }

  goToConversationList() {
    // reset current conversation
    this.changeConversation('');

    this.changeRoute('conversationList');
  }

  openLastConversation() {
    const _id = getLocalStorageItem('lastConversationId');

    this.setState({
      activeConversation: _id || '',
      activeRoute: _id ? 'conversationDetail' : 'conversationCreate'
    });
  }

  saveGetNotified({ type, value }) {
    if (!value) {
      return;
    }

    client.mutate({
      mutation: gql`
        mutation saveCustomerGetNotified($customerId: String!, $type: String!, $value: String!) {
          saveCustomerGetNotified(customerId: $customerId, type: $type, value: $value)
        }`,

      variables: {
        customerId: connection.data.customerId,
        type,
        value,
      },
    })

    // after mutation
    .then(() => {
      // save email
      setLocalStorageItem('getNotifiedType', type);
      setLocalStorageItem('getNotifiedValue', value);

      // redirect to conversation
      this.openLastConversation();

      // notify parent window launcher state
      postMessage('fromMessenger', 'messenger', { isVisible: true, isSmallContainer: this.isSmallContainer() });
    });
  }

  endConversation() {
    const setting = connection.setting;

    // ignore this action for inapp
    if (setting.email) {
      return;
    }

    // reset local storage items
    setLocalStorageItem('getNotifiedType', '');
    setLocalStorageItem('getNotifiedValue', '');
    setLocalStorageItem('lastConversationId', '');
    setLocalStorageItem('customerId', '');

    window.location.reload();
  }

  readConversation({ conversationId }) {
    this.toggle();
    this.changeConversation(conversationId);
    this.changeRoute('conversationDetail');
    this.readMessages(conversationId);
    this.toggleNotifier();
    this.toggle();
  }

  readMessages(conversationId) {
    client.mutate({
      mutation: gql(graphqlTypes.readConversationMessages),
      variables: { conversationId },
      refetchQueries: [
        {
          query: gql(graphqlTypes.unreadCountQuery),
          variables: { conversationId }
        },
        {
          query: gql(graphqlTypes.totalUnreadCountQuery),
          variables: connection.data,
        },
      ]
    });
  }

  sendMessage(message, attachments) {
    // current conversation
    const currentConversationId = this.state.activeConversation;

    let optimisticResponse;
    let update;

    // generate optimistic response
    if (currentConversationId) {
      optimisticResponse = {
        __typename: 'Mutation',
        insertMessage: {
          __typename: 'ConversationMessage',
          _id: Math.round(Math.random() * -1000000),
          conversationId: currentConversationId,
          customerId: connection.data.customerId,
          user: null,
          content: message,
          createdAt: Number(new Date()),
          attachments: attachments || [],
          internal: false,
          engageData: null
        }
      };

      update = (proxy, { data: { insertMessage } }) => {
        const message = insertMessage;

        const selector = {
          query: gql(graphqlTypes.conversationDetailQuery),
          variables: { _id: message.conversationId }
        };

        // Read data from our cache for this query
        const data = proxy.readQuery(selector);

        const messages = data.conversationDetail.messages;

        // check duplications
        if (!messages.find(m => m._id === message._id)) {
          // Add our message from the mutation to the end
          messages.push(message);

          // Write out data back to the cache
          proxy.writeQuery({ ...selector, data });
        }
      }
    }

    return client.mutate({
      mutation: gql`
        mutation insertMessage(
            ${connection.queryVariables}
            $message: String
            $conversationId: String
            $attachments: [JSON]
          ) {

          insertMessage(
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
        conversationId: currentConversationId,
        message,
        attachments,
      },
      optimisticResponse,
      update,
    })

    // after mutation
    .then(({ data }) => {
      const message = data.insertMessage;

      this.setState({ isConversationEnded: false });

      if (!currentConversationId) {
        this.changeConversation(message.conversationId);
      }
    });
  }

  sendFile(file) {
    const self = this;

    uploadHandler({
      file,

      beforeUpload() {
        self.setState({ isAttachingFile: true });
      },

      // upload to server
      afterUpload({ response, fileInfo }) {
        self.setState({ isAttachingFile: false });

        const attachment = Object.assign({ url: response }, fileInfo);

        // send message with attachment
        self.sendMessage('This message has an attachment', [attachment]);
      }
    });
  }

  render() {
    return (
      <AppContext.Provider
        value={{
          ...this.state,
          saveBrowserInfo: this.saveBrowserInfo,
          toggle: this.toggle,
          toggleNotifier: this.toggleNotifier,
          toggleNotifierFull: this.toggleNotifierFull,
          changeRoute: this.changeRoute,
          changeConversation: this.changeConversation,
          goToConversation: this.goToConversation,
          goToConversationList: this.goToConversationList,
          openLastConversation: this.openLastConversation,
          saveGetNotified: this.saveGetNotified,
          endConversation: this.endConversation,
          readConversation: this.readConversation,
          readMessages: this.readMessages,
          sendMessage: this.sendMessage,
          sendFile: this.sendFile,
        }}
      >
        {this.props.children}
      </AppContext.Provider>
    )
  }
}

AppProvider.propTypes = {
  children: PropTypes.object,
}
