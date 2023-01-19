import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import { withProps } from '@erxes/ui/src/utils';
import List from '../components/List';
import {
  TimeClockMutationResponse,
  BranchesQueryResponse,
  PayDatesQueryResponse,
  ScheduleConfigQueryResponse
} from '../types';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import { IUser } from '@erxes/ui/src/auth/types';
import erxesQuery from '@erxes/ui/src/team/graphql/queries';
import { removeParams } from '@erxes/ui/src/utils/router';
import { queries } from '../graphql';

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
  searchFilter: string;
};

type FinalProps = {
  listBranchesQuery: BranchesQueryResponse;
  listScheduleConfigsQuery: ScheduleConfigQueryResponse;
} & Props &
  TimeClockMutationResponse;

class ListContainer extends React.Component<FinalProps> {
  componentDidUpdate(prevProps): void {
    if (prevProps.route !== this.props.route) {
      removeParams(this.props.history, 'page', 'perPage');
    }
  }
  render() {
    const {
      listBranchesQuery,
      listScheduleConfigsQuery,
      currentUser
    } = this.props;

    if (listBranchesQuery.loading) {
      return <Spinner />;
    }

    const currentUserId = currentUser._id;

    const updatedProps = {
      ...this.props,
      currentUserId,
      scheduleConfigs: listScheduleConfigsQuery.scheduleConfigs || [],
      branchesList: listBranchesQuery.branches || [],
      loading: listBranchesQuery.loading
    };
    return <List {...updatedProps} />;
  }
}

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
    ),
    graphql<Props, PayDatesQueryResponse>(gql(queries.listScheduleConfig), {
      name: 'listScheduleConfigsQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    })
  )(withCurrentUser(ListContainer))
);
