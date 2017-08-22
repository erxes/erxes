import React, { PropTypes } from 'react';
import Ionicons from 'react-ionicons';
import { Articles } from '../components';

export default class CategoryDetail extends React.Component {
  render() {
    const { category } = this.props;
    return (
      <div className="category-container">
        <div className="flex-item spaced">
          <div className="topic-icon">
            <Ionicons icon={category.icon} fontSize="46px" color="#818a88" />
          </div>
          <div className="topic-content">
            <h1>{category.title}</h1>
            {category.description}
          </div>
        </div>
        <Articles category={category} articles={category.articles} />
      </div>
    );
  }
}

CategoryDetail.propTypes = {
  category: PropTypes.object, // eslint-disable-line
};
