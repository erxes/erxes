import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { Bulk, EmptyState, Spinner } from '@erxes/ui/src/components';
import { IRouterProps, QueryResponse } from '@erxes/ui/src/types';
import { router, withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import React from 'react';
import ScoreLogsListComponent from '../components/List';
import { queries } from '../graphql';
import { IScore } from '../types';
type Props = {
  queryParams: any;
  history: any;
};

type ScoreLogsQueryRespnse = {
  scoreLogList: {
    list: IScore[];
    total: number;
  };
} & QueryResponse;

type FinalProps = {
  scoreLogsQueryResponse: ScoreLogsQueryRespnse;
} & Props &
  IRouterProps;

type State = {
  loading: boolean;
};

class ScoreLogsListContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);
  }

  render() {
    const { scoreLogsQueryResponse } = this.props;

    const { loading, error, scoreLogList, refetch } = scoreLogsQueryResponse;

    if (error) {
      return <EmptyState text={error || ''} />;
    }

    if (loading) {
      return <Spinner />;
    }

    const updatedProps = {
      ...this.props,
      scoreLogs: scoreLogList?.list,
      total: scoreLogList?.total,
      loading,
      error,
      refetch
    };
    const content = props => (
      <ScoreLogsListComponent {...props} {...updatedProps} />
    );

    return <Bulk content={content} refetch={refetch} />;
  }
}

const generateParams = ({ queryParams }) => ({
  ...router.generatePaginationParams(queryParams || {}),
  ids: queryParams.ids,
  campaignId: queryParams.campaignId,
  status: queryParams.status,
  ownerId: queryParams.ownerId,
  ownerType: queryParams.ownerType,
  searchValue: queryParams.searchValue,
  sortField: queryParams.sortField,
  sortDirection: Number(queryParams.sortDirection) || undefined
});

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.getScoreLogs), {
      name: 'scoreLogsQueryResponse',
      options: ({ queryParams }) => ({
        variables: generateParams({ queryParams })
      })
    })
  )(ScoreLogsListContainer)
);
