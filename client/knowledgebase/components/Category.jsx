import React, { PropTypes } from 'react';
import Article from './Article';

export default class Category extends React.Component {
  renderArticles() {
    const { category } = this.props;
    const articles = category.articles;
    return articles.map((article) => {
      return (
        <Article key={article._id} article={article} />
      );
    });
  }

  renderCategory() {
    const { category } = this.props;
    console.log('category: ', category);
    return (
      <div>
        {category.title}
        {this.renderArticles()}
      </div>
    );
  }

  render() {
    return this.renderCategory();
  }
}

Category.propTypes = {
  category: PropTypes.object, // eslint-disable-line
};
