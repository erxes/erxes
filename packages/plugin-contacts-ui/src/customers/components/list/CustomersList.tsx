import CustomersMerge from '@erxes/ui-contacts/src/customers/components/detail/CustomersMerge';
import {
  EMAIL_VALIDATION_STATUSES,
  PHONE_VALIDATION_STATUSES,
  CUSTOMER_STATE_OPTIONS
} from '@erxes/ui-contacts/src/customers/constants';
import CustomerForm from '@erxes/ui-contacts/src/customers/containers/CustomerForm';
import { queries } from '@erxes/ui-contacts/src/customers/graphql';
import Widget from '@erxes/ui-engage/src/containers/Widget';
import ManageColumns from '@erxes/ui-forms/src/settings/properties/containers/ManageColumns';
import { IConfigColumn } from '@erxes/ui-forms/src/settings/properties/types';
import { EMPTY_CONTENT_CONTACTS } from '@erxes/ui-settings/src/constants';
import TaggerPopover from '@erxes/ui-tags/src/components/TaggerPopover';
import { TAG_TYPES } from '@erxes/ui-tags/src/constants';
import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import DateFilter from '@erxes/ui/src/components/DateFilter';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import EmptyContent from '@erxes/ui/src/components/empty/EmptyContent';
import FormControl from '@erxes/ui/src/components/form/Control';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import SortHandler from '@erxes/ui/src/components/SortHandler';
import Table from '@erxes/ui/src/components/table';
import withTableWrapper from '@erxes/ui/src/components/table/withTableWrapper';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { BarItems } from '@erxes/ui/src/layout/styles';
import { IRouterProps } from '@erxes/ui/src/types';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { menuContacts } from '@erxes/ui/src/utils/menus';
import * as routerUtils from '@erxes/ui/src/utils/router';
import { __, Alert, confirm, router } from 'coreui/utils';
import { gql } from '@apollo/client';
import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { Link, withRouter } from 'react-router-dom';
import TemporarySegment from '@erxes/ui-segments/src/components/filter/TemporarySegment';

import { ICustomer } from '../../types';
import CustomerRow from './CustomerRow';
import Sidebar from './Sidebar';

interface IProps extends IRouterProps {
  type: string;
  customers: ICustomer[];
  totalCount: number;
  columnsConfig: IConfigColumn[];
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  toggleBulk: (target: ICustomer, toAdd: boolean) => void;
  toggleAll: (targets: ICustomer[], containerId: string) => void;
  loading: boolean;
  mergeCustomerLoading: boolean;
  searchValue: string;
  removeCustomers: (
    doc: { customerIds: string[] },
    emptyBulk: () => void
  ) => void;
  mergeCustomers: (doc: {
    ids: string[];
    data: any;
    callback: () => void;
  }) => Promise<void>;
  verifyCustomers: (doc: { verificationType: string }) => void;
  changeVerificationStatus: (doc: {
    verificationType: string;
    status: string;
    customerIds: string[];
  }) => Promise<void>;
  queryParams: any;
  exportData: (bulk: Array<{ _id: string }>) => void;
  responseId: string;
  refetch?: () => void;
  renderExpandButton?: any;
  isExpand?: boolean;
  page: number;
  perPage: number;
  changeStateBulk: (_ids: string[], value: string) => void;
}

type State = {
  searchValue?: string;
  searchType?: string;
  showDropDown?: boolean;
};

class CustomersList extends React.Component<IProps, State> {
  private timer?: NodeJS.Timer;

  constructor(props) {
    super(props);

    this.state = {
      searchValue: this.props.searchValue
    };
  }

  componentDidUpdate() {
    const { queryParams, history, type } = this.props;
    const { searchValue, searchType } = this.state;

    if (searchValue && !queryParams.searchValue) {
      if (searchType === type) {
        routerUtils.setParams(history, { searchValue });
      } else {
        this.setState({ searchValue: '' });
      }
    }
  }

  onChange = () => {
    const { toggleAll, customers } = this.props;

    toggleAll(customers, 'customers');
  };

  removeCustomers = customers => {
    const customerIds: string[] = [];

    customers.forEach(customer => {
      customerIds.push(customer._id);
    });

    const { removeCustomers, emptyBulk } = this.props;

    removeCustomers({ customerIds }, emptyBulk);
  };

  verifyCustomers = (verificationType: string) => {
    const { verifyCustomers } = this.props;

    verifyCustomers({ verificationType });
  };

  onTargetSelect = () => {
    if (this.state.showDropDown) {
      this.setState({ showDropDown: false });
    } else {
      this.setState({ showDropDown: true });
    }
  };

  changeVerificationStatus = (type: string, status: string, customers) => {
    const customerIds: string[] = [];

    customers.forEach(customer => {
      customerIds.push(customer._id);
    });

    const { changeVerificationStatus } = this.props;

    changeVerificationStatus({ verificationType: type, status, customerIds });
  };

