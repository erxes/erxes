import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Loading } from 'modules/common/components';
import { AutoAndManualForm } from '../components';
import { queries } from '../graphql';

const AutoAndManualFormContainer = props => {
  const {
    engageMessageDetailQuery,
    usersQuery,
    segmentsQuery,
    emailTemplatesQuery,
    customerCountsQuery
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

  // save
  const save = () => {};

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
  kind: PropTypes.string,
  engageMessageDetailQuery: PropTypes.object,
  usersQuery: PropTypes.object,
  segmentsQuery: PropTypes.object,
  emailTemplatesQuery: PropTypes.object,
  customerCountsQuery: PropTypes.object
};

export default compose(
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
  })
)(AutoAndManualFormContainer);
