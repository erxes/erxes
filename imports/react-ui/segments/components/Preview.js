import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { LoadMore } from '/imports/react-ui/common';
import { CustomerRow } from '/imports/react-ui/customers/components';

const propTypes = {
  customers: PropTypes.array.isRequired,
};

function Preview({ customers }) {
  return (
    <div>
      <Table className="no-wrap">
        <thead>
          <tr>
            <th className="less-space" />
            <th>Name</th>
            <th>Email</th>
            <th>Brand</th>
            <th>Integration</th>
            <th>Last online</th>
            <th>Session count</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(customer => <CustomerRow customer={customer} key={customer._id} />)}
        </tbody>
      </Table>
      <LoadMore all={Counts.get('customers.list.count')} perPage={20} />
    </div>
  );
}

Preview.propTypes = propTypes;

export default Preview;
