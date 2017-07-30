import React, { PropTypes } from 'react';

import Category from './Category';

export default class KnowledgeBase extends React.Component {

  renderCategories() {
    const { kbTopic } = this.props;
    const categories = kbTopic.categories;

    return categories.map((category) => {
      return (
        <Category
          key={category._id}
          category={category}
        />
      );
    });
  }

  renderTopic() {
    return (
      <div className="erxes-form">
        <div className="erxes-topbar thiner">
          <div className="erxes-middle">
            <div className="erxes-topbar-title" />
          </div>
        </div>
        <div className="erxes-form-content">
          {this.renderCategories()}
        </div>
      </div>
    );
  }

  render() {
    return this.renderTopic();
  }
}

KnowledgeBase.propTypes = {
  kbTopic: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,

    categories: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string,
      description: PropTypes.string,

      articles: PropTypes.arrayOf(PropTypes.shape({
        _id: PropTypes.string.isRequired,
        title: PropTypes.string,
        description: PropTypes.string,
      })),
    })),
  }),
};
