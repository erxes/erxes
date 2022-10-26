import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Icon from '@erxes/ui/src/components/Icon';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils/core';
import Participators from '@erxes/ui-inbox/src/inbox/components/conversationDetail/workarea/Participators';
import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { Link } from 'react-router-dom';
import PipelineWatch from '../containers/PipelineWatch';
import {
  BarItems,
  HeaderButton,
  HeaderLabel,
  HeaderLink,
  PageHeader,
  ButtonGroup
} from '../styles/header';
import { IBoard, IOptions, IPipeline } from '../types';
import RightMenu from './RightMenu';
import { GroupByContent } from '../styles/common';
import Button from '@erxes/ui/src/components/Button';
import {
  chartTypes,
  stackByChart,
  groupByList,
  groupByGantt,
  showByTime
} from '../constants';
import SelectType from './SelectType';

type Props = {
  onSearch: (search: string) => void;
  onSelect: (values: string[] | string, key: string) => void;
  isFiltered: () => boolean;
  clearFilter: () => void;
  currentBoard?: IBoard;
  currentPipeline?: IPipeline;
  boards: IBoard[];
  middleContent?: () => React.ReactNode;
  history: any;
  queryParams: any;
  extraFilter?: React.ReactNode;
  link: string;
  rightContent?: () => React.ReactNode;
  groupContent?: () => React.ReactNode;
  boardText?: string;
  pipelineText?: string;
  options: IOptions;
  viewType: string;
};

class MainActionBar extends React.Component<Props> {
  static defaultProps = {
    viewType: 'board',
    boardText: 'Board',
    pipelineText: 'Pipeline'
  };

  renderBoards() {
    const { currentBoard, boards } = this.props;
    if ((currentBoard && boards.length === 1) || boards.length === 0) {
      return (
        <EmptyState icon="web-grid-alt" text="No other boards" size="small" />
      );
    }

    return boards.map(board => {
      let link = `${this.props.link}?id=${board._id}`;

      const { pipelines = [] } = board;

      if (pipelines.length > 0) {
        link = `${link}&pipelineId=${pipelines[0]._id}`;
      }

      return (
        <li key={board._id}>
          <Link to={link}>{board.name}</Link>
          {currentBoard && board._id === currentBoard._id && (
            <Icon icon="check-1" size={15} />
          )}
        </li>
      );
    });
  }

  renderPipelines() {
    const { currentBoard, currentPipeline, link } = this.props;
    const pipelines = currentBoard ? currentBoard.pipelines || [] : [];

    if ((currentPipeline && pipelines.length === 1) || pipelines.length === 0) {
      return (
        <EmptyState
          icon="web-section-alt"
          text="No other pipeline"
          size="small"
        />
      );
    }

    if (!currentBoard) {
      return null;
    }

    return pipelines.map(pipeline => {
      return (
        <li key={pipeline._id}>
          <Link
            to={`${link}?id=${currentBoard._id}&pipelineId=${pipeline._id}`}
          >
            {pipeline.name}
          </Link>
          {currentPipeline && pipeline._id === currentPipeline._id && (
            <Icon icon="check-1" size={15} />
          )}
        </li>
      );
    });
  }

  renderFilter() {
    const isFiltered = this.props.isFiltered();
    const {
      onSearch,
      onSelect,
      queryParams,
      link,
      extraFilter,
      options,
      clearFilter
    } = this.props;

    const rightMenuProps = {
      onSearch,
      onSelect,
      queryParams,
      link,
      extraFilter,
      options,
      isFiltered,
      clearFilter
    };

    return <RightMenu {...rightMenuProps} />;
  }

  renderVisibility() {
    const { currentPipeline } = this.props;

    if (!currentPipeline) {
      return null;
    }

    if (currentPipeline.visibility === 'public') {
      return (
        <HeaderButton isActive={true}>
          <Icon icon="earthgrid" /> {__('Public')}
        </HeaderButton>
      );
    }

    const members = currentPipeline.members || [];

    return (
      <>
        <HeaderButton isActive={true}>
          <Icon icon="users-alt" /> {__('Private')}
        </HeaderButton>
        <Participators participatedUsers={members} limit={3} />
      </>
    );
  }

  renderGroupBy = () => {
    const { viewType, queryParams } = this.props;

    if (viewType !== 'list' && viewType !== 'gantt') {
      return null;
    }

    return (
      <GroupByContent>
        <SelectType
          title={__('Group by:')}
          icon="list-2"
          list={viewType === 'list' ? groupByList : groupByGantt}
          text={__('Stage')}
          queryParamName="groupBy"
          queryParams={queryParams}
        />
      </GroupByContent>
    );
  };

  renderChartView = () => {
    const { viewType, queryParams } = this.props;

    if (viewType !== 'chart') {
      return null;
    }

    return (
      <GroupByContent>
        <SelectType
          title={__('Chart Type:')}
          icon="chart-bar"
          list={chartTypes}
          text={__('Stacked Bar Chart')}
          queryParamName="chartType"
          queryParams={queryParams}
        />
        &nbsp;&nbsp;&nbsp;
        <SelectType
          title={__('Stack By:')}
          icon="list-2"
          list={stackByChart}
          text={__('Stage')}
          queryParamName="stackBy"
          queryParams={queryParams}
        />
      </GroupByContent>
    );
  };

