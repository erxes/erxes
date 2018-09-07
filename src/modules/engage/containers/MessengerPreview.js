import * as React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { MessengerPreview } from '../components';
import { queries } from '../graphql';

const MessengerPreviewContainer = props => {
  const { userDetailQuery } = props;

  if (userDetailQuery.loading) {
    return null;
  }

  const user = userDetailQuery.userDetail;
  const updatedProps = {
    ...props,
    user
  };

  return <MessengerPreview {...updatedProps} />;
};

MessengerPreviewContainer.propTypes = {
  userDetailQuery: PropTypes.object,
  fromUser: PropTypes.string
};

export default compose(
  graphql(gql(queries.userDetail), {
    name: 'userDetailQuery',
    options: ({ fromUser }) => ({
      variables: {
        _id: fromUser
      }
    })
  })
)(MessengerPreviewContainer);
