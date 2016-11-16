import React from 'react';
import { Label } from 'react-bootstrap';

const propTypes = {
  customer: React.PropTypes.object.isRequired,
};

function CustomerRow({ customer }) {
  return (
    <tr>
      <td>
        <a href="#">
          {customer.email}
        </a>
      </td>
      <td>{customer.brand() && customer.brand().name}</td>
      <td>{customer.lastSeenAt.toDateString()}</td>
      <td>{customer.sessionCount}</td>
      <td>
        {
          customer.isActive ?
            <Label bsStyle="success">Active</Label> :
            <Label>Inactive</Label>
        }
      </td>
    </tr>
  );
}

CustomerRow.propTypes = propTypes;

export default CustomerRow;
