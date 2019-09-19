import dayjs from 'dayjs';
import { IBoard, IPipeline } from 'modules/boards/types';
import EmptyState from 'modules/common/components/EmptyState';
import React from 'react';
import { Link } from 'react-router-dom';

type Props = {
  currentBoard?: IBoard;
  pipelines: IPipeline[];
  boards: IBoard[];
  boardId: string;
};

class DashBoard extends React.Component<Props> {
  renderBoards() {
    const { boards } = this.props;

    return boards.map(board => (
      <li key={board._id}>
        <Link to={`/growthHack/dashboard?id=${board._id}`}>{board.name}</Link>
      </li>
    ));
  }

  renderFilter() {
    const { boardId } = this.props;

    return (
      <ul>
        <li>
          <Link to={`/growthHack/dashBoard?id=${boardId}`}>All</Link>
        </li>
        <li>
          <Link to={`/growthHack/dashBoard?id=${boardId}&state=In progress`}>
            In progress
          </Link>
        </li>
        <li>
          <Link to={`/growthHack/dashBoard?id=${boardId}&state=Not started`}>
            Not started
          </Link>
        </li>
        <li>
          <Link to={`/growthHack/dashBoard?id=${boardId}&state=Completed`}>
            Completed
          </Link>
        </li>
      </ul>
    );
  }

  renderPipelines() {
    const { currentBoard, pipelines } = this.props;

    if (pipelines.length === 0) {
      return <EmptyState icon="stop" text="No other pipeline" size="small" />;
    }

    if (!currentBoard) {
      return null;
    }

    return pipelines.map(pipeline => {
      return (
        <li key={pipeline._id}>
          <Link
            to={`/growthHack/board?id=${currentBoard._id}&pipelineId=${
              pipeline._id
            }`}
          >
            {pipeline.name}
            <br />
            Start date: {dayjs(pipeline.startDate).format('MMM DD, YYYY')}
            <br />
            End date: {dayjs(pipeline.endDate).format('MMM DD, YYYY')}
            <br />
            State: {pipeline.state}
            <br />
          </Link>
        </li>
      );
    });
  }

  render() {
    return (
      <div>
        <h1>Boards</h1>
        {this.renderBoards()}
        <h2>Pipelines</h2>
        {this.renderFilter()}
        {this.renderPipelines()}
      </div>
    );
  }
}

export default DashBoard;
