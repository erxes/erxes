import React from 'react';
import PropTypes from 'prop-types';
import { Table, Button } from 'react-bootstrap';
import { Wrapper } from 'modules/layout/components';
import { Pagination, ModalTrigger } from 'modules/common/components';
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
        <Table className="no-wrap">
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
      <Button bsStyle="link">
        <i className="ion-plus-circled" /> New customer
      </Button>
    );

    const actionBarLeft = (
      <div>
        <ModalTrigger title="New customer" trigger={addTrigger}>
          <CustomerForm addCustomer={addCustomer} />
        </ModalTrigger>
      </div>
    );

    const actionBar = <Wrapper.ActionBar left={actionBarLeft} />;
    const breadcrumb = [{ title: `Customers (${counts.all})` }];

    return (
      <div>
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
      </div>
    );
  }
}

CustomersList.propTypes = propTypes;

export default CustomersList;
