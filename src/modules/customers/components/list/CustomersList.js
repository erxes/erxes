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
  Table
} from 'modules/common/components';
import { BarItems } from 'modules/layout/styles';
import { Widget } from 'modules/engage/containers';
import Sidebar from './Sidebar';
import CustomerRow from './CustomerRow';
import { CustomerForm } from '../';
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
  addCustomer: PropTypes.func.isRequired,
  history: PropTypes.object
};

class CustomersList extends React.Component {
  renderContent() {
    const { customers, columnsConfig, toggleBulk, history } = this.props;

    return (
      <Table whiteSpace="nowrap" hover bordered>
        <thead>
          <tr>
            <th />
            {columnsConfig.map(({ name, label }) => (
              <th key={name}>{label}</th>
            ))}
            <th>Tags</th>
          </tr>
        </thead>
        <tbody>
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

  render() {
    const { counts, bulk, addCustomer, tags, emptyBulk } = this.props;

    const addTrigger = (
      <Button btnStyle="success" size="small">
        <Icon icon="plus" /> Add customer
      </Button>
    );
    const editColumns = <a>Edit columns</a>;
    const actionBarRight = (
      <BarItems>
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
        leftSidebar={<Sidebar counts={counts} tags={tags} />}
        content={this.renderContent()}
      />
    );
  }
}

CustomersList.propTypes = propTypes;

export default withRouter(CustomersList);
