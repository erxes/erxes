import React, { PropTypes } from 'react';
import { Category } from '../containers';

export default class Categories extends React.Component {

  renderCategories() {
    const { kbTopic } = this.props;
    const categories = kbTopic.categories;

    return categories.map((category) => {
      return <Category key={category._id} category={category} />;
    });
  }

  render() {
    return (
      <div>
        {this.renderCategories()}
      </div>
    );
  }
}

Categories.propTypes = {
  kbTopic: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,

    categories: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string,
      description: PropTypes.string,
      authors: PropTypes.arrayOf(PropTypes.shape({
        details: PropTypes.shape({
          fullName: PropTypes.string,
          avatar: PropTypes.string,
        }),
        articleCount: PropTypes.string,
      })),
      numOfArticles: PropTypes.string,
      articles: PropTypes.arrayOf(PropTypes.shape({
        _id: PropTypes.string.isRequired,
        title: PropTypes.string,
        summary: PropTypes.string,
        content: PropTypes.string,
        createdBy: PropTypes.string,
        modifiedBy: PropTypes.string,
        createdDate: PropTypes.date,
        modifiedDate: PropTypes.date,
      })),
    })),
  }),
};
