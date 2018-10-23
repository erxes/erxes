import * as React from "react";
import { ArticleDetail, CategoryDetail } from "../../containers/faq";

type Props = {
  activeRoute: string;
};

export default function Faq({ activeRoute }: Props) {
  if (activeRoute === "CATEGORY_DETAIL") {
    return <CategoryDetail />;
  }

  if (activeRoute === "ARTICLE_DETAIL") {
    return <ArticleDetail />;
  }

  return null;
}
