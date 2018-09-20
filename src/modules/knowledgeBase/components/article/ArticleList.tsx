import React, { Component, Fragment } from 'react';
import { IArticle } from '../../types';
import { ArticleRow } from './';

type Props= {
  articles: IArticle[];
  queryParams: any;
  currentCategoryId: string;
  topicIds: string;
  remove: (_id: string) => void;
};

class ArticleList extends Component<Props> {
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

export default ArticleList;
