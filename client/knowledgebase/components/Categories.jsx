import React, { PropTypes } from 'react';
import Category from './Category';

export default class Categories extends React.Component {

  constructor(props, context, aa) {
    super(props, context);
    console.log('KnowledgeBase.js.props: ', props);
    console.log('KnowledgeBase.js.context: ', context);
    console.log('KnowledgeBase.js.aa: ', aa);

  }

  renderCategories() {
    const { kbTopic } = this.props;
    const categories = kbTopic.categories;
    console.log('Categories.jsx.props: ', this.props);

    return categories.map((category) => {
      return (
        <Category
          key={category._id}
          category={category}
        />
      );
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

      articles: PropTypes.arrayOf(PropTypes.shape({
        _id: PropTypes.string.isRequired,
        title: PropTypes.string,
        summary: PropTypes.string,
        content: PropTypes.string,
      })),
    })),
  }),
};
