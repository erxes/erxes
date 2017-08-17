import React, { PropTypes } from 'react';
import { Article } from '../containers';

export default class CategoryDetail extends React.Component {

  renderArticles() {
    const { category } = this.props;
    const articles = category.articles;
    return articles.map((article) => {
      return (
        <Article key={article._id} category={category} article={article} />
      );
    });
  }

  renderCategory() {
    const { category } = this.props;
    return (
      <div>
        <h1>{category.title}</h1>
        {category.description}
        <div>
          {this.renderArticles()}
        </div>
      </div>
    );
  }

  render() {
    return this.renderCategory();
  }
}

CategoryDetail.propTypes = {
  category: PropTypes.object, // eslint-disable-line
};
