import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { withProps } from '@erxes/ui/src/utils';
import { UserDetailQueryResponse } from '@erxes/ui/src/auth/types';
import MessengerPreview from '../components/MessengerPreview';
import { queries } from '../graphql';

type Props = {
  fromUserId: string;
  sentAs: string;
  content: string;
};

type FinalProps = { userDetailQuery: UserDetailQueryResponse } & Props;

const MessengerPreviewContainer = (props: FinalProps) => {
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

export default withProps<Props>(
  compose(
    graphql<Props, UserDetailQueryResponse, { _id: string }>(
      gql(queries.userDetail),
      {
        name: 'userDetailQuery',
        options: ({ fromUserId }: { fromUserId: string }) => ({
          variables: {
            _id: fromUserId
          }
        })
      }
    )
  )(MessengerPreviewContainer)
);
