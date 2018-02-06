import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ArticleRow } from '/';
import { Articles } from '../../styles';

const propTypes = {
  articlesQuery: PropTypes.object.isRequired,
  articles: PropTypes.array.isRequired,
  remove: PropTypes.func.isRequired
};

class ArticleList extends Component {
  render() {
    const { articles, articlesQuery, remove } = this.props;

    return (
      <Articles>
        {articles.map(article => (
          <ArticleRow
            key={article._id}
            articlesQuery={articlesQuery}
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
