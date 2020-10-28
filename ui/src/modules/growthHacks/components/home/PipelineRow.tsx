import dayjs from 'dayjs';
import { IPipeline } from 'modules/boards/types';
import Icon from 'modules/common/components/Icon';
import Label from 'modules/common/components/Label';
import React from 'react';
import { Link } from 'react-router-dom';
import { PipelineMeta, ProjectItem } from './styles';

type Props = {
  pipeline: IPipeline;
};

class PipelineRow extends React.Component<Props, {}> {
  renderText(state: string) {
    switch (state) {
      case 'Completed':
        return 'primary';
      case 'In progress':
        return 'success';
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
      <div>
        <Icon icon="clock-eight" />
        {dayjs(startDate).format('ll')} {' - '}
        {dayjs(endDate).format('ll')}
      </div>
    );
  }

  render() {
    const { pipeline } = this.props;

    return (
      <Link
        to={`/growthHack/board?id=${pipeline.boardId}&pipelineId=${pipeline._id}`}
      >
        <ProjectItem key={pipeline._id}>
          <h5>{pipeline.name}</h5>
          <PipelineMeta>
            {this.renderState(pipeline.state)}
            {this.renderDate(pipeline)}
          </PipelineMeta>
        </ProjectItem>
      </Link>
    );
  }
}

export default PipelineRow;
