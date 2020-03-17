import * as React from "react";
import { ArticleDetail } from "../../components/faq";
import { AppConsumer } from "../AppContext";

const ArticleDetailContainer = () => {
  return (
    <AppConsumer>
      {({ goToFaqCategory, activeFaqArticle }) => (
        <ArticleDetail
          goToCategory={goToFaqCategory}
          article={activeFaqArticle}
        />
      )}
    </AppConsumer>
  );
};

export default ArticleDetailContainer;
