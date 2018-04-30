import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'react-apollo';
import { connection } from '../connection';
import { changeRoute } from '../actions/messenger';
import { Conversation as DumbConversation } from '../components';
import conversationCommonQueries from './conversationCommonQueries';

class ConversationCreate extends React.Component {
  render() {
    let { messengerSupportersQuery, isMessengerOnlineQuery } = this.props;

    const extendedProps = {
      ...this.props,
      messages: [],
      users: messengerSupportersQuery.messengerSupporters || [],
      isOnline: isMessengerOnlineQuery.isMessengerOnline || false,
      data: connection.data,
    };

    return <DumbConversation {...extendedProps} />;
  }
}

const mapDisptachToProps = dispatch => ({
  goToConversationList(e) {
    e.preventDefault();
    dispatch(changeRoute('conversationList'));
  },
});

const query = compose(...conversationCommonQueries());

ConversationCreate.propTypes = {
  messengerSupportersQuery: PropTypes.object,
  isMessengerOnlineQuery: PropTypes.object,
}

export default connect(null, mapDisptachToProps)(query(ConversationCreate));
