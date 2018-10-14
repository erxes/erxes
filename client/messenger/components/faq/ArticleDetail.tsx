import * as moment from "moment";
import * as React from "react";
import { defaultAvatar } from "../../../icons/Icons";
import { __ } from "../../../utils";
import { IFaqArticle } from "../../types";

type Props = {
  article: IFaqArticle | null;
  goToArticles: () => void;
};

export default function ArticleDetail({ article, goToArticles }: Props) {
  if (!article) {
    return null;
  }

  const {
    author,
    modifiedDate,
    createdDate,
    title,
    summary,
    content
  } = article;
  const authorDetails = author.details || {
    fullName: "",
    avatar: defaultAvatar
  };

  return (
    <div>
      <a onClick={goToArticles}>{__("Back to articles")}</a>

      <div className="erxes-kb-item detail">
        <h1>{title}</h1>
        <div className="item-meta flex-item">
          <div className="avatars">
            <img alt={authorDetails.fullName} src={authorDetails.avatar} />
          </div>
          <div>
            <div>
              {__("Written by")}: <span>{authorDetails.fullName}</span>
            </div>
            <div>
              {modifiedDate ? __("Modified ") : __("Created ")}
              <span>
                {moment(modifiedDate ? modifiedDate : createdDate).format(
                  "lll"
                )}
              </span>
            </div>
          </div>
        </div>
        <div className="erxes-article-content">
          <p>{summary}</p>
          <p dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </div>
    </div>
  );
}
