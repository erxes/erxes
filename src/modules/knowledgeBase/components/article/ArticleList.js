import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { ArticleRow } from './';

const propTypes = {
  articles: PropTypes.array.isRequired,
  queryParams: PropTypes.object,
  currentCategoryId: PropTypes.string,
  topicIds: PropTypes.string,
  remove: PropTypes.func.isRequired
};

class ArticleList extends Component {
  render() {
    const {
      articles,
      queryParams,
      currentCategoryId,
      topicIds,
      remove
    } = this.props;

    return (
      <Fragment>
        {articles.map(article => (
          <ArticleRow
            key={article._id}
            queryParams={queryParams}
            currentCategoryId={currentCategoryId}
            topicIds={topicIds}
            article={article}
            remove={remove}
          />
        ))}
      </Fragment>
    );
  }
}

ArticleList.propTypes = propTypes;

export default ArticleList;
