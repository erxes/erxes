import { Bulk } from '@erxes/ui/src/components';
import { IRouterProps } from '@erxes/ui/src/types';
import { withProps, router } from '@erxes/ui/src/utils/core';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { withRouter } from 'react-router-dom';
import ScoreLogsListComponent from '../components/List';
import { queries } from '../graphql';
type Props = {
  queryParams: any;
  history: any;
};
type FinalProps = {
  scoreLogs: any;
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
    const { scoreLogs } = this.props;

    const handlerefetch = variables => {
      this.props.scoreLogs.refetch(variables);
    };

    const updatedProps = {
      ...this.props,
      scoreLogs: scoreLogs.scoreLogList?.list,
      total: scoreLogs.scoreLogList?.total,
      loading: scoreLogs.loading,
      error: scoreLogs.error,
      refetch: handlerefetch
    };
    const content = props => (
      <ScoreLogsListComponent {...props} {...updatedProps} />
    );

    const refetch = () => {
      this.props.scoreLogs.refetch();
    };

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
      name: 'scoreLogs',
      options: ({ queryParams }) => ({
        variables: generateParams({ queryParams })
      })
    })
  )(withRouter<IRouterProps>(ScoreLogsListContainer))
);
