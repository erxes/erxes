import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Inbox as InboxComponent } from '../components';


class Inbox extends Component {
  render() {

    const conversations = [];
    const messages = [];
    const user = {};

    // =============== actions
    const changeStatus = () => {

    };

    const updatedProps = {
      ...this.props,
      conversations,
      messages,
      user,
      changeStatus,
    };

    return <InboxComponent {...updatedProps} />;
  }
}

Inbox.propTypes = {
  id: PropTypes.string,
  channelId: PropTypes.string,
  queryParams: PropTypes.object,
  conversationDetailQuery: PropTypes.object,
  subscribeToNewMessages: PropTypes.func,
  data: PropTypes.object,
};

export default Inbox;
