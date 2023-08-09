import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { withProps } from '@erxes/ui/src/utils';
import List from '../components/List';
import {
  TimeClockMutationResponse,
  BranchesQueryResponse,
  PayDatesQueryResponse,
  ScheduleConfigQueryResponse,
  DepartmentsQueryResponse
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
  checkUserPermission?: boolean;
};

type FinalProps = {
  listDepartmentsQuery: DepartmentsQueryResponse;
  listBranchesQuery: BranchesQueryResponse;
  listScheduleConfigsQuery: ScheduleConfigQueryResponse;
} & Props &
  TimeClockMutationResponse;

class ListContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  componentDidUpdate(prevProps): void {
    if (prevProps.route !== this.props.route) {
      removeParams(this.props.history, 'page', 'perPage');
    }
  }

  render() {
    const {
      listBranchesQuery,
      listScheduleConfigsQuery,
      listDepartmentsQuery,
      currentUser
    } = this.props;

    if (listBranchesQuery && listBranchesQuery.loading) {
      return <Spinner />;
    }

    if (!listScheduleConfigsQuery.scheduleConfigs) {
      listScheduleConfigsQuery.refetch();
    }

    const currentUserId = currentUser._id;

    const updatedProps = {
      ...this.props,
      scheduleConfigs: listScheduleConfigsQuery.scheduleConfigs || [],
      isCurrentUserAdmin: isCurrentUserAdmin(this.props),
      isCurrentUserSupervisor:
        this.props.currentUser.permissionActions &&
        this.props.currentUser.permissionActions.manageTimeclocks,
      currentUserId,

      branches:
        (isCurrentUserAdmin(this.props)
          ? listBranchesQuery.branches
          : listBranchesQuery.timeclockBranches) || [],
      departments:
        (isCurrentUserAdmin(this.props)
          ? listDepartmentsQuery.departments
          : listDepartmentsQuery.timeclockDepartments) || [],

      loading: listBranchesQuery.loading
    };

    return <List {...updatedProps} />;
  }
}

const isCurrentUserAdmin = (props: any) => {
  return (
    (props.currentUser.permissionActions &&
      props.currentUser.permissionActions.showTimeclocks &&
      props.currentUser.permissionActions.manageTimeclocks) ||
    false
  );
};

export default withProps<Props>(
  compose(
    graphql<Props, BranchesQueryResponse, { searchValue: string }>(
      gql(erxesQuery.branches),
      {
        name: 'listBranchesQuery',
        skip: props => !isCurrentUserAdmin(props),
        options: ({ searchValue }) => ({
          variables: { searchValue },
          fetchPolicy: 'network-only'
        })
      }
    ),

    graphql<Props, BranchesQueryResponse, { searchValue: string }>(
      gql(erxesQuery.departments),
      {
        name: 'listDepartmentsQuery',
        skip: props => !isCurrentUserAdmin(props),
        options: ({ searchValue }) => ({
          variables: { searchValue },
          fetchPolicy: 'network-only'
        })
      }
    ),

    graphql<Props, PayDatesQueryResponse>(gql(queries.timeclockBranches), {
      name: 'listBranchesQuery',
      skip: props => isCurrentUserAdmin(props),
      options: ({ searchValue }) => ({
        variables: { searchValue },
        fetchPolicy: 'network-only'
      })
    }),

    graphql<Props, PayDatesQueryResponse>(gql(queries.timeclockDepartments), {
      name: 'listDepartmentsQuery',
      skip: props => isCurrentUserAdmin(props),
      options: ({ searchValue }) => ({
        variables: { searchValue },
        fetchPolicy: 'network-only'
      })
    }),

    graphql<Props, PayDatesQueryResponse>(gql(queries.scheduleConfigs), {
      name: 'listScheduleConfigsQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    })
  )(withCurrentUser(ListContainer))
);
