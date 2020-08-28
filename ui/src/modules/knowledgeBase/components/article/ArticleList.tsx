import DataWithLoader from 'modules/common/components/DataWithLoader';
import EmptyContent from 'modules/common/components/empty/EmptyContent';
import { EMPTY_CONTENT_KNOWLEDGEBASE } from 'modules/settings/constants';
import React from 'react';
import { IArticle } from '../../types';
import ArticleRow from './ArticleRow';

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
      <DataWithLoader
        loading={loading}
        count={articles.length}
        emptyText="Articles can address any number of issues your customers encounter. Types of knowledge articles can include solutions to common issues, product or feature documentation, FAQ's and much more."
        emptyImage="/images/actions/8.svg"
        emptyContent={<EmptyContent content={EMPTY_CONTENT_KNOWLEDGEBASE} />}
        data={this.renderArticles()}
      />
    );
  }
}

export default ArticleList;
