import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import Link from "next/link";
import { Avatars, CategoryListWrapper } from "./styles";
import { Config, Topic } from "../../types";
import { getConfigColor } from "../../common/utils";

type Props = {
  topic: Topic;
  config: Config;
};
class CategoryList extends React.Component<Props> {
  renderNames = (authors) => {
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

  renderAuthors = (cat) => {
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

    const specialCategory = parentCategories[0];
    const categories = parentCategories.slice(1);
    const categoryUrl = `/knowledge-base/category`;

    const detail = (cat) => {
      return (
        <Link href={`${categoryUrl}?id=${cat._id}`} passHref={true}>
          <a className="d-flex flex-column align-items-center w-100 link-color">
            <div className="icon-wrapper">
              <i className={`icon-${cat.icon}`} />
            </div>
            <div className="tab-content">
              <h5 className="link-hover-color">{cat.title}</h5>
              <div className="description">
                <p>{cat.description}</p>
              </div>
            </div>
          </a>
        </Link>
      );
    };

    return (
      <>
        {specialCategory && (
          <Container className="knowledge-base promoted mt-30" fluid="sm">
            <div className="category-knowledge-list">
              <h2 className="list-category-title">
                <Link href={`${categoryUrl}?id=${specialCategory._id}`}>
                  {specialCategory.title}
                </Link>
              </h2>
              <div className="promoted-wrap">
                {specialCategory.childrens &&
                  specialCategory.childrens.map((cat, i) => (
                    <Card key={`child-${i}`}>
                      {detail(cat)}
                      <Link href={`${categoryUrl}?id=${cat._id}`}>
                        <a className="more link-color">Read more</a>
                      </Link>
                    </Card>
                  ))}
              </div>
            </div>
          </Container>
        )}

        {categories.map((parentCat, i) => (
          <Container className="knowledge-base" fluid="sm" key={`key-${i}`}>
            <div className="category-knowledge-list">
              <h2 className="list-category-title">
                <Link href={`${categoryUrl}?id=${parentCat._id}`}>
                  {parentCat.title}
                </Link>
              </h2>
              <Row>
                {parentCat.childrens &&
                  parentCat.childrens.map((cat) => (
                    <Col md={4} key={cat._id} className="category-col">
                      <Card className="category-item">{detail(cat)}</Card>
                    </Col>
                  ))}
              </Row>
            </div>
          </Container>
        ))}
      </>
    );
  };

  render() {
    const { config } = this.props;

    return (
      <CategoryListWrapper
        baseColor={getConfigColor(config, "baseColor")}
        linkColor={getConfigColor(config, "linkColor")}
        linkHoverColor={getConfigColor(config, "linkHoverColor")}
      >
        <div className="categories-wrapper">{this.renderCategories()}</div>
      </CategoryListWrapper>
    );
  }
}

export default CategoryList;
