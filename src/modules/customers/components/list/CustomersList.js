import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { Dropdown } from 'react-bootstrap';
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
import CustomerForm from './CustomerForm';

const propTypes = {
  customers: PropTypes.array.isRequired,
  totalCount: PropTypes.number.isRequired,
  counts: PropTypes.object.isRequired,
  columnsConfig: PropTypes.array.isRequired,
  brands: PropTypes.array.isRequired,
  integrations: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired,
  bulk: PropTypes.array.isRequired,
  toggleBulk: PropTypes.func.isRequired,
  addCustomer: PropTypes.func.isRequired
};

class CustomersList extends React.Component {
  renderContent() {
    const { customers, totalCount, columnsConfig, toggleBulk } = this.props;

    return (
      <div>
        <Table whiteSpace="nowrap" hover bordered>
          <thead>
            <tr>
              <th />
              {columnsConfig.map(({ name, label }) => (
                <th key={name}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <CustomerRow
                customer={customer}
                columnsConfig={columnsConfig}
                key={customer._id}
                toggleBulk={toggleBulk}
              />
            ))}
          </tbody>
        </Table>

        <Pagination count={totalCount} />
      </div>
    );
  }

  render() {
    const { counts, bulk, addCustomer } = this.props;

    const addTrigger = (
      <Button btnStyle="success" size="small">
        <Icon icon="plus" /> Add customer
      </Button>
    );

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
              <Link to="/customers/manage-columns">Edit columns</Link>
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
          <TaggerPopover type="customer" targets={bulk} trigger={tagButton} />
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
        leftSidebar={<Sidebar counts={counts} />}
        content={this.renderContent()}
      />
    );
  }
}

CustomersList.propTypes = propTypes;

export default CustomersList;
