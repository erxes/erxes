import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ArticleRow } from '/';
import { Articles } from '../../styles';

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
      <Articles>
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
      </Articles>
    );
  }
}

ArticleList.propTypes = propTypes;

export default ArticleList;
