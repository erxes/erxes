import React from 'react';
import PropTypes from 'prop-types';
import { ItemCounterContainer } from '../../styles';
import { renderFullName } from 'modules/common/utils';

const propTypes = {
  items: PropTypes.array,
  show: PropTypes.bool,
  color: PropTypes.string
};

const defaultProps = {
  show: false
};

class ItemCounter extends React.Component {
  constructor(props) {
    super(props);

    this.state = { show: props.show };
  }

  showOthers() {
    this.setState({ show: true });
  }

  renderItem(item) {
    return (
      <li style={{ background: this.props.color }} key={item._id}>
        {item.name || renderFullName(item)}
      </li>
    );
  }

  renderOtherItems(items) {
    if (this.state.show) {
      return items.map(
        (item, index) => (index > 0 ? this.renderItem(item) : null)
      );
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

    if (length === 0) return null;

    return (
      <ItemCounterContainer>
        {this.renderItem(items[0])}
        {length > 1 ? this.renderOtherItems(items) : null}
      </ItemCounterContainer>
    );
  }
}

ItemCounter.propTypes = propTypes;
ItemCounter.defaultProps = defaultProps;

export default ItemCounter;
