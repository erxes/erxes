import * as React from "react";
import { Article } from "../../containers/faq";
import { IFaqArticle } from "../../types";

type Props = {
  articles: IFaqArticle[];
};

export default class Articles extends React.Component<Props> {
  render() {
    const { articles = [] } = this.props;

    return articles.map(article => (
      <Article key={article._id} article={article} />
    ));
  }
}
