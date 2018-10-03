import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { IPipeline } from '../../../settings/deals/types';
import { DealMove } from '../../components';
import { queries } from '../../graphql';

class DealMoveContainer extends React.Component<{ stagesQuery: any }> {
  render() {
    const { stagesQuery } = this.props;

    const stages = stagesQuery.dealStages || [];

    const updatedProps = {
      ...this.props,
      stages
    };

    return <DealMove {...updatedProps} />;
  }
}

export default compose(
  graphql(gql(queries.stages), {
    name: 'stagesQuery',
    options: ({ deal: { pipeline } }: { deal: { pipeline: IPipeline } }) => ({
      variables: {
        pipelineId: pipeline._id
      }
    })
  })
)(DealMoveContainer);
