import * as React from "react";
import { __ } from "../../utils";
import { Articles, BackButton, ItemMeta } from "../components";
import { IKbCategory } from "../types";

type Props = {
  category: IKbCategory | null;
  goToCategories: () => void;
};

function CategoryDetail({ category, goToCategories }: Props) {
  if (!category) {
    return null;
  }

  return (
    <div>
      <BackButton
        onClickHandler={goToCategories}
        text={__("Back to categories")}
      />

      <div className="category-container">
        <div className="flex-item spaced">
          <div className="topic-icon">
            <i className={`erxes-icon-${category.icon}`} />
          </div>
          <div className="topic-content">
            <h1>{category.title}</h1>
            {category.description}
            <ItemMeta category={category} />
          </div>
        </div>

        <Articles articles={category.articles} />
      </div>
    </div>
  );
}

export default CategoryDetail;
