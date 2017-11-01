import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import {
  Pagination,
  ModalTrigger,
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
  counts: PropTypes.object.isRequired,
  columnsConfig: PropTypes.array.isRequired,
  brands: PropTypes.array.isRequired,
  integrations: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired,
  loadMore: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired,
  bulk: PropTypes.array.isRequired,
  toggleBulk: PropTypes.func.isRequired,
  addCustomer: PropTypes.func.isRequired
};

class CustomersList extends React.Component {
  renderContent() {
    const {
      customers,
      columnsConfig,
      loadMore,
      hasMore,
      toggleBulk
    } = this.props;

    return (
      <Pagination hasMore={hasMore} loadMore={loadMore}>
        <Table whiteSpace="nowrap" hover bordered>
          <thead>
            <tr>
              <th>
                <Link to="/customers/manage-columns">...</Link>
              </th>
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
      </Pagination>
    );
  }

  render() {
    const { counts, bulk, addCustomer } = this.props;

    const addTrigger = (
      <Button btnStyle="success" size="small">
        Add customer
      </Button>
    );

    const actionBarRight = (
      <BarItems>
        <Button btnStyle="simple" size="small">
          Tags <Icon icon="ios-arrow-down" />
        </Button>
        <Button btnStyle="simple" size="small">
          Customize <Icon icon="ios-arrow-down" />
        </Button>
        <ModalTrigger title="New customer" trigger={addTrigger}>
          <CustomerForm addCustomer={addCustomer} />
        </ModalTrigger>
      </BarItems>
    );

    const actionBarLeft = (
      <BarItems>
        {bulk.length > 0 ? <Widget customers={bulk} /> : null}

        <Button btnStyle="simple" size="small">
          <Icon icon="ios-pricetag" /> Tag
        </Button>
        <Button btnStyle="simple" size="small">
          More <Icon icon="ios-arrow-down" />
        </Button>
      </BarItems>
    );

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
