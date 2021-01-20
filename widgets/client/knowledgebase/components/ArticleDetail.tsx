import classNames from "classnames";
import * as dayjs from "dayjs";
import * as React from "react";
import { defaultAvatar } from "../../icons/Icons";
import { __, makeClickableLink, readFile } from "../../utils";
import { IKbArticle } from "../types";
import { BackButton } from "./";

type Props = {
  article: IKbArticle | null;
  goToArticles: () => void;
  incReactionCount: (articleId: string, reactionChoice: string) => void;
};
export default class ArticleDetail extends React.PureComponent<
  Props,
  { activeReaction: string }
> {
  constructor(props: Props) {
    super(props);

    this.state = {
      activeReaction: ""
    };
  }

  componentDidMount() {
    makeClickableLink(".erxes-article-content a");
  }

  onReactionClick = (articleId: string, reactionChoice: string) => {
    const { incReactionCount } = this.props;

    this.setState({ activeReaction: reactionChoice });

    incReactionCount(articleId, reactionChoice);
  };

  renderReactions() {
    const { article } = this.props;

    if (
      !article ||
      (article.reactionChoices && article.reactionChoices.length === 0)
    ) {
      return null;
    }

    const reactionClassess = classNames("reactions", {
      clicked: this.state.activeReaction
    });

    return (
      <div className="feedback">
        <div className={reactionClassess}>
          {(article.reactionChoices || []).map((reactionChoice, index) => (
            <span
              key={index}
              className={
                reactionChoice === this.state.activeReaction
                  ? "active"
                  : undefined
              }
              onClick={this.onReactionClick.bind(
                this,
                article._id,
                reactionChoice
              )}
            >
              <img src={reactionChoice} />
            </span>
          ))}
        </div>
      </div>
    );
  }

  render() {
    const { article, goToArticles } = this.props;

    if (!article) {
      return null;
    }

    const {
      createdUser,
      modifiedDate,
      createdDate,
      title,
      summary,
      content
    } = article;

    const authorDetails = createdUser.details || {
      fullName: "",
      avatar: defaultAvatar
    };

    return (
      <div>
        <BackButton
          onClickHandler={goToArticles}
          text={__("Back to articles")}
        />

        <div className="erxes-kb-item detail">
          <h1>{title}</h1>
          <div className="item-meta flex-item">
            <div className="avatars">
              <img
                alt={authorDetails.fullName}
                src={readFile(authorDetails.avatar)}
              />
            </div>
            <div>
              <div>
                {__("Written by")}: <span>{authorDetails.fullName}</span>
              </div>
              <div>
                {modifiedDate ? __("Modified ") : __("Created ")}
                <span>
                  {dayjs(modifiedDate ? modifiedDate : createdDate).format(
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

          {this.renderReactions()}
        </div>
      </div>
    );
  }
}
