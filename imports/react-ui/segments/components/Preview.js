import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { LoadMore } from '/imports/react-ui/common';
import { CustomerRow } from '/imports/react-ui/customers/components';

const propTypes = {
  customers: PropTypes.array.isRequired,
  customerFields: PropTypes.array.isRequired,
};

function Preview({ customers, customerFields }) {
  return (
    <div>
      <Table className="no-wrap" responsive>
        <thead>
          <tr>
            {customerFields.map(({ key, label }) => <th key={key}>{label}</th>)}
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
