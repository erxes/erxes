import React from 'react';
import { Table } from 'react-bootstrap';
import { Wrapper } from '/imports/react-ui/layout/components';
import { Pagination } from '/imports/react-ui/common';
import Sidebar from '../../Sidebar.jsx';
import CustomerRow from './CustomerRow.jsx';


const propTypes = {
  customers: React.PropTypes.array.isRequired,
  loadMore: React.PropTypes.func.isRequired,
  hasMore: React.PropTypes.bool.isRequired,
};

class CustomersList extends React.Component {
  constructor(props) {
    super(props);

    this.renderCustomers = this.renderCustomers.bind(this);
  }

  renderCustomers() {
    return this.props.customers.map(customer =>
      <CustomerRow customer={customer} key={customer._id} />
    );
  }

  render() {
    const { loadMore, hasMore } = this.props;
    const content = (
      <Pagination hasMore={hasMore} loadMore={loadMore}>
        <Table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Integration</th>
              <th>Last seen</th>
              <th>Session count</th>
              <th>Is Active?</th>
            </tr>
          </thead>
          <tbody>
            {this.renderCustomers()}
          </tbody>
        </Table>
      </Pagination>
    );

    return (
      <div>
        <Wrapper
          header={<Wrapper.Header breadcrumb={[{ title: 'Customers' }]} />}
          leftSidebar={<Sidebar />}
          content={content}
        />
      </div>
    );
  }
}

CustomersList.propTypes = propTypes;

export default CustomersList;
