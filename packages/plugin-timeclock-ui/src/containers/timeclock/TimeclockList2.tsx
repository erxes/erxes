import React from 'react';

import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import Spinner from '@erxes/ui/src/components/Spinner';
import { withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import TimeclockList from '../../components/timeclock/TimeclockList2';
import { queries, mutations } from '../../graphql';
import {
  ReportByUsersQueryResponse,
  TimeClockMutationResponse,
} from '../../types';
import { generateParams } from '../../utils';
import { Alert } from '@erxes/ui/src/utils';
import { IUser } from '@erxes/ui/src/auth/types';
type Props = {
  currentUser: IUser;
  queryParams: any;
  history?: any;
  isCurrentUserAdmin: boolean;
  isCurrentUserSupervisor: boolean;

  getActionBar: (actionBar: any) => void;
  showSideBar: (sideBar: boolean) => void;
  getPagination: (pagination: any) => void;
};

type FinalProps = {
  listReportByUsersQuery: ReportByUsersQueryResponse;
} & Props &
  TimeClockMutationResponse;

const TimeclockContainer = (props: FinalProps) => {
  const {
    listReportByUsersQuery,
    timeclockEditMutation,
    isCurrentUserAdmin,
    isCurrentUserSupervisor,
    getPagination,
    getActionBar,
    showSideBar,
    queryParams,
    currentUser,
  } = props;

  if (listReportByUsersQuery.loading) {
    return <Spinner />;
  }

  const timeclockEdit = (variables: any) => {
    timeclockEditMutation({ variables })
      .then(() => Alert.success('Successfully edited timeclock'))
      .catch((err) => Alert.error(err.message));
  };

  const { list = [], totalCount } =
    listReportByUsersQuery?.timeclockReportByUsers;

  return (
    <TimeclockList
      currentUser={currentUser}
      queryParams={queryParams}
      reportByUsers={list}
      totalCount={totalCount}
      isCurrentUserSupervisor={isCurrentUserSupervisor}
      isCurrentUserAdmin={isCurrentUserAdmin}
      timeclockEdit={timeclockEdit}
      getPagination={getPagination}
      getActionBar={getActionBar}
      showSideBar={showSideBar}
    />
  );
};

export default withProps<Props>(
  compose(
    graphql<any>(gql(queries.timeclockReportByUsers), {
      name: 'listReportByUsersQuery',
      options: ({ queryParams, isCurrentUserAdmin }) => ({
        variables: {
          ...generateParams(queryParams),
          isCurrentUserAdmin,
        },
      }),
    }),
    graphql<Props>(gql(mutations.timeclockEdit), {
      name: 'timeclockEditMutation',
      options: {
        refetchQueries: ['timeclocksMain', 'timeclockReportByUsers'],
      },
    }),
  )(TimeclockContainer),
);
