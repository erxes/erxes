import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { Dropdown } from 'react-bootstrap';
import { withRouter } from 'react-router';
import {
  DropdownToggle,
  TaggerPopover,
  ModalTrigger,
  Pagination,
  Button,
  Icon,
  Table,
  FormControl,
  ShowData
} from 'modules/common/components';
import { router, confirm } from 'modules/common/utils';
import { BarItems } from 'modules/layout/styles';
import { Widget } from 'modules/engage/containers';
import Sidebar from './Sidebar';
import CustomerRow from './CustomerRow';
import { CustomerForm, CommonMerge } from '../';
import { ManageColumns } from 'modules/fields/containers';

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
  addCustomer: PropTypes.func.isRequired,
  history: PropTypes.object,
  loading: PropTypes.bool.isRequired,
  searchValue: PropTypes.string.isRequired,
  loadingTags: PropTypes.bool.isRequired,
  removeCustomers: PropTypes.func.isRequired,
  mergeCustomers: PropTypes.func.isRequired
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
    const { customers, columnsConfig, toggleBulk, history } = this.props;

    return (
      <Table whiteSpace="nowrap" hover bordered>
        <thead>
          <tr>
            <th>
              <FormControl componentClass="checkbox" onChange={this.onChange} />
            </th>
            {columnsConfig.map(({ name, label }) => (
              <th key={name}>{label}</th>
            ))}
            <th>Tags</th>
          </tr>
        </thead>
        <tbody id="customers">
          {customers.map(customer => (
            <CustomerRow
              customer={customer}
              columnsConfig={columnsConfig}
              key={customer._id}
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

  render() {
    const {
      counts,
      bulk,
      addCustomer,
      tags,
      emptyBulk,
      loading,
      customers,
      loadingTags,
      mergeCustomers
    } = this.props;

    const addTrigger = (
      <Button btnStyle="success" size="small" icon="plus">
        Add customer
      </Button>
    );
    const editColumns = <a>Edit columns</a>;
    const actionBarRight = (
      <BarItems>
        <FormControl
          type="text"
          placeholder="Type to search.."
          onChange={e => this.search(e)}
          value={this.state.searchValue}
        />
        <Dropdown id="dropdown-engage" pullRight>
          <DropdownToggle bsRole="toggle">
            <Button btnStyle="simple" size="small">
              Customize <Icon icon="ios-arrow-down" />
            </Button>
          </DropdownToggle>
          <Dropdown.Menu>
            <li>
              <ModalTrigger title="Manage Columns" trigger={editColumns}>
                <ManageColumns contentType="customer" />
              </ModalTrigger>
            </li>
            <li>
              <Link to="/fields/manage/customer">Properties</Link>
            </li>
          </Dropdown.Menu>
        </Dropdown>
        <ModalTrigger title="New customer" trigger={addTrigger}>
          <CustomerForm addCustomer={addCustomer} />
        </ModalTrigger>
      </BarItems>
    );

    let actionBarLeft = null;

    if (bulk.length > 0) {
      const tagButton = (
        <Button btnStyle="simple" size="small">
          Tag <Icon icon="ios-arrow-down" />
        </Button>
      );

      actionBarLeft = (
        <BarItems>
          <Widget customers={bulk} />
          <TaggerPopover
            type="customer"
            afterSave={emptyBulk}
            targets={bulk}
            trigger={tagButton}
          />
          <Dropdown id="dropdown-options" pullRight>
            <DropdownToggle bsRole="toggle">
              <Button btnStyle="simple" size="small">
                More <Icon icon="ios-arrow-down" />
              </Button>
            </DropdownToggle>
            <Dropdown.Menu>
              <li>
                <ModalTrigger title="Merge Customers" trigger={<a>Merge</a>}>
                  <CommonMerge datas={bulk} save={mergeCustomers} />
                </ModalTrigger>
              </li>
              <li>
                <a
                  onClick={() =>
                    confirm().then(() => {
                      this.removeCustomers(bulk);
                    })
                  }
                >
                  Remove
                </a>
              </li>
            </Dropdown.Menu>
          </Dropdown>
        </BarItems>
      );
    }

    const actionBar = (
      <Wrapper.ActionBar left={actionBarLeft} right={actionBarRight} />
    );

    const breadcrumb = [{ title: `Customers (${counts.all})` }];

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        actionBar={actionBar}
        footer={<Pagination count={counts.all} />}
        leftSidebar={
          <Sidebar counts={counts} tags={tags} loading={loadingTags} />
        }
        content={
          <ShowData
            data={this.renderContent()}
            loading={loading}
            count={customers.length}
            emptyText="There is no customer."
            emptyIcon="person-stalker"
          />
        }
      />
    );
  }
}

CustomersList.propTypes = propTypes;

export default withRouter(CustomersList);
