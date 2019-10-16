import dayjs from 'dayjs';
import { IBoard, IPipeline } from 'modules/boards/types';
import Icon from 'modules/common/components/Icon';
import Label from 'modules/common/components/Label';
import { __ } from 'modules/common/utils';
import React from 'react';
import { Link } from 'react-router-dom';
import {
  BottomAction,
  PipelineMeta,
  ProjectItem,
  TopContent
} from '../../styles';

type Props = {
  pipeline: IPipeline;
  currentBoard: IBoard;
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
    const { pipeline, currentBoard } = this.props;

    return (
      <ProjectItem key={pipeline._id}>
        <TopContent>
          <h5>
            {pipeline.name}
            {this.renderState(pipeline.state)}
          </h5>
          <PipelineMeta>
            {this.renderDate(pipeline)}
            <div>
              <Icon icon="files-landscapes" />
              {pipeline.itemsTotalCount}
            </div>
          </PipelineMeta>
        </TopContent>

        <BottomAction>
          <Link
            to={`/growthHack/board?id=${currentBoard._id}&pipelineId=${
              pipeline._id
            }`}
          >
            {__(' Go to project')}
            <Icon icon="angle-double-right" />
          </Link>
        </BottomAction>
      </ProjectItem>
    );
  }
}

export default PipelineRow;
