import { ArticleWrapper, Feedback, Modal, PageAnchor } from "./styles";
import { Config, IKbArticle } from "../../types";

import Avatar from "../../common/Avatar";
import { Col } from "react-bootstrap";
import React from "react";
import Script from "../../common/Script";
import Scrollspy from "react-scrollspy";
import Spinner from "../../common/Spinner";
import classNames from "classnames";

type Props = {
  article: IKbArticle;
  config: Config;
  loading?: boolean;
};

class SingleArticle extends React.Component<Props, { reaction: string }> {
  constructor(props) {
    super(props);

    this.state = {
      reaction: "",
    };
  }

  createDom = () => {
    const { article } = this.props;

    if (!article) {
      return null;
    }
    const content = article.content;
    const dom = new DOMParser().parseFromString(content, "text/html");
    return dom;
  };

  onReactionClick = (reaction) => {
    this.setState({ reaction });
  };

  renderTags = () => {
    const tags =
      (typeof window !== "undefined" &&
        (document.getElementsByTagName("h2") as any)) ||
      ({} as any);

    if (!tags || Object.keys(tags).length === 0) {
      return null;
    }

    const tagged = [];

    const addId = (array, isTag) => {
      return array.forEach((el) => {
        let taggedItem;

        if (el.lastChild.innerText) {
          el.children.length > 0
            ? (taggedItem = el.lastChild.innerText.replace(/&nbsp;/gi, ""))
            : (taggedItem = el.innerText.replace(/&nbsp;/gi, ""));

          el.setAttribute("id", taggedItem);
          // tslint:disable-next-line:no-unused-expression
          isTag && tagged.push(taggedItem);
        }
      });
    };

    const h2Array =
      (typeof window !== "undefined" &&
        (document.getElementsByTagName("h2") as any)) ||
      ({} as any);
    addId([...(tags || ({} as any))], true);
    addId([...h2Array], false);

    if (!tagged || tagged.length === 0) {
      return null;
    }

    return (
      <Col md={2}>
        <PageAnchor id="anchorTag">
          <h6>On this page </h6>
          <Scrollspy items={tagged} currentClassName="active">
            {tagged.map((val, index) => (
              <li key={index}>
                <a href={`#${val}`}>{val}</a>
              </li>
            ))}
          </Scrollspy>
        </PageAnchor>
      </Col>
    );
  };

  showImageModal = (e) => {
    const img = (e.target.closest("img") as any) || {};
    const modalImg =
      (typeof window !== "undefined" &&
        (document.getElementById("modal-content") as any)) ||
      {};
    const modal =
      (typeof window !== "undefined" &&
        (document.getElementById("modal") as any)) ||
      {};

    if (img && e.currentTarget.contains(img)) {
      modalImg.src = img.src;
      modalImg.alt = img.alt;

      if (modal.style) {
        modal.style.visibility = "visible";
      }
    }
  };

  handleModal = () => {
    const modal =
      typeof window !== "undefined" && document.getElementById("modal");

    if (modal) {
      modal.style.visibility = "hidden";
    }
  };

  renderReactions = () => {
    const { article } = this.props;
    const { reaction } = this.state;

    if (
      !article ||
      (article.reactionChoices && article.reactionChoices.length === 0)
    ) {
      return null;
    }

    const reactionClassess = classNames("reactions", {
      clicked: reaction,
    });

    return (
      <Feedback>
        <div className={reactionClassess}>
          {(article.reactionChoices || []).map((reactionChoice, index) => (
            <span
              key={index}
              className={reactionChoice === reaction ? "active" : undefined}
              onClick={this.onReactionClick.bind(this, reactionChoice)}
            >
              <img alt="reaction" src={reactionChoice} />
            </span>
          ))}
        </div>
      </Feedback>
    );
  };

  renderContent = () => {
    const { article, config } = this.props;

    const forms = article.forms || [];

    return (
      <p>
        {forms.length !== 0 && (
          <Script
            messengerBrandCode={config.messengerBrandCode}
            erxesForms={forms}
          />
        )}
        <div
          onClick={this.showImageModal}
          dangerouslySetInnerHTML={{
            __html: article.content,
          }}
        />
      </p>
    );
  };

  render() {
    const { article, loading } = this.props;

    if (loading) {
      return <Spinner />;
    }

    return (
      <>
        <ArticleWrapper>
          <h4> {article.title}</h4>
          <Avatar
            date={article.modifiedDate}
            user={article.createdUser}
            viewCount={article.viewCount || 0}
          />

          <hr />

          <div className="content" id="contentText">
            <p>{article.summary}</p>
            {this.renderContent()}
            <Modal onClick={this.handleModal} id="modal">
              <span id="close">&times;</span>
              <img id="modal-content" alt="modal" />
            </Modal>
          </div>
          <hr />
          {this.renderReactions()}
        </ArticleWrapper>
        {this.renderTags()}
      </>
    );
  }
}

export default SingleArticle;
