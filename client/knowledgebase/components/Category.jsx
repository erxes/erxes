import React from 'react';
import PropTypes from 'prop-types';
import { ItemMeta } from '../components';

const propTypes = {
  category: PropTypes.object, // eslint-disable-line
  onSwitchToCategoryDisplay: PropTypes.func,
};

export default class Category extends React.Component {
  constructor(props) {
    super(props);
    this.handleOnClick = this.handleOnClick.bind(this);
  }

  handleOnClick(event) {
    event.preventDefault();
    const { category, onSwitchToCategoryDisplay } = this.props;
    onSwitchToCategoryDisplay({
      category,
    });
  }

  render() {
    const { category } = this.props;

    return (
      <div className="erxes-kb-item">
        <a className="flex-item" href="" onClick={this.handleOnClick}>
          <div className="topic-icon">
            <i className={`icon-${category.icon}`} />
          </div>
          <div className="topic-content">
            <h3>{category.title}</h3>
            {category.description}
            <ItemMeta category={category} />
          </div>
        </a>
      </div>
    );
  }
}

Category.propTypes = propTypes;
