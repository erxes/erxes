import * as React from 'react';
import ArticleDetail from '../../components/faq/ArticleDetail';
import { useRouter } from '../../context/Router';

const ArticleDetailContainer = ({ loading }: { loading: boolean }) => {
  const { goToFaqCategory, activeFaqArticle } = useRouter();

  return (
    <ArticleDetail
      goToCategory={goToFaqCategory}
      article={activeFaqArticle}
      loading={loading}
    />
  );
};

export default ArticleDetailContainer;
