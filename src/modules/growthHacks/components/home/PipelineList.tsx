import { IBoard, IPipeline } from 'modules/boards/types';
import EmptyState from 'modules/common/components/EmptyState';
import { BoxContainer } from 'modules/settings/growthHacks/styles';
import React from 'react';
import PipelineRow from './PipelineRow';

type Props = {
  currentBoard?: IBoard;
  pipelines: IPipeline[];
};
class PipelineList extends React.Component<Props, {}> {
  render() {
    const { pipelines, currentBoard } = this.props;
    if (pipelines.length === 0) {
      return <EmptyState text="No projects" image="/images/actions/16.svg" />;
    }

    if (!currentBoard) {
      return null;
    }

    return (
      <BoxContainer>
        {pipelines.map(pipeline => (
          <PipelineRow
            key={pipeline._id}
            pipeline={pipeline}
            currentBoard={currentBoard}
          />
        ))}
      </BoxContainer>
    );
  }
}

export default PipelineList;
