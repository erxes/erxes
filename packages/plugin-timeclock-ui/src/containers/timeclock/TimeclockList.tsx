import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { Alert, withProps, confirm } from '@erxes/ui/src/utils';
import List from '../../components/timeclock/TimeclockList';
import {
  TimeClockMainQueryResponse,
  TimeClockMutationResponse,
  TimeClockQueryResponse
} from '../../types';
import { queries } from '../../graphql';
import React, { useState } from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { mutations } from '../../graphql';
import { generateParams } from '../../utils';
import { IUser } from '@erxes/ui/src/auth/types';
import { IDepartment, IBranch } from '@erxes/ui/src/team/types';

type Props = {
  currentUser: IUser;
  departments: IDepartment[];
  branches: IBranch[];

  queryParams: any;
  history: any;
  isCurrentUserAdmin: boolean;

  timeclockUser?: string;

  timeclockId?: string;

  showSideBar: (sideBar: boolean) => void;
  getActionBar: (actionBar: any) => void;
  getPagination: (pagination: any) => void;
};

type FinalProps = {
  timeclocksMainQuery: TimeClockMainQueryResponse;
} & Props &
  TimeClockMutationResponse;

const ListContainer = (props: FinalProps) => {
  const { timeclocksMainQuery, timeclockRemove } = props;

  const dateFormat = 'YYYY-MM-DD';
  const [loading, setLoading] = useState(false);

  if (timeclocksMainQuery.loading || loading) {
    return <Spinner />;
  }

  const removeTimeclock = (timeclockId: string) => {
    confirm('Are you sure to remove this timeclock?').then(() => {
      timeclockRemove({ variables: { _id: timeclockId } }).then(() => {
        Alert.success('Successfully removed timeclock');
      });
    });
  };

  const { list = [], totalCount = 0 } =
    timeclocksMainQuery.timeclocksMain || {};

  const updatedProps = {
    ...props,
    totalCount,
    timeclocks: list,
    loading: timeclocksMainQuery.loading || loading,
    removeTimeclock
  };

  return <List {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, TimeClockQueryResponse>(gql(queries.timeclocksMain), {
      name: 'timeclocksMainQuery',
      options: ({ queryParams, isCurrentUserAdmin }) => ({
        variables: { ...generateParams(queryParams), isCurrentUserAdmin },
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, TimeClockMutationResponse>(gql(mutations.timeclockRemove), {
      name: 'timeclockRemove',
      options: ({ timeclockId }) => ({
        variables: {
          _id: timeclockId
        },
        refetchQueries: ['timeclocksMain']
      })
    })
  )(ListContainer)
);
