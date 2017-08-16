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
      _id: category._id,
      title: category.title,
      description: category.description,
      articles: category.articles,
    });
  }

  renderCategory() {
    const { category } = this.props;
    return (
      <div>
        <div>
          <a href="" onClick={this.handleOnClick}>{category.title}</a>
        </div>
        <div>
          {category.description}
        </div>
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
