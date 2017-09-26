import React from 'react';
import PropTypes from 'prop-types';
import Ionicons from 'react-ionicons';
import { Articles, ItemMeta } from '../components';

const propTypes = {
  category: PropTypes.object,
};

function CategoryDetail({category}) {
  return (
    <div className="category-container">
      <div className="flex-item spaced">
        <div className="topic-icon">
          <Ionicons icon={category.icon} fontSize="46px" color="#818a88" />
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
