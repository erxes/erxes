import React from 'react';
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
// TODO
// import { Widget } from '/imports/react-ui/engage/containers';
import Sidebar from './sidebar/Sidebar';
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
        <Table whiteSpace="nowrap" hover>
          <thead>
            <tr>
              <th />
              <th>
                <a href="/customers/manage-columns">...</a>
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
    const { counts, brands, integrations, tags, addCustomer } = this.props;

    const addTrigger = (
      <Button btnStyle="success" size="small">
        Add customer
      </Button>
    );

    const actionBarRight = (
      <BarItems>
        <Button btnStyle="simple" size="small">
          Tags <Icon icon="ios-arrow-down" size="10" />
        </Button>
        <Button btnStyle="simple" size="small">
          Customize <Icon icon="ios-arrow-down" size="10" />
        </Button>
        <ModalTrigger title="New customer" trigger={addTrigger}>
          <CustomerForm addCustomer={addCustomer} />
        </ModalTrigger>
      </BarItems>
    );

    const actionBarLeft = (
      <BarItems>
        <Button btnStyle="success" size="small">
          <Icon icon="email" size="10" /> Message
        </Button>
        <Button btnStyle="simple" size="small">
          <Icon icon="ios-pricetag" size="10" /> Tag
        </Button>
        <Button btnStyle="simple" size="small">
          More <Icon icon="ios-arrow-down" size="10" />
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
        leftSidebar={
          <Sidebar
            counts={counts}
            brands={brands}
            integrations={integrations}
            tags={tags}
          />
        }
        content={this.renderContent()}
      />
    );
  }
}

CustomersList.propTypes = propTypes;

export default CustomersList;
