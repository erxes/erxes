import {
  Button,
  DropdownToggle,
  EmptyState,
  FormControl,
  Icon,
  Tip
} from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { SelectCompanies } from 'modules/companies/containers';
import { SelectCustomers } from 'modules/customers/containers/common';
import { PopoverHeader } from 'modules/notifications/components/styles';
import { SelectProducts } from 'modules/settings/productService/containers';
import { IProduct } from 'modules/settings/productService/types';
import { SelectTeamMembers } from 'modules/settings/team/containers';
import * as React from 'react';
import { Dropdown } from 'react-bootstrap';
import { Overlay, Popover } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  ClearDate,
  ClearFilter,
  DateFilter,
  FilterBox,
  FilterBtn,
  FilterDetail,
  FilterItem,
  RemoveFilter
} from '../styles/filter';
import {
  ButtonGroup,
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
  products: IProduct[];
  assignedUserIds?: string[];
};

type State = {
  show: boolean;
  target: any;
};

// get selected deal type from URL
const getType = () =>
  window.location.href.includes('calendar') ? 'calendar' : 'board';

const teamMemberCustomOption = {
  value: '',
  label: 'Assigned to no one'
};

class MainActionBar extends React.Component<Props, State> {
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

  onFilterClick = (type: string) => {
    const { currentBoard, currentPipeline } = this.props;

    if (currentBoard && currentPipeline) {
      return `/deal/${type}?id=${currentBoard._id}&pipelineId=${
        currentPipeline._id
      }`;
    }

    return `/deal/${type}`;
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

      let link = `/deal/${getType()}?id=${board._id}`;

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
            to={`/deal/${getType()}?id=${currentBoard._id}&pipelineId=${
              pipeline._id
            }`}
          >
            {pipeline.name}
          </Link>
        </li>
      );
    });
  }

  renderDates() {
    const { history, queryParams } = this.props;

    if (history.location.pathname.includes('calendar')) {
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

  render() {
    const {
      currentBoard,
      currentPipeline,
      middleContent,
      queryParams,
      onSelect,
      isFiltered
    } = this.props;

    const boardLink = this.onFilterClick('board');
    const calendarLink = this.onFilterClick('calendar');
    const hasFilter = isFiltered();
    const active = isFiltered();
    const actionBarLeft = (
      <HeaderItems>
        <HeaderLabel>
          <Icon icon="layout" /> {__('Board')}:{' '}
        </HeaderLabel>
        <Dropdown id="dropdown-board">
          <DropdownToggle bsRole="toggle">
            <HeaderButton>
              {(currentBoard && currentBoard.name) || __('Choose board')}
              <Icon icon="downarrow" />
            </HeaderButton>
          </DropdownToggle>
          <Dropdown.Menu>{this.renderBoards()}</Dropdown.Menu>
        </Dropdown>
        <HeaderLabel>
          <Icon icon="verticalalignment" /> {__('Pipeline')}:{' '}
        </HeaderLabel>
        <Dropdown id="dropdown-pipeline">
          <DropdownToggle bsRole="toggle">
            <HeaderButton>
              {(currentPipeline && currentPipeline.name) ||
                __('Choose pipeline')}
              <Icon icon="downarrow" />
            </HeaderButton>
          </DropdownToggle>
          <Dropdown.Menu>{this.renderPipelines()}</Dropdown.Menu>
        </Dropdown>
        <HeaderLink>
          <Tip text={__('Manage Board & Pipeline')}>
            <Link to="/settings/deals">
              <Icon icon="settings" />
            </Link>
          </Tip>
        </HeaderLink>
      </HeaderItems>
    );

    const DealFilter = (
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
            <SelectProducts
              label="Choose products"
              name="productIds"
              queryParams={queryParams}
              onSelect={onSelect}
            />
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

    const actionBarRight = (
      <HeaderItems>
        {middleContent && middleContent()}

        <div style={{ display: 'inline-block' }}>
          <FormControl
            defaultValue={queryParams.search}
            placeholder={__('Search ...')}
            onKeyPress={this.onSearch}
            autoFocus={true}
          />
        </div>

        <HeaderLink>
          <Tip text={__('Filter')}>
            <FilterBtn active={active}>
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
          {DealFilter}
        </HeaderLink>

        <ButtonGroup>
          <Link
            to={boardLink}
            className={getType() === 'board' ? 'active' : ''}
          >
            <Icon icon="layout" />
            {__('Board')}
          </Link>
          <Link
            to={calendarLink}
            className={getType() === 'calendar' ? 'active' : ''}
          >
            <Icon icon="calendar" />
            {__('Calendar')}
          </Link>
        </ButtonGroup>
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
