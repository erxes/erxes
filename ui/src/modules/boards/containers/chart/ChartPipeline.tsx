import * as compose from 'lodash.flowright';

import React, { Component } from 'react';
import { StagesQueryResponse } from '../../types';
import gql from 'graphql-tag';
import { withProps } from 'modules/common/utils';
import { graphql } from 'react-apollo';
import { queries } from '../../graphql';
import ChartStack from 'modules/boards/components/chart/ChartStack';

type Props = {
  pipelineId: string;
};

type FinalProps = {
  stagesByAssignedUserQuery;
} & Props;

class WithStages extends Component<FinalProps> {
  render() {
    const { stagesByAssignedUserQuery } = this.props;

    if (stagesByAssignedUserQuery.loading) {
      return <div>...</div>;
    }

    const chartData = stagesByAssignedUserQuery.stagesByAssignedUser;

    return <ChartStack chartData={chartData} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, StagesQueryResponse>(gql(queries.stagesByAssignedUser), {
      name: 'stagesByAssignedUserQuery',
      options: ({ pipelineId }) => ({
        variables: {
          pipelineId
        }
      })
    })
  )(WithStages)
);
