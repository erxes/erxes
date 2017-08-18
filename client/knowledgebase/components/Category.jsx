import React, { PropTypes } from 'react';

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

  renderCategory() {
    const { category } = this.props;
    console.log('category: ', category);
    return (
      <div>
        <a href="" onClick={this.handleOnClick}>
          <h1>{category.title}</h1>
        </a>
        {category.description}
      </div>
    );
  }

  render() {
    return this.renderCategory();
  }
}

Category.propTypes = {
  category: PropTypes.object, // eslint-disable-line
  onSwitchToCategoryDisplay: PropTypes.func
};
