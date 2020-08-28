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
        emptyContent={<EmptyContent content={EMPTY_CONTENT_KNOWLEDGEBASE} maxItemWidth="420px" />}
        data={this.renderArticles()}
      />
    );
  }
}

export default ArticleList;
