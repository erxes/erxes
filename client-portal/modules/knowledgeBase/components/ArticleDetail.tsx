import { Col, Container, Row } from "react-bootstrap";
import { Config, IKbArticle, IKbCategory, Topic } from "../../types";

import { Card } from "../../styles/cards";
import React from "react";
import SectionHeader from "../../common/SectionHeader";
import SideBar from "./SideBar";
import { SidebarList } from "./styles";
import SingleArticle from "./SingleArticle";
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
        <Col md={4}>
          <Card>
            <SidebarList baseColor={getConfigColor(config, "baseColor")}>
              <SideBar
                parentCategories={topic.parentCategories}
                category={category}
                articleId={article._id}
                config={config}
              />
            </SidebarList>
          </Card>
        </Col>
        <Col md={8}>
          <SingleArticle article={article} loading={loading} config={config} />
        </Col>
      </Row>
    </Container>
  );
}

export default ArticleDetail;
