import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import EmptyContent from '@erxes/ui/src/components/empty/EmptyContent';
import Spinner from '@erxes/ui/src/components/Spinner';
import { EMPTY_CONTENT_KNOWLEDGEBASE } from '@erxes/ui-settings/src/constants';
import React from 'react';
import { IArticle } from '@erxes/ui-knowledgebase/src/types';
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

const ArticleList = (props: Props) => {
  const { articles, loading, queryParams, currentCategoryId, topicId, remove } =
    props;

  const renderLoading = () => {
    return (
      <RowArticle style={{ height: '115px' }}>
        <Spinner />
      </RowArticle>
    );
  };

  const renderArticles = () => {
    return articles.map((article) => (
      <ArticleRow
        key={article._id}
        queryParams={queryParams}
        currentCategoryId={currentCategoryId}
        topicId={topicId}
        article={article}
        remove={remove}
      />
    ));
  };

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
      loadingContent={renderLoading()}
      data={renderArticles()}
    />
  );
};

export default ArticleList;
