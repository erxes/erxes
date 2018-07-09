import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'react-apollo';
import { AppConsumer } from './AppContext';
import { connection } from '../connection';
import { Conversation as DumbConversation } from '../components';
import conversationCommonQueries from './conversationCommonQueries';

class ConversationCreate extends React.Component {
  render() {
    let { messengerSupportersQuery, isMessengerOnlineQuery } = this.props;

    return (
      <AppConsumer>
        {({ goToConversationList }) => {
          return (
            <DumbConversation
              {...this.props}
              messages={[]}
              users={messengerSupportersQuery.messengerSupporters || []}
              isOnline={isMessengerOnlineQuery.isMessengerOnline || false}
              data={connection.data}
              goToConversationList={goToConversationList}
            />
          );
        }}
      </AppConsumer>
    );
  }
}

const query = compose(...conversationCommonQueries());

ConversationCreate.propTypes = {
  messengerSupportersQuery: PropTypes.object,
  isMessengerOnlineQuery: PropTypes.object,
}

export default query(ConversationCreate);
