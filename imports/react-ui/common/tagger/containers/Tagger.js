import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Meteor } from 'meteor/meteor';
import { TAG_TYPES } from '/imports/api/tags/constants';
import Tagger from '../components/Tagger';

const propTypes = {
  type: PropTypes.string.isRequired,
  targets: PropTypes.array.isRequired,
};

/**
 * This higher order component is required for conditional queries.
 * Based on prop `type` we need to change our target's query.
 * @param {Object} props Component initial props
 */
function TaggerWithData(props) {
  // Providing data to the component from API
  const Component = compose(
    // Target objects (Conversations | Customers | Engage messages)
    graphql(Queries[props.type], {
      options: () => ({
        variables: { params: { ids: props.targets } },
      }),
      props: ({ data: { loading, conversations, customers } }) => ({
        targetsLoading: loading,
        targets: props.type === TAG_TYPES.CONVERSATION ? conversations : customers,
      }),
    }),
    // Tags
    graphql(Tags, {
      options: props => ({
        variables: { type: props.type },
      }),
      props: ({ data: { loading, tags } }) => ({
        tagsLoading: loading,
        tags,
      }),
    }),
  )(Tagger);

  // Other props
  function tag({ type, targetIds, tagIds }, callback) {
    return Meteor.call('tags.tag', { type, targetIds, tagIds }, callback);
  }

  // Initial `props` are passed along with other props
  return <Component {...props} tag={tag} />;
}

TaggerWithData.propTypes = propTypes;

/**
 * Queries
 */
const Conversations = gql`
  query GetConversations($params: ConversationListParams) {
    conversations(params: $params) {
      _id
      tagIds
    }
  }
`;

const Customers = gql`
  query GetCustomers($params: CustomerListParams) {
    customers(params: $params) {
      _id
      tagIds
    }
  }
`;

const EngageMessages = gql`
  query GetEngageMessages($ids: [String]) {
    engageMessages(ids: $ids) {
      _id
      tagIds
    }
  }
`;

const Tags = gql`
  query GetTags($type: String!) {
    tags(type: $type) {
      _id
      name
      colorCode
    }
  }
`;

const Queries = {
  [TAG_TYPES.CONVERSATION]: Conversations,
  [TAG_TYPES.CUSTOMER]: Customers,
  [TAG_TYPES.ENGAGE_MESSAGE]: EngageMessages,
};

export default TaggerWithData;
