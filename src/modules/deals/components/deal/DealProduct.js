import React from 'react';
import PropTypes from 'prop-types';
import { DealProducts } from '../../styles';

const propTypes = {
  products: PropTypes.array
};

class DealProduct extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      show: false
    };
  }

  showOthers() {
    this.setState({
      show: true
    });
  }

  render() {
    const products = this.props.products;
    const length = products.length;

    if (length === 0) {
      return null;
    }

    const otherProducts = () => {
      if (this.state.show) {
        return products.map(
          (el, index) => (index > 0 ? <li key={el._id}>{el.name}</li> : null)
        );
      } else {
        return (
          <li onClick={this.showOthers.bind(this)} className="remained-count">
            +{length - 1}
          </li>
        );
      }
    };

    return (
      <DealProducts>
        <ul>
          <li>{products[0].name}</li>
          {length > 1 ? otherProducts() : null}
        </ul>
      </DealProducts>
    );
  }
}

DealProduct.propTypes = propTypes;

export default DealProduct;
