import * as React from "react";
import { ArticleDetail } from "../../components/faq";
import { FaqConsumer } from "./FaqContext";

const ArticleDetailContainer = () => {
  return (
    <FaqConsumer>
      {({ goToArticles, activeArticle }) => (
        <ArticleDetail goToArticles={goToArticles} article={activeArticle} />
      )}
    </FaqConsumer>
  );
};

export default ArticleDetailContainer;
