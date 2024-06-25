import * as React from 'react';
import ArticleDetail from '../../components/faq/ArticleDetail';
import { useAppContext } from '../AppContext';

const ArticleDetailContainer = () => {
  const { goToFaqCategory, activeFaqArticle } = useAppContext();

  return (
    <ArticleDetail goToCategory={goToFaqCategory} article={activeFaqArticle} />
  );
};

export default ArticleDetailContainer;
