import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { Bulk, withProps } from '@erxes/ui/src';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import SchedulesList from '../components/schedules/SchedulesList';
import { queries } from '../graphql';
import { SchedulesQueryResponse, ScheduleYearsQueryResponse } from '../types';

type Props = {
  contractId: string;
  isFirst: boolean;
};

type FinalProps = {
  schedulesQuery: SchedulesQueryResponse;
  scheduleYearsQuery: ScheduleYearsQueryResponse;
} & Props;

type State = {
  loading: boolean;
  currentYear: number;
};

class SchedulesListContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      currentYear: new Date().getFullYear()
    };
  }

  render() {
    const { schedulesQuery, scheduleYearsQuery } = this.props;

    if (scheduleYearsQuery.loading) {
      return null;
    }

    const onClickYear = (year: number) => {
      this.setState({ currentYear: year }, () =>
        schedulesQuery.refetch({
          year
        })
      );
    };

    const scheduleYears = scheduleYearsQuery.scheduleYears || [];
    const schedules = schedulesQuery.schedules || [];

    const updatedProps = {
      ...this.props,
      schedules,
      scheduleYears,
      currentYear: this.state.currentYear,
      onClickYear,
      loading: schedulesQuery.loading || this.state.loading
    };

    const contractsList = props => {
      return <SchedulesList {...updatedProps} {...props} />;
    };

    return <Bulk content={contractsList} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, SchedulesQueryResponse, { contractId: String }>(
      gql(queries.schedules),
      {
        name: 'schedulesQuery',
        options: ({ contractId, isFirst }) => ({
          skip: !contractId,
          variables: {
            contractId,
            isFirst,
            year: new Date().getFullYear()
          },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, ScheduleYearsQueryResponse, { contractId: String }>(
      gql(queries.scheduleYears),
      {
        name: 'scheduleYearsQuery',
        options: ({ contractId }) => ({
          skip: !contractId,
          variables: {
            contractId
          }
        })
      }
    )
  )(SchedulesListContainer)
);
