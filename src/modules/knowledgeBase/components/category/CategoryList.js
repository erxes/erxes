import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { CategoryRow } from './';

const propTypes = {
  currentCategoryId: PropTypes.string,
  categories: PropTypes.array.isRequired,
  remove: PropTypes.func.isRequired
};

class CategoryList extends Component {
  render() {
    const { categories, remove, currentCategoryId } = this.props;

    return categories.map(category => (
      <CategoryRow
        key={category._id}
        isActive={currentCategoryId === category._id}
        category={category}
        remove={remove}
      />
    ));
  }
}

CategoryList.propTypes = propTypes;

export default CategoryList;
