import * as React from 'react';
import { IArticle } from '../../types';
import { ArticleRow } from './';

type Props = {
  articles: IArticle[];
  queryParams: any;
  currentCategoryId: string;
  topicIds: string;
  remove: (_id: string) => void;
};

class ArticleList extends React.Component<Props> {
  render() {
    const {
      articles,
      queryParams,
      currentCategoryId,
      topicIds,
      remove
    } = this.props;

    return (
      <React.Fragment>
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
      </React.Fragment>
    );
  }
}

export default ArticleList;
