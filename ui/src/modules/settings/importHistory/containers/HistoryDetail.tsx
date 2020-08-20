import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import HistoryDetail from '../components/HistoryDetail';
import { queries } from '../graphql';
import { ImportHistoryDetailQueryResponse } from '../types';

class HistoryDetailContainer extends React.Component<
  { id: string } & {
    importHistoryDetailQuery: ImportHistoryDetailQueryResponse;
  },
  { percentage: number }
> {
  constructor(props) {
    super(props);

    this.state = {
      percentage: 0,
    };
  }

  render() {
    const { importHistoryDetailQuery } = this.props;
    const importHistory = importHistoryDetailQuery.importHistoryDetail || {};
    const percentage =
      Math.trunc(importHistory.percentage) || this.state.percentage;

    return (
      <HistoryDetail
        importHistory={importHistory}
        loading={importHistoryDetailQuery.loading}
        percentage={percentage}
      />
    );
  }
}

export default withProps<{ id: string }>(
  compose(
    graphql<{ id: string }, ImportHistoryDetailQueryResponse, { _id: string }>(
      gql(queries.historyDetail),
      {
        name: 'importHistoryDetailQuery',
        options: ({ id }) => ({
          fetchPolicy: 'network-only',
          variables: {
            _id: id,
          },
          pollInterval: 3000,
        }),
      }
    )
  )(HistoryDetailContainer)
);
