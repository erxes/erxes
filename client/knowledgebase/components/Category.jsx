import React, { PropTypes } from 'react';
import Ionicons from 'react-ionicons';
import { ItemMeta } from '../components';

export default class Category extends React.Component {
  constructor(props) {
    super(props);
    this.handleOnClick = this.handleOnClick.bind(this);
  }

  handleOnClick(event) {
    event.preventDefault();
    const { category } = this.props;
    const { onSwitchToCategoryDisplay } = this.props;
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
            <Ionicons icon={category.icon} fontSize="46px" color="#888" />
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

Category.propTypes = {
  category: PropTypes.object, // eslint-disable-line
  onSwitchToCategoryDisplay: PropTypes.func,
};
