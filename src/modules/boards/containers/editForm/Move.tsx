import gql from 'graphql-tag';
import { queries as boardQueries } from 'modules/boards/graphql';
import { IOptions, IPipeline, StagesQueryResponse } from 'modules/boards/types';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { Move } from '../../components/editForm';
import { IItem } from '../../types';

type Props = {
  item: IItem;
  stageId?: string;
  options: IOptions;
  onChangeStage?: (
    name: 'stageId' | 'name' | 'closeDate' | 'description' | 'assignedUserIds',
    value: any
  ) => void;
};

class MoveContainer extends React.Component<{
  stagesQuery: any;
  options: IOptions;
}> {
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
      { item: { pipeline: IPipeline }; options: IOptions },
      StagesQueryResponse,
      { pipelineId: string }
    >(gql(boardQueries.stages), {
      name: 'stagesQuery',
      options: ({ item: { pipeline } }) => ({
        variables: {
          pipelineId: pipeline._id
        }
      })
    })
  )(MoveContainer)
);
