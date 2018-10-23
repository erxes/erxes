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
  handleOnClick = (event: React.FormEvent<HTMLDivElement>) => {
    event.preventDefault();

    const { article, onClick } = this.props;

    onClick(article);
  };

  render() {
    const { article } = this.props;

    return (
      <div className="erxes-list-item faq-item" onClick={this.handleOnClick}>
        <div className="erxes-left-side">
          <i className="erxes-icon-clipboard" />
        </div>
        <div className="erxes-right-side">
          <div className="erxes-name">{article.title}</div>
          <div className="description">{article.summary}</div>
        </div>
      </div>
    );
  }
}
