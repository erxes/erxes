import * as moment from "moment";
import * as React from "react";
import { defaultAvatar } from "../../../icons/Icons";
import { __ } from "../../../utils";
import { IFaqArticle } from "../../types";

type Props = {
  article: IFaqArticle;
  onClick: (article: IFaqArticle) => void;
};

export default class Article extends React.Component<Props> {
  handleOnClick = (event: React.FormEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    const { article, onClick } = this.props;

    onClick(article);
  };

  render() {
    const { article } = this.props;
    const { author } = article;

    return (
      <a className="erxes-kb-item" onClick={this.handleOnClick}>
        <h3>{article.title}</h3>
        <p>{article.summary}</p>
      </a>
    );
  }
}
