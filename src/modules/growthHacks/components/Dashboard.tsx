import dayjs from 'dayjs';
import { IBoard } from 'modules/boards/types';
import EmptyState from 'modules/common/components/EmptyState';
import React from 'react';
import { Link } from 'react-router-dom';

type Props = {
  currentBoard?: IBoard;
  boards: IBoard[];
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

  renderState(pipeline) {
    if (pipeline.startDate && pipeline.endDate) {
      const timestamp = new Date().getTime();

      if (timestamp > pipeline.endDate) {
        return 'Completed';
      } else if (
        timestamp < pipeline.endDate &&
        timestamp > pipeline.startDate
      ) {
        return 'In progress';
      }
    }

    return null;
  }

  renderPipelines() {
    const { currentBoard } = this.props;

    const pipelines = currentBoard ? currentBoard.pipelines || [] : [];

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
            State: {this.renderState(pipeline)}
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
        {this.renderPipelines()}
      </div>
    );
  }
}

export default DashBoard;
