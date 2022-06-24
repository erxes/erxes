import { Bulk } from '@erxes/ui/src/components';
import { IRouterProps } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils/core';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
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

    const refetch = variables => {
      this.props.scoreLogs.refetch(variables);
    };

    const updatedProps = {
      ...this.props,
      scoreLogs: scoreLogs.scoreLogList?.list,
      total: scoreLogs.scoreLogList?.total,
      loading: scoreLogs.loading,
      error: scoreLogs.error,
      refetch
    };
    const content = props => (
      <ScoreLogsListComponent {...props} {...updatedProps} />
    );

    return <Bulk content={content} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.getScoreLogs), {
      name: 'scoreLogs',
      options: ({ queryParams }) => ({
        variables: queryParams
      })
    })
  )(withRouter<IRouterProps>(ScoreLogsListContainer))
);
