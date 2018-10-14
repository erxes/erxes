import * as React from "react";
import { ArticleDetail, CategoryDetail } from "../../containers/faq";

type Props = {
  activeRoute: string;
};

export default class Faq extends React.Component<Props> {
  renderContent() {
    const { activeRoute } = this.props;
    console.log(activeRoute);

    if (activeRoute === "CATEGORY_DETAIL") {
      return <CategoryDetail />;
    }

    if (activeRoute === "ARTICLE_DETAIL") {
      return <ArticleDetail />;
    }

    return null;
  }

  render() {
    return this.renderContent();
  }
}
