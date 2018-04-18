import React from 'react';
import PropTypes from 'prop-types';
import { Articles, ItemMeta } from '../components';

const propTypes = {
  category: PropTypes.object,
};

function CategoryDetail({category}) {
  return (
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
  );
}

CategoryDetail.propTypes = propTypes;

export default CategoryDetail;
