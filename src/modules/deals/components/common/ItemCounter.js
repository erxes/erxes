import React from 'react';
import PropTypes from 'prop-types';
import { ItemCounterContainer } from '../../styles';
import { renderFullName } from 'modules/common/utils';

const propTypes = {
  items: PropTypes.array
};

class ItemCounter extends React.Component {
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

  renderItem(item) {
    return <li key={item._id}>{item.name || renderFullName(item)}</li>;
  }

  renderOtherItems(items) {
    if (this.state.show) {
      return items.map((el, index) => (index > 0 ? this.renderItem(el) : null));
    }

    return (
      <li onClick={this.showOthers.bind(this)} className="remained-count">
        +{items.length - 1}
      </li>
    );
  }

  render() {
    const { items } = this.props;
    const length = items.length;

    if (length === 0) {
      return null;
    }

    return (
      <ItemCounterContainer>
        <ul>
          {this.renderItem(items[0])}
          {length > 1 ? this.renderOtherItems(items) : null}
        </ul>
      </ItemCounterContainer>
    );
  }
}

ItemCounter.propTypes = propTypes;

export default ItemCounter;
