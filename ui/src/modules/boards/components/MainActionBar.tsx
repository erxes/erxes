import DropdownToggle from 'modules/common/components/DropdownToggle';
import EmptyState from 'modules/common/components/EmptyState';
import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';
import { __ } from 'modules/common/utils';
import Participators from 'modules/inbox/components/conversationDetail/workarea/Participators';
import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { Link } from 'react-router-dom';
import PipelineWatch from '../containers/PipelineWatch';
import {
  BarItems,
  HeaderButton,
  HeaderLabel,
  HeaderLink,
  PageHeader
} from '../styles/header';
import { IBoard, IOptions, IPipeline } from '../types';
import RightMenu from './RightMenu';

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
  boardText?: string;
  pipelineText?: string;
  options: IOptions;
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
        <HeaderButton>
          <Icon icon="earthgrid" /> {__('Public')}
        </HeaderButton>
      );
    }

    const members = currentPipeline.members || [];

    return (
      <>
        <HeaderButton>
          <Icon icon="users-alt" /> {__('Private')}
        </HeaderButton>
        <Participators participatedUsers={members} limit={3} />
      </>
    );
  }

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
