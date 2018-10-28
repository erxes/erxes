import * as moment from "moment";
import * as React from "react";
import { iconLeft } from "../../../icons/Icons";
import { __ } from "../../../utils";
import { TopBar } from "../../containers";
import { IFaqArticle } from "../../types";

type Props = {
  article: IFaqArticle | null;
  goToArticles: () => void;
};

export default function ArticleDetail({ article, goToArticles }: Props) {
  if (!article) {
    return <div className="loader bigger" />;
  }

  const { createdDate, title, summary, content } = article;

  const renderHead = () => {
    return (
      <div className="erxes-topbar-title limited">
        <div>{title}</div>
      </div>
    );
  };

  return (
    <>
      <TopBar
        middle={renderHead()}
        buttonIcon={iconLeft}
        onLeftButtonClick={goToArticles}
      />
      <div className="erxes-content slide-in">
        <div className="erxes-article-content">
          <h2>{title}</h2>
          <div className="date">
            {__("Created ")}: <span>{moment(createdDate).format("lll")}</span>
          </div>
          <p>{summary}</p>
          <p dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </div>
    </>
  );
}
