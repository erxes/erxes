import React from 'react';
import { Table } from 'react-bootstrap';
import { Wrapper } from '/imports/react-ui/layout/components';
import Sidebar from '../../Sidebar.jsx';
import CustomerRow from './CustomerRow.jsx';


const propTypes = {
  customers: React.PropTypes.array.isRequired,
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
    const content = (
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
