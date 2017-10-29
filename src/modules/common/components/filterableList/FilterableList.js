import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Filter from './Filter';

const propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string,
      iconClass: PropTypes.string,
      iconColor: PropTypes.string,
      selectedBy: PropTypes.string.isRequired
    })
  ).isRequired,
  links: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      link: PropTypes.element,
      onClick: PropTypes.func
    })
  ),
  showCheckmark: PropTypes.bool,
  className: PropTypes.string,

  // hooks
  onClick: PropTypes.func,
  onExit: PropTypes.func
};

class FilterableList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      key: '',
      items: props.items
    };

    this.filterItems = this.filterItems.bind(this);
    this.toggleItem = this.toggleItem.bind(this);
  }

  componentWillUnmount() {
    // onExit hook
    const { onExit } = this.props;

    if (onExit) onExit(this.state.items);
  }

  filterItems(e) {
    this.setState({ key: e.target.value });
  }

  toggleItem(id) {
    const items = this.state.items;
    const item = items.find(i => i._id === id);

    items[items.indexOf(item)].selectedBy =
      item.selectedBy === 'all' ? 'none' : 'all';

    this.setState({ items });

    // onClick hook
    const { onClick } = this.props;
    if (onClick) onClick(items, id);
  }

  renderItems() {
    const { showCheckmark = true } = this.props;
    const { items, key } = this.state;

    return items.map(item => {
      // filter items by key
      if (key && item.title.toLowerCase().indexOf(key) < 0) {
        return false;
      }

      return (
        <li
          key={item._id}
          className={showCheckmark ? item.selectedBy : ''}
          onClick={() => {
            this.toggleItem(item._id);
          }}
        >
          {item.iconClass ? (
            <i
              className={`icon ${item.iconClass}`}
              style={{ color: item.iconColor }}
            />
          ) : null}{' '}
          {item.title || '[undefined]'}
        </li>
      );
    });
  }

  render() {
    return (
      <div className={this.props.className}>
        <div className="popover-header">
          <Filter onChange={this.filterItems} />
        </div>

        <div className="popover-body">
          <ul className="popover-list selectable">{this.renderItems()}</ul>
        </div>

        <div className="popover-footer">
          <ul className="popover-list linked">
            {this.props.links &&
              this.props.links.map(link => (
                <li key={link.href}>
                  <a onClick={link.onClick} href={link.href}>
                    {link.title}
                  </a>
                </li>
              ))}
          </ul>
        </div>
      </div>
    );
  }
}

FilterableList.propTypes = propTypes;

export default FilterableList;
