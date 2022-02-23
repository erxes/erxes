import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import EmptyContent from '@erxes/ui/src/components/empty/EmptyContent';
import Spinner from '@erxes/ui/src/components/Spinner';
import { EMPTY_CONTENT_KNOWLEDGEBASE } from '@erxes/ui-settings/src/constants';
import React from 'react';
import { IArticle } from '@erxes/ui-knowledgeBase/src/types';
import ArticleRow from './ArticleRow';
import { RowArticle } from './styles';

type Props = {
  articles: IArticle[];
  queryParams: any;
  currentCategoryId: string;
  topicId: string;
  remove: (articleId: string) => void;
  loading: boolean;
};

class ArticleList extends React.Component<Props> {
  renderLoading = () => {
    return (
      <RowArticle style={{ height: '115px' }}>
        <Spinner />
      </RowArticle>
    );
  };

  renderArticles() {
    const {
      articles,
      queryParams,
      currentCategoryId,
      topicId,
      remove
    } = this.props;

    return articles.map(article => (
      <ArticleRow
        key={article._id}
        queryParams={queryParams}
        currentCategoryId={currentCategoryId}
        topicId={topicId}
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
        emptyContent={
          <EmptyContent
            content={EMPTY_CONTENT_KNOWLEDGEBASE}
            maxItemWidth="420px"
          />
        }
        loadingContent={this.renderLoading()}
        data={this.renderArticles()}
      />
    );
  }
}

export default ArticleList;
