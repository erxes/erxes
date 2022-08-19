import React, { useState } from "react";
import classNames from "classnames";
import { Container, Row, Col } from "react-bootstrap";
import Scrollspy from "react-scrollspy";
import Avatar from "../../common/Avatar";
import {
  ArticleWrapper,
  SidebarList,
  Feedback,
  PageAnchor,
  Modal,
} from "./styles";
import { Config, Topic, IKbCategory, IKbArticle } from "../../types";
import SectionHeader from "../../common/SectionHeader";
import SideBar from "./SideBar";
import { getConfigColor } from "../../common/utils";

type Props = {
  article: IKbArticle;
  category: IKbCategory;
  topic: Topic;
  config: Config;
  loading: boolean;
};

function ArticleDetail({ loading, article, category, topic, config }: Props) {
  const [reaction, setReaction] = useState("");

  const createDom = () => {
    if (!article) {
      return null;
    }
    const content = article.content;
    const dom = new DOMParser().parseFromString(content, "text/html");
    return dom;
  };

  if (loading) {
    return <div>'loading ...'</div>;
  }

  const onReactionClick = (reactionChoice) => {
    setReaction(reactionChoice);
  };

  const renderTags = () => {
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

  const showImageModal = (e) => {
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

  const handleModal = () => {
    const modal =
      typeof window !== "undefined" && document.getElementById("modal");

    if (modal) {
      modal.style.visibility = "hidden";
    }
  };

  const renderReactions = () => {
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
              onClick={onReactionClick.bind(this, reactionChoice)}
            >
              <img alt="reaction" src={reactionChoice} />
            </span>
          ))}
        </div>
      </Feedback>
    );
  };

  return (
    <Container className="knowledge-base">
      <SectionHeader
        categories={topic.parentCategories}
        selectedCat={category}
      />

      <Row className="category-detail">
        <Col md={3}>
          <SidebarList baseColor={getConfigColor(config, "baseColor")}>
            <SideBar
              parentCategories={topic.parentCategories}
              category={category}
              articleId={article._id}
            />
          </SidebarList>
        </Col>
        <Col md={9} style={{ display: "flex" }}>
          <ArticleWrapper>
            <h4> {article.title}</h4>
            <Avatar date={article.modifiedDate} user={article.createdUser} />

            <hr />

            <div className="content" id="contentText">
              <p>{article.summary}</p>
              <p>
                <div
                  onClick={showImageModal}
                  dangerouslySetInnerHTML={{
                    __html: article.content,
                  }}
                />
              </p>
              <Modal onClick={handleModal} id="modal">
                <span id="close">&times;</span>
                <img id="modal-content" alt="modal" />
              </Modal>
            </div>
            <hr />
            {renderReactions()}
          </ArticleWrapper>
          {renderTags()}
        </Col>
      </Row>
    </Container>
  );
}

export default ArticleDetail;
