import { DataWithLoader } from 'modules/common/components';
import React from 'react';
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
          emptyText="Articles can address any number of issues your customers encounter. Types of knowledge articles can include solutions to common issues, product or feature documentation, FAQ's and much more."
          emptyImage="/images/actions/8.svg"
          objective={true}
          data={this.renderArticles()}
        />
      </React.Fragment>
    );
  }
}

export default ArticleList;
