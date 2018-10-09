import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Move } from '../../components/editForm';
import { queries } from '../../graphql';
import { IPipeline } from '../../types';

class DealMoveContainer extends React.Component<{ stagesQuery: any }> {
  render() {
    const { stagesQuery } = this.props;

    const stages = stagesQuery.dealStages || [];

    const updatedProps = {
      ...this.props,
      stages
    };

    return <Move {...updatedProps} />;
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
