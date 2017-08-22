import React, { PropTypes } from 'react';
import { Article } from '../containers';

export default class Articles extends React.Component {
  renderArticles() {
    const { articles, category } = this.props;
    console.log('props: ', this.props);
    return articles.map(article => {
      return (
        <Article key={article._id} article={article} category={category} />
      );
    });
  }

  render() {
    return (
      <div>
        {this.renderArticles()}
      </div>
    );
  }
}

Articles.propTypes = {
  articles: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string,
    summary: PropTypes.string,
    content: PropTypes.string,
    createdBy: PropTypes.string,
    modifiedBy: PropTypes.string,
    createdDate: PropTypes.date,
    modifiedDate: PropTypes.date,
    authorDetails: PropTypes.shape({
      fullName: PropTypes.string,
      avatar: PropTypes.string,
    }),
  })),
  category: PropTypes.object,
};
