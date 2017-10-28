import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Loading } from 'modules/common/components';
import { VisitorForm } from '../components';

const VisitorFormContainer = props => {
  const { engageMessageDetailQuery, usersQuery } = props;

  if (engageMessageDetailQuery.loading || usersQuery.loading) {
    return <Loading title="Visitor auto message" spin sidebarSize="wide" />;
  }

  // save
  const save = () => {};

  // props
  const message = engageMessageDetailQuery.engageMessageDetail;
  const users = usersQuery.users;

  const updatedProps = {
    ...props,
    save,
    message,
    users
  };

  return <VisitorForm {...updatedProps} />;
};

VisitorFormContainer.propTypes = {
  messageId: PropTypes.string,
  engageMessageDetailQuery: PropTypes.object,
  usersQuery: PropTypes.object
};

export default compose(
  graphql(
    gql`
      query engageMessageDetail($_id: String) {
        engageMessageDetail(_id: $_id) {
          _id
          kind
          segmentId
          customerIds
          title
          fromUserId
          method
          email
          isDraft
          isLive
          stopDate
          createdDate
          messenger
        }
      }
    `,
    {
      name: 'engageMessageDetailQuery',
      options: ({ messageId }) => ({
        fetchPolicy: 'network-only',
        variables: {
          _id: messageId
        }
      })
    }
  ),
  graphql(
    gql`
      query users {
        users {
          _id
          username
          details
        }
      }
    `,
    { name: 'usersQuery' }
  )
)(VisitorFormContainer);
