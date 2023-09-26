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
import { IUser, UsersQueryResponse } from '@erxes/ui/src/auth/types';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import { queries as userQueries } from '@erxes/ui/src/team/graphql';

type Props = {
  history: any;
  searchFilter: string;
  queryParams: any;
  route?: string;
  perPage?: number;
};

type FinalProps = {
  meetingQuery: MeetingsQueryResponse;
  userQuery: UsersQueryResponse;
  currentUser: IUser;
} & Props &
  RemoveMutationResponse &
  EditMutationResponse;

const ListContainer = (props: FinalProps) => {
  const { meetingQuery, userQuery } = props;
  if (meetingQuery.loading || userQuery.loading) {
    return <Spinner />;
  }
  const updatedProps = {
    ...props,
    meetings: meetingQuery.meetings || [],
    types: [],
    loading: meetingQuery.loading,
    participantUsers: userQuery.users
  };
  return <List {...updatedProps} />;
};

export default withCurrentUser(
  withProps<Props>(
    compose(
      graphql(gql(queries.meetings), {
        name: 'meetingQuery',
        options: ({ queryParams, perPage }: Props) => {
          const participantUserIds =
            queryParams?.participantUserIds?.split(',') || [];
          const {
            createdAtFrom,
            createdAtTo,
            ownerId,
            companyId,
            searchValue
          } = queryParams;

          return {
            variables: {
              participantIds: participantUserIds || [],
              perPage: perPage || 80,
              createdAtFrom,
              createdAtTo,
              userId: ownerId,
              companyId,
              searchValue
            }
          };
        }
      }),
      graphql(gql(userQueries.users), {
        name: 'userQuery'
      })
    )(ListContainer)
  )
);
