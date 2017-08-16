import React, { PropTypes } from 'react';
import { Article } from '../containers';

export default class CategoryDetail extends React.Component {

  renderArticles() {
    const articles = this.props.categoryData.articles;
    return articles.map((article) => {
      return (
        <Article key={article._id} article={article} />
      );
    });
  }

  renderCategory() {
    const { categoryData } = this.props;
    console.log('this.props: ', this.props);
    return (
      <div>
        <div>
          {categoryData.title}
        </div>
        <div>
          {categoryData.description}
        </div>
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
  categoryData: PropTypes.object, // eslint-disable-line
};
