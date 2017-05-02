import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { Customers } from '/imports/api/customers/customers';
import { LoadMore } from '/imports/react-ui/common';
import { CustomerRow } from '/imports/react-ui/customers/components';

const propTypes = {
  customers: PropTypes.array.isRequired,
};

function Preview({ customers }) {
  const customerFields = Customers.getPublicFields();

  return (
    <div>
      <Table className="no-wrap" responsive>
        <thead>
          <tr>
            {customerFields.map(field => <th key={field}>{field}</th>)}
            <th>Tags</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(customer => (
            <CustomerRow customer={customer} key={customer._id} customerFields={customerFields} />
          ))}
        </tbody>
      </Table>
      <LoadMore all={Counts.get('customers.list.count')} perPage={20} />
    </div>
  );
}

Preview.propTypes = propTypes;

export default Preview;
