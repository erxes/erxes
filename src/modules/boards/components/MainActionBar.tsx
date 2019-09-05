import {
  ClearDate,
  ClearFilter,
  DateFilter,
  FilterBox,
  FilterBtn,
  FilterDetail,
  FilterItem,
  RemoveFilter
} from 'modules/boards/styles/filter';
import Button from 'modules/common/components/Button';
import DropdownToggle from 'modules/common/components/DropdownToggle';
import EmptyState from 'modules/common/components/EmptyState';
import FormControl from 'modules/common/components/form/Control';
import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';
import { __ } from 'modules/common/utils';
import SelectCompanies from 'modules/companies/containers/SelectCompanies';
import SelectCustomers from 'modules/customers/containers/common/SelectCustomers';
import Participators from 'modules/inbox/components/conversationDetail/workarea/Participators';
import { PopoverHeader } from 'modules/notifications/components/styles';
import SelectTeamMembers from 'modules/settings/team/containers/SelectTeamMembers';
import React from 'react';
import { Overlay, Popover } from 'react-bootstrap';
import { Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PipelineWatch from '../containers/PipelineWatch';
import {
  HeaderButton,
  HeaderItems,
  HeaderLabel,
  HeaderLink,
  PageHeader
} from '../styles/header';
import { IBoard, IPipeline } from '../types';

type Props = {
  onSearch: (search: string) => void;
  onSelect: (values: string[] | string, name: string) => void;
  onDateFilterSelect: (name: string, value: string) => void;
  onClear: (name: string, values) => void;
  isFiltered: () => boolean;
  clearFilter: () => void;
  currentBoard?: IBoard;
  currentPipeline?: IPipeline;
  boards: IBoard[];
  middleContent?: () => React.ReactNode;
  history: any;
  queryParams: any;
  assignedUserIds?: string[];
  type: string;
  extraFilter?: React.ReactNode;
  link: string;
  rightContent?: () => React.ReactNode;
};

type State = {
  show: boolean;
  target: any;
};

const teamMemberCustomOption = {
  value: '',
  label: 'Assigned to no one'
};

class MainActionBar extends React.Component<Props, State> {
  static defaultProps = {
    viewType: 'board'
  };

  constructor(props) {
    super(props);

    this.state = {
      show: false,
      target: null
    };
  }

  showFilter = ({ target }) => {
    this.setState(s => ({ target, show: !s.show }));
  };

  onSearch = (e: React.KeyboardEvent<Element>) => {
    if (e.key === 'Enter') {
      const target = e.currentTarget as HTMLInputElement;
      this.props.onSearch(target.value || '');
    }
  };

  toggleFilter = () => {
    this.setState({ show: !this.state.show });
  };

  hideFilter = () => {
    this.setState({ show: false });
  };

  onClear = (name: string) => {
    this.props.onSelect(name, '');
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

      let link = `${this.props.link}?id=${board._id}`;

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
    const { currentBoard, currentPipeline, link } = this.props;

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
            to={`${link}?id=${currentBoard._id}&pipelineId=${pipeline._id}`}
          >
            {pipeline.name}
          </Link>
        </li>
      );
    });
  }

  renderDates() {
    const { queryParams, link } = this.props;

    if (link.includes('calendar')) {
      return null;
    }

    const { onDateFilterSelect, onClear } = this.props;

    const renderLink = (label: string, name: string) => {
      const selected = queryParams[name] && queryParams[name].length > 0;

      return (
        <FilterItem>
          <FilterDetail
            selected={selected}
            onClick={onDateFilterSelect.bind(this, name, 'true')}
          >
            {__(label)}
          </FilterDetail>
          <ClearDate selected={selected}>
            <Tip text={__('Remove this filter')}>
              <Button
                btnStyle="link"
                icon="cancel-1"
                onClick={onClear.bind(this, name)}
              />
            </Tip>
          </ClearDate>
        </FilterItem>
      );
    };

    return (
      <DateFilter>
        {renderLink('Due to the next day', 'nextDay')}
        {renderLink('Due in the next week', 'nextWeek')}
        {renderLink('Due in the next month', 'nextMonth')}
        {renderLink('Has no close date', 'noCloseDate')}
        {renderLink('Overdue', 'overdue')}
      </DateFilter>
    );
  }

  renderFilterOverlay() {
    const { queryParams, onSelect, extraFilter } = this.props;

    return (
      <Overlay
        show={this.state.show}
        onHide={this.hideFilter}
        placement="bottom"
        rootClose={true}
        containerPadding={20}
        target={this.state.target}
      >
        <Popover id="popover-contained">
          <PopoverHeader>{__('Filter')}</PopoverHeader>
          <FilterBox>
            {extraFilter}
            <SelectCompanies
              label="Choose companies"
              name="companyIds"
              queryParams={queryParams}
              onSelect={onSelect}
            />
            <SelectCustomers
              label="Choose customers"
              name="customerIds"
              queryParams={queryParams}
              onSelect={onSelect}
            />
            <SelectTeamMembers
              label="Choose team members"
              name="assignedUserIds"
              queryParams={queryParams}
              onSelect={onSelect}
              customOption={teamMemberCustomOption}
            />

            {this.renderDates()}
          </FilterBox>
          <ClearFilter>
            <Button
              btnStyle="primary"
              onClick={this.props.clearFilter}
              block={true}
              size="small"
            >
              {__('Clear filter')}
            </Button>
          </ClearFilter>
        </Popover>
      </Overlay>
    );
  }

  renderFilter() {
    const hasFilter = this.props.isFiltered();

    return (
      <HeaderLink>
        <Tip text={__('Filter')} placement="bottom">
          <FilterBtn active={hasFilter}>
            <Button
              btnStyle={hasFilter ? 'success' : 'link'}
              className={hasFilter ? 'filter-success' : 'filter-link'}
              icon="filter"
              onClick={this.showFilter}
            >
              {hasFilter && __('Filtering is on')}
            </Button>
            {hasFilter && (
              <RemoveFilter>
                <Button
                  btnStyle="link"
                  icon="cancel-1"
                  onClick={this.props.clearFilter}
                />
              </RemoveFilter>
            )}
          </FilterBtn>
        </Tip>
        {this.renderFilterOverlay()}
      </HeaderLink>
    );
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
          <Icon icon="user" /> {__('Private')}
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
      queryParams,
      type,
      rightContent
    } = this.props;

    const actionBarLeft = (
      <HeaderItems>
        <HeaderLabel>
          <Icon icon="layout" /> {__('Board')}:{' '}
        </HeaderLabel>
        <Dropdown id="dropdown-board">
          <DropdownToggle bsRole="toggle">
            <HeaderButton rightIconed={true}>
              {(currentBoard && currentBoard.name) || __('Choose board')}
              <Icon icon="angle-down" />
            </HeaderButton>
          </DropdownToggle>
          <Dropdown.Menu>{this.renderBoards()}</Dropdown.Menu>
        </Dropdown>
        <HeaderLabel>
          <Icon icon="verticalalignment" /> {__('Pipeline')}:{' '}
        </HeaderLabel>
        <Dropdown id="dropdown-pipeline">
          <DropdownToggle bsRole="toggle">
            <HeaderButton rightIconed={true}>
              {(currentPipeline && currentPipeline.name) ||
                __('Choose pipeline')}
              <Icon icon="angle-down" />
            </HeaderButton>
          </DropdownToggle>
          <Dropdown.Menu>{this.renderPipelines()}</Dropdown.Menu>
        </Dropdown>
        <HeaderLink>
          <Tip text={__('Manage Board & Pipeline')}>
            <Link to={`/settings/boards/${type}`}>
              <Icon icon="settings" />
            </Link>
          </Tip>
        </HeaderLink>

        {currentPipeline ? (
          <PipelineWatch pipeline={currentPipeline} type={type} />
        ) : null}

        {this.renderVisibility()}
      </HeaderItems>
    );

    const actionBarRight = (
      <HeaderItems>
        {middleContent && middleContent()}

        <FormControl
          defaultValue={queryParams.search}
          placeholder={__('Search ...')}
          onKeyPress={this.onSearch}
          autoFocus={true}
        />

        {this.renderFilter()}

        {rightContent && rightContent()}
      </HeaderItems>
    );

    return (
      <PageHeader>
        {actionBarLeft}
        {actionBarRight}
      </PageHeader>
    );
  }
}

export default MainActionBar;
