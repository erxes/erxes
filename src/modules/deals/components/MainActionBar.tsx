import { IUser } from 'modules/auth/types';
import {
  ControlLabel,
  DropdownToggle,
  EmptyState,
  FormControl,
  Icon,
  Tip
} from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { ICompany } from 'modules/companies/types';
import { ICustomer } from 'modules/customers/types';
import { FlexItem } from 'modules/layout/styles';
import { IProduct } from 'modules/settings/productService/types';
import * as React from 'react';
import { Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Select from 'react-select-plus';
import { Avatar, SelectOption, SelectValue } from '../styles/deal';
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
  assignedUserIds: string[];
};
// get selected deal type from URL
const getType = () =>
  window.location.href.includes('calendar') ? 'calendar' : 'board';

class MainActionBar extends React.Component<Props, State> {
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

  onChangeField = <T extends keyof State>(name: T, value: State[T]) => {
    this.setState({ [name]: value } as Pick<State, keyof State>);
  };

  userOnChange = usrs => {
    this.onChangeField('assignedUserIds', usrs.map(user => user.value));
  };

  render() {
    const {
      currentBoard,
      currentPipeline,
      middleContent,
      queryParams,
      users,
      customers,
      companies,
      products,
      assignedUserIds
    } = this.props;

    const content = option => (
      <React.Fragment>
        <Avatar src={option.avatar || '/images/avatar-colored.svg'} />
        {option.label}
      </React.Fragment>
    );

    const userOption = option => (
      <SelectOption className="simple-option">{content(option)}</SelectOption>
    );

    const userValue = option => <SelectValue>{content(option)}</SelectValue>;

    const boardLink = this.onFilterClick('board');
    const calendarLink = this.onFilterClick('calendar');

    const selectOption = option => (
      <SelectOption className="simple-option">{content(option)}</SelectOption>
    );

    const selectValue = option => <SelectValue>{content(option)}</SelectValue>;

    const onChange = (name, list) => {
      return this.onSelectChange(name, list.map(item => item.value));
    };

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

    const actionBarRight = (
      <HeaderItems>
        {middleContent && middleContent()}
        <div style={{ display: 'inline-block' }}>
          <Select
            placeholder={__('Filter')}
            value={assignedUserIds}
            onChange={this.userOnChange}
            optionRenderer={userOption}
            valueRenderer={userValue}
            removeSelected={true}
            options={selectUserOptions(users)}
            multi={true}
          />
        </div>

        <Select
          placeholder={__('Choose team members')}
          value={queryParams.assignedUserIds}
          onChange={onChange.bind(this, 'assignedUserIds')}
          optionRenderer={selectOption}
          valueRenderer={selectValue}
          removeSelected={true}
          options={selectUserOptions(users)}
          multi={true}
        />

        <Select
          placeholder={__('Choose product')}
          value={queryParams.productIds}
          onChange={onChange.bind(this, 'productIds')}
          optionRenderer={selectOption}
          valueRenderer={selectValue}
          removeSelected={true}
          options={selectProductOptions(products)}
          multi={true}
        />

        <Select
          placeholder={__('Choose companies')}
          value={queryParams.companyIds}
          onChange={onChange.bind(this, 'companyIds')}
          optionRenderer={selectOption}
          valueRenderer={selectValue}
          removeSelected={true}
          options={selectCompanyOptions(companies)}
          multi={true}
        />

        <Select
          placeholder={__('Choose customers')}
          value={queryParams.customerIds}
          onChange={onChange.bind(this, 'customerIds')}
          optionRenderer={selectOption}
          valueRenderer={selectValue}
          removeSelected={true}
          options={selectCustomerOptions(customers)}
          multi={true}
        />

        <div style={{ display: 'inline-block' }}>
          <FormControl
            defaultValue={queryParams.search}
            placeholder="Search ..."
            onKeyPress={this.onSearch}
            autoFocus={true}
          />
        </div>
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
