import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { MessengerPreview } from '../components';
import { queries } from '../graphql';

type Props = {
  userDetailQuery: any;
  fromUserId: string;
};

const MessengerPreviewContainer = (props : Props) => {
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

export default compose(
  graphql(gql(queries.userDetail), {
    name: 'userDetailQuery',
    options: ({ fromUserId } : { fromUserId: string }) => ({
      variables: {
        _id: fromUserId
      }
    })
  })
)(MessengerPreviewContainer);
