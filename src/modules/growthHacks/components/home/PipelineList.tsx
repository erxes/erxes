import { IBoard, IPipeline } from 'modules/boards/types';
import EmptyState from 'modules/common/components/EmptyState';
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
      return <EmptyState icon="stop" text="No other pipeline" size="small" />;
    }

    if (!currentBoard) {
      return null;
    }

    return pipelines.map(pipeline => (
      <PipelineRow
        key={pipeline._id}
        pipeline={pipeline}
        currentBoard={currentBoard}
      />
    ));
  }
}

export default PipelineList;