  changeState(value: string) {
    const { type, changeStateBulk, bulk = [] } = this.props;

    if (type === value) {
      return Alert.warning(`Contacts are already in "${value}" state`);
    }

    const _ids: string[] = bulk.map(c => c._id);

    changeStateBulk(_ids, value);
  }

  renderContent() {
    const {
      customers,
      columnsConfig,
      bulk,
      toggleBulk,
      history,
      isAllSelected,
      isExpand,
      perPage,
      page
    } = this.props;

    return (
      <withTableWrapper.Wrapper>
        <Table
          whiteSpace="nowrap"
          hover={true}
          bordered={true}
          responsive={true}
          wideHeader={true}
        >
          <thead>
            <tr>
              <th>
                <FormControl
                  checked={isAllSelected}
                  componentClass="checkbox"
                  onChange={this.onChange}
                />
              </th>
              {(columnsConfig || []).map(({ _id, name, label }) => (
                <th key={name}>
                  {_id !== '#' ? (
                    <SortHandler sortField={name} label={__(label)} />
                  ) : (
                    <>#</>
                  )}
                </th>
              ))}
              <th>{__('Tags')}</th>
            </tr>
          </thead>
          <tbody id="customers" className={isExpand ? 'expand' : ''}>
            {(customers || []).map((customer, i) => (
              <CustomerRow
                index={(page - 1) * perPage + i + 1}
                customer={customer}
                columnsConfig={columnsConfig}
                key={customer._id}
                isChecked={bulk.includes(customer)}
                toggleBulk={toggleBulk}
                history={history}
              />
            ))}
          </tbody>
        </Table>
      </withTableWrapper.Wrapper>
    );
  }

  search = e => {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    const { history, type } = this.props;
    const searchValue = e.target.value;

    this.setState({ searchValue, searchType: type });

    this.timer = setTimeout(() => {
      router.removeParams(history, 'page');
      router.setParams(history, { searchValue });
    }, 500);
  };

  moveCursorAtTheEnd(e) {
    const tmpValue = e.target.value;

    e.target.value = '';
    e.target.value = tmpValue;
  }

  afterTag = () => {
    this.props.emptyBulk();

    if (this.props.refetch) {
      this.props.refetch();
    }
  };

