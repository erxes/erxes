import {
  ArticleWrapper,
  Feedback,
  Modal,
  PageAnchor,
  SidebarList,
} from "./styles";
import { Col, Container, Row } from "react-bootstrap";
import { Config, IKbArticle, IKbCategory, Topic } from "../../types";
import React, { useState } from "react";

import Avatar from "../../common/Avatar";
import Script from "../../common/Script";
import Scrollspy from "react-scrollspy";
import SectionHeader from "../../common/SectionHeader";
import SideBar from "./SideBar";
import SingleArticle from "./SingleArticle";
import classNames from "classnames";
import { getConfigColor } from "../../common/utils";

type Props = {
  article: IKbArticle;
  category: IKbCategory;
  topic: Topic;
  config: Config;
  loading: boolean;
};

function ArticleDetail({ loading, article, category, topic, config }: Props) {
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
          <SingleArticle article={article} loading={loading} config={config} />
        </Col>
      </Row>
    </Container>
  );
}

export default ArticleDetail;
