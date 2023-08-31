import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { withProps } from '@erxes/ui/src/utils';
import List from '../components/List';
import {
  EditMutationResponse,
  MeetingsQueryResponse,
  RemoveMutationResponse
} from '../types';
import { queries } from '../graphql';
import React from 'react';

import Spinner from '@erxes/ui/src/components/Spinner';
import { IUser } from '@erxes/ui/src/auth/types';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';

type Props = {
  history: any;
  searchFilter: string;

  queryParams: any;
  route?: string;
};

type FinalProps = {
  meetingQuery: MeetingsQueryResponse;
  currentUser: IUser;
} & Props &
  RemoveMutationResponse &
  EditMutationResponse;

const ListContainer = (props: FinalProps) => {
  const { meetingQuery, queryParams } = props;

  if (meetingQuery.loading) {
    return <Spinner />;
  }

  const updatedProps = {
    ...props,
    meetings: meetingQuery.meetings || [],
    types: [],
    loading: meetingQuery.loading,
    refetch: meetingQuery.refetch
  };
  return <List {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql(gql(queries.meetings), {
      name: 'meetingQuery',
      options: ({ queryParams }: Props) => {
        const participantUserIds =
          queryParams?.participantUserIds?.split(',') || [];
        return {
          variables: {
            participantIds: participantUserIds || []
          }
        };
      }
    })
  )(withCurrentUser(ListContainer))
);
