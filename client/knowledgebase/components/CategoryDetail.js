import React from 'react';
import PropTypes from 'prop-types';
import { Articles, ItemMeta, BackButton } from '../components';

const propTypes = {
  category: PropTypes.object,
  goToCategories: PropTypes.func,
};

function CategoryDetail({ category, goToCategories }, { __ }) {
  return (
    <div>
      <BackButton
        onClickHandler={goToCategories}
        text={__('Back to categories')}
      />
      <div className="category-container">
        <div className="flex-item spaced">
          <div className="topic-icon">
            <i className={`icon-${category.icon}`} />
          </div>
          <div className="topic-content">
            <h1>{category.title}</h1>
            {category.description}
            <ItemMeta category={category} />
          </div>
        </div>
        <Articles category={category} articles={category.articles} />
      </div>
    </div>
  );
}

CategoryDetail.propTypes = propTypes;
CategoryDetail.contextTypes = {
  __: PropTypes.func
};

export default CategoryDetail;
