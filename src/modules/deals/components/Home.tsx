import { Button, DropdownToggle, EmptyState } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import { BarItems } from 'modules/layout/styles';
import * as React from 'react';
import { Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Board } from '../containers';
import { IBoard, IPipeline } from '../types';

type Props = {
  currentBoard?: IBoard;
  currentPipeline?: IPipeline;
  boards: IBoard[];
  loading?: boolean;
};

class Home extends React.Component<Props> {
  renderBoards() {
    const { currentBoard, boards } = this.props;

    if (boards.length <= 1) {
      return <EmptyState icon="layout" text="No other boards" size="small" />;
    }

    return boards.map(board => {
      if (currentBoard && board._id === currentBoard._id) {
        return null;
      }

      let link = `/deals/board?id=${board._id}`;

      const { pipelines = [] } = board;

      if (pipelines.length > 0) {
        link = `${link}&pipelineId=${pipelines[0]._id}`;
      }

      return (
        <li key={board._id}>
          <Link to={link}>{board.name}</Link>
        </li>
      );
    });
  }

  renderPipelines() {
    const { currentBoard, currentPipeline } = this.props;
    const pipelines = currentBoard ? currentBoard.pipelines || [] : [];

    if (pipelines.length <= 1) {
      return <EmptyState icon="stop" text="No other pipeline" size="small" />;
    }

    if (!currentBoard) {
      return null;
    }

    return pipelines.map(pipeline => {
      if (currentPipeline && pipeline._id === currentPipeline._id) {
        return null;
      }

      return (
        <li key={pipeline._id}>
          <Link
            to={`/deals/board?id=${currentBoard._id}&pipelineId=${
              pipeline._id
            }`}
          >
            {pipeline.name}
          </Link>
        </li>
      );
    });
  }

  renderActionBar() {
    const { currentBoard, currentPipeline } = this.props;

    const actionBarLeft = (
      <BarItems>
        <Dropdown id="dropdown-board">
          <DropdownToggle bsRole="toggle">
            <Button btnStyle="primary" icon="downarrow" ignoreTrans={true}>
              {(currentBoard && currentBoard.name) || __('There is no board')}
            </Button>
          </DropdownToggle>
          <Dropdown.Menu>{this.renderBoards()}</Dropdown.Menu>
        </Dropdown>

        <Dropdown id="dropdown-pipeline">
          <DropdownToggle bsRole="toggle">
            <Button btnStyle="primary" icon="downarrow" ignoreTrans={true}>
              {(currentPipeline && currentPipeline.name) || __('No pipeline')}
            </Button>
          </DropdownToggle>
          <Dropdown.Menu>{this.renderPipelines()}</Dropdown.Menu>
        </Dropdown>
      </BarItems>
    );

    const actionBarRight = (
      <Button btnStyle="success" icon="settings">
        <Link to="/settings/deals">{__('Manage Board & Pipeline')}</Link>
      </Button>
    );

    return (
      <Wrapper.ActionBar
        left={actionBarLeft}
        right={actionBarRight}
        background="transparent"
      />
    );
  }

  render() {
    const breadcrumb = [{ title: __('Deal') }];

    const { currentPipeline } = this.props;

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        actionBar={this.renderActionBar()}
        content={<Board currentPipeline={currentPipeline} />}
        transparent={true}
      />
    );
  }
}

export default Home;
