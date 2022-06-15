import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Config, Topic } from "../../types";
import { SidebarList } from "./styles";
import SideBar from "./SideBar";
import SectionHeader from "../../common/SectionHeader";
import { getConfigColor } from "../../common/utils";
import ArticleListContainer from "../containers/ArticleList";

type Props = {
  category: any;
  loading: boolean;
  topic: Topic;
  config: Config;
};

function CategoryDetail({ topic, category, config }: Props) {
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
            />
          </SidebarList>
        </Col>
        <Col md={9}>
          <ArticleListContainer categoryId={category._id} />
        </Col>
      </Row>
    </Container>
  );
}

export default CategoryDetail;
