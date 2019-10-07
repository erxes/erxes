import dayjs from 'dayjs';
import { IBoard, IPipeline } from 'modules/boards/types';
import Icon from 'modules/common/components/Icon';
import Label from 'modules/common/components/Label';
import { __ } from 'modules/common/utils';
import React from 'react';
import { Link } from 'react-router-dom';
import {
  PipelineActions,
  PipelineListRow,
  PipelineMeta,
  PipelineName
} from '../../styles';

type Props = {
  pipeline: IPipeline;
  currentBoard: IBoard;
};

class PipelineRow extends React.Component<Props, {}> {
  renderText(state: string) {
    switch (state) {
      case 'Completed':
        return 'success';
      case 'In progress':
        return 'warning';
      default:
        return 'simple';
    }
  }

  renderState(state?: string) {
    if (state) {
      return <Label lblStyle={this.renderText(state)}>{state}</Label>;
    }

    return null;
  }

  renderDate(pipeline) {
    const { startDate, endDate } = pipeline;

    if (!startDate && !endDate) {
      return null;
    }

    return (
      <>
        <Icon icon="wallclock" />
        {dayjs(startDate).format('ll')} {' - '}
        {dayjs(endDate).format('ll')}
      </>
    );
  }

  render() {
    const { pipeline, currentBoard } = this.props;

    return (
      <PipelineListRow key={pipeline._id}>
        <PipelineMeta>
          <PipelineName>{pipeline.name}</PipelineName>
          <Icon icon="light-bulb" />
          {pipeline.itemsTotalCount}
          {this.renderState(pipeline.state)}
          {this.renderDate(pipeline)}
        </PipelineMeta>

        <PipelineActions>
          <Link
            to={`/growthHack/board?id=${currentBoard._id}&pipelineId=${
              pipeline._id
            }`}
          >
            <Icon icon="arrow-to-right" />
            {__(' Go to project')}
          </Link>
        </PipelineActions>
      </PipelineListRow>
    );
  }
}

export default PipelineRow;
