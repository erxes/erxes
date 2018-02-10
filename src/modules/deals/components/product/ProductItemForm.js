import React from 'react';
import PropTypes from 'prop-types';
import { Products, UOM, Currencies, Taxes } from '../../constants';
import { FormControl } from 'modules/common/components';

const propTypes = {
  removeProduct: PropTypes.func.isRequired
};

class ProductItemForm extends React.Component {
  render() {
    return (
      <tr>
        <td>
          <select>
            {Products.map(item => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </select>
        </td>
        <td>
          <select>
            {UOM.map(item => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </select>
        </td>
        <td>
          <select>
            {Currencies.map(item => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </select>
        </td>
        <td>
          <FormControl />
        </td>
        <td>
          <FormControl />
        </td>
        <td>
          <FormControl />
          <br />
          Tax
        </td>
        <td>
          <FormControl />
          <br />
          <select>
            {Taxes.map(item => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </select>
        </td>
        <td>
          5,890,000₮<br />120,000₮
        </td>
      </tr>
    );
  }
}

ProductItemForm.propTypes = propTypes;

export default ProductItemForm;
