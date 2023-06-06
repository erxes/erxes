import { Avatars, CategoryListWrapper } from "./styles";
import { Card, Col, Container, Row } from "react-bootstrap";
import { Config, Topic } from "../../types";

import Icon from "../../common/Icon";
import Link from "next/link";
import React from "react";
import { getConfigColor } from "../../common/utils";

type Props = {
  topic: Topic;
  config: Config;
};
class CategoryList extends React.Component<Props> {
  renderNames = authors => {
    if (authors.length > 3) {
      return (
        <>
          {authors.slice(0, 3).map((user, index) => (
            <span key={index}>{user.details.fullName},</span>
          ))}
          <span> and {authors.length - 3} other </span>
        </>
      );
    }

    return authors.map((author, index) => (
      <span key={index}>
        {author.details.fullName}
        {authors.length > 1 && ", "}
      </span>
    ));
  };

  renderAuthors = cat => {
    const { authors } = cat;

    if (authors.length === 0) {
      return;
    }

    return (
      <Avatars>
        {cat.authors.map((author, index) => (
          <img
            key={`author-${index}`}
            alt={author.details.fullName}
            src={author.details.avatar}
          />
        ))}
        <div className="avatar-info">
          <div>
            <div className="darker">{cat.numOfArticles}</div> articles in this
            category
          </div>
          <div>
            <div className="darker">Written by: </div>
            {this.renderNames(cat.authors)}
          </div>
        </div>
      </Avatars>
    );
  };

  renderCategories = () => {
    const { topic } = this.props;
    const { parentCategories = [] } = topic;

    const categoryUrl = `/knowledge-base/category`;

    const renderInfo = cat => {
      const getAuthorsCount = cat.authors
        ? new Set(cat.authors.map(author => author._id)).size
        : 0;
      return (
        <Link href={`${categoryUrl}?id=${cat._id}`} passHref={true}>
          <a className="d-flex flex-column align-items-start w-100 h-100 link-color">
            <div className="icon-wrapper d-flex justify-content-center align-items-center">
              <i className={`icon-${cat.icon ? cat.icon : "notebooks"}`} />
            </div>
            <div className="tab-content h-100 d-flex flex-column justify-content-between">
              <div>
                <h5 className="link-hover-color">{cat.title.toLowerCase()}</h5>
                <p>{cat.description.toLowerCase()}</p>
              </div>
              <div className="authors d-flex align-item-center">
                <span className="d-flex align-item-center">
                  <Icon icon="book" />
                  &nbsp; {cat.numOfArticles || 0} articles
                </span>
                <span className="d-flex align-item-center">
                  <Icon icon="users-alt" />
                  &nbsp;
                  {getAuthorsCount} authors
                </span>
              </div>
            </div>
          </a>
        </Link>
      );
    };

    return parentCategories.map((parentCat, i) => (
      <Container key={`key-${i}`} className="knowledge-base">
        <div className="category-knowledge-list">
          <h2 className="list-category-title">
            <Link href={`${categoryUrl}?id=${parentCat._id}`}>
              {parentCat.title.toLowerCase()}
            </Link>
          </h2>
          <p>{parentCat.description}</p>
          <Row>
            {parentCat.childrens &&
              parentCat.childrens.map(cat => (
                <Col md={4} key={cat._id} className="category-col">
                  <Card className="category-item">{renderInfo(cat)}</Card>
                </Col>
              ))}
          </Row>
        </div>
      </Container>
    ));
  };

  render() {
    const { config } = this.props;

    return (
      <CategoryListWrapper
        baseColor={getConfigColor(config, "baseColor")}
        headingColor={getConfigColor(config, "headingColor")}
        linkColor={getConfigColor(config, "linkColor")}
        linkHoverColor={getConfigColor(config, "linkHoverColor")}
      >
        <div className="categories-wrapper">{this.renderCategories()}</div>
      </CategoryListWrapper>
    );
  }
}

export default CategoryList;
