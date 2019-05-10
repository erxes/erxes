import { IUser } from 'modules/auth/types';
import {
  Button,
  ControlLabel,
  DropdownToggle,
  EmptyState,
  FormControl,
  FormGroup,
  Icon,
  Tip
} from 'modules/common/components';
import { router } from 'modules/common/utils';
import { __ } from 'modules/common/utils';
import { ICompany } from 'modules/companies/types';
import { ICustomer } from 'modules/customers/types';
import { IProduct } from 'modules/settings/productService/types';
import * as moment from 'moment';
import * as React from 'react';
import { Dropdown } from 'react-bootstrap';
import * as Datetime from 'react-datetime';
import { Link } from 'react-router-dom';
import Select from 'react-select-plus';
import { Avatar, FilterBox, SelectOption, SelectValue } from '../styles/deal';
import {
  ButtonGroup,
  HeaderButton,
  HeaderItems,
  HeaderLabel,
  HeaderLink,
  PageHeader
} from '../styles/header';
import { IBoard, IPipeline } from '../types';
import {
  selectCompanyOptions,
  selectCustomerOptions,
  selectProductOptions,
  selectUserOptions
} from '../utils';

type Props = {
  onSearch: (search: string) => void;
  onSelect: (name: string, values) => void;
  currentBoard?: IBoard;
  currentPipeline?: IPipeline;
  boards: IBoard[];
  middleContent?: () => React.ReactNode;
  history: any;
  queryParams: any;
  users: IUser[];
  customers: ICustomer[];
  companies: ICompany[];
  products: IProduct[];
  assignedUserIds?: string[];
};

type State = {
  startDate: string;
  endDate: string;
  isHidden: boolean;
};

// get selected deal type from URL
const getType = () =>
  window.location.href.includes('calendar') ? 'calendar' : 'board';

class MainActionBar extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { startDate, endDate } = props.queryParams;

    this.state = {
      startDate: startDate || '',
      endDate: endDate || '',
      isHidden: true
    };
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

  onSelectChange(name: string, values: [string]) {
    this.props.onSelect(name, values);
  }

  onClearDate = (name: string) => {
    if (name === 'startDate') {
      this.setState({ startDate: '' });
    } else {
      this.setState({ endDate: '' });
    }

    this.props.onSelect(name, '');
  };

  onDateInputChange = (type: string, date: moment.Moment) => {
    const formatDate = date ? moment(date).format('YYYY-MM-DD HH:mm') : '';

    if (type === 'startDate') {
      this.setState({ startDate: formatDate });
    } else {
      this.setState({ endDate: formatDate });
    }

    this.props.onSelect(type, formatDate);
  };

  toggleHidden = () => {
    this.setState({ isHidden: !this.state.isHidden });
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

  renderDatePicker({ label, value, name, dateProps }) {
    return (
      <FormGroup>
        <ControlLabel>{label}</ControlLabel>
        <Datetime
          {...dateProps}
          value={value}
          onChange={this.onDateInputChange.bind(this, name)}
          className="date-form"
        />
        <div className="clear-date">
          <Tip text={__('Delete')}>
            <Button
              btnStyle="link"
              icon="cancel-1"
              onClick={this.onClearDate.bind(this, name)}
            />
          </Tip>
        </div>
      </FormGroup>
    );
  }

  renderDates() {
    const { startDate, endDate } = this.state;

    const dateProps = {
      inputProps: { placeholder: 'Click to select a date' },
      timeFormat: 'HH:mm',
      dateFormat: 'YYYY/MM/DD'
    };

    return (
      <div className="date-filter">
        <h5>{__('Filter by date')}</h5>
        {this.renderDatePicker({
          label: __('Start date'),
          value: startDate,
          name: 'startDate',
          dateProps
        })}

        {this.renderDatePicker({
          label: __('End date'),
          value: endDate,
          name: 'endDate',
          dateProps
        })}
      </div>
    );
  }

  renderSelectors({ label, name, options, generator }) {
    const { queryParams } = this.props;

    const content = option => (
      <React.Fragment>
        <Avatar src={option.avatar || '/images/avatar-colored.svg'} />
        {option.label}
      </React.Fragment>
    );

    const selectOption = option => (
      <SelectOption className="simple-option">{content(option)}</SelectOption>
    );

    const selectValue = option => <SelectValue>{content(option)}</SelectValue>;

    const onChange = (selector, list) => {
      return this.onSelectChange(selector, list.map(item => item.value));
    };

    return (
      <Select
        placeholder={__(label)}
        value={queryParams[name]}
        onChange={onChange.bind(this, name)}
        optionRenderer={selectOption}
        valueRenderer={selectValue}
        removeSelected={true}
        options={generator(options)}
        multi={true}
      />
    );
  }

  render() {
    const {
      currentBoard,
      currentPipeline,
      middleContent,
      queryParams,
      users,
      customers,
      companies,
      products
    } = this.props;

    const boardLink = this.onFilterClick('board');
    const calendarLink = this.onFilterClick('calendar');

    const actionBarLeft = (
      <HeaderItems>
        <HeaderLabel>
          <Icon icon="layout" /> Board:{' '}
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
          <Icon icon="verticalalignment" /> Pipeline:{' '}
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

    const DealFilter = () => (
      <FilterBox>
        <h4>{__('Filter')}</h4>
        {this.renderSelectors({
          label: 'Choose products',
          name: 'productIds',
          options: products,
          generator: selectProductOptions
        })}

        {this.renderSelectors({
          label: 'Choose team members',
          name: 'assignedUserIds',
          options: users,
          generator: selectUserOptions
        })}

        {this.renderSelectors({
          label: 'Choose companies',
          name: 'companyIds',
          options: companies,
          generator: selectCompanyOptions
        })}

        {this.renderSelectors({
          label: 'Choose customers',
          name: 'customerIds',
          options: customers,
          generator: selectCustomerOptions
        })}

        {this.renderDates()}
      </FilterBox>
    );

    const actionBarRight = (
      <HeaderItems>
        {middleContent && middleContent()}

        <div style={{ display: 'inline-block' }}>
          <FormControl
            defaultValue={queryParams.search}
            placeholder="Search ..."
            onKeyPress={this.onSearch}
            autoFocus={true}
          />
        </div>
        <HeaderLink>
          <Tip text={__('Filter')}>
            <div onClick={this.toggleHidden} className="filter-button">
              <Icon icon="filter" />
            </div>
          </Tip>
        </HeaderLink>
        {!this.state.isHidden && <DealFilter />}
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
