import { Meteor } from 'meteor/meteor';
import React, { PropTypes } from 'react';
import { compose, gql, graphql } from 'react-apollo';
import { methodCallback } from '/imports/react-ui/engage/utils';
import { Loading } from '/imports/react-ui/common';
import { VisitorForm } from '../components';

const VisitorFormContainer = props => {
  const { engageMessageDetailQuery, usersQuery, messageId } = props;

  if (engageMessageDetailQuery.loading || usersQuery.loading) {
    return <Loading title="Visitor auto message" spin sidebarSize="wide" />;
  }

  // save
  const save = doc => {
    if (messageId) {
      return Meteor.call('engage.messages.edit', { id: messageId, doc }, methodCallback);
    }

    return Meteor.call('engage.messages.add', { doc }, methodCallback);
  };

  // props
  const message = engageMessageDetailQuery.engageMessageDetail;
  const users = usersQuery.users;

  const updatedProps = {
    ...props,
    save,
    message,
    users,
  };

  return <VisitorForm {...updatedProps} />;
};

VisitorFormContainer.propTypes = {
  messageId: PropTypes.string,
  engageMessageDetailQuery: PropTypes.object,
  usersQuery: PropTypes.object,
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
          _id: messageId,
        },
      }),
    },
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
    { name: 'usersQuery' },
  ),
)(VisitorFormContainer);