  renderTimeView = () => {
    const { viewType, queryParams } = this.props;

    if (viewType !== 'time') {
      return null;
    }

    return (
      <GroupByContent>
        <SelectType
          title={__('Group by:')}
          icon="list-2"
          list={showByTime}
          text={__('Stage')}
          queryParamName="groupBy"
          queryParams={queryParams}
        />
      </GroupByContent>
    );
  };

  renderViewChooser = () => {
    const { currentBoard, currentPipeline, options, viewType } = this.props;

    const type = options.type;
    localStorage.setItem(`${type}View`, `${viewType}`);

    const onFilterClick = (type: string) => {
      if (currentBoard && currentPipeline) {
        return `/${options.type}/${type}?id=${currentBoard._id}&pipelineId=${currentPipeline._id}`;
      }

      return `/${options.type}/${type}`;
    };

    return (
      <ButtonGroup>
        <Dropdown>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-taskaction">
            <Button btnStyle="primary" icon="list-ui-alt">
              {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
              <Icon icon="angle-down" />
            </Button>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <li key="board">
              <Link
                to={onFilterClick('board')}
                className={viewType === 'board' ? 'active' : ''}
              >
                {__('Board')}
              </Link>
            </li>
            <li key="calendar">
              <Link
                to={onFilterClick('calendar')}
                className={viewType === 'calendar' ? 'active' : ''}
              >
                {__('Calendar')}
              </Link>
            </li>
            {options.type === 'deal' && (
              <li key="conversion">
                <Link
                  to={onFilterClick('conversion')}
                  className={viewType === 'conversion' ? 'active' : ''}
                >
                  {__('Conversion')}
                </Link>
              </li>
            )}
            <li key="activity">
              <Link
                to={onFilterClick('activity')}
                className={viewType === 'activity' ? 'active' : ''}
              >
                {__('Activity')}
              </Link>
            </li>
            <li key="list">
              <Link
                to={onFilterClick('list')}
                className={viewType === 'list' ? 'active' : ''}
              >
                {__('List')}
              </Link>
            </li>
            <li key="chart">
              <Link
                to={onFilterClick('chart')}
                className={viewType === 'chart' ? 'active' : ''}
              >
                {__('Chart')}
              </Link>
            </li>
            <li key="gantt">
              <Link
                to={onFilterClick('gantt')}
                className={viewType === 'gantt' ? 'active' : ''}
              >
                {__('Gantt')}
              </Link>
            </li>

            <li key="time">
              <Link
                to={onFilterClick('time')}
                className={viewType === 'time' ? 'active' : ''}
              >
                {__('Time')}
              </Link>
            </li>
          </Dropdown.Menu>
        </Dropdown>
      </ButtonGroup>
    );
  };

  render() {
    const {
      currentBoard,
      currentPipeline,
      middleContent,
      options,
      rightContent,
      boardText,
      pipelineText
    } = this.props;

    const type = options.type;

    const actionBarLeft = (
      <BarItems>
        <HeaderLabel>
          <Icon icon="web-grid-alt" /> {__(boardText || '')}:{' '}
        </HeaderLabel>
        <Dropdown>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-board">
            <HeaderButton rightIconed={true}>
              {(currentBoard && currentBoard.name) || __('Choose board')}
              <Icon icon="angle-down" />
            </HeaderButton>
          </Dropdown.Toggle>
          <Dropdown.Menu>{this.renderBoards()}</Dropdown.Menu>
        </Dropdown>
        <HeaderLabel>
          <Icon icon="web-section-alt" /> {__(pipelineText || '')}:{' '}
        </HeaderLabel>
        <Dropdown>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-pipeline">
            <HeaderButton rightIconed={true}>
              {(currentPipeline && currentPipeline.name) ||
                __('Choose pipeline')}
              <Icon icon="angle-down" />
            </HeaderButton>
          </Dropdown.Toggle>
          <Dropdown.Menu>{this.renderPipelines()}</Dropdown.Menu>
        </Dropdown>
        <HeaderLink>
          <Tip text={__('Manage Board & Pipeline')} placement="bottom">
            <Link
              to={`/settings/boards/${type}?boardId=${
                currentBoard ? currentBoard._id : ''
              }`}
            >
              <Icon icon="cog" />
            </Link>
          </Tip>
        </HeaderLink>

        {currentPipeline ? (
          <PipelineWatch pipeline={currentPipeline} type={type} />
        ) : null}

        {this.renderVisibility()}
      </BarItems>
    );

    const actionBarRight = (
      <BarItems>
        {middleContent && middleContent()}

        {this.renderGroupBy()}

        {this.renderChartView()}

        {this.renderTimeView()}

        {this.renderViewChooser()}

        {rightContent && rightContent()}

        {this.renderFilter()}
      </BarItems>
    );

    return (
      <PageHeader id="board-pipeline-header">
        {actionBarLeft}
        {actionBarRight}
      </PageHeader>
    );
  }
}

export default MainActionBar;
