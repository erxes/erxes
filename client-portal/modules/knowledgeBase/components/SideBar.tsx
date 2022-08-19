import React from "react";
import { IKbCategory, IKbParentCategory } from "../../types";
import Link from "next/link";
import { SubCategories, SubMenu } from "./styles";

type Props = {
  parentCategories: IKbParentCategory[];
  category: IKbCategory;
  articleId?: string;
};

class SideBar extends React.Component<Props> {
  renderArticles = (isActive) => {
    const { category, articleId } = this.props;
    const { articles } = category;

    if (!articleId || !isActive || !articles || articles.length === 0) {
      return null;
    }

    return (
      <SubMenu>
        {articles.map((article, index) => (
          <Link
            key={index}
            href={`/knowledge-base/article?id=${article._id}&catId=${article.categoryId}`}
          >
            <li className={article._id === articleId && "active"}>
              {article.title}
            </li>
          </Link>
        ))}
      </SubMenu>
    );
  };

  renderCategory(cat) {
    const icon = cat.childrens ? cat.icon : "angle-right";

    return (
      <React.Fragment key={cat._id}>
        <Link href={`/knowledge-base/category?id=${cat._id}`}>
          <div
            className={`item ${
              cat._id === this.props.category._id && "active"
            }`}
          >
            <div>
              <i className={`icon-${icon}`} />
              <h6>{cat.title}</h6>
            </div>
            <span>{`(${cat.numOfArticles})`}</span>
          </div>
        </Link>
        {this.renderArticles(cat._id === this.props.category._id)}
      </React.Fragment>
    );
  }

  render() {
    const { parentCategories } = this.props;

    if (!parentCategories || parentCategories.length === 0) {
      return null;
    }

    return parentCategories.map((cat, i) => (
      <React.Fragment key={i}>
        {this.renderCategory(cat)}

        {cat.childrens && (
          <SubCategories>
            {cat.childrens.map((child) => this.renderCategory(child))}
          </SubCategories>
        )}
      </React.Fragment>
    ));
  }
}

export default SideBar;
