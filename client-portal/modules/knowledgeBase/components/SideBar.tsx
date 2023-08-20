import { Config, IKbCategory, IKbParentCategory } from "../../types";
import { SubCategories, SubMenu } from "./styles";

import Icon from "../../common/Icon";
import Link from "next/link";
import React from "react";
import { getConfigColor } from "../../common/utils";

type Props = {
  parentCategories: IKbParentCategory[];
  category: IKbCategory;
  articleId?: string;
  config: Config;
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

  renderCatIcon(cat) {
    if (!cat.childrens) {
      return <span>&#x2022;</span>;
    }

    return (
      <div className="icon-wrapper d-flex justify-content-center align-items-center">
        <i className={`icon-${cat.icon}`} />
      </div>
    );
  }

  renderCategory(cat) {
    return (
      <React.Fragment key={cat._id}>
        <Link href={`/knowledge-base/category?id=${cat._id}`}>
          <div
            className={`item ${
              cat._id === this.props.category._id && "active"
            }`}
          >
            <div>
              {this.renderCatIcon(cat)}
              <h6>{cat.title}</h6>
            </div>
            <span className="d-flex align-items-center">
              {`(${cat.numOfArticles})`}
            </span>
          </div>
        </Link>
        {this.renderArticles(cat._id === this.props.category._id)}
      </React.Fragment>
    );
  }

  render() {
    const { parentCategories, config } = this.props;

    if (!parentCategories || parentCategories.length === 0) {
      return null;
    }

    return parentCategories.map((cat, i) => (
      <React.Fragment key={i}>
        {this.renderCategory(cat)}

        {cat.childrens && (
          <SubCategories baseColor={getConfigColor(config, "baseColor")}>
            {cat.childrens.map((child) => this.renderCategory(child))}
          </SubCategories>
        )}
      </React.Fragment>
    ));
  }
}

export default SideBar;
