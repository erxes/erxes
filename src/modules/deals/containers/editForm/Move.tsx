import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { Move } from '../../components/editForm';
import { queries } from '../../graphql';
import { IDeal, IPipeline, IStage } from '../../types';

type StagesQueryResponse = {
  dealStages: IStage[];
};

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

    const stages = stagesQuery.dealStages || [];

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
    >(gql(queries.stages), {
      name: 'stagesQuery',
      options: ({ deal: { pipeline } }) => ({
        variables: {
          pipelineId: pipeline._id
        }
      })
    })
  )(DealMoveContainer)
);
