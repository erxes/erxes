import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { Bulk, withProps } from '@erxes/ui/src';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import SchedulesList from '../components/schedules/SchedulesList';
import { queries } from '../graphql';
import { SchedulesQueryResponse } from '../types';

type Props = {
  contractId: string;
  isFirst: boolean;
};

type FinalProps = {
  schedulesQuery: SchedulesQueryResponse;
} & Props;

type State = {
  loading: boolean;
};

class SchedulesListContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  render() {
    const { schedulesQuery } = this.props;

    const transactions = schedulesQuery.savingsTransactions || [];

    const updatedProps = {
      ...this.props,
      transactions,
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
    )
  )(SchedulesListContainer)
);
