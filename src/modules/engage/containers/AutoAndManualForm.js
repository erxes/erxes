import React from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Loading } from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import { AutoAndManualForm } from '../components';
import { queries, mutations } from '../graphql';

const AutoAndManualFormContainer = props => {
  const {
    history,
    kind,
    messageId,
    engageMessageDetailQuery,
    usersQuery,
    segmentsQuery,
    emailTemplatesQuery,
    customerCountsQuery,
    addMutation,
    editMutation
  } = props;

  if (
    engageMessageDetailQuery.loading ||
    usersQuery.loading ||
    segmentsQuery.loading ||
    emailTemplatesQuery.loading ||
    customerCountsQuery.loading
  ) {
    return <Loading title="New message" spin sidebarSize="wide" />;
  }

  const templates = emailTemplatesQuery.emailTemplates;
  const message = engageMessageDetailQuery.engageMessageDetail;
  const segments = segmentsQuery.segments;
  const users = usersQuery.users;

  // TODO change query to get only customerCounts
  const counts = customerCountsQuery.customerCounts.bySegment;

  const doMutation = (mutation, variables) => {
    mutation({
      variables
    })
      .then(() => {
        Alert.success('Congrats');
        history.push('/engage');
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  // save
  const save = doc => {
    doc.kind = message ? message.kind : kind;

    if (messageId) {
      return doMutation(editMutation, { ...doc, _id: messageId });
    }

    return doMutation(addMutation, doc);
  };

  const updatedProps = {
    ...props,
    save,
    message,
    segments,
    templates,
    users,
    counts
  };

  return <AutoAndManualForm {...updatedProps} />;
};

AutoAndManualFormContainer.propTypes = {
  messageId: PropTypes.string,
  history: PropTypes.object,
  kind: PropTypes.string,
  engageMessageDetailQuery: PropTypes.object,
  usersQuery: PropTypes.object,
  segmentsQuery: PropTypes.object,
  emailTemplatesQuery: PropTypes.object,
  customerCountsQuery: PropTypes.object,
  addMutation: PropTypes.func,
  editMutation: PropTypes.func
};

export default withRouter(
  compose(
    graphql(gql(queries.engageMessageDetail), {
      name: 'engageMessageDetailQuery',
      options: ({ messageId }) => ({
        fetchPolicy: 'network-only',
        variables: {
          _id: messageId
        }
      })
    }),
    graphql(gql(queries.users), { name: 'usersQuery' }),
    graphql(gql(queries.emailTemplates), { name: 'emailTemplatesQuery' }),
    graphql(gql(queries.segments), { name: 'segmentsQuery' }),
    graphql(gql(queries.customerCounts), {
      name: 'customerCountsQuery',
      options: () => ({
        variables: {
          params: {}
        }
      })
    }),
    graphql(gql(mutations.messagesAdd), { name: 'addMutation' }),
    graphql(gql(mutations.messagesEdit), { name: 'editMutation' })
  )(AutoAndManualFormContainer)
);
