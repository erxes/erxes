import * as React from "react";
import { ArticleDetail } from "../components";
import { AppConsumer } from "./AppContext";

const ArticleDetailContainer = () => {
  return (
    <AppConsumer>
      {({ goToArticles, activeArticle, incReactionCount }) => (
        <ArticleDetail
          goToArticles={goToArticles}
          article={activeArticle}
          incReactionCount={incReactionCount}
        />
      )}
    </AppConsumer>
  );
};

export default ArticleDetailContainer;
