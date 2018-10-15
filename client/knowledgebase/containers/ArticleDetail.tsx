import * as React from "react";
import { ArticleDetail } from "../components";
import { AppConsumer } from "./AppContext";

const ArticleDetailContainer = () => {
  return (
    <AppConsumer>
      {({ goToArticles, activeArticle }) => (
        <ArticleDetail goToArticles={goToArticles} article={activeArticle} />
      )}
    </AppConsumer>
  );
};

export default ArticleDetailContainer;
