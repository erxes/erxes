import React from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

// The data prop, which is provided by the wrapper below contains,
// a `loading` key while the query is in flight and posts when it is ready
function ConversationList({ data: { loading, conversations } }) {
  if (loading) {
    return <div>Loading</div>;
  }

  return (
    <ul>
      {conversations.map(conversation =>
        <li key={conversation._id}>
          {conversation._id}
          {conversation.content}
        </li>
      )}
    </ul>
  );
}

// The `graphql` wrapper executes a GraphQL query and makes the results
// available on the `data` prop of the wrapped component (ConversationList here)
export default graphql(gql`
  query allConversations {
    conversations {
      _id
      content
    }
  }
`)(ConversationList);
