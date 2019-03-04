import { DataWithLoader } from 'modules/common/components';
import * as React from 'react';
import { IArticle } from '../../types';
import { ArticleRow } from './';

type Props = {
  articles: IArticle[];
  queryParams: any;
  currentCategoryId: string;
  topicIds: string;
  remove: (articleId: string) => void;
  loading: boolean;
};

class ArticleList extends React.Component<Props> {
  renderArticles() {
    const {
      articles,
      queryParams,
      currentCategoryId,
      topicIds,
      remove
    } = this.props;

    return articles.map(article => (
      <ArticleRow
        key={article._id}
        queryParams={queryParams}
        currentCategoryId={currentCategoryId}
        topicIds={topicIds}
        article={article}
        remove={remove}
      />
    ));
  }

  render() {
    const { articles, loading } = this.props;

    return (
      <React.Fragment>
        <DataWithLoader
          loading={loading}
          count={articles.length}
          emptyText="There is no article"
          emptyImage="/images/actions/8.svg"
          objective={true}
          data={this.renderArticles()}
        />
      </React.Fragment>
    );
  }
}

export default ArticleList;