  render() {
    const {
      type,
      totalCount,
      bulk,
      emptyBulk,
      loading,
      customers,
      mergeCustomers,
      location,
      history,
      queryParams,
      exportData,
      renderExpandButton,
      mergeCustomerLoading
    } = this.props;

    const addTrigger = (
      <Button btnStyle="success" size="small" icon="plus-circle">
        Add {type || 'customer'}
      </Button>
    );

    const onEmailStatusClick = e => {
      this.changeVerificationStatus('email', e.target.id, bulk);
    };

    const onPhoneStatusClick = e => {
      this.changeVerificationStatus('phone', e.target.id, bulk);
    };

    const onStateClick = e => {
      this.changeState(e.target.id);
    };

    const emailVerificationStatusList = [] as any;

    for (const status of EMAIL_VALIDATION_STATUSES) {
      emailVerificationStatusList.push(
        <li key={status.value}>
          <a
            id={status.value}
            href="#changeStatus"
            onClick={onEmailStatusClick}
          >
            {status.label}
          </a>
        </li>
      );
    }

    const phoneVerificationStatusList = [] as any;

    for (const status of PHONE_VALIDATION_STATUSES) {
      phoneVerificationStatusList.push(
        <li key={status.value}>
          <a
            id={status.value}
            href="#changeStatus"
            onClick={onPhoneStatusClick}
          >
            {status.label}
          </a>
        </li>
      );
    }

    const customerStateOptions: any[] = [];

    for (const option of CUSTOMER_STATE_OPTIONS) {
      customerStateOptions.push(
        <li key={option.value}>
          <a id={option.value} href="#changeState" onClick={onStateClick}>
            {option.label}
          </a>
        </li>
      );
    }

    const editColumns = <a href="#edit">{__('Choose Properties/View')}</a>;

    const dateFilter = queryParams.form && (
      <DateFilter queryParams={queryParams} history={history} />
    );

    const manageColumns = props => {
      return (
        <ManageColumns
          {...props}
          contentType={`contacts:${type}`}
          location={location}
          history={history}
        />
      );
    };

    const customerForm = props => {
      return (
        <CustomerForm
          {...props}
          type={type}
          size="lg"
          queryParams={queryParams}
        />
      );
    };

    const customersMerge = props => {
      return (
        <CustomersMerge
          {...props}
          objects={bulk}
          save={mergeCustomers}
          mergeCustomerLoading={mergeCustomerLoading}
        />
      );
    };

    const actionBarRight = (
      <BarItems>
        <FormControl
          type="text"
          placeholder={__('Type to search')}
          onChange={this.search}
          value={this.state.searchValue}
          autoFocus={true}
          onFocus={this.moveCursorAtTheEnd}
        />

        {renderExpandButton()}

        {dateFilter}

        {isEnabled('segments') && (
          <TemporarySegment contentType={`contacts:${type}`} />
        )}

        <Dropdown className="dropdown-btn" alignRight={true}>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-customize">
            <Button btnStyle="simple" size="small">
              {__('Customize ')} <Icon icon="angle-down" />
            </Button>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <li>
              <ModalTrigger
                title="Manage Columns"
                trigger={editColumns}
                content={manageColumns}
              />
            </li>
            <li>
              <Link to="/settings/properties?type=contacts:customer">
                {__('Manage properties')}
              </Link>
            </li>
            <li>
              <a href="#export" onClick={exportData.bind(this, bulk)}>
                {type === 'lead'
                  ? __('Export this leads')
                  : __('Export this contacts')}
              </a>
            </li>
            <li>
              <a
                href="#verifyEmail"
                onClick={this.verifyCustomers.bind(this, 'email')}
              >
                {__('Verify emails')}
              </a>
            </li>
            <li>
              <a
                href="#verifyPhone"
                onClick={this.verifyCustomers.bind(this, 'phone')}
              >
                {__('Verify phone numbers')}
              </a>
            </li>
          </Dropdown.Menu>
        </Dropdown>
        <Link to={`/settings/importHistories?type=${type}`}>
          <Button btnStyle="primary" size="small" icon="arrow-from-right">
            {__('Go to import')}
          </Button>
        </Link>

        {type === 'visitor' ? null : (
          <ModalTrigger
            title="New customer"
            autoOpenKey="showCustomerModal"
            trigger={addTrigger}
            size="lg"
            content={customerForm}
            backDrop="static"
          />
        )}
      </BarItems>
    );

    let actionBarLeft: React.ReactNode;

    const mergeButton = (
      <Button btnStyle="primary" size="small" icon="merge">
        Merge
      </Button>
    );

    if (bulk.length > 0) {
      const tagButton = (
        <Button btnStyle="simple" size="small" icon="tag-alt">
          Tag
        </Button>
      );

      const onClick = () =>
        confirm()
          .then(() => {
            this.removeCustomers(bulk);
          })
          .catch(e => {
            Alert.error(e.message);
          });

      const refetchQuery = {
        query: gql(queries.customerCounts),
        variables: { type, only: 'byTag' }
      };

      actionBarLeft = (
        <BarItems>
          <Widget customers={bulk} emptyBulk={emptyBulk} />

          {isEnabled('tags') && (
            <TaggerPopover
              type={TAG_TYPES.CUSTOMER}
              successCallback={this.afterTag}
              targets={bulk}
              trigger={tagButton}
              refetchQueries={[refetchQuery]}
            />
          )}
          {bulk.length === 2 && (
            <ModalTrigger
              title="Merge Customers"
              size="xl"
              dialogClassName="modal-1000w"
              trigger={mergeButton}
              content={customersMerge}
            />
          )}

          <Dropdown
            className="dropdown-btn"
            alignRight={true}
            onClick={this.onTargetSelect}
          >
            <Dropdown.Toggle as={DropdownToggle} id="dropdown-customize">
              <Button btnStyle="simple" size="small">
                {__('Change email status')} <Icon icon="angle-down" />
              </Button>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <div>{emailVerificationStatusList}</div>
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown className="dropdown-btn" alignRight={true}>
            <Dropdown.Toggle as={DropdownToggle} id="dropdown-customize">
              <Button btnStyle="simple" size="small">
                {__('Change phone status')} <Icon icon="angle-down" />
              </Button>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <div>{phoneVerificationStatusList}</div>
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown className="dropdown-btn" alignRight={true}>
            <Dropdown.Toggle as={DropdownToggle} id="dropdown-customize">
              <Button btnStyle="simple" size="small">
                {__('Change state')} <Icon icon="angle-down" />
              </Button>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <div>{customerStateOptions}</div>
            </Dropdown.Menu>
          </Dropdown>

          <Button
            btnStyle="danger"
            size="small"
            icon="times-circle"
            onClick={onClick}
          >
            Remove
          </Button>
        </BarItems>
      );
    }

    const actionBar = (
      <Wrapper.ActionBar left={actionBarLeft} right={actionBarRight} />
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__(`Customers`) + ` (${totalCount})`}
            queryParams={queryParams}
            submenu={menuContacts}
          />
        }
        actionBar={actionBar}
        footer={<Pagination count={totalCount} />}
        leftSidebar={
          <Sidebar
            loadingMainQuery={loading}
            type={type}
            queryParams={queryParams}
          />
        }
        content={
          <DataWithLoader
            data={this.renderContent()}
            loading={loading}
            count={customers.length}
            emptyContent={<EmptyContent content={EMPTY_CONTENT_CONTACTS} />}
          />
        }
        hasBorder={true}
      />
    );
  }
}

export default withTableWrapper('Customer', withRouter(CustomersList));
