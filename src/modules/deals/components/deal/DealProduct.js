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

  renderProductItem(item) {
    return <li key={item._id}>{item.name}</li>;
  }

  renderOtherProducts(products) {
    if (this.state.show) {
      return products.map(
        (el, index) => (index > 0 ? this.renderProductItem(el) : null)
      );
    }

    return (
      <li onClick={this.showOthers.bind(this)} className="remained-count">
        +{products.length - 1}
      </li>
    );
  }

  render() {
    const products = this.props.products;
    const length = products.length;

    if (length === 0) {
      return null;
    }

    return (
      <DealProducts>
        <ul>
          {this.renderProductItem(products[0])}
          {length > 1 ? this.renderOtherProducts(products) : null}
        </ul>
      </DealProducts>
    );
  }
}

DealProduct.propTypes = propTypes;

export default DealProduct;
