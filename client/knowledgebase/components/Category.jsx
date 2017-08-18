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
    const authors = category.authors;

    let text = '';

    if (authors.length >= 1) {
      text = '' + text + authors[0].details.avatar + ' ' + authors[0].details.fullName;
    }

    if (authors.length >= 2) {
      text = ', ' + text + authors[1].details.avatar + ' ' + authors[1].details.fullName;
    }

    if (authors.length >= 3) {
      text = ', ' + text + authors[2].details.avatar + ' ' + authors[2].details.fullName;
    }

    if (authors.length >= 4) {
      text = text + ' and ' + (authors.length - 3) + ' people';
    }

    return (
      <div>
        <div>
          icon: {category.icon}
        </div>
        <a href="" onClick={this.handleOnClick}>
          <h1>{category.title}</h1>
        </a>
        <h3>
          There are {category.numOfArticles} articles in this category
        </h3>
        <h3>
          Written by {text}
        </h3>
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
