import React from 'react';

import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import Spinner from '@erxes/ui/src/components/Spinner';
import { withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import TimeclockList from '../../components/timeclock/TimeclockList';
import { queries, mutations } from '../../graphql';
import {
  ReportByUsersQueryResponse,
  TimeclockMutationResponse
} from '../../types';
import { generateParams } from '../../utils';
import { Alert } from '@erxes/ui/src/utils';
type Props = {
  queryParams: any;
  isCurrentUserAdmin: boolean;
  isCurrentUserSupervisor: boolean;

  getPagination: (pagination: any) => void;
};

type FinalProps = {
  listReportByUsersQuery: ReportByUsersQueryResponse;
} & Props &
  TimeclockMutationResponse;

const TimeclockContainer = (props: FinalProps) => {
  const { listReportByUsersQuery, timeclockEditMutation } = props;

  if (listReportByUsersQuery.loading) {
    return <Spinner />;
  }

  const timeclockEdit = (variables: any) => {
    timeclockEditMutation({ variables })
      .then(() => Alert.success('Successfully edited timeclock'))
      .catch(err => Alert.error(err.message));
  };
  const {
    list = [],
    totalCount
  } = listReportByUsersQuery.bichilTimeclockReportByUsers;

  return (
    <TimeclockList
      reportByUsers={list}
      totalCount={totalCount}
      timeclockEdit={timeclockEdit}
      {...props}
    />
  );
};

export default withProps<Props>(
  compose(
    graphql<any>(gql(queries.bichilTimeclockReportByUsers), {
      name: 'listReportByUsersQuery',
      options: ({ queryParams, isCurrentUserAdmin }) => ({
        variables: {
          ...generateParams(queryParams),
          isCurrentUserAdmin
        }
      })
    }),
    graphql<Props>(gql(mutations.timeclockEdit), {
      name: 'timeclockEditMutation',
      options: {
        refetchQueries: ['timeclocksMain', 'bichilTimeclockReportByUsers']
      }
    })
  )(TimeclockContainer)
);
