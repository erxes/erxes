import dayjs from 'dayjs';
import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import Label from 'modules/common/components/Label';
import { IPipeline, IBoard } from 'modules/boards/types';
import React from 'react';
import {
  PipelineRow,
  PipelineMeta,
  PipelineName,
  PipelineActions
} from '../styles';

type Props = {
  pipeline: IPipeline;
  currentBoard: IBoard;
};

class DashboardPipelineRow extends React.Component<Props, {}> {
  renderLabel(state) {
    switch (state) {
      case 'Completed':
        return 'success';
      case 'In progress':
        return 'warning';
      default:
        return 'simple';
    }
  }

  render() {
    const { pipeline, currentBoard } = this.props;
    return (
      <PipelineRow key={pipeline._id}>
        <div>
          <PipelineName>{pipeline.name}</PipelineName>
          <Label lblStyle={this.renderLabel(pipeline.state)}>
            {pipeline.state}
          </Label>
        </div>
        <PipelineMeta>
          <Icon icon="wallclock" />
          {dayjs(pipeline.startDate).format('ll')} {' - '}
          {dayjs(pipeline.endDate).format('ll')}
          <PipelineActions>
            <Button
              href={`/growthHack/board?id=${currentBoard._id}&pipelineId=${
                pipeline._id
              }`}
              size="small"
              icon="arrow-to-right"
            >
              {'Go to project'}
            </Button>
          </PipelineActions>
        </PipelineMeta>
      </PipelineRow>
    );
  }
}

export default DashboardPipelineRow;
