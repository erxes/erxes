import React from 'react';
import PropTypes from 'prop-types';
import { Categories, Articles, SearchBar, CategoryDetail, ArticleDetail } from '../containers';

const propTypes = {
  activeRoute: PropTypes.string,
  color: PropTypes.string,
};

export default class KnowledgeBase extends React.Component {
  renderContent() {
    const { activeRoute } = this.props;

    if (activeRoute === 'CATEGORIES') {
      return <Categories />;
    }

    if (activeRoute === 'CATEGORY_DETAIL') {
      return <CategoryDetail />;
    }

    if (activeRoute === 'ARTICLE_DETAIL') {
      return <ArticleDetail />;
    }

    if (activeRoute === 'ARTICLES') {
      return <Articles />;
    }

    return null;
  }

  render() {
    const { color } = this.props;

    return (
      <div className="erxes-widget-kb">
        <SearchBar color={color} />

        <div className="erxes-content">
          <div className="erxes-knowledge-container">
            {this.renderContent()}
          </div>
        </div>
      </div>
    );
  }
}

KnowledgeBase.propTypes = propTypes;
