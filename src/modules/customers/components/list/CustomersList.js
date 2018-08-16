import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { Dropdown } from 'react-bootstrap';
import { withRouter } from 'react-router';

import {
  DropdownToggle,
  ModalTrigger,
  Pagination,
  Button,
  Icon,
  Table,
  FormControl,
  DataWithLoader,
  DateFilter,
  SortHandler
} from 'modules/common/components';
import { router, confirm } from 'modules/common/utils';
import { BarItems } from 'modules/layout/styles';
import { Widget } from 'modules/engage/containers';
import { ManageColumns } from 'modules/settings/properties/containers';
import { TaggerPopover } from 'modules/tags/components';
import Sidebar from './Sidebar';
import CustomerRow from './CustomerRow';
import { CustomerForm } from '../../containers';
import { CustomersMerge } from '../';

const propTypes = {
  customers: PropTypes.array.isRequired,
  counts: PropTypes.object.isRequired,
  columnsConfig: PropTypes.array.isRequired,
  brands: PropTypes.array.isRequired,
  integrations: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired,
  bulk: PropTypes.array.isRequired,
  emptyBulk: PropTypes.func.isRequired,
  toggleBulk: PropTypes.func.isRequired,
  toggleAll: PropTypes.func.isRequired,
  location: PropTypes.object,
  history: PropTypes.object,
  loading: PropTypes.bool.isRequired,
  searchValue: PropTypes.string.isRequired,
  loadingTags: PropTypes.bool.isRequired,
  removeCustomers: PropTypes.func.isRequired,
  mergeCustomers: PropTypes.func.isRequired,
  queryParams: PropTypes.object,
  exportCustomers: PropTypes.func,
  handleXlsUpload: PropTypes.func
};

class CustomersList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      searchValue: this.props.searchValue
    };

    this.onChange = this.onChange.bind(this);
    this.removeCustomers = this.removeCustomers.bind(this);
    this.search = this.search.bind(this);
  }

  onChange() {
    const { toggleAll, customers } = this.props;
    toggleAll(customers, 'customers');
  }

  removeCustomers(customers) {
    const customerIds = [];

    customers.forEach(customer => {
      customerIds.push(customer._id);
    });

    this.props.removeCustomers({ customerIds });
  }

  renderContent() {
    const { customers, columnsConfig, bulk, toggleBulk, history } = this.props;
    const { __ } = this.context;

    return (
      <Table whiteSpace="nowrap" hover bordered>
        <thead>
          <tr>
            <th>
              <FormControl
                checked={bulk.length > 0}
                componentClass="checkbox"
                onChange={this.onChange}
              />
            </th>
            {columnsConfig.map(({ name, label }) => (
              <th key={name}>
                <SortHandler sortField={name} />
                {__(label)}
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

  search(e) {
    if (this.timer) clearTimeout(this.timer);
    const { history } = this.props;
    const searchValue = e.target.value;

    this.setState({ searchValue });
    this.timer = setTimeout(() => {
      router.setParams(history, { searchValue });
    }, 500);
  }

  moveCursorAtTheEnd(e) {
    const tmpValue = e.target.value;

    e.target.value = '';
    e.target.value = tmpValue;
  }

  render() {
    const {
      counts,
      bulk,
      tags,
      emptyBulk,
      loading,
      customers,
      loadingTags,
      mergeCustomers,
      location,
      history,
      queryParams,
      exportCustomers,
      handleXlsUpload
    } = this.props;

    const { __ } = this.context;

    const addTrigger = (
      <Button btnStyle="success" size="small" icon="add">
        Add customer
      </Button>
    );

    const editColumns = <a>{__('Edit columns')}</a>;

    const dateFilter = queryParams.form && (
      <DateFilter queryParams={queryParams} history={history} />
    );

    const actionBarRight = (
      <BarItems>
        <FormControl
          type="text"
          placeholder={__('Type to search')}
          onChange={e => this.search(e)}
          value={this.state.searchValue}
          autoFocus
          onFocus={e => this.moveCursorAtTheEnd(e)}
        />

        {dateFilter}

        <Dropdown id="dropdown-engage" pullRight>
          <DropdownToggle bsRole="toggle">
            <Button btnStyle="simple" size="small">
              {__('Customize ')} <Icon icon="downarrow" />
            </Button>
          </DropdownToggle>
          <Dropdown.Menu>
            <li>
              <ModalTrigger title="Manage Columns" trigger={editColumns}>
                <ManageColumns
                  contentType="customer"
                  location={location}
                  history={history}
                />
              </ModalTrigger>
            </li>
            <li>
              <Link to="/settings/properties?type=customer">
                {__('Properties')}
              </Link>
            </li>
            <li>
              <a onClick={() => exportCustomers(bulk)}>
                {__('Export customers')}
              </a>
            </li>
            <li>
              <a>
                <label style={{ fontWeight: 'normal' }}>
                  {__('Import customers')}
                  <input
                    type="file"
                    onChange={e => handleXlsUpload(e)}
                    style={{ display: 'none' }}
                    accept=".xlsx, .xls"
                  />
                </label>
              </a>
            </li>
          </Dropdown.Menu>
        </Dropdown>

        <ModalTrigger title="New customer" trigger={addTrigger} size="lg">
          <CustomerForm size="lg" queryParams={queryParams} />
        </ModalTrigger>
      </BarItems>
    );

    let actionBarLeft = null;

    const mergeButton = (
      <Button btnStyle="primary" size="small" icon="shuffle">
        Merge
      </Button>
    );

    if (bulk.length > 0) {
      const tagButton = (
        <Button btnStyle="simple" size="small" icon="downarrow">
          Tag
        </Button>
      );

      actionBarLeft = (
        <BarItems>
          <Widget customers={bulk} />
          <TaggerPopover
            type="customer"
            successCallback={emptyBulk}
            targets={bulk}
            trigger={tagButton}
          />
          {bulk.length === 2 && (
            <ModalTrigger
              title="Merge Customers"
              size="lg"
              trigger={mergeButton}
            >
              <CustomersMerge objects={bulk} save={mergeCustomers} />
            </ModalTrigger>
          )}
          <Button
            btnStyle="danger"
            size="small"
            icon="cancel-1"
            onClick={() =>
              confirm().then(() => {
                this.removeCustomers(bulk);
              })
            }
          >
            Remove
          </Button>
        </BarItems>
      );
    }

    const actionBar = (
      <Wrapper.ActionBar left={actionBarLeft} right={actionBarRight} />
    );

    const breadcrumb = [{ title: __(`Customers`) + ` (${counts.all})` }];

    return (
      <Wrapper
        header={
          <Wrapper.Header breadcrumb={breadcrumb} queryParams={queryParams} />
        }
        actionBar={actionBar}
        footer={<Pagination count={counts.all} />}
        leftSidebar={
          <Sidebar counts={counts} tags={tags} loading={loadingTags} />
        }
        content={
          <DataWithLoader
            data={this.renderContent()}
            loading={loading}
            count={customers.length}
            emptyText="There is no customer."
            emptyImage="/images/robots/robot-01.svg"
          />
        }
      />
    );
  }
}

CustomersList.propTypes = propTypes;
CustomersList.contextTypes = {
  __: PropTypes.func
};

export default withRouter(CustomersList);
