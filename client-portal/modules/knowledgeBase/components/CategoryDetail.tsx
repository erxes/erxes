import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Topic } from "../../types";
import { SidebarList } from "./styles";
import Articles from "./ArticleList";
import SideBar from "./SideBar";
import SectionHeader from "../../common/SectionHeader";

type Props = {
  category: any;
  loading: boolean;
  topic: Topic;
};

function CategoryDetail({ topic, category }: Props) {
  return (
    <Container className="knowledge-base">
      <SectionHeader
        categories={topic.parentCategories}
        selectedCat={category}
      />

      <Row className="category-detail">
        <Col md={3}>
          <SidebarList>
            <SideBar
              parentCategories={topic.parentCategories}
              category={category}
            />
          </SidebarList>
        </Col>
        <Col md={9}>
          <Articles articles={category.articles} />
        </Col>
      </Row>
    </Container>
  );
}

export default CategoryDetail;
