import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import { withProps } from '@erxes/ui/src/utils';
import List from '../components/List';
import {
  TimeClockMutationResponse,
  TimeClockQueryResponse,
  BranchesQueryResponse
} from '../types';
import { queries } from '../graphql';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import { IUser } from '@erxes/ui/src/auth/types';
import erxesQuery from '@erxes/ui/src/team/graphql/queries';

type Props = {
  currentUser: IUser;
  queryParams: any;
  searchValue: string;
  route?: string;
  history: any;
  startTime: Date;
  stopTime: Date;
  timeId: string;
  userId: string;

  queryStartDate: string;
  queryEndDate: string;
  queryUserIds: string[];
  queryBranchIds: string[];
  queryDepartmentIds: string[];
  searchFilter: string;
};

type FinalProps = {
  listBranchesQuery: BranchesQueryResponse;
} & Props &
  TimeClockMutationResponse;

const ListContainer = (props: FinalProps) => {
  const { listBranchesQuery, currentUser, queryUserIds } = props;

  if (listBranchesQuery.loading) {
    return <Spinner />;
  }

  const currentUserId = currentUser._id;

  const updatedProps = {
    ...props,
    currentUserId,
    queryUserIds,
    branchesList: listBranchesQuery.branches || [],
    loading: listBranchesQuery.loading
  };

  return <List {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, BranchesQueryResponse, { searchValue: string }>(
      gql(erxesQuery.branches),
      {
        name: 'listBranchesQuery',
        options: ({ searchValue }) => ({
          variables: { searchValue },
          fetchPolicy: 'network-only'
        })
      }
    )
  )(withCurrentUser(ListContainer))
);
