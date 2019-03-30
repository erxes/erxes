import {
  Button,
  DropdownToggle,
  EmptyState,
  FormControl
} from 'modules/common/components';
import { __, router as routerUtils } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import { BarItems } from 'modules/layout/styles';
import * as React from 'react';
import { Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { IBoard, IPipeline } from '../types';

type Props = {
  onSearch: (search: string) => void;
  currentBoard?: IBoard;
  currentPipeline?: IPipeline;
  boards: IBoard[];
  middleContent?: () => React.ReactNode;
  history: any;
  queryParams: any;
};

// get selected deal type from URL
const getType = () =>
  window.location.href.includes('calendar') ? 'calendar' : 'board';

class MainActionBar extends React.Component<Props> {
  componentDidMount() {
    const { currentBoard, currentPipeline, history } = this.props;

    if (currentBoard && currentPipeline) {
      routerUtils.setParams(history, {
        id: currentBoard._id,
        pipelineId: currentPipeline._id
      });
    }
  }

  onSearch = (e: React.KeyboardEvent<Element>) => {
    if (e.key === 'Enter') {
      const target = e.currentTarget as HTMLInputElement;
      this.props.onSearch(target.value || '');
    }
  };

  onFilterClick = (type: string) => {
    const { currentBoard, currentPipeline } = this.props;

    if (currentBoard && currentPipeline) {
      return `/deals/${type}?id=${currentBoard._id}&pipelineId=${
        currentPipeline._id
      }`;
    }

    return `/deals/${type}`;
  };

  renderBoards() {
    const { currentBoard, boards } = this.props;

    if ((currentBoard && boards.length === 1) || boards.length === 0) {
      return <EmptyState icon="layout" text="No other boards" size="small" />;
    }

    return boards.map(board => {
      if (currentBoard && board._id === currentBoard._id) {
        return null;
      }

      let link = `/deals/${getType()}?id=${board._id}`;

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

    if ((currentPipeline && pipelines.length === 1) || pipelines.length === 0) {
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
            to={`/deals/${getType()}?id=${currentBoard._id}&pipelineId=${
              pipeline._id
            }`}
          >
            {pipeline.name}
          </Link>
        </li>
      );
    });
  }

  render() {
    const {
      currentBoard,
      currentPipeline,
      middleContent,
      queryParams
    } = this.props;

    const boardLink = this.onFilterClick('board');
    const calendarLink = this.onFilterClick('calendar');

    const actionBarLeft = (
      <BarItems>
        <Dropdown id="dropdown-board">
          <DropdownToggle bsRole="toggle">
            <Button btnStyle="primary" icon="downarrow" ignoreTrans={true}>
              {(currentBoard && currentBoard.name) || __('Choose board')}
            </Button>
          </DropdownToggle>
          <Dropdown.Menu>{this.renderBoards()}</Dropdown.Menu>
        </Dropdown>

        <Dropdown id="dropdown-pipeline">
          <DropdownToggle bsRole="toggle">
            <Button btnStyle="primary" icon="downarrow" ignoreTrans={true}>
              {(currentPipeline && currentPipeline.name) ||
                __('Choose pipeline')}
            </Button>
          </DropdownToggle>
          <Dropdown.Menu>{this.renderPipelines()}</Dropdown.Menu>
        </Dropdown>
        {middleContent && middleContent()}
      </BarItems>
    );

    const actionBarRight = (
      <BarItems>
        <div style={{ display: 'inline-block' }}>
          <FormControl
            defaultValue={queryParams.search}
            placeholder="Search ..."
            onKeyPress={this.onSearch}
            autoFocus={true}
          />
        </div>

        {getType() === 'calendar' && (
          <Link to={boardLink}>
            <Button btnStyle="primary" icon="clipboard">
              {__('Board')}
            </Button>
          </Link>
        )}

        {getType() === 'board' && (
          <Link to={calendarLink}>
            <Button btnStyle="primary" icon="calendar">
              {__('Calendar')}
            </Button>
          </Link>
        )}

        <Link to="/settings/deals">
          <Button btnStyle="success" icon="settings">
            {__('Manage Board & Pipeline')}
          </Button>
        </Link>
      </BarItems>
    );

    return (
      <Wrapper.ActionBar
        left={actionBarLeft}
        right={actionBarRight}
        background="transparent"
      />
    );
  }
}

export default MainActionBar;
