import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
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
import dayjs from 'dayjs';
import { generateParams } from '../../utils';

type Props = {
  queryParams: any;
  history: any;
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
  const {
    timeclocksMainQuery,
    extractAllMsSqlDataMutation,
    timeclockRemove
  } = props;

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

  const extractAllMsSqlData = (start: Date, end: Date) => {
    setLoading(true);
    extractAllMsSqlDataMutation({
      variables: {
        startDate: dayjs(start).format(dateFormat),
        endDate: dayjs(end).format(dateFormat)
      }
    })
      .then(() => {
        setLoading(false);
        timeclocksMainQuery.refetch();
        Alert.success('Successfully extracted data');
      })
      .catch(e => {
        setLoading(false);
        Alert.error(e.message);
      });
  };

  const { list = [], totalCount = 0 } =
    timeclocksMainQuery.timeclocksMain || {};

  const updatedProps = {
    ...props,
    totalCount,
    timeclocks: list,
    loading: timeclocksMainQuery.loading || loading,
    removeTimeclock,
    extractAllMsSqlData
  };

  return <List {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, TimeClockQueryResponse>(gql(queries.timeclocksMain), {
      name: 'timeclocksMainQuery',
      options: ({ queryParams }) => ({
        variables: generateParams(queryParams),
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, TimeClockMutationResponse>(
      gql(mutations.extractAllDataFromMsSQL),
      {
        name: 'extractAllMsSqlDataMutation'
      }
    ),
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
