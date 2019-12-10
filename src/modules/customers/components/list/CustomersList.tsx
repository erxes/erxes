import gql from 'graphql-tag';
import Button from 'modules/common/components/Button';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import DateFilter from 'modules/common/components/DateFilter';
import DropdownToggle from 'modules/common/components/DropdownToggle';
import FormControl from 'modules/common/components/form/Control';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Pagination from 'modules/common/components/pagination/Pagination';
import SortHandler from 'modules/common/components/SortHandler';
import Table from 'modules/common/components/table';
import { menuContacts } from 'modules/common/utils/menus';
import { queries } from 'modules/customers/graphql';
import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { IRouterProps } from '../../../common/types';
import { __, Alert, confirm, router } from '../../../common/utils';
import Widget from '../../../engage/containers/Widget';
import Wrapper from '../../../layout/components/Wrapper';
import { BarItems } from '../../../layout/styles';
import ManageColumns from '../../../settings/properties/containers/ManageColumns';
import { IConfigColumn } from '../../../settings/properties/types';
import TaggerPopover from '../../../tags/components/TaggerPopover';
import CustomerForm from '../../containers/CustomerForm';
import { ICustomer } from '../../types';
import CustomersMerge from '../detail/CustomersMerge';
import CustomerRow from './CustomerRow';
import Sidebar from './Sidebar';

interface IProps extends IRouterProps {
  customers: ICustomer[];
  totalCount: number;
  columnsConfig: IConfigColumn[];
  integrations: string[];
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
  mergeCustomers: (
    doc: {
      ids: string[];
      data: any;
      callback: () => void;
    }
  ) => Promise<void>;
  queryParams: any;
  exportCustomers: (bulk: string[]) => void;
  responseId: string;
}

type State = {
  searchValue?: string;
};

class CustomersList extends React.Component<IProps, State> {
  private timer?: NodeJS.Timer;

  constructor(props) {
    super(props);

    this.state = {
      searchValue: this.props.searchValue
    };
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

  renderContent() {
    const {
      customers,
      columnsConfig,
      bulk,
      toggleBulk,
      history,
      isAllSelected
    } = this.props;

    return (
      <Table whiteSpace="nowrap" hover={true} bordered={true}>
        <thead>
          <tr>
            <th>
              <FormControl
                checked={isAllSelected}
                componentClass="checkbox"
                onChange={this.onChange}
              />
            </th>
            {columnsConfig.map(({ name, label }) => (
              <th key={name}>
                <SortHandler sortField={name} label={__(label)} />
              </th>
            ))}
            <th>{__('Tags')}</th>
          </tr>
        </thead>
        <tbody id="customers">
          {customers.map(customer => (
            <CustomerRow
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
    );
  }

  search = e => {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    const { history } = this.props;
    const searchValue = e.target.value;

    this.setState({ searchValue });

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

  render() {
    const {
      totalCount,
      bulk,
      emptyBulk,
      loading,
      customers,
      mergeCustomers,
      location,
      history,
      queryParams,
      exportCustomers,
      mergeCustomerLoading
    } = this.props;

    const addTrigger = (
      <Button btnStyle="success" size="small" icon="add">
        Add customer
      </Button>
    );

    const editColumns = <a href="#edit">{__('Edit columns')}</a>;

    const dateFilter = queryParams.form && (
      <DateFilter queryParams={queryParams} history={history} />
    );

    const manageColumns = props => {
      return (
        <ManageColumns
          {...props}
          contentType="customer"
          location={location}
          history={history}
        />
      );
    };

    const customerForm = props => {
      return <CustomerForm {...props} size="lg" queryParams={queryParams} />;
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

        {dateFilter}

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
              <Link to="/settings/properties?type=customer">
                {__('Properties')}
              </Link>
            </li>
            <li>
              <a href="#export" onClick={exportCustomers.bind(this, bulk)}>
                {__('Export customers')}
              </a>
            </li>
          </Dropdown.Menu>
        </Dropdown>
        <Link to="/settings/importHistories?type=customer">
          <Button btnStyle="primary" size="small" icon="arrow-from-right">
            {__('Go to import')}
          </Button>
        </Link>
        <ModalTrigger
          title="New customer"
          autoOpenKey="showCustomerModal"
          trigger={addTrigger}
          size="lg"
          content={customerForm}
          backDrop="static"
        />
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
        variables: { only: 'byTag' }
      };

      actionBarLeft = (
        <BarItems>
          <Widget customers={bulk} emptyBulk={emptyBulk} />

          <TaggerPopover
            type="customer"
            successCallback={emptyBulk}
            targets={bulk}
            trigger={tagButton}
            refetchQueries={[refetchQuery]}
          />
          {bulk.length === 2 && (
            <ModalTrigger
              title="Merge Customers"
              size="lg"
              trigger={mergeButton}
              content={customersMerge}
            />
          )}
          <Button
            btnStyle="danger"
            size="small"
            icon="cancel-1"
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
        leftSidebar={<Sidebar loadingMainQuery={loading} />}
        content={
          <DataWithLoader
            data={this.renderContent()}
            loading={loading}
            count={customers.length}
            emptyText="Let's start taking care of your customers"
            emptyImage="/images/actions/11.svg"
          />
        }
      />
    );
  }
}

export default withRouter(CustomersList);
