import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { AppConsumer } from './AppContext';
import { connection } from '../connection';
import { ConversationList as DumbConversationList } from '../components';
import graphqTypes from '../graphql';

class ConversationList extends React.Component {
  render() {
    const { data } = this.props;

    let conversations = data.conversations || [];

    // show empty list while waiting
    if (data.loading) {
      conversations = [];
    }

    return (
      <AppConsumer>
        {({ changeRoute, goToConversation }) => {
          const createConversation = (e) => {
            e.preventDefault();
            changeRoute('conversationCreate');
          }

          return (
            <DumbConversationList
              {...this.props}
              loading={data.loading}
              conversations={conversations}
              createConversation={createConversation}
              goToConversation={goToConversation}
            />
          );
        }}
      </AppConsumer>
    );
  }
}

ConversationList.propTypes = {
  data: PropTypes.object,
};

const ListWithData = graphql(
  gql(graphqTypes.allConversations),
  {
    options: () => ({
      fetchPolicy: 'network-only',
      variables: connection.data,
    }),
  },
)(ConversationList);

export default ListWithData;
