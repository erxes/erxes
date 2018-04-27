import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { CategoryRow } from './';
import { Categories } from './styles';

const propTypes = {
  currentCategoryId: PropTypes.string,
  topicIds: PropTypes.string,
  categories: PropTypes.array.isRequired,
  articlesCount: PropTypes.number.isRequired,
  remove: PropTypes.func.isRequired
};

class CategoryList extends Component {
  render() {
    const {
      categories,
      remove,
      currentCategoryId,
      topicIds,
      articlesCount
    } = this.props;

    return (
      <Categories>
        {categories.map(category => (
          <CategoryRow
            key={category._id}
            isActive={currentCategoryId === category._id}
            articlesCount={articlesCount}
            topicIds={topicIds}
            category={category}
            remove={remove}
          />
        ))}
      </Categories>
    );
  }
}

CategoryList.propTypes = propTypes;

export default CategoryList;
