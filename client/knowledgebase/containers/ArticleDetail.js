import React from 'react';
import { ArticleDetail } from '../components';
import { AppConsumer } from './AppContext';

const ArticleDetailContainer = (props) => {
  return (
    <AppConsumer>
      {({ goToArticles, activeArticle }) =>
        <ArticleDetail
          {...props}
          goToArticles={goToArticles}
          article={activeArticle}
        />
      }
    </AppConsumer>
  );
}

export default ArticleDetailContainer;
