import * as React from "react";
import {
  ArticleDetail,
  Articles,
  Categories,
  CategoryDetail,
  SearchBar
} from "../containers";

type Props = {
  activeRoute: string;
  color: string;
};

export default class KnowledgeBase extends React.Component<Props> {
  renderContent() {
    const { activeRoute } = this.props;

    if (activeRoute === "CATEGORIES") {
      return <Categories />;
    }

    if (activeRoute === "CATEGORY_DETAIL") {
      return <CategoryDetail />;
    }

    if (activeRoute === "ARTICLE_DETAIL") {
      return <ArticleDetail />;
    }

    if (activeRoute === "ARTICLES") {
      return <Articles />;
    }

    return null;
  }

  render() {
    const { color } = this.props;

    return (
      <div className="erxes-widget-container">
        <SearchBar color={color} />
        <div className="erxes-widget-kb">
          <div className="erxes-content">
            <div className="erxes-knowledge-container">
              {this.renderContent()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
