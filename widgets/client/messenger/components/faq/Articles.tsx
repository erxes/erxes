import * as React from "react";
import { iconSearch } from "../../../icons/Icons";
import { __ } from "../../../utils";
import Article from "../../containers/faq/Article";
import { IFaqArticle } from "../../types";

type Props = {
  articles: IFaqArticle[];
  loading: boolean;
};

export default class Articles extends React.PureComponent<Props> {
  render() {
    const { articles = [], loading } = this.props;

    if (loading) {
      return <div className="loader bigger" />;
    }

    if (articles.length === 0) {
      return (
        <div className="empty-articles">
          {iconSearch}
          {__("No articles found")}
        </div>
      );
    }

    return articles.map(article => (
      <Article key={article._id} article={article} />
    ));
  }
}
