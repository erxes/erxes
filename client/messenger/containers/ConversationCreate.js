import * as React from 'react';
import * as PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import * as gql from 'graphql-tag';
import { AppConsumer } from './AppContext';
import { connection } from '../connection';
import graphqlTypes from '../graphql';
import { Conversation as DumbConversation } from '../components';

class ConversationCreate extends React.Component {
  render() {
    const { conversationDetailQuery } = this.props;
    const { conversationDetail={} } = conversationDetailQuery;
    const { isOnline=false, supporters=[] } = conversationDetail;

    return (
      <AppConsumer>
        {({ goToConversationList }) => {
          return (
            <DumbConversation
              {...this.props}
              messages={[]}
              users={supporters}
              isOnline={isOnline}
              data={connection.data}
              goToConversationList={goToConversationList}
            />
          );
        }}
      </AppConsumer>
    );
  }
}

const query = compose(
  graphql(
    gql(graphqlTypes.conversationDetailQuery),
    {
      name: 'conversationDetailQuery',
      options: () => ({
        variables: {
          integrationId: connection.data.integrationId,
        },
        fetchPolicy: 'network-only',
      }),
    },
  ),
);

ConversationCreate.propTypes = {
  conversationDetailQuery: PropTypes.object,
}

export default query(ConversationCreate);
