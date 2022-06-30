import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Config, Topic } from "../../types";
import { SidebarList, CategoryHeader, ArticlesContainer } from "./styles";
import SideBar from "./SideBar";
import SectionHeader from "../../common/SectionHeader";
import { getConfigColor } from "../../common/utils";
import ArticleListContainer from "../containers/ArticleList";

type Props = {
  category: any;
  loading: boolean;
  topic: Topic;
  config: Config;
  type?: string;
};

function CategoryDetail({ topic, category, config, type }: Props) {
  return (
    <Container className="knowledge-base">
      {type === "layout" ? (
        <>
          {topic &&
            topic.parentCategories &&
            topic.parentCategories.map((cat) => (
              <>
                <CategoryHeader>{cat.title}</CategoryHeader>
                <ArticlesContainer>
                  <ArticleListContainer
                    categoryId={cat._id}
                    type={type}
                    topic={topic}
                  />
                </ArticlesContainer>
              </>
            ))}
        </>
      ) : (
        <>
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
        </>
      )}
    </Container>
  );
}

export default CategoryDetail;
