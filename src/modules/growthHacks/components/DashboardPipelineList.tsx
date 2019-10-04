import { IPipeline, IBoard } from 'modules/boards/types';
import EmptyState from 'modules/common/components/EmptyState';
import DashboardPipelineRow from './DashboardPipelineRow';
import React from 'react';

type Props = {
  currentBoard?: IBoard;
  pipelines: IPipeline[];
};
class DashboardPipelineList extends React.Component<Props, {}> {
  render() {
    const { pipelines, currentBoard } = this.props;
    if (pipelines.length === 0) {
      return <EmptyState icon="stop" text="No other pipeline" size="small" />;
    }

    if (!currentBoard) {
      return null;
    }
    return pipelines.map(pipeline => (
      <DashboardPipelineRow
        key={pipeline._id}
        pipeline={pipeline}
        currentBoard={currentBoard}
      />
    ));
  }
}

export default DashboardPipelineList;
