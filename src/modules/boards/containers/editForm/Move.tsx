import gql from 'graphql-tag';
import { queries as boardQueries } from 'modules/boards/graphql';
import { IPipeline, StagesQueryResponse } from 'modules/boards/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { Move } from '../../components/editForm';
import { IDeal } from '../../types';

type Props = {
  deal: IDeal;
  stageId?: string;
  onChangeStage?: (
    name: 'stageId' | 'name' | 'closeDate' | 'description' | 'assignedUserIds',
    value: any
  ) => void;
};

class DealMoveContainer extends React.Component<{ stagesQuery: any }> {
  render() {
    const { stagesQuery } = this.props;

    const stages = stagesQuery.stages || [];

    const updatedProps = {
      ...this.props,
      stages
    };

    return <Move {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<
      { deal: { pipeline: IPipeline } },
      StagesQueryResponse,
      { pipelineId: string }
    >(gql(boardQueries.stages), {
      name: 'stagesQuery',
      options: ({ deal: { pipeline } }) => ({
        variables: {
          pipelineId: pipeline._id
        }
      })
    })
  )(DealMoveContainer)
);
